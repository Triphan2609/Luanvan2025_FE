import React, { useEffect, useState } from "react";
import { Modal, Form, Select, DatePicker, Space, Button, Spin } from "antd";
import dayjs from "dayjs";
import { getActiveShifts } from "../../../../../api/shiftsApi";
import { getEmployees } from "../../../../../api/employeesApi";

const ScheduleForm = ({ open, onCancel, onSubmit, selectedDate }) => {
    const [form] = Form.useForm();
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const loadFormData = async () => {
        try {
            setLoading(true);

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
        const employee = employees.find((e) => e.id === values.employeeId);

        onSubmit({
            employeeId: values.employeeId,
            shiftId: values.shiftId,
            date: values.date.format("YYYY-MM-DD"),
            // Các thông tin khác sẽ được xử lý trong component cha
        });

        form.resetFields();
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
                            notFoundContent={
                                loading ? <Spin size="small" /> : null
                            }
                        >
                            {Array.isArray(employees) &&
                                employees.map((emp) => (
                                    <Select.Option key={emp.id} value={emp.id}>
                                        {emp.fullname} -{" "}
                                        {emp.department?.name ||
                                            "Chưa phân bộ phận"}
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
