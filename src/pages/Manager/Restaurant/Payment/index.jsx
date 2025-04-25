// PaymentRestaurant.jsx
import React, { useState } from "react";
import {
    Radio,
    Table,
    Descriptions,
    Divider,
    Button,
    Card,
    Space,
    InputNumber,
    Row,
    Col,
    Statistic,
    Steps,
    message,
    Tag,
    Modal,
    Input,
} from "antd";
import {
    DollarOutlined,
    CreditCardOutlined,
    PrinterOutlined,
    RollbackOutlined,
    CheckCircleOutlined,
    BankOutlined,
    MoneyCollectOutlined,
} from "@ant-design/icons";

// Helper function để format tiền tệ
const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function PaymentRestaurant() {
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [note, setNote] = useState("");

    // 🔹 Dữ liệu mẫu nâng cao
    const table = {
        id: "table01",
        name: "Bàn 1",
        orders: [
            { id: 1, name: "Phở bò", quantity: 2, price: 45000, type: "food", status: "done" },
            { id: 2, name: "Trà đá", quantity: 2, price: 5000, type: "food", status: "done" },
            { id: 3, name: "Khăn giấy", quantity: 1, price: 3000, type: "service", status: "done" },
        ],
        timeIn: "10:30",
        timeOut: "11:45",
        customerCount: 2,
    };

    const orderItems = table?.orders || [];
    const createdAt = new Date().toLocaleString();
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const change = receivedAmount - total;

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
                <span style={{ color: "#1890ff", fontWeight: "bold" }}>{formatCurrency(record.price * record.quantity)}</span>
            ),
        },
    ];

    const handlePayment = () => {
        if (paymentMethod === "cash" && receivedAmount < total) {
            message.error("Số tiền nhận vào phải lớn hơn hoặc bằng tổng tiền!");
            return;
        }
        setIsModalVisible(true);
    };

    const confirmPayment = () => {
        message.success("Thanh toán thành công!");
        setCurrentStep(2);
        setIsModalVisible(false);
    };

    const steps = [
        {
            title: "Xác nhận đơn",
            icon: <CheckCircleOutlined />,
        },
        {
            title: "Thanh toán",
            icon: <MoneyCollectOutlined />,
        },
        {
            title: "Hoàn thành",
            icon: <PrinterOutlined />,
        },
    ];

    return (
        <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Steps current={currentStep} items={steps} />

                <Row gutter={16}>
                    <Col span={16}>
                        <Card title="Chi tiết hóa đơn">
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Bàn">{table.name}</Descriptions.Item>
                                <Descriptions.Item label="Thời gian vào">{table.timeIn}</Descriptions.Item>
                                <Descriptions.Item label="Số khách">{table.customerCount} người</Descriptions.Item>
                                <Descriptions.Item label="Thời gian ra">{table.timeOut}</Descriptions.Item>
                            </Descriptions>

                            <Divider />

                            <Table
                                dataSource={orderItems}
                                columns={columns}
                                pagination={false}
                                summary={() => (
                                    <Table.Summary fixed>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell colSpan={5} align="right">
                                                <strong>Tổng cộng:</strong>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell align="right">
                                                <span style={{ color: "#f5222d", fontWeight: "bold", fontSize: 16 }}>
                                                    {formatCurrency(total)}
                                                </span>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </Table.Summary>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card title="Thanh toán">
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <Statistic
                                    title="Tổng tiền"
                                    value={total}
                                    formatter={(value) => formatCurrency(value)}
                                    prefix={<DollarOutlined />}
                                    valueStyle={{ color: "#cf1322" }}
                                />

                                <Divider />

                                <div>
                                    <h4>Phương thức thanh toán</h4>
                                    <Radio.Group
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        buttonStyle="solid"
                                    >
                                        <Space direction="vertical">
                                            <Radio.Button value="cash">
                                                <MoneyCollectOutlined /> Tiền mặt
                                            </Radio.Button>
                                            <Radio.Button value="card">
                                                <CreditCardOutlined /> Thẻ
                                            </Radio.Button>
                                            <Radio.Button value="bank">
                                                <BankOutlined /> Chuyển khoản
                                            </Radio.Button>
                                        </Space>
                                    </Radio.Group>
                                </div>

                                {paymentMethod === "cash" && (
                                    <>
                                        <Divider />
                                        <Space direction="vertical" style={{ width: "100%" }}>
                                            <div>
                                                <label>Tiền khách đưa:</label>
                                                <InputNumber
                                                    style={{ width: "100%" }}
                                                    value={receivedAmount}
                                                    onChange={setReceivedAmount}
                                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                    parser={(value) => value.replace(/\./g, "")}
                                                    addonAfter="₫"
                                                />
                                            </div>
                                            <Statistic
                                                title="Tiền thừa"
                                                value={change > 0 ? change : 0}
                                                formatter={(value) => formatCurrency(value)}
                                                valueStyle={{ color: change > 0 ? "#3f8600" : "#cf1322" }}
                                            />
                                        </Space>
                                    </>
                                )}

                                <Divider />

                                <Space>
                                    <Button icon={<RollbackOutlined />} onClick={() => window.history.back()}>
                                        Quay lại
                                    </Button>
                                    <Button type="primary" icon={<CheckCircleOutlined />} onClick={handlePayment}>
                                        Xác nhận thanh toán
                                    </Button>
                                </Space>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title="Xác nhận thanh toán"
                    open={isModalVisible}
                    onOk={confirmPayment}
                    onCancel={() => setIsModalVisible(false)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Tổng tiền">{formatCurrency(total)}</Descriptions.Item>
                            <Descriptions.Item label="Phương thức">
                                {paymentMethod === "cash" ? "Tiền mặt" : paymentMethod === "card" ? "Thẻ" : "Chuyển khoản"}
                            </Descriptions.Item>
                            {paymentMethod === "cash" && (
                                <>
                                    <Descriptions.Item label="Tiền nhận">{formatCurrency(receivedAmount)}</Descriptions.Item>
                                    <Descriptions.Item label="Tiền thừa">{formatCurrency(change > 0 ? change : 0)}</Descriptions.Item>
                                </>
                            )}
                        </Descriptions>
                        <Input.TextArea placeholder="Ghi chú (nếu có)" value={note} onChange={(e) => setNote(e.target.value)} rows={4} />
                    </Space>
                </Modal>
            </Space>
        </div>
    );
}
