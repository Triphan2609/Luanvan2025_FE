import React, { useState, useEffect } from "react";
import {
    Card,
    Descriptions,
    Table,
    Radio,
    InputNumber,
    Button,
    message,
    Space,
    Tooltip,
    Alert,
    Input,
    Spin,
    Select,
} from "antd";
import {
    MoneyCollectOutlined,
    CreditCardOutlined,
    BankOutlined,
    QrcodeOutlined,
    CheckCircleOutlined,
    RollbackOutlined,
    CopyOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { restaurantOrderApi } from "../../../../api/restaurantOrderApi";
import {
    getPaymentMethods,
    getPaymentDataByType,
    createRestaurantInvoice,
    createPayment,
    updatePaymentStatus,
    updateRestaurantInvoiceStatus,
} from "../../../../api/paymentsApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";
import "./Payment.scss";
import { useDispatch } from "react-redux";
import { clearCart, setProcessingOrder } from "../../../../store/orderSlice";

const paymentMethodIcons = {
    cash: <MoneyCollectOutlined style={{ fontSize: "20px" }} />,
    bank_transfer: <BankOutlined style={{ fontSize: "20px" }} />,
    zalo_pay: <QrcodeOutlined style={{ fontSize: "20px", color: "#00b3ff" }} />,
    card: <CreditCardOutlined style={{ fontSize: "20px" }} />,
};

const formatCurrency = (value) => {
    const number = Number(value);
    if (isNaN(number) || value === null || value === undefined) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number);
};

export default function RestaurantPayment() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [methodId, setMethodId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [notes, setNotes] = useState("");
    const [processingPayment, setProcessingPayment] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [branchName, setBranchName] = useState("");
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBankId, setSelectedBankId] = useState("");
    const [restaurantInvoiceId, setRestaurantInvoiceId] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchOrderAndInvoice = async () => {
            try {
                setLoading(true);
                const data = await restaurantOrderApi.getById(orderId);
                setOrder(data);
                if (data.restaurantInvoiceId) {
                    setRestaurantInvoiceId(data.restaurantInvoiceId);
                } else {
                    const totalAmount = data.items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );
                    const invoicePayload = {
                        invoiceNumber: `INV-${data.id}-${Date.now()}`,
                        totalAmount,
                        finalAmount: totalAmount,
                        issueDate: new Date(),
                        restaurantOrderId: data.id,
                        branchId: data.branchId,
                    };
                    const invoice = await createRestaurantInvoice(
                        invoicePayload
                    );
                    setRestaurantInvoiceId(invoice.id);
                }
                if (data.branchId) setSelectedBranchId(data.branchId);
            } catch (error) {
                message.error("Không thể lấy thông tin order hoặc hóa đơn");
            } finally {
                setLoading(false);
            }
        };
        fetchOrderAndInvoice();
    }, [orderId]);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const methods = await getPaymentMethods();
                if (Array.isArray(methods) && methods.length > 0) {
                    setPaymentMethods(methods);
                    setMethodId(methods[0].id);
                    setPaymentMethod(methods[0].type);
                } else {
                    const defaultMethods = [
                        { id: 1, name: "Tiền mặt", type: "cash" },
                        { id: 2, name: "Chuyển khoản", type: "bank_transfer" },
                        { id: 3, name: "ZaloPay", type: "zalo_pay" },
                        { id: 4, name: "Thẻ", type: "card" },
                    ];
                    setPaymentMethods(defaultMethods);
                    setMethodId(defaultMethods[0].id);
                    setPaymentMethod(defaultMethods[0].type);
                }
            } catch (error) {
                message.warning(
                    "Không lấy được phương thức thanh toán từ backend, dùng mặc định!"
                );
                const defaultMethods = [
                    { id: 1, name: "Tiền mặt", type: "cash" },
                    { id: 2, name: "Chuyển khoản", type: "bank_transfer" },
                    { id: 3, name: "ZaloPay", type: "zalo_pay" },
                    { id: 4, name: "Thẻ", type: "card" },
                ];
                setPaymentMethods(defaultMethods);
                setMethodId(defaultMethods[0].id);
                setPaymentMethod(defaultMethods[0].type);
            }
        };
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const branchList = await getRestaurantBranches();
                setBranches(branchList);
                if (order && order.branchId) {
                    const found = branchList.find(
                        (b) => b.id === order.branchId
                    );
                    setBranchName(found ? found.name : "");
                }
            } catch (error) {
                message.error("Không thể tải danh sách chi nhánh");
            }
        };
        fetchBranches();
    }, [order]);

    useEffect(() => {
        if (paymentMethod === "bank_transfer") {
            getPaymentDataByType("bank_transfer").then((data) => {
                setBankAccounts(data.accounts || []);
                if (data.accounts && data.accounts.length > 0) {
                    setSelectedBankId(data.accounts[0].id);
                }
            });
        }
    }, [paymentMethod]);

    const total =
        order?.items?.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        ) || 0;
    const change = receivedAmount - total;

    const handlePaymentMethodChange = (e) => {
        const selected = paymentMethods.find((m) => m.id === e.target.value);
        setMethodId(selected.id);
        setPaymentMethod(selected.type);
    };

    const handlePayment = async () => {
        if (!order || !order.branchId) {
            message.error("Không xác định được chi nhánh thanh toán");
            return;
        }
        if (!restaurantInvoiceId) {
            message.error("Không tìm thấy hóa đơn nhà hàng để thanh toán");
            return;
        }
        if (paymentMethod === "cash" && receivedAmount < total) {
            message.error("Số tiền khách đưa không đủ để thanh toán");
            return;
        }
        if (paymentMethod === "bank_transfer" && !selectedBankId) {
            message.error("Vui lòng chọn tài khoản ngân hàng để thanh toán");
            return;
        }
        setProcessingPayment(true);
        try {
            const payment = await createPayment({
                amount: total,
                methodId,
                notes:
                    paymentMethod === "bank_transfer"
                        ? `Chuyển khoản qua tài khoản ${selectedBankId}`
                        : notes,
                receivedAmount,
                branchId: order.branchId,
                restaurantInvoiceId,
            });
            if (payment && payment.id) {
                try {
                    await updatePaymentStatus(payment.id, "confirmed");
                    await updateRestaurantInvoiceStatus(
                        restaurantInvoiceId,
                        "paid"
                    );
                } catch (e) {
                    console.error("Error updating payment/invoice status:", e);
                }
            }
            for (const item of order.items) {
                if (item.status !== "completed") {
                    try {
                        await restaurantOrderApi.updateOrderItemStatus(
                            order.id,
                            item.id,
                            "completed"
                        );
                    } catch (e) {
                        console.error("Error updating order item status:", e);
                    }
                }
            }
            if (order.tableId) {
                dispatch(clearCart({ tableId: order.tableId }));
                dispatch(
                    setProcessingOrder({ tableId: order.tableId, items: [] })
                );
            }
            message.success("Thanh toán thành công!");
            navigate(`/restaurant/invoice/${restaurantInvoiceId}`);
        } catch (error) {
            message.error("Có lỗi khi thanh toán: " + (error.message || ""));
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) return <Spin tip="Đang tải..." />;
    if (!order) return <Alert message="Không tìm thấy order" type="error" />;

    return (
        <Card
            title="Thanh toán đơn hàng nhà hàng"
            style={{ maxWidth: 700, margin: "0 auto" }}
        >
            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Ngày giờ">
                    {dayjs(order.orderTime || order.createdAt).format(
                        "HH:mm DD/MM/YYYY"
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Bàn">
                    {order.tableNumber || order.table?.tableNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Chi nhánh">
                    {branchName || order.branchId}
                </Descriptions.Item>
            </Descriptions>
            <Table
                dataSource={order.items}
                columns={[
                    { title: "Món ăn", dataIndex: "name", key: "name" },
                    {
                        title: "Số lượng",
                        dataIndex: "quantity",
                        key: "quantity",
                    },
                    {
                        title: "Đơn giá",
                        dataIndex: "price",
                        key: "price",
                        render: (v) => formatCurrency(v),
                    },
                    {
                        title: "Thành tiền",
                        key: "total",
                        render: (_, r) => formatCurrency(r.price * r.quantity),
                    },
                ]}
                pagination={false}
                rowKey="id"
                style={{ marginTop: 16, marginBottom: 16 }}
            />
            <div
                style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 16,
                }}
            >
                Tổng tiền: {formatCurrency(total)}
            </div>
            <div style={{ marginBottom: 16 }}>
                <Radio.Group
                    value={methodId}
                    onChange={handlePaymentMethodChange}
                >
                    {paymentMethods.map((method) => (
                        <Radio.Button key={method.id} value={method.id}>
                            <Space>
                                {paymentMethodIcons[method.type]}
                                {method.name}
                            </Space>
                        </Radio.Button>
                    ))}
                </Radio.Group>
            </div>
            {paymentMethod === "cash" && (
                <div style={{ marginBottom: 16 }}>
                    <span>Tiền khách đưa: </span>
                    <InputNumber
                        min={0}
                        value={receivedAmount}
                        onChange={setReceivedAmount}
                        formatter={(v) => formatCurrency(v)}
                        parser={(v) => v.replace(/[^\d]/g, "")}
                        style={{ width: 200, marginLeft: 8 }}
                    />
                    <span style={{ marginLeft: 16 }}>
                        Tiền thừa:{" "}
                        <b style={{ color: change < 0 ? "red" : "green" }}>
                            {formatCurrency(change)}
                        </b>
                    </span>
                </div>
            )}
            {paymentMethod === "bank_transfer" && (
                <div style={{ marginBottom: 24 }}>
                    {bankAccounts.length === 0 ? (
                        <Alert
                            message="Không có tài khoản ngân hàng"
                            description="Không tìm thấy thông tin tài khoản ngân hàng hoạt động trong hệ thống."
                            type="warning"
                            showIcon
                        />
                    ) : (
                        <div style={{ marginTop: 16 }}>
                            <h4>Thông tin chuyển khoản:</h4>
                            {bankAccounts.length > 1 && (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ marginBottom: 8 }}>
                                        Chọn tài khoản ngân hàng:
                                    </div>
                                    <Radio.Group
                                        value={selectedBankId}
                                        onChange={(e) =>
                                            setSelectedBankId(e.target.value)
                                        }
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "8px",
                                        }}
                                    >
                                        {bankAccounts.map((account) => (
                                            <Radio
                                                key={account.id}
                                                value={account.id}
                                            >
                                                <Space>
                                                    <span
                                                        style={{
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {account.bankName}
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: "#888",
                                                        }}
                                                    >
                                                        ({account.accountNumber}
                                                        )
                                                    </span>
                                                </Space>
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                </div>
                            )}
                            {(() => {
                                const bankAccount =
                                    bankAccounts.find(
                                        (acc) => acc.id === selectedBankId
                                    ) || bankAccounts[0];
                                return (
                                    <div
                                        style={{
                                            border: "1px solid #e8e8e8",
                                            padding: "20px",
                                            borderRadius: "8px",
                                            backgroundColor: "#f9f9f9",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                marginBottom: "15px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    backgroundColor: "#1890ff",
                                                    borderRadius: "50%",
                                                    marginRight: "15px",
                                                }}
                                            >
                                                {bankAccount.logoUrl ? (
                                                    <img
                                                        src={
                                                            bankAccount.logoUrl
                                                        }
                                                        alt={
                                                            bankAccount.bankName
                                                        }
                                                        style={{
                                                            width: "30px",
                                                            height: "30px",
                                                        }}
                                                    />
                                                ) : (
                                                    <BankOutlined
                                                        style={{
                                                            fontSize: "24px",
                                                            color: "white",
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: "bold",
                                                        fontSize: "16px",
                                                    }}
                                                >
                                                    {bankAccount.bankName}
                                                </div>
                                                <div
                                                    style={{
                                                        color: "#888",
                                                        fontSize: "12px",
                                                    }}
                                                >
                                                    {bankAccount.branch || ""}
                                                </div>
                                            </div>
                                        </div>
                                        <Descriptions
                                            bordered
                                            column={1}
                                            size="small"
                                            style={{ marginBottom: "15px" }}
                                        >
                                            <Descriptions.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Ngân hàng
                                                    </span>
                                                }
                                                labelStyle={{ width: "150px" }}
                                            >
                                                <b>{bankAccount.bankName}</b>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Số tài khoản
                                                    </span>
                                                }
                                                labelStyle={{ width: "150px" }}
                                            >
                                                <Space>
                                                    <b>
                                                        {
                                                            bankAccount.accountNumber
                                                        }
                                                    </b>
                                                    <Button
                                                        type="text"
                                                        icon={<CopyOutlined />}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(
                                                                bankAccount.accountNumber
                                                            );
                                                            message.success(
                                                                "Đã sao chép số tài khoản"
                                                            );
                                                        }}
                                                    />
                                                </Space>
                                            </Descriptions.Item>
                                            <Descriptions.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontWeight: "500",
                                                        }}
                                                    >
                                                        Tên tài khoản
                                                    </span>
                                                }
                                                labelStyle={{ width: "150px" }}
                                            >
                                                <Space>
                                                    <b>
                                                        {
                                                            bankAccount.accountName
                                                        }
                                                    </b>
                                                    <Button
                                                        type="text"
                                                        icon={<CopyOutlined />}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(
                                                                bankAccount.accountName
                                                            );
                                                            message.success(
                                                                "Đã sao chép tên tài khoản"
                                                            );
                                                        }}
                                                    />
                                                </Space>
                                            </Descriptions.Item>
                                            {bankAccount.swiftCode && (
                                                <Descriptions.Item
                                                    label={
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "500",
                                                            }}
                                                        >
                                                            Mã SWIFT
                                                        </span>
                                                    }
                                                    labelStyle={{
                                                        width: "150px",
                                                    }}
                                                >
                                                    <Space>
                                                        <b>
                                                            {
                                                                bankAccount.swiftCode
                                                            }
                                                        </b>
                                                        <Button
                                                            type="text"
                                                            icon={
                                                                <CopyOutlined />
                                                            }
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    bankAccount.swiftCode
                                                                );
                                                                message.success(
                                                                    "Đã sao chép mã SWIFT"
                                                                );
                                                            }}
                                                        />
                                                    </Space>
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>
                                        {bankAccount.description && (
                                            <Alert
                                                message="Lưu ý"
                                                description={
                                                    bankAccount.description
                                                }
                                                type="info"
                                                showIcon
                                            />
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            )}
            <div style={{ marginBottom: 16 }}>
                <span>Ghi chú: </span>
                <Input.TextArea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                />
            </div>
            <Space>
                <Button
                    icon={<RollbackOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>
                <Tooltip
                    title={total <= 0 ? "Không có số tiền cần thanh toán" : ""}
                >
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handlePayment}
                        disabled={total <= 0}
                        loading={processingPayment}
                    >
                        Xác nhận thanh toán
                    </Button>
                </Tooltip>
            </Space>
        </Card>
    );
}
