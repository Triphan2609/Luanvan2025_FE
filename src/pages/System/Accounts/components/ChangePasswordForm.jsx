import React, { useEffect } from "react";
import { Modal, Form, Input, Space, Button, message } from "antd";

const ChangePasswordForm = ({ open, onCancel, onSubmit, account }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (account) {
            form.resetFields(); // Reset form khi tài khoản thay đổi
        }
    }, [account, form]);

    const handleSubmit = async (values) => {
        try {
            await onSubmit(values); // Gọi hàm onSubmit từ props
            message.success("Đổi mật khẩu thành công!");
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        }
    };

    return (
        <Modal title={`Đổi mật khẩu cho tài khoản: ${account?.username || "N/A"}`} open={open} onCancel={onCancel} footer={null}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="currentPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

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
