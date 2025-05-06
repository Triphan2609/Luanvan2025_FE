import React, { useEffect } from "react";
import { Modal, Form, Input, Space, message } from "antd";
import {
    TagOutlined,
    FontSizeOutlined,
    FileTextOutlined,
} from "@ant-design/icons";

export default function AddEditAmenityModal({
    open,
    onClose,
    onSubmit,
    initialData,
}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialData) {
                form.setFieldsValue(initialData);
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                const formData = initialData
                    ? { ...values, id: initialData.id }
                    : values;
                onSubmit(formData);
                form.resetFields();
                onClose();
            })
            .catch(() => {
                message.error("Vui lòng kiểm tra lại thông tin!");
            });
    };

    return (
        <Modal
            title={
                <Space>
                    <TagOutlined />
                    {initialData ? "Chỉnh sửa tiện nghi" : "Thêm tiện nghi mới"}
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            width={500}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên hiển thị"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên tiện nghi",
                        },
                    ]}
                >
                    <Input
                        prefix={<FontSizeOutlined />}
                        placeholder="VD: Điều hòa, TV, WiFi"
                    />
                </Form.Item>

                <Form.Item
                    name="value"
                    label="Giá trị"
                    rules={[
                        { required: true, message: "Vui lòng nhập giá trị" },
                    ]}
                    tooltip="Giá trị kỹ thuật để lưu trữ trong hệ thống (không dấu, viết liền)"
                >
                    <Input
                        prefix={<TagOutlined />}
                        placeholder="VD: AC, TV, WiFi"
                    />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea
                        prefix={<FileTextOutlined />}
                        rows={4}
                        placeholder="Nhập mô tả về tiện nghi này..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
