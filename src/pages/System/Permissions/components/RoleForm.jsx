import React, { useState } from "react";
import { Modal, Form, Input, Space, Button, ColorPicker } from "antd";

const RoleForm = ({ open, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    const [color, setColor] = useState("#1890ff"); // Màu mặc định

    const handleSubmit = (values) => {
        onSubmit({ ...values, color }); // Gửi màu sắc cùng với các giá trị khác
        form.resetFields();
        setColor("#1890ff"); // Reset màu về mặc định
    };

    return (
        <Modal
            title={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Thêm vai trò mới</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={500}
        >
            <p style={{ marginBottom: "16px", color: "#888" }}>Điền thông tin vai trò và chọn màu sắc hiển thị để dễ dàng quản lý.</p>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: "Vui lòng nhập tên vai trò!" }]}>
                    <Input placeholder="Nhập tên vai trò (ví dụ: Quản trị viên)" />
                </Form.Item>
                <Form.Item
                    name="code"
                    label="Mã vai trò"
                    rules={[
                        { required: true, message: "Vui lòng nhập mã vai trò!" },
                        { pattern: /^[A-Z_]+$/, message: "Mã vai trò chỉ được chứa chữ hoa và dấu gạch dưới!" },
                    ]}
                >
                    <Input placeholder="Ví dụ: MANAGER, STAFF" style={{ textTransform: "uppercase" }} />
                </Form.Item>
                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả vai trò!" }]}>
                    <Input.TextArea placeholder="Nhập mô tả vai trò (ví dụ: Vai trò quản lý toàn bộ hệ thống)" />
                </Form.Item>
                <Form.Item label="Màu hiển thị">
                    <ColorPicker value={color} onChange={(newColor) => setColor(newColor.toHexString())} />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            Thêm mới
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RoleForm;
