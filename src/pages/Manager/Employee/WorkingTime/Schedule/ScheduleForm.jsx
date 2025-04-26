import React, { useEffect } from "react";
import { Modal, Form, Select, DatePicker, Space, Button } from "antd";
import dayjs from "dayjs";

const ScheduleForm = ({ open, onCancel, onSubmit, selectedDate }) => {
    const [form] = Form.useForm();

    // Sample data - should be fetched from API
    const employees = [
        { id: "NV001", name: "Nguyễn Văn A", department: "front_desk" },
        { id: "NV002", name: "Trần Thị B", department: "restaurant" },
    ];

    const shifts = [
        { id: "CA001", name: "Ca Sáng (07:00-15:00)" },
        { id: "CA002", name: "Ca Chiều (15:00-23:00)" },
    ];

    useEffect(() => {
        if (selectedDate) {
            form.setFieldValue("date", selectedDate);
        }
    }, [selectedDate, form]);

    const handleSubmit = (values) => {
        const employee = employees.find((e) => e.id === values.employeeId);
        onSubmit({
            ...values,
            employeeName: employee.name,
            department: employee.department,
            shiftName: shifts.find((s) => s.id === values.shiftId).name,
            date: values.date.format("YYYY-MM-DD"),
        });
        form.resetFields();
    };

    return (
        <Modal title="Phân công ca làm việc" open={open} onCancel={onCancel} footer={null} width={500}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="employeeId" label="Chọn nhân viên" rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}>
                    <Select placeholder="Chọn nhân viên" showSearch optionFilterProp="children">
                        {employees.map((emp) => (
                            <Select.Option key={emp.id} value={emp.id}>
                                {emp.name} -{" "}
                                {emp.department === "front_desk" ? "Lễ tân" : emp.department === "restaurant" ? "Nhà hàng" : "Buồng phòng"}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="shiftId" label="Chọn ca làm việc" rules={[{ required: true, message: "Vui lòng chọn ca làm việc!" }]}>
                    <Select placeholder="Chọn ca làm việc">
                        {shifts.map((shift) => (
                            <Select.Option key={shift.id} value={shift.id}>
                                {shift.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="date" label="Ngày làm việc" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
                    <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        disabledDate={(current) => current && current < dayjs().endOf("day")}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            Phân công
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ScheduleForm;
