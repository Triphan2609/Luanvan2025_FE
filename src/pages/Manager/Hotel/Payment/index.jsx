import React, { useState } from "react";
import { Card, Steps, Space, Descriptions, Radio, InputNumber, Button, message, Modal, Result, Statistic, Divider } from "antd";
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
import "./Payment.scss";

const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Dữ liệu mẫu đặt phòng
const sampleBooking = {
    id: "BK001",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    roomNumber: "101",
    roomType: "Phòng Đôi",
    checkIn: "2025-04-26",
    checkOut: "2025-04-28",
    services: [
        { id: 1, name: "Phòng đôi - 2 đêm", quantity: 1, pricePerNight: 800000, nights: 2 },
        { id: 2, name: "Dịch vụ giặt ủi", quantity: 1, price: 100000 },
    ],
};

export default function Payment() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Tính tổng tiền
    const total = sampleBooking.services.reduce((sum, item) => {
        const itemTotal = item.pricePerNight ? item.pricePerNight * item.nights : item.price * item.quantity;
        return sum + itemTotal;
    }, 0);

    // Tính tiền thừa
    const change = receivedAmount - total;

    const handlePayment = () => {
        if (paymentMethod === "cash" && receivedAmount < total) {
            message.error("Số tiền nhận vào phải lớn hơn hoặc bằng tổng tiền!");
            return;
        }
        setIsModalVisible(true);
    };

    const handleConfirmPayment = () => {
        const paymentInfo = {
            method: paymentMethod,
            receivedAmount,
            change,
            timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };

        // Lưu thông tin vào localStorage
        localStorage.setItem(
            `payment_${sampleBooking.id}`,
            JSON.stringify({
                booking: sampleBooking,
                paymentInfo,
            })
        );

        // Chuyển hướng đến trang hóa đơn
        navigate(`/hotel/payment/invoice/${sampleBooking.id}`);
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
        <div className="payment-container">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Steps current={currentStep} items={steps} className="payment-steps" />

                <Card className="payment-card">
                    <Descriptions title="Thông tin đặt phòng" bordered>
                        <Descriptions.Item label="Mã đặt phòng">{sampleBooking.id}</Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{sampleBooking.customerName}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{sampleBooking.phone}</Descriptions.Item>
                        <Descriptions.Item label="Phòng">{sampleBooking.roomNumber}</Descriptions.Item>
                        <Descriptions.Item label="Loại phòng">{sampleBooking.roomType}</Descriptions.Item>
                        <Descriptions.Item label="Thời gian">
                            {sampleBooking.checkIn} - {sampleBooking.checkOut}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Statistic title="Tổng tiền" value={total} formatter={(value) => formatCurrency(value)} className="payment-total" />

                        <div className="payment-methods">
                            <h4>Phương thức thanh toán</h4>
                            <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} buttonStyle="solid">
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
                            <div style={{ marginTop: 16 }}>
                                <h4>Tiền khách đưa:</h4>
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
                                        value={change}
                                        formatter={(value) => formatCurrency(value)}
                                        valueStyle={{ color: change >= 0 ? "#3f8600" : "#cf1322" }}
                                    />
                                )}
                            </div>
                        )}

                        <Space style={{ marginTop: 24 }}>
                            <Button icon={<RollbackOutlined />} onClick={() => window.history.back()}>
                                Quay lại
                            </Button>
                            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handlePayment}>
                                Xác nhận thanh toán
                            </Button>
                        </Space>
                    </Space>
                </Card>

                <Modal
                    title="Xác nhận thanh toán"
                    open={isModalVisible}
                    onOk={handleConfirmPayment}
                    onCancel={() => setIsModalVisible(false)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Descriptions column={1}>
                        <Descriptions.Item label="Tổng tiền">{formatCurrency(total)}</Descriptions.Item>
                        <Descriptions.Item label="Phương thức">
                            {paymentMethod === "cash" ? "Tiền mặt" : paymentMethod === "card" ? "Thẻ" : "Chuyển khoản"}
                        </Descriptions.Item>
                        {paymentMethod === "cash" && (
                            <>
                                <Descriptions.Item label="Tiền nhận">{formatCurrency(receivedAmount)}</Descriptions.Item>
                                <Descriptions.Item label="Tiền thừa">{formatCurrency(change)}</Descriptions.Item>
                            </>
                        )}
                    </Descriptions>
                </Modal>
            </Space>
        </div>
    );
}
