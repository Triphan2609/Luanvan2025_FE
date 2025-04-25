import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";

export default function ServiceModal({ open, onCancel, onSave, initialData }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (initialData?.id) {
                onSave({ ...values, id: initialData.id });
            } else {
                onSave(values);
            }
        });
    };

    return (
        <Modal
            title={initialData ? "Cập nhật Dịch vụ" : "Thêm Dịch vụ"}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                    <Select>
                        <Select.Option value="active">Hoạt động</Select.Option>
                        <Select.Option value="inactive">Ngừng</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
