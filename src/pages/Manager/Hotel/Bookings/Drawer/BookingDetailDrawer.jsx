import React, { useState } from "react";
import {
    Drawer,
    Descriptions,
    Space,
    Button,
    Tag,
    Modal,
    Input,
    Typography,
    Divider,
    Timeline,
    Badge,
    Row,
    Col,
    Skeleton,
    message,
    Card,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    PrinterOutlined,
    CreditCardOutlined,
    DollarOutlined,
    MailFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    getPaymentsByBookingId,
    generateAndSendInvoice,
} from "../../../../../api/paymentsApi";

const { Text, Title } = Typography;
const { confirm } = Modal;

// Component hiển thị chi tiết đặt phòng trong drawer
const BookingDetailDrawer = ({
    open,
    onClose,
    booking,
    onCheckIn,
    onCheckOut,
    onConfirm,
    onCancel,
    onDelete,
}) => {
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [payments, setPayments] = useState([]);
    const [isPaymentsLoaded, setIsPaymentsLoaded] = useState(false);

    // Lấy lịch sử thanh toán khi mở drawer
    React.useEffect(() => {
        if (open && booking?.id && !isPaymentsLoaded) {
            fetchPaymentHistory();
        }
    }, [open, booking]);

    const fetchPaymentHistory = async () => {
        try {
            setIsLoading(true);
            const result = await getPaymentsByBookingId(booking.id);
            setPayments(result || []);
            setIsPaymentsLoaded(true);
        } catch (error) {
            console.error("Failed to fetch payment history:", error);
            message.error("Không thể tải lịch sử thanh toán");
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý khi đóng drawer
    const handleClose = () => {
        setIsPaymentsLoaded(false);
        setPayments([]);
        onClose();
    };

    // Xử lý khi check-in
    const handleCheckIn = () => {
        if (booking?.id) {
            confirm({
                title: "Xác nhận check-in",
                icon: <ExclamationCircleOutlined />,
                content: "Bạn có chắc chắn muốn check-in cho đặt phòng này?",
                onOk() {
                    onCheckIn(booking.id);
                },
            });
        }
    };

    // Xử lý khi check-out
    const handleCheckOut = () => {
        if (booking?.id) {
            confirm({
                title: "Xác nhận check-out",
                icon: <ExclamationCircleOutlined />,
                content: "Bạn có chắc chắn muốn check-out cho đặt phòng này?",
                onOk() {
                    onCheckOut(booking.id);
                },
            });
        }
    };

    // Xử lý khi xác nhận đặt phòng
    const handleConfirm = () => {
        if (booking?.id) {
            confirm({
                title: "Xác nhận đặt phòng",
                icon: <ExclamationCircleOutlined />,
                content: "Bạn có chắc chắn muốn xác nhận đặt phòng này?",
                onOk() {
                    onConfirm(booking.id);
                },
            });
        }
    };

    // Xử lý khi hủy đặt phòng
    const showCancelModal = () => {
        setCancelReason("");
        setIsCancelModalOpen(true);
    };

    const handleCancelModalOk = () => {
        if (booking?.id) {
            onCancel(booking.id, cancelReason);
            setIsCancelModalOpen(false);
        }
    };

    const handleCancelModalCancel = () => {
        setIsCancelModalOpen(false);
    };

    // Xử lý khi xóa đặt phòng
    const handleDelete = () => {
        if (booking?.id) {
            confirm({
                title: "Xóa đặt phòng",
                icon: <ExclamationCircleOutlined />,
                content:
                    "Bạn có chắc chắn muốn xóa đặt phòng này? Hành động này không thể hoàn tác.",
                okText: "Xóa",
                okType: "danger",
                onOk() {
                    onDelete(booking.id);
                },
            });
        }
    };

    // Xử lý xuất hóa đơn
    const handleGenerateInvoice = async () => {
        try {
            setIsLoading(true);
            const result = await generateAndSendInvoice(booking.id);
            message.success("Hóa đơn đã được tạo thành công!");

            // Nếu có email khách hàng, thông báo đã gửi email
            if (booking.customer?.email) {
                message.success(
                    `Hóa đơn đã được gửi đến ${booking.customer.email}`
                );
            }

            // Hiển thị link tải hóa đơn nếu có
            if (result && result.pdfPath) {
                Modal.success({
                    title: "Tạo hóa đơn thành công",
                    content: (
                        <div>
                            <p>Hóa đơn đã được tạo thành công!</p>
                            <p>
                                <a
                                    href={`/api/download?path=${encodeURIComponent(
                                        result.pdfPath
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Tải xuống hóa đơn
                                </a>
                            </p>
                        </div>
                    ),
                });
            }
        } catch (error) {
            console.error("Failed to generate invoice:", error);
            message.error(
                "Không thể tạo hóa đơn: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Render trạng thái đặt phòng
    const renderStatus = (status) => {
        switch (status) {
            case "pending":
                return <Tag color="warning">Chờ xác nhận</Tag>;
            case "confirmed":
                return <Tag color="processing">Đã xác nhận</Tag>;
            case "checkedIn":
                return <Tag color="success">Đã check-in</Tag>;
            case "checkedOut":
                return <Tag color="default">Đã check-out</Tag>;
            case "cancelled":
                return <Tag color="error">Đã hủy</Tag>;
            case "rejected":
                return <Tag color="error">Từ chối</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    // Hiển thị các nút hành động dựa trên trạng thái
    const renderActions = () => {
        if (!booking) return null;

        switch (booking.status) {
            case "pending":
                return (
                    <Space>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={handleConfirm}
                        >
                            Xác nhận
                        </Button>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={showCancelModal}
                        >
                            Từ chối
                        </Button>
                        <Button
                            icon={<CloseCircleOutlined />}
                            onClick={handleDelete}
                        >
                            Xóa
                        </Button>
                    </Space>
                );
            case "confirmed":
                return (
                    <Space>
                        <Button
                            type="primary"
                            icon={<UserOutlined />}
                            onClick={handleCheckIn}
                        >
                            Check-in
                        </Button>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={showCancelModal}
                        >
                            Hủy
                        </Button>
                        <Button
                            icon={<CreditCardOutlined />}
                            onClick={handleGenerateInvoice}
                        >
                            Xuất hóa đơn
                        </Button>
                    </Space>
                );
            case "checkedIn":
                return (
                    <Space>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={handleCheckOut}
                        >
                            Check-out
                        </Button>
                        <Button
                            icon={<CreditCardOutlined />}
                            onClick={handleGenerateInvoice}
                        >
                            Xuất hóa đơn
                        </Button>
                    </Space>
                );
            case "checkedOut":
                return (
                    <Space>
                        <Button
                            type="primary"
                            icon={<PrinterOutlined />}
                            onClick={handleGenerateInvoice}
                        >
                            Xuất hóa đơn
                        </Button>
                        <Button
                            icon={<MailFilled />}
                            onClick={handleGenerateInvoice}
                        >
                            Gửi hóa đơn
                        </Button>
                    </Space>
                );
            case "cancelled":
            case "rejected":
                return (
                    <Space>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={handleDelete}
                        >
                            Xóa
                        </Button>
                    </Space>
                );
            default:
                return null;
        }
    };

    // Tính tổng tiền từ booking
    const calculateTotal = () => {
        if (!booking) return 0;
        const checkIn = dayjs(booking.checkIn || booking.checkInDate);
        const checkOut = dayjs(booking.checkOut || booking.checkOutDate);
        const nights = checkOut.diff(checkIn, "day");

        return (booking.room?.price || 0) * nights;
    };

    return (
        <Drawer
            title={
                <Space>
                    <HomeOutlined />
                    <span>Chi tiết đặt phòng</span>
                </Space>
            }
            width={720}
            onClose={handleClose}
            open={open}
            extra={renderActions()}
        >
            {!booking ? (
                <Skeleton active paragraph={{ rows: 10 }} />
            ) : (
                <div className="booking-detail">
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="Thông tin đặt phòng">
                                <Descriptions column={1} bordered>
                                    <Descriptions.Item label="Trạng thái">
                                        {renderStatus(booking.status)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Mã đặt phòng">
                                        {booking.id}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày đặt">
                                        {dayjs(booking.createdAt).format(
                                            "DD/MM/YYYY HH:mm:ss"
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card title="Thông tin phòng">
                                <Descriptions column={1} bordered>
                                    <Descriptions.Item label="Mã phòng">
                                        {booking.room?.roomCode || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Loại phòng">
                                        {booking.room?.roomType?.name || "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tầng">
                                        {booking.room?.floorDetails?.name ||
                                            "N/A"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giá phòng">
                                        {booking.room?.price?.toLocaleString() ||
                                            0}{" "}
                                        đ/đêm
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày nhận phòng">
                                        {dayjs(
                                            booking.checkIn ||
                                                booking.checkInDate
                                        ).format("DD/MM/YYYY")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày trả phòng">
                                        {dayjs(
                                            booking.checkOut ||
                                                booking.checkOutDate
                                        ).format("DD/MM/YYYY")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số đêm">
                                        {dayjs(
                                            booking.checkOut ||
                                                booking.checkOutDate
                                        ).diff(
                                            dayjs(
                                                booking.checkIn ||
                                                    booking.checkInDate
                                            ),
                                            "day"
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tổng tiền">
                                        <Text type="danger" strong>
                                            {calculateTotal().toLocaleString()}{" "}
                                            đ
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card title="Thông tin khách hàng">
                                <Descriptions column={1} bordered>
                                    <Descriptions.Item label="Tên khách hàng">
                                        <Space>
                                            <UserOutlined />
                                            {booking.customer?.name ||
                                                "Khách hàng"}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        <Space>
                                            <PhoneOutlined />
                                            {booking.customer?.phone || "N/A"}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        <Space>
                                            <MailOutlined />
                                            {booking.customer?.email || "N/A"}
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card title="Lịch sử thanh toán">
                                {isLoading ? (
                                    <Skeleton active paragraph={{ rows: 4 }} />
                                ) : payments && payments.length > 0 ? (
                                    <Timeline>
                                        {payments.map((payment) => (
                                            <Timeline.Item
                                                key={payment.id}
                                                color={
                                                    payment.status ===
                                                    "confirmed"
                                                        ? "green"
                                                        : payment.status ===
                                                          "pending"
                                                        ? "blue"
                                                        : "red"
                                                }
                                                dot={
                                                    payment.type ===
                                                    "deposit" ? (
                                                        <DollarOutlined />
                                                    ) : payment.type ===
                                                      "refund" ? (
                                                        <CloseCircleOutlined />
                                                    ) : (
                                                        <CreditCardOutlined />
                                                    )
                                                }
                                            >
                                                <p>
                                                    <Text strong>
                                                        {payment.type ===
                                                        "deposit"
                                                            ? "Đặt cọc"
                                                            : payment.type ===
                                                              "refund"
                                                            ? "Hoàn tiền"
                                                            : "Thanh toán"}
                                                    </Text>
                                                    {" - "}
                                                    <Text
                                                        type={
                                                            payment.type ===
                                                            "refund"
                                                                ? "danger"
                                                                : "success"
                                                        }
                                                    >
                                                        {payment.type ===
                                                        "refund"
                                                            ? "-"
                                                            : "+"}
                                                        {payment.amount.toLocaleString()}{" "}
                                                        đ
                                                    </Text>
                                                </p>
                                                <p>
                                                    <Text type="secondary">
                                                        Phương thức:{" "}
                                                        {payment.method?.name ||
                                                            "N/A"}
                                                    </Text>
                                                </p>
                                                <p>
                                                    <Text type="secondary">
                                                        Thời gian:{" "}
                                                        {dayjs(
                                                            payment.createdAt
                                                        ).format(
                                                            "DD/MM/YYYY HH:mm:ss"
                                                        )}
                                                    </Text>
                                                </p>
                                                <p>
                                                    <Badge
                                                        status={
                                                            payment.status ===
                                                            "confirmed"
                                                                ? "success"
                                                                : payment.status ===
                                                                  "pending"
                                                                ? "processing"
                                                                : "error"
                                                        }
                                                        text={
                                                            payment.status ===
                                                            "confirmed"
                                                                ? "Đã xác nhận"
                                                                : payment.status ===
                                                                  "pending"
                                                                ? "Đang xử lý"
                                                                : payment.status ===
                                                                  "refunded"
                                                                ? "Đã hoàn tiền"
                                                                : "Đã hủy"
                                                        }
                                                    />
                                                </p>
                                                {payment.notes && (
                                                    <p>
                                                        <Text type="secondary">
                                                            Ghi chú:{" "}
                                                            {payment.notes}
                                                        </Text>
                                                    </p>
                                                )}
                                            </Timeline.Item>
                                        ))}
                                    </Timeline>
                                ) : (
                                    <div
                                        style={{
                                            textAlign: "center",
                                            padding: "20px 0",
                                        }}
                                    >
                                        Chưa có lịch sử thanh toán
                                    </div>
                                )}
                            </Card>
                        </Col>

                        {booking.notes && (
                            <Col span={24}>
                                <Card title="Ghi chú">
                                    <p>{booking.notes}</p>
                                </Card>
                            </Col>
                        )}
                    </Row>

                    <Modal
                        title="Lý do hủy đặt phòng"
                        open={isCancelModalOpen}
                        onOk={handleCancelModalOk}
                        onCancel={handleCancelModalCancel}
                    >
                        <p>Vui lòng nhập lý do hủy đặt phòng:</p>
                        <Input.TextArea
                            rows={4}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do hủy đặt phòng..."
                        />
                    </Modal>
                </div>
            )}
        </Drawer>
    );
};

export default BookingDetailDrawer;
