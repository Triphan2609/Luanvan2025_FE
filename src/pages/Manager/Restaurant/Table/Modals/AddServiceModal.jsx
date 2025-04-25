// AddServiceModal.jsx
import React from "react";
import { Modal, Form, Input, InputNumber, Select, message, Space, Tag } from "antd";
import { ShoppingOutlined, DollarOutlined } from "@ant-design/icons";

const commonServices = [
    { id: 1, name: "Khăn lạnh", price: 5000 },
    { id: 2, name: "Nước suối", price: 15000 },
    { id: 3, name: "Đá", price: 10000 },
];

const AddServiceModal = ({ open, onClose, onAdd }) => {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                onAdd({ ...values, status: "done" });
                form.resetFields();
                message.success("Thêm dịch vụ thành công");
                onClose();
            })
            .catch(() => {});
    };

    const handleQuickAdd = (service) => {
        form.setFieldsValue({
            name: service.name,
            price: service.price,
            quantity: 1,
        });
    };

    return (
        <Modal
            title={
                <Space>
                    <ShoppingOutlined />
                    Thêm dịch vụ
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            okText="Thêm"
            cancelText="Hủy"
            width={500}
        >
            <Space style={{ marginBottom: 16 }}>
                <Text>Dịch vụ phổ biến:</Text>
                {commonServices.map((service) => (
                    <Tag key={service.id} color="blue" style={{ cursor: "pointer" }} onClick={() => handleQuickAdd(service)}>
                        {service.name} ({service.price.toLocaleString()}đ)
                    </Tag>
                ))}
            </Space>

            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: "Nhập tên dịch vụ" }]}>
                    <Input placeholder="VD: Khăn lạnh, Nước suối..." />
                </Form.Item>

                <Form.Item name="quantity" label="Số lượng" initialValue={1} rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: "100%" }} addonAfter="cái/chai" />
                </Form.Item>

                <Form.Item
                    name="price"
                    label={
                        <Space>
                            <DollarOutlined />
                            Đơn giá
                        </Space>
                    }
                    rules={[{ required: true }]}
                >
                    <InputNumber
                        min={0}
                        step={1000}
                        style={{ width: "100%" }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        addonAfter="đ"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddServiceModal;
