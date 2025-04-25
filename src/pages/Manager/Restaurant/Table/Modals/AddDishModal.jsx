import React, { useState } from "react";
import { Modal, Form, Input, InputNumber, Select, message, Space, Divider, Typography, Tag } from "antd";
import { DollarOutlined, FieldTimeOutlined, FireOutlined } from "@ant-design/icons";

const { Text } = Typography;

const categories = [
    { value: "main", label: "Món chính" },
    { value: "appetizer", label: "Khai vị" },
    { value: "dessert", label: "Tráng miệng" },
    { value: "drink", label: "Đồ uống" },
];

const mockDishes = [
    { id: 1, name: "Gà chiên mắm", price: 120000, category: "main", prepTime: "15-20", spicyLevel: 2 },
    { id: 2, name: "Lẩu thái", price: 350000, category: "main", prepTime: "25-30", spicyLevel: 3 },
    { id: 3, name: "Canh chua cá", price: 95000, category: "main", prepTime: "20-25", spicyLevel: 1 },
    { id: 4, name: "Bò lúc lắc", price: 135000, category: "main", prepTime: "15-20", spicyLevel: 0 },
];

export default function AddDishModal({ open, onClose, onAdd }) {
    const [form] = Form.useForm();
    const [selectedDish, setSelectedDish] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleDishSelect = (value) => {
        const dish = mockDishes.find((d) => d.id === value);
        setSelectedDish(dish);
    };

    const handleFinish = (values) => {
        if (!selectedDish) {
            message.error("Vui lòng chọn món ăn");
            return;
        }

        const newDish = {
            id: selectedDish.id,
            name: selectedDish.name,
            quantity: values.quantity,
            price: selectedDish.price,
            note: values.note || "",
            status: "cooking",
        };

        onAdd(newDish);
        message.success("Đã thêm món vào bàn");
        form.resetFields();
        setSelectedDish(null);
        onClose?.();
    };

    return (
        <Modal
            open={open}
            title="Gọi món mới"
            onCancel={() => {
                form.resetFields();
                setSelectedDish(null);
                onClose?.();
            }}
            onOk={() => form.submit()}
            okText="Thêm món"
            cancelText="Hủy"
            width={600}
        >
            <Form layout="vertical" form={form} onFinish={handleFinish}>
                <Space style={{ marginBottom: 16 }}>
                    {categories.map((cat) => (
                        <Tag
                            key={cat.value}
                            color={selectedCategory === cat.value ? "blue" : "default"}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedCategory(cat.value)}
                        >
                            {cat.label}
                        </Tag>
                    ))}
                </Space>

                <Form.Item label="Chọn món" name="dishId" rules={[{ required: true, message: "Vui lòng chọn món ăn" }]}>
                    <Select placeholder="Chọn món ăn" onChange={handleDishSelect} showSearch optionFilterProp="children">
                        {(selectedCategory ? mockDishes.filter((d) => d.category === selectedCategory) : mockDishes).map((dish) => (
                            <Select.Option key={dish.id} value={dish.id}>
                                <Space>
                                    {dish.name}
                                    <Text type="secondary">({dish.price.toLocaleString()}đ)</Text>
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {selectedDish && (
                    <>
                        <Divider />
                        <Space wrap style={{ marginBottom: 16 }}>
                            <Tag icon={<DollarOutlined />} color="blue">
                                Giá: {selectedDish.price.toLocaleString()}đ
                            </Tag>
                            <Tag icon={<FieldTimeOutlined />} color="orange">
                                Thời gian: {selectedDish.prepTime} phút
                            </Tag>
                            <Tag icon={<FireOutlined />} color="red">
                                Độ cay: {"🌶".repeat(selectedDish.spicyLevel)}
                            </Tag>
                        </Space>
                    </>
                )}

                <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: "Nhập số lượng" }]} initialValue={1}>
                    <InputNumber min={1} max={20} style={{ width: "100%" }} addonAfter="phần" />
                </Form.Item>

                <Form.Item label="Ghi chú đặc biệt" name="note">
                    <Input.TextArea rows={3} placeholder="Ví dụ: Ít cay, không hành..." maxLength={100} showCount />
                </Form.Item>
            </Form>
        </Modal>
    );
}
