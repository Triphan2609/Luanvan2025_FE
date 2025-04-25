import React from "react";
import { Drawer, Descriptions, Image, Tag, Typography } from "antd";

const { Title } = Typography;

export default function FoodDetailDrawer({ open, onClose, food }) {
    if (!food) return null;

    return (
        <Drawer title={<Title level={4}>Chi tiết món ăn</Title>} width={480} placement="right" onClose={onClose} open={open}>
            <Image
                src={food.image || "https://via.placeholder.com/400x250?text=No+Image"}
                alt={food.name}
                width={400}
                height={250}
                style={{ objectFit: "cover", borderRadius: 8, marginBottom: 24 }}
            />

            <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Tên món">{food.name}</Descriptions.Item>
                <Descriptions.Item label="Giá">
                    {food.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </Descriptions.Item>
                <Descriptions.Item label="Phân loại">
                    <Tag color="blue">{food.category || "Chưa rõ"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Nguyên liệu">
                    {food.ingredients?.length > 0 ? (
                        <ul style={{ paddingLeft: 20 }}>
                            {food.ingredients.map((ing, index) => (
                                <li key={index}>{ing}</li>
                            ))}
                        </ul>
                    ) : (
                        "Không có thông tin"
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">{food.description || "Không có mô tả"}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={food.status === "available" ? "green" : "red"}>
                        {food.status === "available" ? "Sẵn sàng" : "Ngừng bán"}
                    </Tag>
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
}
