import React, { useEffect, useState } from "react";
import { Drawer, Descriptions, Image, Tag, Typography, List, Spin } from "antd";
import { getFoodIngredients } from "../../../../../api/restaurantApi";

const { Title } = Typography;

export default function FoodDetailDrawer({ open, onClose, food }) {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (food?.id) {
            setLoading(true);
            getFoodIngredients(food.id)
                .then((res) => setIngredients(res.data || res))
                .finally(() => setLoading(false));
        }
    }, [food?.id]);

    if (!food) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case "available":
                return "green";
            case "sold_out":
                return "orange";
            case "inactive":
                return "red";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "available":
                return "Có sẵn";
            case "sold_out":
                return "Hết hàng";
            case "inactive":
                return "Không hoạt động";
            default:
                return "Không xác định";
        }
    };

    return (
        <Drawer
            title={<Title level={4}>Chi tiết món ăn</Title>}
            width={480}
            placement="right"
            onClose={onClose}
            open={open}
        >
            {food.imageUrl && (
                <Image
                    src={food.imageUrl}
                    alt={food.name}
                    width="100%"
                    height={250}
                    style={{
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 24,
                    }}
                />
            )}

            <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Tên món">
                    {food.name}
                </Descriptions.Item>
                <Descriptions.Item label="Giá">
                    {Number(food.price).toLocaleString("vi-VN")}đ
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                    {food.category?.name || "Chưa phân loại"}
                </Descriptions.Item>
                <Descriptions.Item label="Chi nhánh">
                    {food.branch?.name || "Chưa xác định"}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                    {food.description || "Không có mô tả"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(food.status)}>
                        {getStatusText(food.status)}
                    </Tag>
                </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
                Thành phần nguyên liệu
            </Title>

            <Spin spinning={loading}>
                {ingredients.length > 0 ? (
                    <List
                        bordered
                        dataSource={ingredients}
                        renderItem={(item) => (
                            <List.Item>
                                <div style={{ width: "100%" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span style={{ fontWeight: 500 }}>
                                            {item.ingredient?.name ||
                                                "Không xác định"}
                                        </span>
                                        <Tag color="blue">
                                            {item.amount}{" "}
                                            {item.ingredient?.unit?.name
                                                ? item.ingredient.unit.name
                                                : ""}
                                        </Tag>
                                    </div>
                                    {item.ingredient?.unit?.name && (
                                        <div
                                            style={{
                                                color: "#888",
                                                fontSize: 12,
                                            }}
                                        >
                                            Đơn vị: {item.ingredient.unit.name}
                                        </div>
                                    )}
                                    {item.ingredient?.description && (
                                        <div
                                            style={{
                                                color: "#666",
                                                fontSize: "12px",
                                                marginTop: 4,
                                            }}
                                        >
                                            {item.ingredient.description}
                                        </div>
                                    )}
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "24px",
                            background: "#fafafa",
                            borderRadius: 4,
                        }}
                    >
                        Chưa có thông tin nguyên liệu
                    </div>
                )}
            </Spin>
        </Drawer>
    );
}
