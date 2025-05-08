import React from "react";
import { Typography, Table, Row, Col, Space } from "antd";
import {
    PhoneOutlined,
    HomeOutlined,
    GlobalOutlined,
    MailOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function InvoiceTemplate({ booking, paymentInfo }) {
    // Safety check to ensure we have data
    if (!booking) {
        return <div>Không có dữ liệu hóa đơn</div>;
    }

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 50,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Dịch vụ",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            align: "right",
            render: (_, record) => record.quantity || record.nights || 1,
        },
        {
            title: "Đơn giá",
            key: "price",
            width: 150,
            align: "right",
            render: (_, record) =>
                formatCurrency(record.pricePerNight || record.price || 0),
        },
        {
            title: "Thành tiền",
            key: "total",
            width: 150,
            align: "right",
            render: (_, record) => {
                const total = record.pricePerNight
                    ? record.pricePerNight * (record.nights || 1)
                    : (record.price || 0) * (record.quantity || 1);
                return formatCurrency(total);
            },
        },
    ];

    const invoiceDate = paymentInfo?.date
        ? dayjs(paymentInfo.date).format("DD/MM/YYYY HH:mm")
        : dayjs().format("DD/MM/YYYY HH:mm");

    const getPaymentMethodName = (method) => {
        switch (method) {
            case "cash":
                return "Tiền mặt";
            case "bank_transfer":
                return "Chuyển khoản";
            case "vnpay":
                return "VNPay";
            default:
                return "Không xác định";
        }
    };

    // Generate a unique invoice number if one isn't provided
    const invoiceNumber = `INV-${dayjs().format(
        "YYYYMMDD"
    )}-${booking.id.substr(0, 8)}`;

    return (
        <div
            style={{
                padding: "40px",
                background: "#fff",
                width: "100%",
                minHeight: "297mm",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                fontFamily: "'Segoe UI', Arial, sans-serif",
                position: "relative",
            }}
        >
            {/* Add watermark "HÓA ĐƠN" for better printing */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(-45deg)",
                    fontSize: "150px",
                    color: "rgba(220, 220, 220, 0.15)",
                    fontWeight: "bold",
                    zIndex: 0,
                    pointerEvents: "none",
                }}
            >
                HÓA ĐƠN
            </div>

            {/* Header */}
            <Row
                justify="space-between"
                align="top"
                style={{ marginBottom: 40, position: "relative", zIndex: 1 }}
            >
                <Col span={12}>
                    <Title level={2} style={{ color: "#1890ff" }}>
                        {booking.branch?.name || "KHÁCH SẠN ABC"}
                    </Title>
                    <div>
                        <Space direction="vertical" style={{ display: "flex" }}>
                            <Space align="start">
                                <HomeOutlined />
                                <Text type="secondary">
                                    {booking.branch?.address ||
                                        "123 Đường XYZ, Quận 1, TP.HCM"}
                                </Text>
                            </Space>
                            <Space align="start">
                                <PhoneOutlined />
                                <Text type="secondary">
                                    {booking.branch?.phone || "1900 1234"}
                                </Text>
                            </Space>
                            <Space align="start">
                                <GlobalOutlined />
                                <Text type="secondary">
                                    {booking.branch?.website ||
                                        "www.dncrestaurant.com"}
                                </Text>
                            </Space>
                            {booking.branch?.email && (
                                <Space align="start">
                                    <MailOutlined />
                                    <Text type="secondary">
                                        {booking.branch.email}
                                    </Text>
                                </Space>
                            )}
                        </Space>
                    </div>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                    <Title level={2} style={{ margin: 0 }}>
                        HÓA ĐƠN
                    </Title>
                    <div style={{ marginTop: 8 }}>
                        <Text>Số: </Text>
                        <Text strong>{invoiceNumber}</Text>
                        <br />
                        <Text>Ngày: </Text>
                        <Text strong>{invoiceDate}</Text>
                    </div>
                </Col>
            </Row>

            {/* Thông tin khách hàng */}
            <div
                style={{
                    background: "#f5f5f5",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Title level={5} style={{ marginTop: 0 }}>
                    THÔNG TIN ĐẶT PHÒNG
                </Title>
                <Row gutter={24}>
                    <Col span={12}>
                        <Text strong>Khách hàng: </Text>
                        <Text>{booking.customerName}</Text>
                        <br />
                        {booking.phone && (
                            <>
                                <Text strong>Số điện thoại: </Text>
                                <Text>{booking.phone}</Text>
                                <br />
                            </>
                        )}
                        {booking.email && (
                            <>
                                <Text strong>Email: </Text>
                                <Text>{booking.email}</Text>
                            </>
                        )}
                    </Col>
                    <Col span={12}>
                        <Text strong>Phòng: </Text>
                        <Text>
                            {booking.roomNumber}{" "}
                            {booking.roomType ? `- ${booking.roomType}` : ""}
                        </Text>
                        <br />
                        <Text strong>Thời gian: </Text>
                        <Text>
                            {booking.checkIn} - {booking.checkOut}
                        </Text>
                    </Col>
                </Row>
            </div>

            {/* Chi tiết dịch vụ */}
            <Title level={5} style={{ position: "relative", zIndex: 1 }}>
                CHI TIẾT DỊCH VỤ
            </Title>
            <Table
                dataSource={booking.services || []}
                columns={columns}
                pagination={false}
                bordered
                rowKey={(record, index) => `service-${index}`}
                style={{ position: "relative", zIndex: 1 }}
                summary={(pageData) => {
                    // Calculate total
                    const total = pageData.reduce((sum, item) => {
                        const itemTotal = item.pricePerNight
                            ? item.pricePerNight * (item.nights || 1)
                            : (item.price || 0) * (item.quantity || 1);
                        return sum + itemTotal;
                    }, 0);

                    // Final amount (without tax)
                    const finalAmount = total;

                    return (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell colSpan={4} align="right">
                                    <Text strong>Tổng tiền dịch vụ:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell align="right">
                                    <Text strong>{formatCurrency(total)}</Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                            <Table.Summary.Row>
                                <Table.Summary.Cell colSpan={4} align="right">
                                    <Text strong>Tổng thanh toán:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell align="right">
                                    <Text
                                        strong
                                        style={{
                                            fontSize: "16px",
                                            color: "#f5222d",
                                        }}
                                    >
                                        {formatCurrency(finalAmount)}
                                    </Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                            {paymentInfo && (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell
                                            colSpan={4}
                                            align="right"
                                        >
                                            Phương thức thanh toán:
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell align="right">
                                            {getPaymentMethodName(
                                                paymentInfo.method
                                            )}
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    {paymentInfo.method === "cash" &&
                                        paymentInfo.receivedAmount && (
                                            <>
                                                <Table.Summary.Row>
                                                    <Table.Summary.Cell
                                                        colSpan={4}
                                                        align="right"
                                                    >
                                                        Tiền khách đưa:
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell align="right">
                                                        {formatCurrency(
                                                            paymentInfo.receivedAmount
                                                        )}
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                                <Table.Summary.Row>
                                                    <Table.Summary.Cell
                                                        colSpan={4}
                                                        align="right"
                                                    >
                                                        Tiền thừa:
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell align="right">
                                                        {formatCurrency(
                                                            paymentInfo.change ||
                                                                0
                                                        )}
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            </>
                                        )}
                                    {paymentInfo.notes && (
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell
                                                colSpan={4}
                                                align="right"
                                            >
                                                Ghi chú:
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                {paymentInfo.notes}
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    )}
                                </>
                            )}
                        </>
                    );
                }}
            />

            {/* Footer */}
            <div
                style={{
                    marginTop: "40px",
                    textAlign: "center",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: "20px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Text strong>Cảm ơn Quý khách đã sử dụng dịch vụ!</Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                    Mọi thắc mắc xin vui lòng liên hệ: 1900 1234
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                    Hóa đơn điện tử được tạo vào:{" "}
                    {dayjs().format("DD/MM/YYYY HH:mm:ss")}
                </Text>
            </div>
        </div>
    );
}
