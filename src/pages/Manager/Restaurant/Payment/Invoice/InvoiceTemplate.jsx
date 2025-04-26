import React from "react";
import { Typography, Table, Row, Col, Tag } from "antd";
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

export default function InvoiceTemplate({ orderData, paymentInfo }) {
    const columns = [
        {
            title: "STT",
            key: "index",
            width: 50,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Tên món/dịch vụ",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (text) => <Tag color={text === "service" ? "blue" : "green"}>{text === "service" ? "Dịch vụ" : "Món ăn"}</Tag>,
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
            dataIndex: "price",
            key: "price",
            width: 120,
            align: "right",
            render: (price) => formatCurrency(price),
        },
        {
            title: "Thành tiền",
            key: "total",
            width: 120,
            align: "right",
            render: (_, record) => (
                <Text strong style={{ color: "#1890ff" }}>
                    {formatCurrency(record.price * record.quantity)}
                </Text>
            ),
        },
    ];

    const total = orderData.orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                        NHÀ HÀNG ABC
                    </Title>
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary">
                            <HomeOutlined /> 123 Đường XYZ, Quận 1, TP.HCM
                            <br />
                            <PhoneOutlined /> 1900 1234
                            <br />
                            <GlobalOutlined /> www.abcrestaurant.com
                        </Text>
                    </div>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                    <Title level={2} style={{ margin: 0 }}>
                        HÓA ĐƠN
                    </Title>
                    <div style={{ marginTop: 8 }}>
                        <Text>Số HD: </Text>
                        <Text strong>INV-{orderData.id}</Text>
                        <br />
                        <Text>Ngày: </Text>
                        <Text strong>{dayjs().format("DD/MM/YYYY HH:mm")}</Text>
                    </div>
                </Col>
            </Row>

            {/* Thông tin bàn */}
            <div
                style={{
                    background: "#f5f5f5",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                }}
            >
                <Title level={5} style={{ marginTop: 0 }}>
                    THÔNG TIN BÀN
                </Title>
                <Row gutter={24}>
                    <Col span={12}>
                        <Text strong>Bàn số: </Text>
                        <Text>{orderData.name}</Text>
                        <br />
                        <Text strong>Số khách: </Text>
                        <Text>{orderData.customerCount} người</Text>
                    </Col>
                    <Col span={12}>
                        <Text strong>Giờ vào: </Text>
                        <Text>{orderData.timeIn}</Text>
                        <br />
                        <Text strong>Giờ ra: </Text>
                        <Text>{orderData.timeOut}</Text>
                    </Col>
                </Row>
            </div>

            {/* Chi tiết order */}
            <Title level={5}>CHI TIẾT GỌI MÓN</Title>
            <Table
                dataSource={orderData.orders}
                columns={columns}
                pagination={false}
                bordered
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell colSpan={5} align="right">
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
                                    <Table.Summary.Cell colSpan={5} align="right">
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
                                            <Table.Summary.Cell colSpan={5} align="right">
                                                Tiền khách đưa:
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                {formatCurrency(paymentInfo.receivedAmount)}
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell colSpan={5} align="right">
                                                Tiền thừa:
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">{formatCurrency(paymentInfo.change)}</Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </>
                                )}
                            </>
                        )}
                    </Table.Summary>
                )}
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
