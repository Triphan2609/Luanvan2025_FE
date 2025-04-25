import React from "react";
import { Modal, Form, Input, Select, Space, TimePicker, Checkbox } from "antd";
import {
    ClearOutlined, // Thay thế BroomStickOutlined bằng ClearOutlined
    UserOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

const cleaningTasks = [
    { label: "Dọn giường và thay ga", value: "bed" },
    { label: "Lau dọn phòng tắm", value: "bathroom" },
    { label: "Hút bụi và lau sàn", value: "floor" },
    { label: "Thay khăn tắm mới", value: "towels" },
    { label: "Bổ sung vật dụng", value: "supplies" },
    { label: "Kiểm tra minibar", value: "minibar" },
];

const staffOptions = [
    { label: "Nhân viên A", value: "staff_a" },
    { label: "Nhân viên B", value: "staff_b" },
    { label: "Nhân viên C", value: "staff_c" },
];

export default function CleaningModal({ open, onClose, room, onSubmit }) {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onSubmit({
                roomId: room.id,
                roomCode: room.roomCode,
                ...values,
                status: "Cleaning",
                startTime: new Date().toISOString(),
            });
            form.resetFields();
            onClose();
        });
    };

    return (
        <Modal
            title={
                <Space>
                    <ClearOutlined /> {/* Sử dụng ClearOutlined thay vì BroomStickOutlined */}
                    Yêu cầu dọn phòng {room?.roomCode}
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            okText="Xác nhận"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="staffId"
                    label={
                        <Space>
                            <UserOutlined />
                            Nhân viên phụ trách
                        </Space>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                >
                    <Select options={staffOptions} placeholder="Chọn nhân viên" />
                </Form.Item>

                <Form.Item
                    name="estimatedTime"
                    label={
                        <Space>
                            <ClockCircleOutlined />
                            Thời gian dự kiến hoàn thành
                        </Space>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                >
                    <TimePicker format="HH:mm" />
                </Form.Item>

                <Form.Item
                    name="tasks"
                    label="Công việc cần thực hiện"
                    rules={[{ required: true, message: "Vui lòng chọn ít nhất một công việc" }]}
                >
                    <Checkbox.Group options={cleaningTasks} />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú thêm">
                    <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
