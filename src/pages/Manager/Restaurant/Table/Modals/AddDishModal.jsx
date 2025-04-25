import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, message } from "antd";

const { Option } = Select;

const mockDishes = [
    { name: "Gà chiên mắm", price: 120000 },
    { name: "Lẩu thái", price: 350000 },
    { name: "Canh chua cá", price: 95000 },
    { name: "Bò lúc lắc", price: 135000 },
];

export default function AddDishModal({ open, onClose, onAdd }) {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        const selectedDish = mockDishes.find((d) => d.name === values.dishName);
        if (!selectedDish) {
            message.error("Món ăn không hợp lệ.");
            return;
        }

        const newDish = {
            name: values.dishName,
            quantity: values.quantity,
            price: selectedDish.price,
            note: values.note || "",
            status: "cooking",
        };

        onAdd(newDish);
        message.success("Đã thêm món vào bàn");
        form.resetFields();
        onClose?.(); // Đóng modal sau khi thêm xong
    };

    return (
        <Modal
            open={open}
            title="Gọi món mới"
            onCancel={() => {
                form.resetFields();
                onClose?.(); // Đóng khi bấm nút huỷ
            }}
            onOk={() => form.submit()}
            okText="Thêm món"
            cancelText="Hủy"
        >
            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Form.Item label="Tên món" name="dishName" rules={[{ required: true, message: "Vui lòng chọn món ăn" }]}>
                    <Select placeholder="Chọn món ăn">
                        {mockDishes.map((dish) => (
                            <Option key={dish.name} value={dish.name}>
                                {dish.name} ({dish.price.toLocaleString()}đ)
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: "Nhập số lượng" }]} initialValue={1}>
                    <InputNumber min={1} max={20} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Ghi chú" name="note">
                    <Input.TextArea rows={2} placeholder="Ví dụ: Ít cay, không hành..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
