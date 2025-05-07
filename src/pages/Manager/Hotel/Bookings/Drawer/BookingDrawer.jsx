import React from "react";
import {
    Drawer,
    Descriptions,
    Space,
    Button,
    Tag,
    Typography,
    Divider,
    Badge,
    Popconfirm,
} from "antd";
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
    LoginOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

// Định nghĩa bookingStatus để hiển thị trạng thái đặt phòng
const bookingStatus = {
    pending: { color: "warning", text: "Chờ xác nhận" },
    confirmed: { color: "processing", text: "Đã xác nhận" },
    checkedIn: { color: "success", text: "Đã check-in" },
    checkedOut: { color: "default", text: "Đã check-out" },
    cancelled: { color: "error", text: "Đã hủy" },
    rejected: { color: "error", text: "Từ chối" },
};

export default function BookingDrawer({
    open,
    onClose,
    booking,
    onEdit,
    onDelete,
    onCheckIn,
    onCheckOut,
}) {
    if (!booking) return null;

    // Xác định các action dựa vào trạng thái hiện tại
    const showCheckInButton = booking.status === "confirmed";
    const showCheckOutButton = booking.status === "checkedIn";

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
                        disabled={[
                            "rejected",
                            "cancelled",
                            "checkedOut",
                        ].includes(booking.status)}
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
                {/* Nút check-in/check-out */}
                {(showCheckInButton || showCheckOutButton) && (
                    <div style={{ marginBottom: "16px" }}>
                        {showCheckInButton && onCheckIn && (
                            <Popconfirm
                                title="Xác nhận check-in"
                                description={`Xác nhận check-in cho khách hàng ${
                                    booking.customer?.name ||
                                    booking.customerName
                                }?`}
                                okText="Xác nhận"
                                cancelText="Hủy"
                                onConfirm={() => onCheckIn(booking.id)}
                            >
                                <Button
                                    type="primary"
                                    icon={<LoginOutlined />}
                                    style={{ marginRight: "8px" }}
                                >
                                    Check-in
                                </Button>
                            </Popconfirm>
                        )}

                        {showCheckOutButton && onCheckOut && (
                            <Popconfirm
                                title="Xác nhận check-out"
                                description={`Xác nhận check-out cho khách hàng ${
                                    booking.customer?.name ||
                                    booking.customerName
                                }?`}
                                okText="Xác nhận"
                                cancelText="Hủy"
                                onConfirm={() => onCheckOut(booking.id)}
                            >
                                <Button
                                    type="primary"
                                    danger
                                    icon={<LogoutOutlined />}
                                >
                                    Check-out
                                </Button>
                            </Popconfirm>
                        )}
                    </div>
                )}

                <div>
                    <Title level={5}>
                        <Space>
                            <UserOutlined />
                            Thông tin khách hàng
                        </Space>
                    </Title>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Họ tên">
                            {booking.customer?.name ||
                                booking.customerName ||
                                "Không có thông tin"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            <PhoneOutlined />{" "}
                            {booking.customer?.phone ||
                                booking.phone ||
                                "Không có thông tin"}
                        </Descriptions.Item>
                        {booking.customer?.email && (
                            <Descriptions.Item label="Email">
                                {booking.customer.email}
                            </Descriptions.Item>
                        )}
                        {booking.customer?.idCard && (
                            <Descriptions.Item label="CMND/CCCD">
                                {booking.customer.idCard}
                            </Descriptions.Item>
                        )}
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
                                    <HomeOutlined /> Số phòng:{" "}
                                    {booking.room?.roomCode ||
                                        booking.roomNumber ||
                                        "Không có thông tin"}
                                </Text>
                                <Text type="secondary">
                                    Loại phòng:{" "}
                                    {booking.room?.roomType?.name ||
                                        booking.roomType ||
                                        "Không có thông tin"}
                                </Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian">
                            <Space direction="vertical">
                                <Text>
                                    <CalendarOutlined /> Check-in:{" "}
                                    {booking.checkInDate || booking.checkIn
                                        ? dayjs(
                                              booking.checkInDate ||
                                                  booking.checkIn
                                          ).format("DD/MM/YYYY")
                                        : "Không có thông tin"}
                                </Text>
                                <Text>
                                    <CalendarOutlined /> Check-out:{" "}
                                    {booking.checkOutDate || booking.checkOut
                                        ? dayjs(
                                              booking.checkOutDate ||
                                                  booking.checkOut
                                          ).format("DD/MM/YYYY")
                                        : "Không có thông tin"}
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
                            <Tag
                                color={
                                    booking.paymentStatus === "paid"
                                        ? "success"
                                        : "warning"
                                }
                            >
                                {booking.paymentStatus === "paid"
                                    ? "Đã thanh toán"
                                    : "Chưa thanh toán"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái đặt phòng">
                            {booking.status && bookingStatus[booking.status] ? (
                                <Badge
                                    status={bookingStatus[booking.status].color}
                                    text={bookingStatus[booking.status].text}
                                />
                            ) : (
                                <Badge status="default" text="Không xác định" />
                            )}
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
