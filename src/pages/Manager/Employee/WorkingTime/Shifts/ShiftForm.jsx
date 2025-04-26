import React, { useEffect } from "react";
import { Modal, Form, Input, Select, TimePicker, InputNumber, Space, Button } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;

const ShiftForm = ({ open, onCancel, onSubmit, editingShift, SHIFT_TYPE }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingShift) {
            form.setFieldsValue({
                ...editingShift,
                startTime: dayjs(editingShift.startTime, "HH:mm"),
                endTime: dayjs(editingShift.endTime, "HH:mm"),
                breakTime: editingShift.breakTime.split("-").map((time) => dayjs(time, "HH:mm")),
            });
        } else {
            form.resetFields();
        }
    }, [editingShift, form]);

    const handleSubmit = (values) => {
        const formData = {
            ...values,
            startTime: values.startTime.format("HH:mm"),
            endTime: values.endTime.format("HH:mm"),
            breakTime: values.breakTime.map((time) => time.format("HH:mm")).join("-"),
        };
        onSubmit(formData);
    };

    return (
        <Modal
            title={editingShift ? "Cập nhật ca làm việc" : "Thêm ca làm việc mới"}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="name" label="Tên ca làm việc" rules={[{ required: true, message: "Vui lòng nhập tên ca làm việc!" }]}>
                    <Input placeholder="Nhập tên ca làm việc" />
                </Form.Item>

                <Form.Item name="type" label="Loại ca" rules={[{ required: true, message: "Vui lòng chọn loại ca!" }]}>
                    <Select placeholder="Chọn loại ca">
                        <Select.Option value={SHIFT_TYPE.MORNING}>Ca Sáng</Select.Option>
                        <Select.Option value={SHIFT_TYPE.AFTERNOON}>Ca Chiều</Select.Option>
                        <Select.Option value={SHIFT_TYPE.EVENING}>Ca Tối</Select.Option>
                        <Select.Option value={SHIFT_TYPE.NIGHT}>Ca Đêm</Select.Option>
                    </Select>
                </Form.Item>

                <Space style={{ width: "100%" }} size="large">
                    <Form.Item
                        name="startTime"
                        label="Giờ bắt đầu"
                        rules={[{ required: true, message: "Chọn giờ bắt đầu!" }]}
                        style={{ width: "100%" }}
                    >
                        <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label="Giờ kết thúc"
                        rules={[{ required: true, message: "Chọn giờ kết thúc!" }]}
                        style={{ width: "100%" }}
                    >
                        <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                </Space>

                <Form.Item name="breakTime" label="Thời gian nghỉ" rules={[{ required: true, message: "Chọn thời gian nghỉ!" }]}>
                    <TimePicker.RangePicker format="HH:mm" />
                </Form.Item>

                <Form.Item name="workingHours" label="Số giờ làm việc" rules={[{ required: true, message: "Nhập số giờ làm việc!" }]}>
                    <InputNumber min={1} max={12} style={{ width: "100%" }} addonAfter="giờ" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={4} placeholder="Nhập mô tả về ca làm việc" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingShift ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ShiftForm;
