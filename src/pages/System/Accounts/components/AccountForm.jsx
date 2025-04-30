import React, { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";

const AccountForm = ({ open, onCancel, onSubmit, editingAccount, ACCOUNT_ROLE }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingAccount) {
            form.setFieldsValue({
                ...editingAccount,
                role: editingAccount.role?.id, // Đặt giá trị role là roleId
            });
        } else {
            form.resetFields();
        }
    }, [editingAccount, form]);

    const handleSubmit = async (values) => {
        try {
            // Chuyển đổi role thành roleId trước khi gửi
            const payload = {
                ...values,
                roleId: values.role, // Gửi roleId thay vì role
            };

            await onSubmit(payload); // Gọi hàm onSubmit từ props
            message.success(editingAccount ? "Cập nhật tài khoản thành công!" : "Tạo tài khoản mới thành công!");
            form.resetFields();
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        }
    };

    return (
        <Modal
            title={editingAccount ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
            open={open}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText={editingAccount ? "Cập nhật" : "Tạo mới"}
            cancelText="Hủy"
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
                    <Input placeholder="Nhập tên đăng nhập (ví dụ: admin123)" />
                </Form.Item>
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
                    <Input placeholder="Nhập email (ví dụ: example@gmail.com)" />
                </Form.Item>
                <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}>
                    <Select placeholder="Chọn vai trò">
                        {ACCOUNT_ROLE.map((role) => (
                            <Select.Option key={role.id} value={role.id}>
                                {role.name}
                            </Select.Option>
                        ))}
                    </Select>
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
                {!editingAccount && (
                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu" />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default AccountForm;
