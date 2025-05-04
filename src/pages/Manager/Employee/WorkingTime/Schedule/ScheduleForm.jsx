import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Select,
    DatePicker,
    Button,
    Space,
    Spin,
    Divider,
    Alert,
} from "antd";
import dayjs from "dayjs";
import { getEmployees } from "../../../../../api/employeesApi";
import { getShifts, getShiftsByBranch } from "../../../../../api/shiftsApi";
import { getBranches } from "../../../../../api/branchesApi";

const { Option } = Select;

const ScheduleForm = ({ open, onCancel, onSubmit, selectedDate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Fetch data on modal open
    useEffect(() => {
        if (open) {
            fetchBranches();
            fetchEmployees();
            fetchShifts();

            // Set default date value
            if (selectedDate) {
                form.setFieldsValue({ date: dayjs(selectedDate) });
            }
        }
    }, [open, selectedDate]);

    // Fetch shifts when branch changes
    useEffect(() => {
        if (selectedBranch) {
            fetchShiftsByBranch(selectedBranch);
        } else {
            fetchShifts();
        }
    }, [selectedBranch]);

    // Fetch branches
    const fetchBranches = async () => {
        try {
            setLoading(true);
            const data = await getBranches();
            setBranches(data || []);
        } catch (error) {
            console.error("Error fetching branches:", error);
            setBranches([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch employees
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await getEmployees();
            // Handle the response correctly - getEmployees returns an object with a data property
            setEmployees(response?.data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all shifts
    const fetchShifts = async () => {
        try {
            setLoading(true);
            const data = await getShifts({ isActive: true });
            setShifts(data || []);
        } catch (error) {
            console.error("Error fetching shifts:", error);
            setShifts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch shifts by branch
    const fetchShiftsByBranch = async (branchId) => {
        try {
            setLoading(true);
            const data = await getShiftsByBranch(branchId);
            setShifts(data || []);
        } catch (error) {
            console.error("Error fetching shifts by branch:", error);
            setShifts([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle employee change
    const handleEmployeeChange = (value) => {
        setSelectedEmployee(value);

        // Find employee's branch
        const employee = employees.find((emp) => emp.id === value);
        if (employee && employee.branch) {
            form.setFieldsValue({ branch_id: employee.branch.id });
            setSelectedBranch(employee.branch.id);
        }
    };

    // Handle branch change
    const handleBranchChange = (value) => {
        setSelectedBranch(value);

        // Reset employee selection if their branch doesn't match
        if (selectedEmployee) {
            const employee = employees.find(
                (emp) => emp.id === selectedEmployee
            );
            if (employee && employee.branch && employee.branch.id !== value) {
                form.setFieldsValue({ employee_id: undefined });
                setSelectedEmployee(null);
            }
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Format the date
            values.date = values.date.format("YYYY-MM-DD");
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error("Form validation error:", error);
        }
    };

    // Filter employees by branch
    const filteredEmployees = Array.isArray(employees)
        ? selectedBranch
            ? employees.filter(
                  (emp) => emp.branch && emp.branch.id === selectedBranch
              )
            : employees
        : [];

    return (
        <Modal
            title="Thêm lịch làm việc mới"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            destroyOnClose
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="branch_id"
                        label="Chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chi nhánh",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn chi nhánh"
                            onChange={handleBranchChange}
                            showSearch
                            optionFilterProp="children"
                        >
                            {Array.isArray(branches) &&
                                branches.map((branch) => (
                                    <Option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="employee_id"
                        label="Nhân viên"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn nhân viên",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            onChange={handleEmployeeChange}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        >
                            {Array.isArray(filteredEmployees) &&
                                filteredEmployees.map((employee) => (
                                    <Option
                                        key={employee.id}
                                        value={employee.id}
                                    >
                                        {employee.name || employee.fullname} -{" "}
                                        {employee.department?.name ||
                                            "Chưa phân phòng"}
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="shift_id"
                        label="Ca làm việc"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn ca làm việc",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn ca làm việc"
                            showSearch
                            optionFilterProp="children"
                        >
                            {Array.isArray(shifts) &&
                                shifts.map((shift) => (
                                    <Option key={shift.id} value={shift.id}>
                                        {shift.name} ({shift.start_time} -{" "}
                                        {shift.end_time})
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Ngày làm việc"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn ngày làm việc",
                            },
                        ]}
                    >
                        <DatePicker
                            format="DD/MM/YYYY"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item name="note" label="Ghi chú">
                        <Select placeholder="Chọn ghi chú" allowClear>
                            <Option value="Thay ca">Thay ca</Option>
                            <Option value="Tăng ca">Tăng ca</Option>
                            <Option value="Ca đặc biệt">Ca đặc biệt</Option>
                        </Select>
                    </Form.Item>

                    <Alert
                        message="Sau khi thêm, lịch làm việc sẽ ở trạng thái Chờ xác nhận"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button onClick={onCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                Thêm lịch
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ScheduleForm;
