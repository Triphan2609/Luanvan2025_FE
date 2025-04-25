// TableDetailDrawer.jsx
import React, { useState } from "react";
import { Drawer, Descriptions, Button, Space, message, List, Tag, Select, Divider } from "antd";
import AddServiceModal from "../Modals/AddServiceModal";
import AddDishModal from "../Modals/AddDishModal";
import { useNavigate } from "react-router-dom";
const { Option } = Select;

export default function TableDetailDrawer({ open, onClose, table, tables, onChangeTable, setTables }) {
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
    const navigate = useNavigate();
    if (!table) return null;

    const orderItems = table.orders || [];
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const updateTableOrders = (newOrder) => {
        const updatedTables = tables.map((t) =>
            t.id === table.id
                ? {
                      ...t,
                      orders: [...(t.orders || []), newOrder],
                      status: "occupied",
                  }
                : t
        );
        setTables(updatedTables);
        message.success("Đã thêm vào đơn!");
    };

    return (
        <>
            <Drawer title={`Chi tiết ${table.name}`} placement="right" width={420} onClose={onClose} open={open}>
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Tên bàn">{table.name}</Descriptions.Item>
                    <Descriptions.Item label="Số chỗ ngồi">{table.seats}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <span style={{ textTransform: "capitalize" }}>{table.status}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Chuyển bàn">
                        <Select style={{ width: "100%" }} placeholder="Chọn bàn mới" onChange={(val) => onChangeTable(table.id, val)}>
                            {(tables || [])
                                .filter((t) => t.id !== table.id && t.status === "available")
                                .map((t) => (
                                    <Option key={t.id} value={t.id}>
                                        {t.name}
                                    </Option>
                                ))}
                        </Select>
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left" style={{ marginTop: 24 }}>
                    Đơn hàng hiện tại
                </Divider>
                {orderItems.length === 0 ? (
                    <p>Chưa có món nào được gọi.</p>
                ) : (
                    <List
                        bordered
                        dataSource={orderItems}
                        renderItem={(item) => (
                            <List.Item>
                                <div style={{ width: "100%" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <strong>{item.name}</strong>
                                        <span>
                                            {item.quantity} x {item.price.toLocaleString()}đ
                                        </span>
                                    </div>
                                    <Tag color={item.status === "done" ? "green" : "orange"}>
                                        {item.status === "done" ? "Đã làm" : "Đang chế biến"}
                                    </Tag>
                                </div>
                            </List.Item>
                        )}
                    />
                )}

                <Divider />
                <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tạm tính">
                        <strong style={{ color: "#1890ff" }}>{total.toLocaleString()}đ</strong>
                    </Descriptions.Item>
                </Descriptions>

                <Space style={{ marginTop: 24 }} wrap>
                    <Button type="primary" onClick={() => setIsFoodModalOpen(true)}>
                        Gọi món
                    </Button>
                    <Button onClick={() => setIsServiceModalOpen(true)}>Thêm dịch vụ</Button>
                    <Button danger onClick={() => navigate("/restaurant/payment")}>
                        Thanh toán
                    </Button>
                </Space>
            </Drawer>

            <AddServiceModal open={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onAdd={updateTableOrders} />
            <AddDishModal open={isFoodModalOpen} onClose={() => setIsFoodModalOpen(false)} onAdd={updateTableOrders} />
        </>
    );
}
