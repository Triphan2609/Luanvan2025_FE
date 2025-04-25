import React, { useState } from "react";
import { Card, Table, Button, Tag, Space, Input, DatePicker, Select, Typography, Badge, Tooltip, message, Popconfirm } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SearchOutlined,
    CalendarOutlined,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CreditCardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import BookingModal from "./Modals/BookingModal";
import BookingDrawer from "./Drawer/BookingDrawer";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const bookingStatus = {
    pending: { color: "warning", text: "Chờ xác nhận" },
    confirmed: { color: "processing", text: "Đã xác nhận" },
    checkedIn: { color: "success", text: "Đã check-in" },
    checkedOut: { color: "default", text: "Đã check-out" },
    cancelled: { color: "error", text: "Đã hủy" },
    rejected: { color: "error", text: "Từ chối" },
};

// const initialBookings = [
//     {
//         id: 1,
//         customerName: "Nguyen Van A",
//         phone: "0909123456",
//         checkIn: "2025-04-25",
//         checkOut: "2025-04-27",
//         roomType: "Phòng đôi",
//         roomNumber: "201",
//         adults: 2,
//         children: 1,
//         totalAmount: 1400000,
//         status: "pending",
//         note: "Yêu cầu tầng cao",
//         paymentStatus: "unpaid",
//     },
//     {
//         id: 2,
//         customerName: "Tran Thi B",
//         phone: "0908765432",
//         checkIn: "2025-04-26",
//         checkOut: "2025-04-28",
//         roomType: "Phòng đơn",
//         roomNumber: "101",
//         adults: 1,
//         children: 0,
//         totalAmount: 800000,
//         status: "confirmed",
//         note: "",
//         paymentStatus: "paid",
//     },
// ];

export default function BookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleAdd = () => {
        setEditingBooking(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingBooking(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setBookings((prev) => prev.filter((booking) => booking.id !== id));
        message.success("Đã xóa đặt phòng thành công");
    };

    const handleSave = (data) => {
        if (data.id) {
            setBookings((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } : b)));
            message.success("Cập nhật đặt phòng thành công");
        } else {
            const newBooking = {
                ...data,
                id: Date.now(),
                status: "pending",
                paymentStatus: "unpaid",
            };
            setBookings((prev) => [...prev, newBooking]);
            message.success("Thêm đặt phòng mới thành công");
        }
        setIsModalOpen(false);
    };

    const handleView = (record) => {
        setSelectedBooking(record);
        setIsDrawerOpen(true);
    };

    const columns = [
        {
            title: "Khách hàng",
            dataIndex: "customerName",
            key: "customer",
            sorter: (a, b) => a.customerName.localeCompare(b.customerName),
            render: (name, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{name}</Text>
                    <Text type="secondary">
                        <PhoneOutlined /> {record.phone}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Phòng",
            key: "room",
            filters: [...new Set(bookings.map((item) => item.roomType))].map((type) => ({
                text: type,
                value: type,
            })),
            onFilter: (value, record) => record.roomType === value,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        <HomeOutlined /> {record.roomNumber}
                    </Text>
                    <Text type="secondary">{record.roomType}</Text>
                </Space>
            ),
        },
        {
            title: "Check-in/out",
            key: "dates",
            sorter: (a, b) => dayjs(a.checkIn).unix() - dayjs(b.checkIn).unix(),
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        <CalendarOutlined /> {dayjs(record.checkIn).format("DD/MM/YYYY")}
                    </Text>
                    <Text type="secondary">
                        <CalendarOutlined /> {dayjs(record.checkOut).format("DD/MM/YYYY")}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Số người",
            key: "guests",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag icon={<UserOutlined />} color="blue">
                        {record.adults} người lớn
                    </Tag>
                    {record.children > 0 && (
                        <Tag icon={<UserOutlined />} color="cyan">
                            {record.children} trẻ em
                        </Tag>
                    )}
                </Space>
            ),
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            key: "amount",
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (amount, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong type="success">
                        {amount.toLocaleString()}đ
                    </Text>
                    <Tag color={record.paymentStatus === "paid" ? "success" : "warning"}>
                        {record.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </Tag>
                </Space>
            ),
        },
        {
            title: "Trạng thái",
            key: "status",
            filters: Object.entries(bookingStatus).map(([key, value]) => ({
                text: value.text,
                value: key,
            })),
            onFilter: (value, record) => record.status === value,
            render: (_, record) => <Badge status={bookingStatus[record.status].color} text={bookingStatus[record.status].text} />,
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 240,
            render: (_, record) => (
                <Space>
                    {record.status === "pending" && (
                        <>
                            <Popconfirm
                                title="Xác nhận đặt phòng"
                                description={`Xác nhận đặt phòng cho khách hàng ${record.customerName}?`}
                                icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                                okText="Xác nhận"
                                cancelText="Hủy"
                                onConfirm={() => {
                                    setBookings((prev) =>
                                        prev.map((item) => (item.id === record.id ? { ...item, status: "confirmed" } : item))
                                    );
                                    message.success("Đã xác nhận đặt phòng thành công");
                                }}
                            >
                                <Tooltip title="Xác nhận">
                                    <Button type="primary" icon={<CheckCircleOutlined />} />
                                </Tooltip>
                            </Popconfirm>

                            <Popconfirm
                                title="Từ chối đặt phòng"
                                description={
                                    <div>
                                        <p>{`Bạn có chắc muốn từ chối đặt phòng của ${record.customerName}?`}</p>
                                        <Input.TextArea
                                            placeholder="Nhập lý do từ chối..."
                                            onChange={(e) => (record.rejectReason = e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                }
                                icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                                okText="Từ chối"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => {
                                    setBookings((prev) =>
                                        prev.map((item) => (item.id === record.id ? { ...item, status: "rejected" } : item))
                                    );
                                    message.success("Đã từ chối đặt phòng");
                                }}
                            >
                                <Tooltip title="Từ chối">
                                    <Button danger icon={<CloseCircleOutlined />} />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}
                    <Tooltip title="Xem chi tiết">
                        <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            disabled={["rejected", "cancelled", "checkedOut"].includes(record.status)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa đặt phòng này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="Xóa">
                            <Button danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Space style={{ justifyContent: "space-between", width: "100%" }}>
                    <Title level={4} style={{ margin: 0 }}>
                        <HomeOutlined /> Quản lý Đặt phòng
                    </Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm đặt phòng
                    </Button>
                </Space>

                <Table
                    columns={columns}
                    dataSource={bookings}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng số ${total} đặt phòng`,
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                />
            </Space>

            <BookingModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingBooking} />

            <BookingDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                booking={selectedBooking}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Card>
    );
}
