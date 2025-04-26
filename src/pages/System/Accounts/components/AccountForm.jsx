import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Space, Button, Divider, Transfer } from "antd";

const AccountForm = ({ open, onCancel, onSubmit, editingAccount, ACCOUNT_ROLE }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingAccount) {
            form.setFieldsValue(editingAccount);
        } else {
            form.resetFields();
        }
    }, [editingAccount, form]);

    const handleSubmit = (values) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal
            title={editingAccount ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                        { min: 4, message: "Tên đăng nhập phải có ít nhất 4 ký tự!" },
                    ]}
                >
                    <Input disabled={!!editingAccount} placeholder="Nhập tên đăng nhập" />
                </Form.Item>

                {!editingAccount && (
                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu!" },
                            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>
                )}

                <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}>
                    <Input placeholder="Nhập họ và tên" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                    ]}
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>

                <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
                    <Select placeholder="Chọn vai trò">
                        <Select.Option value={ACCOUNT_ROLE.ADMIN}>Quản trị viên</Select.Option>
                        <Select.Option value={ACCOUNT_ROLE.MANAGER}>Quản lý</Select.Option>
                        <Select.Option value={ACCOUNT_ROLE.STAFF}>Nhân viên</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingAccount ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AccountForm;
