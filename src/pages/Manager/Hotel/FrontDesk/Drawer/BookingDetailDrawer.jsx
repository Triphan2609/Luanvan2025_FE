import React, { useState } from "react";
import {
    Drawer,
    Descriptions,
    Space,
    Button,
    Tag,
    Typography,
    Divider,
    Badge,
    Steps,
    Row,
    Col,
    Card,
    Popconfirm,
    Modal,
    Input,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    HomeOutlined,
    CalendarOutlined,
    TeamOutlined,
    CreditCardOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoginOutlined,
    LogoutOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

const bookingStatus = {
    pending: {
        color: "warning",
        text: "Chờ xác nhận",
        icon: <ClockCircleOutlined />,
    },
    confirmed: {
        color: "processing",
        text: "Đã xác nhận",
        icon: <CheckCircleOutlined />,
    },
    checkedIn: {
        color: "success",
        text: "Đã check-in",
        icon: <LoginOutlined />,
    },
    checkedOut: {
        color: "default",
        text: "Đã check-out",
        icon: <LogoutOutlined />,
    },
    cancelled: {
        color: "error",
        text: "Đã hủy",
        icon: <CloseCircleOutlined />,
    },
    rejected: {
        color: "error",
        text: "Từ chối",
        icon: <CloseCircleOutlined />,
    },
};

const paymentStatus = {
    paid: { color: "success", text: "Đã thanh toán" },
    unpaid: { color: "warning", text: "Chưa thanh toán" },
    partial: { color: "processing", text: "Thanh toán một phần" },
    refunded: { color: "default", text: "Đã hoàn tiền" },
};

const bookingSource = {
    walkIn: { text: "Khách vãng lai" },
    phone: { text: "Đặt qua điện thoại" },
    system: { text: "Đặt từ hệ thống" },
    online: { text: "Đặt trực tuyến" },
};

export default function BookingDetailDrawer({
    open,
    onClose,
    booking,
    onCheckIn,
    onCheckOut,
    onConfirm,
    onCancel,
    onDelete,
}) {
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

    if (!booking) return null;

    const currentStep = (() => {
        switch (booking.status) {
            case "pending":
                return 0;
            case "confirmed":
                return 1;
            case "checkedIn":
                return 2;
            case "checkedOut":
                return 3;
            case "cancelled":
            case "rejected":
                return -1;
            default:
                return 0;
        }
    })();

    // Xử lý hủy đặt phòng
    const showCancelModal = () => {
        setIsCancelModalVisible(true);
    };

    const handleCancelModalOk = () => {
        if (!cancelReason.trim()) {
            Modal.warning({
                title: "Cần có lý do hủy",
                content: "Vui lòng nhập lý do hủy đặt phòng",
            });
            return;
        }

        onCancel(booking.id, cancelReason);
        setIsCancelModalVisible(false);
        setCancelReason("");
    };

    const handleCancelModalCancel = () => {
        setIsCancelModalVisible(false);
        setCancelReason("");
    };

    const renderStatusActions = () => {
        // Nếu đã hủy, đã check-out hoặc đã từ chối thì không hiển thị nút hành động chính
        if (["cancelled", "checkedOut", "rejected"].includes(booking.status)) {
            return null;
        }

        switch (booking.status) {
            case "pending":
                return (
                    <Popconfirm
                        title="Xác nhận đặt phòng"
                        description={`Xác nhận đặt phòng cho ${booking.customer?.name}?`}
                        onConfirm={() => onConfirm(booking.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" icon={<CheckCircleOutlined />}>
                            Xác nhận đặt phòng
                        </Button>
                    </Popconfirm>
                );
            case "confirmed":
                return (
                    <Popconfirm
                        title="Xác nhận check-in"
                        description={`Xác nhận check-in cho ${booking.customer?.name}?`}
                        onConfirm={() => onCheckIn(booking.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" icon={<LoginOutlined />}>
                            Check-in
                        </Button>
                    </Popconfirm>
                );
            case "checkedIn":
                return (
                    <Popconfirm
                        title="Xác nhận check-out"
                        description={`Xác nhận check-out cho ${booking.customer?.name}?`}
                        onConfirm={() => onCheckOut(booking.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<LogoutOutlined />}>
                            Check-out
                        </Button>
                    </Popconfirm>
                );
            default:
                return null;
        }
    };

    return (
        <Drawer
            title={
                <Space>
                    <HomeOutlined />
                    <span>Chi tiết đặt phòng - {booking.bookingCode}</span>
                </Space>
            }
            width={1000}
            open={open}
            onClose={onClose}
            extra={renderStatusActions()}
        >
            <Badge.Ribbon
                text={bookingStatus[booking.status]?.text}
                color={bookingStatus[booking.status]?.color}
            >
                <Card>
                    <Steps
                        current={currentStep}
                        status={
                            booking.status === "cancelled" ||
                            booking.status === "rejected"
                                ? "error"
                                : "process"
                        }
                        size="small"
                        labelPlacement="vertical"
                    >
                        <Step
                            title="Đặt phòng"
                            description={dayjs(booking.createdAt).format(
                                "DD/MM/YYYY"
                            )}
                        />
                        <Step title="Xác nhận" />
                        <Step
                            title="Check-in"
                            description={
                                booking.checkInTime
                                    ? dayjs(booking.checkInTime).format(
                                          "DD/MM/YYYY HH:mm"
                                      )
                                    : ""
                            }
                        />
                        <Step
                            title="Check-out"
                            description={
                                booking.checkOutTime
                                    ? dayjs(booking.checkOutTime).format(
                                          "DD/MM/YYYY HH:mm"
                                      )
                                    : ""
                            }
                        />
                    </Steps>
                </Card>
            </Badge.Ribbon>

            <Divider orientation="left">Thông tin đặt phòng</Divider>

            <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã đặt phòng" span={2}>
                    <Text copyable>{booking.bookingCode}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                    <Badge
                        status={bookingStatus[booking.status]?.color}
                        text={bookingStatus[booking.status]?.text}
                    />
                </Descriptions.Item>

                <Descriptions.Item label="Thanh toán">
                    <Badge
                        status={paymentStatus[booking.paymentStatus]?.color}
                        text={paymentStatus[booking.paymentStatus]?.text}
                    />
                </Descriptions.Item>

                <Descriptions.Item label="Nguồn đặt phòng">
                    {bookingSource[booking.source]?.text}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">
                    {dayjs(booking.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Thông tin khách hàng</Divider>

            <Descriptions bordered column={2}>
                <Descriptions.Item label="Tên khách hàng">
                    <Space>
                        <UserOutlined />
                        {booking.customer?.name}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                    <Space>
                        <PhoneOutlined />
                        <Text copyable>{booking.customer?.phone}</Text>
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Loại khách hàng">
                    <Tag
                        color={
                            booking.customer?.type === "vip" ? "gold" : "blue"
                        }
                    >
                        {booking.customer?.type === "vip" ? "VIP" : "Thường"}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Email">
                    {booking.customer?.email || "--"}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Thông tin phòng</Divider>

            <Card className="room-info-card">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Space align="start">
                            <HomeOutlined
                                style={{ fontSize: "24px", color: "#1890ff" }}
                            />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {booking.room?.roomCode}
                                </Title>
                                <Text type="secondary">
                                    {booking.room?.roomType?.name}
                                </Text>
                            </div>
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Loại phòng">
                                {booking.room?.roomType?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sức chứa">
                                <Space>
                                    <TeamOutlined />
                                    {booking.room?.capacity || 2} người
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá phòng">
                                <Text type="success" strong>
                                    {booking.room?.price?.toLocaleString()}đ/đêm
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col xs={24} md={12}>
                        <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="Thời gian nhận phòng">
                                <Space>
                                    <CalendarOutlined />
                                    {dayjs(booking.checkInDate).format(
                                        "DD/MM/YYYY"
                                    )}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian trả phòng">
                                <Space>
                                    <CalendarOutlined />
                                    {dayjs(booking.checkOutDate).format(
                                        "DD/MM/YYYY"
                                    )}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số đêm">
                                {dayjs(booking.checkOutDate).diff(
                                    dayjs(booking.checkInDate),
                                    "day"
                                )}{" "}
                                đêm
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>

            {booking.specialRequests && (
                <>
                    <Divider orientation="left">Yêu cầu đặc biệt</Divider>
                    <Card className="special-request-card">
                        <Space>
                            <FileTextOutlined />
                            {booking.specialRequests}
                        </Space>
                    </Card>
                </>
            )}

            {booking.cancellationReason && (
                <>
                    <Divider orientation="left">Lý do hủy</Divider>
                    <Card className="cancel-reason-card">
                        <Space>
                            <CloseCircleOutlined style={{ color: "#f5222d" }} />
                            {booking.cancellationReason}
                        </Space>
                    </Card>
                </>
            )}

            {booking.rejectReason && (
                <>
                    <Divider orientation="left">Lý do từ chối</Divider>
                    <Card className="reject-reason-card">
                        <Space>
                            <CloseCircleOutlined style={{ color: "#f5222d" }} />
                            {booking.rejectReason}
                        </Space>
                    </Card>
                </>
            )}

            {booking.notes && (
                <>
                    <Divider orientation="left">Ghi chú</Divider>
                    <Card className="notes-card">
                        <Space>
                            <FileTextOutlined />
                            {booking.notes}
                        </Space>
                    </Card>
                </>
            )}

            <div style={{ marginTop: 24, textAlign: "right" }}>
                <Space>
                    <Button onClick={onClose}>Đóng</Button>

                    {/* Chỉ hiển thị nút Hủy nếu trạng thái là pending hoặc confirmed */}
                    {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={showCancelModal}
                        >
                            Hủy đặt phòng
                        </Button>
                    )}

                    {/* Nút Xóa chỉ hiển thị khi đơn đã bị hủy hoặc từ chối */}
                    {(booking.status === "cancelled" ||
                        booking.status === "rejected") && (
                        <Popconfirm
                            title="Xóa đặt phòng"
                            description="Bạn có chắc chắn muốn xóa đặt phòng này? Hành động này không thể hoàn tác."
                            icon={
                                <ExclamationCircleOutlined
                                    style={{ color: "red" }}
                                />
                            }
                            onConfirm={() => onDelete(booking.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                            >
                                Xóa đặt phòng
                            </Button>
                        </Popconfirm>
                    )}

                    {renderStatusActions()}
                </Space>
            </div>

            {/* Modal xác nhận hủy đặt phòng */}
            <Modal
                title="Hủy đặt phòng"
                open={isCancelModalVisible}
                onOk={handleCancelModalOk}
                onCancel={handleCancelModalCancel}
                okText="Xác nhận hủy"
                cancelText="Đóng"
                okButtonProps={{ danger: true }}
            >
                <p>Vui lòng nhập lý do hủy đặt phòng:</p>
                <TextArea
                    rows={4}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Lý do hủy đặt phòng..."
                />
            </Modal>

            <style jsx="true">{`
                .room-info-card,
                .special-request-card,
                .notes-card,
                .cancel-reason-card,
                .reject-reason-card {
                    margin-bottom: 16px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
                }

                .room-info-card {
                    border-left: 3px solid #1890ff;
                }

                .special-request-card {
                    border-left: 3px solid #faad14;
                }

                .notes-card {
                    border-left: 3px solid #52c41a;
                }

                .cancel-reason-card,
                .reject-reason-card {
                    border-left: 3px solid #f5222d;
                }
            `}</style>
        </Drawer>
    );
}
