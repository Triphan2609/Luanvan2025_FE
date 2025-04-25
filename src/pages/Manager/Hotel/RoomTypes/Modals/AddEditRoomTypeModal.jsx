import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Space } from "antd";
import { HomeOutlined, DollarOutlined } from "@ant-design/icons";

const bedTypes = [
    { label: "Giường đơn", value: "Single" },
    { label: "Giường đôi", value: "Double" },
];

export default function AddEditRoomTypeModal({ open, onClose, onSubmit, initialData }) {
    const [form] = Form.useForm();

    // Reset form khi mở modal mới
    useEffect(() => {
        if (open) {
            form.resetFields();
            // Nếu có id trong initialData thì set các giá trị form
            if (initialData?.id) {
                form.setFieldsValue(initialData);
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            // Nếu có id thì là edit, không thì là add
            const submitData = initialData?.id ? { ...values, id: initialData.id } : values;
            onSubmit(submitData);
            form.resetFields();
            onClose();
        });
    };

    return (
        <Modal
            title={
                <Space>
                    <HomeOutlined />
                    {initialData?.id ? "Chỉnh sửa loại phòng" : "Thêm loại phòng mới"}
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
                <Form.Item name="name" label="Tên loại phòng" rules={[{ required: true, message: "Vui lòng nhập tên loại phòng" }]}>
                    <Input placeholder="VD: Phòng đơn, Phòng đôi..." />
                </Form.Item>

                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}>
                    <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về loại phòng..." />
                </Form.Item>

                <Space size="large" style={{ width: "100%" }}>
                    <Form.Item name="bedCount" label="Số lượng giường" rules={[{ required: true }]} style={{ width: "150px" }}>
                        <InputNumber min={1} max={4} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="bedType" label="Loại giường" rules={[{ required: true }]} style={{ width: "200px" }}>
                        <Select options={bedTypes} placeholder="Chọn loại giường" />
                    </Form.Item>
                </Space>

                <Form.Item
                    name="basePrice"
                    label={
                        <Space>
                            <DollarOutlined />
                            Giá cơ bản/đêm
                        </Space>
                    }
                    rules={[{ required: true }]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        step={100000}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        addonAfter="đ"
                        placeholder="Nhập giá phòng"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
