import React from "react";
import { Typography, Table, Divider, Row, Col } from "antd";
import { PhoneOutlined, HomeOutlined, GlobalOutlined } from "@ant-design/icons";
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
        },
        {
            title: "Đơn giá",
            key: "price",
            width: 150,
            align: "right",
            render: (_, record) => formatCurrency(record.pricePerNight || record.price),
        },
        {
            title: "Thành tiền",
            key: "total",
            width: 150,
            align: "right",
            render: (_, record) => {
                const total = record.pricePerNight ? record.pricePerNight * record.nights : record.price * record.quantity;
                return formatCurrency(total);
            },
        },
    ];

    return (
        <div
            id="invoice-print"
            style={{
                padding: "40px",
                background: "#fff",
                width: "210mm",
                minHeight: "297mm",
                margin: "0 auto",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
        >
            {/* Header */}
            <Row justify="space-between" align="top" style={{ marginBottom: 40 }}>
                <Col span={12}>
                    <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                        KHÁCH SẠN ABC
                    </Title>
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary">
                            <HomeOutlined /> 123 Đường XYZ, Quận 1, TP.HCM
                            <br />
                            <PhoneOutlined /> 1900 1234
                            <br />
                            <GlobalOutlined /> www.abchotel.com
                        </Text>
                    </div>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                    <Title level={2} style={{ margin: 0 }}>
                        HÓA ĐƠN
                    </Title>
                    <div style={{ marginTop: 8 }}>
                        <Text>Số: </Text>
                        <Text strong>INV-{booking.id}</Text>
                        <br />
                        <Text>Ngày: </Text>
                        <Text strong>{dayjs().format("DD/MM/YYYY HH:mm")}</Text>
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
                        <Text strong>Số điện thoại: </Text>
                        <Text>{booking.phone}</Text>
                    </Col>
                    <Col span={12}>
                        <Text strong>Phòng: </Text>
                        <Text>
                            {booking.roomNumber} - {booking.roomType}
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
            <Title level={5}>CHI TIẾT DỊCH VỤ</Title>
            <Table
                dataSource={booking.services}
                columns={columns}
                pagination={false}
                bordered
                summary={(pageData) => {
                    const total = pageData.reduce((sum, item) => {
                        const itemTotal = item.pricePerNight ? item.pricePerNight * item.nights : item.price * item.quantity;
                        return sum + itemTotal;
                    }, 0);

                    return (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell colSpan={4} align="right">
                                    <Text strong>Tổng cộng:</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell align="right">
                                    <Text strong style={{ fontSize: "16px", color: "#f5222d" }}>
                                        {formatCurrency(total)}
                                    </Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                            {paymentInfo && (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell colSpan={4} align="right">
                                            Phương thức thanh toán:
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell align="right">
                                            {paymentInfo.method === "cash"
                                                ? "Tiền mặt"
                                                : paymentInfo.method === "card"
                                                ? "Thẻ"
                                                : "Chuyển khoản"}
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    {paymentInfo.method === "cash" && (
                                        <>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell colSpan={4} align="right">
                                                    Tiền khách đưa:
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell align="right">
                                                    {formatCurrency(paymentInfo.receivedAmount)}
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell colSpan={4} align="right">
                                                    Tiền thừa:
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell align="right">{formatCurrency(paymentInfo.change)}</Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        </>
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
                }}
            >
                <Text strong>Cảm ơn Quý khách đã sử dụng dịch vụ!</Text>
                <br />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                    Mọi thắc mắc xin vui lòng liên hệ: 1900 1234
                </Text>
            </div>
        </div>
    );
}
