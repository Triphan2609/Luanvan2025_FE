import React, { useState, useEffect } from "react";
import {
    Card,
    Table,
    Button,
    Tag,
    Space,
    Input,
    DatePicker,
    Select,
    Typography,
    Badge,
    Tooltip,
    message,
    Popconfirm,
} from "antd";
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
    ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import BookingModal from "./Modals/BookingModal";
import BookingDrawer from "./Drawer/BookingDrawer";
import {
    getBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    confirmBooking,
    rejectBooking,
    getBookingById,
    checkInBooking,
    checkOutBooking,
    checkOutAndSetAvailable,
} from "../../../../api/bookingsApi";

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
    const navigate = useNavigate();
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filteredBookings, setFilteredBookings] = useState(null);

    // Check for tab=2 query parameter and redirect to FrontDesk page if found
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tabParam = searchParams.get("tab");

        if (tabParam === "2") {
            // Redirect to the FrontDesk page to show the calendar view
            navigate("/hotel/front-desk?view=calendar");
            return;
        }
    }, [location, navigate]);

    // Fetch bookings when component mounts
    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            console.log("Fetching bookings data...");

            // Lấy dữ liệu đặt phòng với đầy đủ thông tin quan hệ
            const data = await getBookings({
                relations: true, // Đảm bảo lấy cả thông tin liên quan như customer, room, ...
            });

            console.log(`Loaded ${data.length} bookings`);
            setBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            message.error(
                "Không thể tải danh sách đặt phòng: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingBooking(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingBooking(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteBooking(id);
            setBookings((prev) => prev.filter((booking) => booking.id !== id));
            message.success("Đã xóa đặt phòng thành công");
        } catch (error) {
            message.error("Không thể xóa đặt phòng");
            console.error("Error deleting booking:", error);
        }
    };

    const handleSave = async (data) => {
        try {
            if (data.id) {
                // Update existing booking
                const updatedBooking = await updateBooking(data.id, data);
                setBookings((prev) =>
                    prev.map((b) => (b.id === data.id ? updatedBooking : b))
                );
                message.success("Cập nhật đặt phòng thành công");
            } else {
                // Create new booking
                const newBooking = await createBooking(data);
                setBookings((prev) => [...prev, newBooking]);
                message.success("Thêm đặt phòng mới thành công");
            }
            setIsModalOpen(false);
        } catch (error) {
            message.error("Không thể lưu đặt phòng");
            console.error("Error saving booking:", error);
        }
    };

    const handleView = async (record) => {
        try {
            setLoading(true);
            // Lấy thông tin chi tiết đặt phòng từ API
            const bookingDetail = await getBookingById(record.id);
            setSelectedBooking(bookingDetail);
            setIsDrawerOpen(true);
        } catch (error) {
            console.error("Error fetching booking details:", error);
            message.error("Không thể tải thông tin chi tiết đặt phòng");
            // Nếu gặp lỗi, vẫn hiển thị thông tin từ bảng
            setSelectedBooking(record);
            setIsDrawerOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Hàm tải lại dữ liệu
    const refreshData = async () => {
        await fetchBookings();
        message.success("Đã tải lại dữ liệu");
    };

    const handleConfirmBooking = async (id) => {
        try {
            setLoading(true);
            const updatedBooking = await confirmBooking(id);

            // Cập nhật danh sách đặt phòng
            setBookings((prev) =>
                prev.map((item) => (item.id === id ? updatedBooking : item))
            );

            // Nếu đang hiển thị chi tiết của booking này, cập nhật thông tin
            if (selectedBooking && selectedBooking.id === id) {
                setSelectedBooking(updatedBooking);
            }

            message.success("Đã xác nhận đặt phòng thành công");

            // Tải lại dữ liệu để đảm bảo đồng bộ
            await fetchBookings();
        } catch (error) {
            console.error("Error confirming booking:", error);
            message.error(
                "Không thể xác nhận đặt phòng: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRejectBooking = async (id, reason) => {
        try {
            setLoading(true);
            const updatedBooking = await rejectBooking(id, reason);

            // Cập nhật danh sách đặt phòng
            setBookings((prev) =>
                prev.map((item) => (item.id === id ? updatedBooking : item))
            );

            // Nếu đang hiển thị chi tiết của booking này, cập nhật thông tin
            if (selectedBooking && selectedBooking.id === id) {
                setSelectedBooking(updatedBooking);
            }

            message.success("Đã từ chối đặt phòng thành công");
        } catch (error) {
            console.error("Error rejecting booking:", error);
            message.error(
                "Không thể từ chối đặt phòng: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (id) => {
        try {
            setLoading(true);
            const updatedBooking = await checkInBooking(id);

            // Cập nhật danh sách đặt phòng
            setBookings((prev) =>
                prev.map((item) => (item.id === id ? updatedBooking : item))
            );

            // Nếu đang hiển thị chi tiết của booking này, cập nhật thông tin
            if (selectedBooking && selectedBooking.id === id) {
                setSelectedBooking(updatedBooking);
            }

            message.success("Check-in thành công!");

            // Tải lại dữ liệu để đảm bảo đồng bộ
            await fetchBookings();
        } catch (error) {
            console.error("Error checking in booking:", error);
            message.error(
                "Không thể check-in: " + (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async (id) => {
        try {
            setLoading(true);
            // Sử dụng API mới: checkOutAndSetAvailable thay vì checkOutBooking
            const updatedBooking = await checkOutAndSetAvailable(id);

            // Cập nhật danh sách đặt phòng
            setBookings((prev) =>
                prev.map((item) => (item.id === id ? updatedBooking : item))
            );

            // Nếu đang hiển thị chi tiết của booking này, cập nhật thông tin
            if (selectedBooking && selectedBooking.id === id) {
                setSelectedBooking(updatedBooking);
            }

            message.success(
                "Check-out thành công! Phòng đã được đặt trạng thái sẵn sàng để sử dụng ngay."
            );

            // Tải lại dữ liệu để đảm bảo đồng bộ
            await fetchBookings();
        } catch (error) {
            console.error("Error checking out booking:", error);
            message.error(
                "Không thể check-out: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    // Cấu hình cột của bảng
    const columns = [
        {
            title: "Khách hàng",
            key: "customer",
            sorter: (a, b) => {
                const aName = a.customer?.name || a.customerName || "";
                const bName = b.customer?.name || b.customerName || "";
                return aName.localeCompare(bName);
            },
            render: (_, record) => {
                const name =
                    record.customer?.name ||
                    record.customerName ||
                    "Khách vãng lai";
                const phone = record.customer?.phone || record.phone || "N/A";

                return (
                    <Space direction="vertical" size={0}>
                        <Text strong>{name}</Text>
                        <Text type="secondary">
                            <PhoneOutlined /> {phone}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: "Phòng",
            key: "room",
            filters: [...new Set(bookings.map((b) => b.room?.roomCode))]
                .filter(Boolean)
                .map((roomCode) => ({
                    text: roomCode,
                    value: roomCode,
                })),
            onFilter: (value, record) => record.room?.roomCode === value,
            render: (_, record) => {
                const roomCode =
                    record.room?.roomCode || record.roomNumber || "N/A";
                const roomType =
                    record.room?.roomType?.name || record.roomType || "N/A";

                return (
                    <Space direction="vertical" size={0}>
                        <Text>
                            <HomeOutlined /> {roomCode}
                        </Text>
                        <Text type="secondary">{roomType}</Text>
                    </Space>
                );
            },
        },
        {
            title: "Check-in/out",
            key: "dates",
            sorter: (a, b) =>
                dayjs(a.checkIn || a.checkInDate).unix() -
                dayjs(b.checkIn || b.checkInDate).unix(),
            render: (_, record) => {
                const checkIn = record.checkIn || record.checkInDate;
                const checkOut = record.checkOut || record.checkOutDate;

                return (
                    <Space direction="vertical" size={0}>
                        <Text>
                            <CalendarOutlined />{" "}
                            {dayjs(checkIn).format("DD/MM/YYYY")}
                        </Text>
                        <Text type="secondary">
                            <CalendarOutlined />{" "}
                            {dayjs(checkOut).format("DD/MM/YYYY")}
                        </Text>
                    </Space>
                );
            },
        },
        {
            title: "Số người",
            key: "guests",
            render: (_, record) => {
                const adults = record.adults || 1;
                const children = record.children || 0;
                const totalGuests = adults + children;

                return (
                    <div style={{ textAlign: "center" }}>
                        <Tag icon={<UserOutlined />} color="blue">
                            {totalGuests} người
                            {children > 0
                                ? ` (${adults} NL, ${children} TE)`
                                : ""}
                        </Tag>
                    </div>
                );
            },
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            key: "amount",
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (amount, record) => {
                const paymentStatus = record.paymentStatus || "unpaid";

                return (
                    <Space direction="vertical" size={0}>
                        <Text strong type="success">
                            {amount?.toLocaleString()}đ
                        </Text>
                        <Tag
                            color={
                                paymentStatus === "paid" ? "success" : "warning"
                            }
                        >
                            {paymentStatus === "paid"
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                        </Tag>
                    </Space>
                );
            },
        },
        {
            title: "Trạng thái",
            key: "status",
            filters: Object.entries(bookingStatus).map(([key, value]) => ({
                text: value.text,
                value: key,
            })),
            onFilter: (value, record) => record.status === value,
            render: (_, record) => {
                const status = record.status || "pending";
                return (
                    <Badge
                        status={bookingStatus[status]?.color || "default"}
                        text={bookingStatus[status]?.text || "Không xác định"}
                    />
                );
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 180,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>

                    {/* Hiển thị nút chỉnh sửa khi trạng thái cho phép */}
                    {!["rejected", "cancelled", "checkedOut"].includes(
                        record.status
                    ) && (
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                            />
                        </Tooltip>
                    )}

                    {/* Nút thanh toán khi chưa thanh toán */}
                    {record.paymentStatus !== "paid" && (
                        <Tooltip title="Thanh toán">
                            <Button
                                type="primary"
                                icon={<CreditCardOutlined />}
                                onClick={() =>
                                    (window.location.href = `/hotel/payment/${record.id}`)
                                }
                            />
                        </Tooltip>
                    )}

                    {/* Xóa chỉ khi cho phép */}
                    {["pending", "confirmed"].includes(record.status) && (
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
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Space
                    style={{ justifyContent: "space-between", width: "100%" }}
                >
                    <Title level={4} style={{ margin: 0 }}>
                        <HomeOutlined /> Quản lý Đặt phòng
                    </Title>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={refreshData}
                            loading={loading}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm đặt phòng
                        </Button>
                    </Space>
                </Space>

                {/* Bộ lọc và tìm kiếm */}
                <Card size="small" style={{ marginBottom: 0 }}>
                    <Space style={{ width: "100%" }} wrap>
                        <Input
                            placeholder="Tìm kiếm theo tên khách hàng"
                            prefix={<SearchOutlined />}
                            style={{ width: 240 }}
                            allowClear
                            onChange={(e) => {
                                const searchText = e.target.value.toLowerCase();
                                const filtered = bookings.filter((booking) => {
                                    const customerName = (
                                        booking.customer?.name ||
                                        booking.customerName ||
                                        ""
                                    ).toLowerCase();
                                    return customerName.includes(searchText);
                                });
                                setFilteredBookings(filtered);
                            }}
                        />
                        <RangePicker
                            placeholder={["Check-in", "Check-out"]}
                            onChange={(dates) => {
                                if (!dates || dates.length === 0) {
                                    setFilteredBookings(bookings);
                                    return;
                                }

                                const [start, end] = dates;
                                const filtered = bookings.filter((booking) => {
                                    const checkIn = dayjs(
                                        booking.checkIn || booking.checkInDate
                                    );
                                    const checkOut = dayjs(
                                        booking.checkOut || booking.checkOutDate
                                    );

                                    return (
                                        (!start ||
                                            checkIn.isSameOrAfter(
                                                start,
                                                "day"
                                            )) &&
                                        (!end ||
                                            checkOut.isSameOrBefore(end, "day"))
                                    );
                                });

                                setFilteredBookings(filtered);
                            }}
                        />
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: 150 }}
                            allowClear
                            options={Object.entries(bookingStatus).map(
                                ([key, value]) => ({
                                    label: value.text,
                                    value: key,
                                })
                            )}
                            onChange={(value) => {
                                if (!value) {
                                    setFilteredBookings(bookings);
                                    return;
                                }

                                const filtered = bookings.filter(
                                    (booking) => booking.status === value
                                );
                                setFilteredBookings(filtered);
                            }}
                        />
                        <Select
                            placeholder="Thanh toán"
                            style={{ width: 150 }}
                            allowClear
                            options={[
                                { label: "Đã thanh toán", value: "paid" },
                                { label: "Chưa thanh toán", value: "unpaid" },
                            ]}
                            onChange={(value) => {
                                if (!value) {
                                    setFilteredBookings(bookings);
                                    return;
                                }

                                const filtered = bookings.filter(
                                    (booking) => booking.paymentStatus === value
                                );
                                setFilteredBookings(filtered);
                            }}
                        />
                    </Space>
                </Card>

                <Table
                    columns={columns}
                    dataSource={filteredBookings || bookings}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `Tổng số ${total} đặt phòng`,
                    }}
                    bordered
                    size="middle"
                    scroll={{ x: "max-content" }}
                />
            </Space>

            <BookingModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingBooking}
            />

            <BookingDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                booking={selectedBooking}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
            />
        </Card>
    );
}
