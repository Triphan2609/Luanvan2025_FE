// AddServiceModal.jsx
import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Button, message } from "antd";

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

    return (
        <Modal title="Thêm dịch vụ" open={open} onCancel={onClose} onOk={handleSubmit} okText="Thêm">
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: "Nhập tên dịch vụ" }]}>
                    <Input placeholder="VD: Khăn lạnh, Nước suối..." />
                </Form.Item>
                <Form.Item name="quantity" label="Số lượng" initialValue={1} rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="price" label="Đơn giá (đ)" rules={[{ required: true }]}>
                    <InputNumber min={0} step={1000} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddServiceModal;
