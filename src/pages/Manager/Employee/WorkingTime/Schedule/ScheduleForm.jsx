import React, { useEffect, useState } from "react";
import { Modal, Form, Select, DatePicker, Space, Button, Spin } from "antd";
import dayjs from "dayjs";
import { getActiveShifts } from "../../../../../api/shiftsApi";
import { getEmployees } from "../../../../../api/employeesApi";
import { getDepartments } from "../../../../../api/departmentsApi";

const ScheduleForm = ({ open, onCancel, onSubmit, selectedDate }) => {
    const [form] = Form.useForm();
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [departmentId, setDepartmentId] = useState(null);
    const [roleId, setRoleId] = useState(null);

    // Lấy dữ liệu khi form mở
    useEffect(() => {
        if (open) {
            loadFormData();
        }
    }, [open]);

    // Cập nhật ngày được chọn
    useEffect(() => {
        if (selectedDate) {
            form.setFieldValue("date", selectedDate);
        }
    }, [selectedDate, form]);

    // Lọc nhân viên theo phòng ban
    useEffect(() => {
        if (!departmentId) {
            setFilteredEmployees([]);
            setRoles([]);
            return;
        }

        // Lấy danh sách role từ nhân viên theo department
        const departmentEmployees = employees.filter(
            (emp) => emp.department?.id === departmentId
        );

        // Lấy danh sách roles duy nhất từ danh sách nhân viên đã lọc
        const uniqueRoles = [];
        const roleIds = new Set();

        departmentEmployees.forEach((emp) => {
            if (emp.role && !roleIds.has(emp.role.id)) {
                roleIds.add(emp.role.id);
                uniqueRoles.push({
                    id: emp.role.id,
                    name: emp.role.name,
                });
            }
        });

        setRoles(uniqueRoles);

        // Reset role selection
        form.setFieldValue("roleId", undefined);
        form.setFieldValue("employeeId", undefined);
        setRoleId(null);
    }, [departmentId, employees, form]);

    // Lọc nhân viên theo chức vụ
    useEffect(() => {
        if (!departmentId || !roleId) {
            setFilteredEmployees([]);
            return;
        }

        const filtered = employees.filter(
            (emp) =>
                emp.department?.id === departmentId && emp.role?.id === roleId
        );

        setFilteredEmployees(filtered);

        // Reset employee selection
        form.setFieldValue("employeeId", undefined);
    }, [departmentId, roleId, employees, form]);

    const loadFormData = async () => {
        try {
            setLoading(true);

            // Tải danh sách phòng ban
            const departmentsData = await getDepartments();
            setDepartments(departmentsData);

            // Tải danh sách nhân viên
            const employeesResponse = await getEmployees();

            // Xác định cấu trúc response và lấy mảng employees
            let employeesList = [];
            if (Array.isArray(employeesResponse)) {
                employeesList = employeesResponse;
            } else if (employeesResponse && employeesResponse.data) {
                // Nếu response có format { data: [...], total: number }
                employeesList = employeesResponse.data;
            } else {
                console.error(
                    "Định dạng dữ liệu nhân viên không đúng:",
                    employeesResponse
                );
                employeesList = [];
            }

            setEmployees(employeesList);

            // Tải danh sách ca làm việc đang hoạt động
            const shiftsData = await getActiveShifts();

            // Chuyển đổi dữ liệu ca làm việc
            const formattedShifts = shiftsData.map((shift) => ({
                id: shift.id,
                shift_code: shift.shift_code,
                name: `${shift.name} (${shift.start_time}-${shift.end_time})`,
                start_time: shift.start_time,
                end_time: shift.end_time,
                type: shift.type,
            }));

            setShifts(formattedShifts);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu form:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (values) => {
        onSubmit({
            employeeId: values.employeeId,
            shiftId: values.shiftId,
            date: values.date.format("YYYY-MM-DD"),
        });

        form.resetFields();
    };

    const handleDepartmentChange = (value) => {
        setDepartmentId(value);
    };

    const handleRoleChange = (value) => {
        setRoleId(value);
    };

    // Hàm lọc nhân viên theo tên
    const filterEmployees = (input, option) => {
        return option.children.toLowerCase().includes(input.toLowerCase());
    };

    return (
        <Modal
            title="Phân công ca làm việc"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="departmentId"
                        label="Chọn phòng ban"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn phòng ban!",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn phòng ban"
                            onChange={handleDepartmentChange}
                            notFoundContent={
                                loading ? <Spin size="small" /> : null
                            }
                        >
                            {Array.isArray(departments) &&
                                departments.map((dept) => (
                                    <Select.Option
                                        key={dept.id}
                                        value={dept.id}
                                    >
                                        {dept.name}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="roleId"
                        label="Chọn chức vụ"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chức vụ!",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn chức vụ"
                            onChange={handleRoleChange}
                            disabled={!departmentId}
                            notFoundContent={
                                loading ? <Spin size="small" /> : null
                            }
                        >
                            {Array.isArray(roles) &&
                                roles.map((role) => (
                                    <Select.Option
                                        key={role.id}
                                        value={role.id}
                                    >
                                        {role.name}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="employeeId"
                        label="Chọn nhân viên"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn nhân viên!",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            showSearch
                            filterOption={filterEmployees}
                            disabled={!departmentId || !roleId}
                            notFoundContent={
                                loading ? <Spin size="small" /> : null
                            }
                        >
                            {Array.isArray(filteredEmployees) &&
                                filteredEmployees.map((emp) => (
                                    <Select.Option key={emp.id} value={emp.id}>
                                        {emp.name || emp.fullname}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="shiftId"
                        label="Chọn ca làm việc"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn ca làm việc!",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn ca làm việc"
                            notFoundContent={
                                loading ? <Spin size="small" /> : null
                            }
                        >
                            {Array.isArray(shifts) &&
                                shifts.map((shift) => (
                                    <Select.Option
                                        key={shift.id}
                                        value={shift.id}
                                    >
                                        {shift.name}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Ngày làm việc"
                        rules={[
                            { required: true, message: "Vui lòng chọn ngày!" },
                        ]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button onClick={onCancel}>Hủy</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                Phân công
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ScheduleForm;
