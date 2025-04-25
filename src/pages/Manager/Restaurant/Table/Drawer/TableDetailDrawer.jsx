// TableDetailDrawer.jsx
import React, { useState } from "react";
import {
    Drawer,
    Descriptions,
    Button,
    Space,
    message,
    List,
    Tag,
    Select,
    Divider,
    Typography,
    Badge,
    Statistic,
    Row,
    Col,
    Timeline,
    Popconfirm,
    Empty,
} from "antd";
import {
    UserOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    TableOutlined,
    DeleteOutlined,
    EditOutlined,
    CheckCircleOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import AddServiceModal from "../Modals/AddServiceModal";
import AddDishModal from "../Modals/AddDishModal";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
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

    const handleStatusChange = (itemId, newStatus) => {
        const updatedTables = tables.map((t) =>
            t.id === table.id
                ? {
                      ...t,
                      orders: t.orders.map((order) => (order.id === itemId ? { ...order, status: newStatus } : order)),
                  }
                : t
        );
        setTables(updatedTables);
        message.success("Đã cập nhật trạng thái!");
    };

    return (
        <>
            <Drawer
                title={
                    <Space>
                        <TableOutlined />
                        <span>Chi tiết {table.name}</span>
                        <Badge
                            status={table.status === "available" ? "success" : "error"}
                            text={table.status === "available" ? "Còn trống" : "Đang sử dụng"}
                        />
                    </Space>
                }
                placement="right"
                width={500}
                onClose={onClose}
                open={open}
                extra={
                    <Button type="primary" danger onClick={() => navigate("/restaurant/payment")}>
                        Thanh toán
                    </Button>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Statistic title="Tổng món" value={orderItems.length} prefix={<ShoppingCartOutlined />} />
                    </Col>
                    <Col span={12}>
                        <Statistic title="Tổng tiền" value={total} prefix={<DollarOutlined />} suffix="đ" />
                    </Col>
                </Row>

                <Divider />

                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Số chỗ ngồi">
                        <UserOutlined /> {table.seats} người
                    </Descriptions.Item>
                    <Descriptions.Item label="Chuyển đến">
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

                <Divider orientation="left">Đơn hiện tại</Divider>

                {orderItems.length === 0 ? (
                    <Empty description="Chưa có món nào được gọi" />
                ) : (
                    <List
                        dataSource={orderItems}
                        renderItem={(item) => (
                            <List.Item
                                actions={[
                                    <Popconfirm title="Xác nhận món đã hoàn thành?" onConfirm={() => handleStatusChange(item.id, "done")}>
                                        <Button type="link" icon={<CheckCircleOutlined />} disabled={item.status === "done"}>
                                            Hoàn thành
                                        </Button>
                                    </Popconfirm>,
                                    <Button type="link" danger icon={<DeleteOutlined />}>
                                        Xóa
                                    </Button>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            {item.name}
                                            <Badge
                                                status={item.status === "done" ? "success" : "processing"}
                                                text={item.status === "done" ? "Đã hoàn thành" : "Đang chế biến"}
                                            />
                                        </Space>
                                    }
                                    description={
                                        <Space direction="vertical">
                                            <Text>
                                                {item.quantity} x {item.price.toLocaleString()}đ ={" "}
                                                <Text strong>{(item.quantity * item.price).toLocaleString()}đ</Text>
                                            </Text>
                                            {item.note && <Tag color="orange">Ghi chú: {item.note}</Tag>}
                                        </Space>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}

                <Divider />

                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Button type="primary" onClick={() => setIsFoodModalOpen(true)}>
                        Gọi thêm món
                    </Button>
                    <Button onClick={() => setIsServiceModalOpen(true)}>Thêm dịch vụ</Button>
                </Space>
            </Drawer>

            <AddServiceModal open={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onAdd={updateTableOrders} />
            <AddDishModal open={isFoodModalOpen} onClose={() => setIsFoodModalOpen(false)} onAdd={updateTableOrders} />
        </>
    );
}
