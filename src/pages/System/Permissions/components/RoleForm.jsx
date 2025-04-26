import React from "react";
import { Modal, Form, Input, Space, Button, ColorPicker } from "antd";

const { TextArea } = Input;

const RoleForm = ({ open, onCancel, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal title="Thêm vai trò mới" open={open} onCancel={onCancel} footer={null} width={500}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="name" label="Tên vai trò" rules={[{ required: true, message: "Vui lòng nhập tên vai trò!" }]}>
                    <Input placeholder="Nhập tên vai trò" />
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

                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}>
                    <TextArea rows={4} placeholder="Nhập mô tả về vai trò" />
                </Form.Item>

                <Form.Item name="color" label="Màu hiển thị" rules={[{ required: true, message: "Vui lòng chọn màu!" }]}>
                    <ColorPicker />
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
