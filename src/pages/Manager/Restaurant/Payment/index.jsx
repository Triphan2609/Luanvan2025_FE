// PaymentRestaurant.jsx
import React, { useState } from "react";
import {
    Card,
    Steps,
    Space,
    Typography,
    Radio,
    InputNumber,
    Button,
    message,
    Modal,
    Statistic,
    Divider,
    Table,
    Tag,
    Descriptions,
    Input,
} from "antd";
import {
    DollarOutlined,
    CreditCardOutlined,
    MoneyCollectOutlined,
    BankOutlined,
    CheckCircleOutlined,
    RollbackOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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

export default function PaymentRestaurant() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [note, setNote] = useState("");

    // Dữ liệu mẫu đơn hàng
    const orderData = {
        id: "table01",
        name: "Bàn 1",
        orders: [
            { id: 1, name: "Phở bò", quantity: 2, price: 45000, type: "food", status: "done" },
            { id: 2, name: "Trà đá", quantity: 2, price: 5000, type: "drink", status: "done" },
            { id: 3, name: "Khăn giấy", quantity: 1, price: 3000, type: "service", status: "done" },
        ],
        timeIn: "10:30",
        timeOut: "11:45",
        customerCount: 2,
    };

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
            render: (text) => (
                <Tag color={text === "food" ? "green" : text === "drink" ? "blue" : "purple"}>
                    {text === "food" ? "Món ăn" : text === "drink" ? "Đồ uống" : "Dịch vụ"}
                </Tag>
            ),
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

    // Tính tổng tiền
    const total = orderData.orders.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Xử lý thanh toán
    const handlePayment = () => {
        if (paymentMethod === "cash" && receivedAmount < total) {
            message.error("Số tiền nhận vào phải lớn hơn hoặc bằng tổng tiền!");
            return;
        }
        setIsModalVisible(true);
    };

    // Xác nhận thanh toán
    const handleConfirmPayment = () => {
        const paymentInfo = {
            method: paymentMethod,
            receivedAmount,
            change: receivedAmount - total,
            timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            note,
        };

        // Lưu thông tin vào localStorage
        localStorage.setItem(
            `restaurant_payment_${orderData.id}`,
            JSON.stringify({
                orderData,
                paymentInfo,
            })
        );

        message.success("Thanh toán thành công!");
        // Chuyển đến trang hóa đơn
        navigate(`/restaurant/payment/invoice/${orderData.id}`);
    };

    const steps = [
        {
            title: "Xác nhận",
            icon: <CheckCircleOutlined />,
        },
        {
            title: "Thanh toán",
            icon: <MoneyCollectOutlined />,
        },
    ];

    return (
        <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Steps current={currentStep} items={steps} />

                <Card title="Thông tin thanh toán">
                    <Space direction="vertical" style={{ width: "100%" }} size="large">
                        {/* Thông tin bàn */}
                        <div style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}>
                            <Title level={5}>THÔNG TIN BÀN</Title>
                            <Space wrap>
                                <Text strong>Bàn số:</Text>
                                <Text>{orderData.name}</Text>
                                <Divider type="vertical" />
                                <Text strong>Số khách:</Text>
                                <Text>{orderData.customerCount} người</Text>
                                <Divider type="vertical" />
                                <Text strong>Giờ vào:</Text>
                                <Text>{orderData.timeIn}</Text>
                                <Divider type="vertical" />
                                <Text strong>Giờ ra:</Text>
                                <Text>{orderData.timeOut}</Text>
                            </Space>
                        </div>

                        {/* Chi tiết đơn hàng */}
                        <Table dataSource={orderData.orders} columns={columns} pagination={false} bordered />

                        {/* Phần thanh toán */}
                        <Card>
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <Statistic
                                    title="Tổng tiền"
                                    value={total}
                                    formatter={(value) => formatCurrency(value)}
                                    valueStyle={{ color: "#cf1322" }}
                                />

                                <Divider />

                                <div>
                                    <Title level={5}>PHƯƠNG THỨC THANH TOÁN</Title>
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
                                            <Title level={5}>TIỀN KHÁCH ĐƯA</Title>
                                            <InputNumber
                                                style={{ width: "100%" }}
                                                value={receivedAmount}
                                                onChange={setReceivedAmount}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                                                parser={(value) => value.replace(/\./g, "")}
                                                min={0}
                                            />
                                            {receivedAmount > 0 && (
                                                <Statistic
                                                    title="Tiền thừa"
                                                    value={receivedAmount - total}
                                                    formatter={(value) => formatCurrency(value)}
                                                    valueStyle={{
                                                        color: receivedAmount - total >= 0 ? "#3f8600" : "#cf1322",
                                                    }}
                                                />
                                            )}
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
                    </Space>
                </Card>

                {/* Modal xác nhận thanh toán */}
                <Modal
                    title="Xác nhận thanh toán"
                    open={isModalVisible}
                    onOk={handleConfirmPayment}
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
                                    <Descriptions.Item label="Tiền thừa">{formatCurrency(receivedAmount - total)}</Descriptions.Item>
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
