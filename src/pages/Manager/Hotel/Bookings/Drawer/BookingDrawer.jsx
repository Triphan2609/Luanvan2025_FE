import React from "react";
import { Drawer, Descriptions, Space, Button, Tag, Typography, Divider, Badge, Popconfirm } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    PhoneOutlined,
    HomeOutlined,
    CalendarOutlined,
    TeamOutlined,
    CreditCardOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export default function BookingDrawer({ open, onClose, booking, onEdit, onDelete }) {
    if (!booking) return null;

    return (
        <Drawer
            title={
                <Space>
                    <UserOutlined />
                    Chi tiết đặt phòng
                </Space>
            }
            width={520}
            open={open}
            onClose={onClose}
            extra={
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => onEdit(booking)}
                        disabled={["rejected", "cancelled", "checkedOut"].includes(booking.status)}
                    >
                        Chỉnh sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa đặt phòng này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => onDelete(booking.id)}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                    <Title level={5}>
                        <Space>
                            <UserOutlined />
                            Thông tin khách hàng
                        </Space>
                    </Title>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Họ tên">{booking.customerName}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            <PhoneOutlined /> {booking.phone}
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                <div>
                    <Title level={5}>
                        <Space>
                            <HomeOutlined />
                            Chi tiết phòng
                        </Space>
                    </Title>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Phòng">
                            <Space direction="vertical">
                                <Text>
                                    <HomeOutlined /> Số phòng: {booking.roomNumber}
                                </Text>
                                <Text type="secondary">Loại phòng: {booking.roomType}</Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian">
                            <Space direction="vertical">
                                <Text>
                                    <CalendarOutlined /> Check-in: {dayjs(booking.checkIn).format("DD/MM/YYYY")}
                                </Text>
                                <Text>
                                    <CalendarOutlined /> Check-out: {dayjs(booking.checkOut).format("DD/MM/YYYY")}
                                </Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Số người">
                            <Space direction="vertical">
                                <Tag icon={<TeamOutlined />} color="blue">
                                    {booking.adults} người lớn
                                </Tag>
                                {booking.children > 0 && (
                                    <Tag icon={<TeamOutlined />} color="cyan">
                                        {booking.children} trẻ em
                                    </Tag>
                                )}
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                <div>
                    <Title level={5}>
                        <Space>
                            <CreditCardOutlined />
                            Thanh toán
                        </Space>
                    </Title>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Tổng tiền">
                            <Text strong type="success">
                                {booking.totalAmount?.toLocaleString()}đ
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái thanh toán">
                            <Tag color={booking.paymentStatus === "paid" ? "success" : "warning"}>
                                {booking.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái đặt phòng">
                            <Badge status={bookingStatus[booking.status].color} text={bookingStatus[booking.status].text} />
                        </Descriptions.Item>
                    </Descriptions>
                </div>

                {booking.note && (
                    <div>
                        <Title level={5}>
                            <Space>
                                <FileTextOutlined />
                                Ghi chú
                            </Space>
                        </Title>
                        <div
                            style={{
                                background: "#f5f5f5",
                                padding: 16,
                                borderRadius: 4,
                            }}
                        >
                            {booking.note}
                        </div>
                    </div>
                )}
            </Space>
        </Drawer>
    );
}
