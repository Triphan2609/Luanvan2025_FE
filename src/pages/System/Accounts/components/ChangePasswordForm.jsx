import React from "react";
import { Modal, Form, Input, Space, Button } from "antd";

const ChangePasswordForm = ({ open, onCancel, onSubmit, account }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal title="Đổi mật khẩu" open={open} onCancel={onCancel} footer={null}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                        { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={["newPassword"]}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            Xác nhận
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChangePasswordForm;
