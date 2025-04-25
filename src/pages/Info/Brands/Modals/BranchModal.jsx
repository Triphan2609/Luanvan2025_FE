import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";

const { Option } = Select;

export default function BranchModal({ open, onCancel, onSave, initialData }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                const dataToSave = initialData ? { ...initialData, ...values } : values;
                onSave(dataToSave);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    return (
        <Modal
            title={initialData ? "Chỉnh sửa Chi nhánh" : "Thêm Chi nhánh"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            okText="Lưu"
            cancelText="Hủy"
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên chi nhánh" rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}>
                    <Input placeholder="Nhập tên chi nhánh" />
                </Form.Item>

                <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
                    <Input placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Email không hợp lệ" }]}>
                    <Input placeholder="Nhập email" />
                </Form.Item>

                <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
                    <Select placeholder="Chọn trạng thái">
                        <Option value="active">Hoạt động</Option>
                        <Option value="inactive">Ngừng</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
