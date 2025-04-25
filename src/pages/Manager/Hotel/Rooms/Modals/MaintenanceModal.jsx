import React from "react";
import { Modal, Form, Input, Select, Space, DatePicker, Radio } from "antd";
import { ToolOutlined, ExclamationCircleOutlined, UserOutlined } from "@ant-design/icons";

const maintenanceTypes = [
    { label: "Sửa chữa thiết bị", value: "repair" },
    { label: "Bảo trì định kỳ", value: "regular" },
    { label: "Thay thế thiết bị", value: "replace" },
];

const priorityOptions = [
    { label: "Cao", value: "high", color: "#f5222d" },
    { label: "Trung bình", value: "medium", color: "#faad14" },
    { label: "Thấp", value: "low", color: "#52c41a" },
];

const staffOptions = [
    { label: "Kỹ thuật viên A", value: "tech_a" },
    { label: "Kỹ thuật viên B", value: "tech_b" },
    { label: "Kỹ thuật viên C", value: "tech_c" },
];

export default function MaintenanceModal({ open, onClose, room, onSubmit }) {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onSubmit({
                roomId: room.id,
                roomCode: room.roomCode,
                ...values,
                status: "Maintenance",
                reportDate: new Date().toISOString(),
            });
            form.resetFields();
            onClose();
        });
    };

    return (
        <Modal
            title={
                <Space>
                    <ToolOutlined />
                    Báo cáo bảo trì phòng {room?.roomCode}
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
            width={600}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="maintenanceType" label="Loại bảo trì" rules={[{ required: true }]}>
                    <Radio.Group buttonStyle="solid">
                        {maintenanceTypes.map((type) => (
                            <Radio.Button key={type.value} value={type.value}>
                                {type.label}
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="issue"
                    label={
                        <Space>
                            <ExclamationCircleOutlined />
                            Mô tả vấn đề
                        </Space>
                    }
                    rules={[{ required: true, message: "Vui lòng mô tả vấn đề" }]}
                >
                    <Input.TextArea rows={3} placeholder="Mô tả chi tiết vấn đề cần bảo trì..." />
                </Form.Item>

                <Space size="large" style={{ width: "100%" }}>
                    <Form.Item name="priority" label="Mức độ ưu tiên" rules={[{ required: true }]} style={{ width: "200px" }}>
                        <Select>
                            {priorityOptions.map((option) => (
                                <Select.Option key={option.value} value={option.value}>
                                    <Space>
                                        <span style={{ color: option.color }}>●</span>
                                        {option.label}
                                    </Space>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="assignedTo"
                        label={
                            <Space>
                                <UserOutlined />
                                Phân công
                            </Space>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <Select options={staffOptions} placeholder="Chọn nhân viên kỹ thuật" />
                    </Form.Item>
                </Space>

                <Space size="large" style={{ width: "100%" }}>
                    <Form.Item name="estimatedStartDate" label="Ngày bắt đầu dự kiến" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="estimatedDuration" label="Thời gian dự kiến" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Select>
                            <Select.Option value="1">1 ngày</Select.Option>
                            <Select.Option value="2">2 ngày</Select.Option>
                            <Select.Option value="3">3 ngày</Select.Option>
                            <Select.Option value="7">1 tuần</Select.Option>
                        </Select>
                    </Form.Item>
                </Space>
            </Form>
        </Modal>
    );
}
