import React, { useState, useEffect } from "react";
import {
    Card,
    Steps,
    Space,
    Descriptions,
    Radio,
    InputNumber,
    Button,
    message,
    Modal,
    Statistic,
    Divider,
    Spin,
    Alert,
    Table,
    Tooltip,
    Form,
    Input,
    Select,
} from "antd";
import {
    DollarOutlined,
    CreditCardOutlined,
    MoneyCollectOutlined,
    BankOutlined,
    CheckCircleOutlined,
    RollbackOutlined,
    CalendarOutlined,
    UserOutlined,
    HomeOutlined,
    PrinterOutlined,
    QrcodeOutlined,
    MailOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import "./Payment.scss";
import {
    getBookingById,
    updateBookingPaymentStatus,
    updatePaymentStatusAndSetAvailable,
} from "../../../../api/bookingsApi";
import {
    getHotelInvoiceByBookingId,
    createHotelInvoice,
    createPayment,
    getPaymentsByHotelInvoiceId,
    sendHotelInvoiceByEmail,
    getPaymentMethods,
    getPaymentDataByType,
    getBankAccounts,
    getActiveBankAccounts,
    updatePaymentStatus,
} from "../../../../api/paymentsApi";
import { getHotelBranches } from "../../../../api/branchesApi";

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

// Map icon động theo type
const paymentMethodIcons = {
    cash: <MoneyCollectOutlined style={{ fontSize: "20px" }} />,
    bank_transfer: <BankOutlined style={{ fontSize: "20px" }} />,
    zalo_pay: <QrcodeOutlined style={{ fontSize: "20px", color: "#00b3ff" }} />,
    zalopay: <QrcodeOutlined style={{ fontSize: "20px", color: "#00b3ff" }} />,
    card: <CreditCardOutlined style={{ fontSize: "20px" }} />,
    // Thêm các type khác nếu backend có
};

export default function Payment() {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [methodId, setMethodId] = useState(null);
    const [receivedAmount, setReceivedAmount] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [booking, setBooking] = useState(null);
    const [hotelInvoice, setHotelInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [notes, setNotes] = useState("");
    const [previousPayments, setPreviousPayments] = useState([]);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBankId, setSelectedBankId] = useState("");
    const [processingPayment, setProcessingPayment] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailForm] = Form.useForm();
    const [sendingEmail, setSendingEmail] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);

    useEffect(() => {
        if (bankAccounts.length > 0) {
            setSelectedBankId(bankAccounts[0].id);
        }
    }, [bankAccounts]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log("[LOG] Bắt đầu fetch dữ liệu Payment");
                if (!bookingId) {
                    throw new Error("Không tìm thấy mã đặt phòng");
                }
                const bookingData = await getBookingById(bookingId);
                setBooking(bookingData);
                console.log("[LOG] bookingData:", bookingData);
                let invoice = await getHotelInvoiceByBookingId(bookingId);
                console.log("[LOG] hotelInvoice lấy từ API:", invoice);

                if (!invoice || !invoice.id) {
                    // Không có hóa đơn, tạo mới
                    const checkIn = dayjs(
                        bookingData?.checkIn || bookingData?.checkin
                    ).format("YYYY-MM-DD");
                    const checkOut = dayjs(
                        bookingData?.checkOut || bookingData?.checkout
                    ).format("YYYY-MM-DD");
                    // Tính tổng tiền phòng + dịch vụ
                    let nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
                    if (nights <= 0) nights = 1;
                    let totalAmount =
                        (Number(bookingData.room?.price) || 0) * nights;
                    if (
                        bookingData.services &&
                        Array.isArray(bookingData.services)
                    ) {
                        bookingData.services.forEach((service) => {
                            totalAmount += Number(service.price) || 0;
                        });
                    }
                    if (bookingData.discount) {
                        totalAmount =
                            totalAmount * (1 - bookingData.discount / 100);
                    }
                    const finalAmount = totalAmount;
                    invoice = await createHotelInvoice({
                        bookingId,
                        branchId: bookingData.branchId,
                        checkIn,
                        checkOut,
                        invoiceNumber: `INV-${bookingId}-${Date.now()}`,
                        totalAmount,
                        finalAmount,
                        issueDate: new Date(),
                    });
                    console.log("[LOG] hotelInvoice vừa tạo:", invoice);
                    // Gọi lại lấy từ DB để đảm bảo đồng bộ
                    invoice = await getHotelInvoiceByBookingId(bookingId);
                    console.log(
                        "[LOG] hotelInvoice lấy lại sau khi tạo:",
                        invoice
                    );
                }
                setHotelInvoice(invoice);
                console.log("[LOG] setHotelInvoice:", invoice);

                try {
                    const methods = await getPaymentMethods();
                    if (Array.isArray(methods) && methods.length > 0) {
                        setPaymentMethods(methods);
                        const defaultMethod = methods[0];
                        setMethodId(defaultMethod.id);
                        setPaymentMethod(defaultMethod.type);
                        if (defaultMethod.type === "bank_transfer") {
                            const paymentData = await getPaymentDataByType(
                                "bank_transfer"
                            );
                            setBankAccounts(paymentData.accounts || []);
                        }
                    } else {
                        throw new Error("No payment methods found");
                    }
                } catch (error) {
                    message.warning(
                        "Không tìm thấy phương thức thanh toán từ backend, sử dụng mặc định!"
                    );
                    const defaultMethods = [
                        { id: 1, name: "Tiền mặt", type: "cash" },
                        { id: 2, name: "Chuyển khoản", type: "bank_transfer" },
                        { id: 3, name: "Thanh toán ZaloPay", type: "zalo_pay" },
                    ];
                    setPaymentMethods(defaultMethods);
                    setMethodId(defaultMethods[0].id);
                    setPaymentMethod(defaultMethods[0].type);
                }

                if (invoice && invoice.id) {
                    const payments = await getPaymentsByHotelInvoiceId(
                        invoice.id
                    );
                    setPreviousPayments(payments || []);
                } else {
                    setPreviousPayments([]);
                }

                setLoading(false);
            } catch (error) {
                message.error(
                    error.message || "Lỗi khi lấy dữ liệu thanh toán"
                );
                console.log("[LOG] Lỗi fetchData:", error);
                setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu");
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line
    }, [bookingId]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const branchList = await getHotelBranches();
                setBranches(branchList);
                if (booking && booking.branch && booking.branch.id) {
                    setSelectedBranchId(booking.branch.id);
                } else if (branchList.length > 0) {
                    setSelectedBranchId(branchList[0].id);
                }
            } catch (error) {
                console.error("Error fetching branches:", error);
                message.error("Không thể tải danh sách chi nhánh");
            }
        };
        if (booking) {
            fetchBranches();
        }
    }, [booking]);

    const calculateTotal = () => {
        if (!booking) {
            return 0;
        }
        const checkIn = dayjs(booking.checkIn || booking.checkInDate);
        const checkOut = dayjs(booking.checkOut || booking.checkOutDate);
        let nights = checkOut.diff(checkIn, "day");
        if (nights <= 0) nights = 1;
        let total = Number(booking.room?.price) || 0;
        total = total * nights;
        if (booking.services && Array.isArray(booking.services)) {
            let servicesTotal = 0;
            booking.services.forEach((service) => {
                servicesTotal += Number(service.price) || 0;
            });
            total += servicesTotal;
        }
        if (booking.discount) {
            total = total * (1 - booking.discount / 100);
        }
        const previousPaymentsTotal = previousPayments.reduce(
            (sum, payment) => {
                return sum + (Number(payment.amount) || 0);
            },
            0
        );
        const finalTotal = Math.max(0, total - previousPaymentsTotal);
        return isNaN(finalTotal) ? 0 : finalTotal;
    };

    const total =
        hotelInvoice && hotelInvoice.finalAmount != null
            ? Number(hotelInvoice.finalAmount)
            : calculateTotal();
    const safeTotal = isNaN(total) ? 0 : total;
    const safeReceivedAmount = isNaN(Number(receivedAmount))
        ? 0
        : Number(receivedAmount);
    const change = safeReceivedAmount - safeTotal;

    const calculateTotalDeposit = () => {
        if (!previousPayments || !Array.isArray(previousPayments)) {
            return 0;
        }
        return previousPayments.reduce((total, payment) => {
            if (payment.type === "DEPOSIT") {
                return total + (Number(payment.amount) || 0);
            }
            return total;
        }, 0);
    };

    const handlePaymentMethodChange = async (e) => {
        const selectedMethod = paymentMethods.find(
            (m) => m.id === e.target.value
        );
        const methodType = selectedMethod?.type || "cash";

        setMethodId(e.target.value);
        setPaymentMethod(methodType);

        if (methodType === "bank_transfer") {
            try {
                const paymentData = await getPaymentDataByType(methodType);
                setBankAccounts(paymentData.accounts || []);
            } catch (error) {
                console.error("Error fetching bank account data:", error);
                message.error("Không thể tải thông tin tài khoản ngân hàng");
                setBankAccounts([]);
            }
        }
    };

    const handlePayment = async () => {
        if (!paymentMethod) {
            message.error(
                "Vui lòng chọn phương thức thanh toán trước khi tiếp tục"
            );
            return;
        }
        if (!selectedBranchId) {
            message.error("Vui lòng chọn chi nhánh thanh toán");
            return;
        }
        if (paymentMethod === "cash" && receivedAmount < total) {
            message.error(
                "Số tiền khách đưa không đủ để thanh toán tổng số tiền cần thanh toán"
            );
            return;
        }
        if (!hotelInvoice || !hotelInvoice.id) {
            message.error("Không tìm thấy hóa đơn khách sạn để thanh toán");
            console.log("[LOG] hotelInvoice object:", hotelInvoice);
            return;
        }
        try {
            setProcessingPayment(true);
            console.log("[LOG] Gọi createPayment với:", {
                hotelInvoiceId: hotelInvoice.id,
                methodId,
                amount: total,
                notes,
                branchId: selectedBranchId,
                receivedAmount,
                paymentMethod,
            });
            const payment = await createPayment({
                hotelInvoiceId: hotelInvoice.id,
                methodId,
                amount: total,
                notes,
                branchId: selectedBranchId,
                ...(paymentMethod === "cash" ? { receivedAmount } : {}),
            });
            // Cập nhật trạng thái payment thành công
            if (payment && payment.id) {
                await updatePaymentStatus(payment.id, "confirmed");
            }
            message.success("Thanh toán thành công!");
            await updateBookingPaymentStatus(bookingId, "paid");
            fetchPayments();
            navigate(`/hotel/invoice/${bookingId}`);
        } catch (error) {
            message.error("Có lỗi khi thanh toán: " + (error.message || ""));
        } finally {
            setProcessingPayment(false);
        }
    };

    const fetchPayments = async () => {
        if (!hotelInvoice || !hotelInvoice.id) {
            setPreviousPayments([]);
            return;
        }
        try {
            const payments = await getPaymentsByHotelInvoiceId(hotelInvoice.id);
            setPreviousPayments(payments || []);
        } catch (error) {
            setPreviousPayments([]);
        }
    };

    const handleGenerateInvoice = async () => {
        try {
            setLoading(true);

            const result = await generateAndSendInvoice(booking.id);

            const paymentInfo = {
                method: paymentMethod,
                receivedAmount: receivedAmount,
                change: change,
                notes: notes,
                methodId: methodId,
                date: new Date().toISOString(),
            };

            const formattedBooking = {
                id: booking.id,
                customerName: booking.customer?.name || "Khách hàng",
                phone: booking.customer?.phone || "",
                email: booking.customer?.email || "",
                roomNumber: booking.room?.roomCode || "",
                roomType: booking.room?.roomType?.name || "",
                checkIn: new Date(booking.checkInDate).toLocaleDateString(
                    "vi-VN"
                ),
                checkOut: new Date(booking.checkOutDate).toLocaleDateString(
                    "vi-VN"
                ),
                services: [
                    {
                        name: `${booking.room.roomCode} - ${
                            booking.room.roomType?.name || "Phòng"
                        }`,
                        pricePerNight: booking.room.price,
                        nights: Math.ceil(
                            (new Date(booking.checkOutDate) -
                                new Date(booking.checkInDate)) /
                                (1000 * 60 * 60 * 24)
                        ),
                        quantity: 1,
                    },
                    ...(booking.services || []).map((service) => ({
                        name: service.name,
                        price: service.price,
                        quantity: service.quantity || 1,
                    })),
                ],
                branch: {
                    id: booking.branch?.id,
                    name: booking.branch?.name || "KHÁCH SẠN ABC",
                    address:
                        booking.branch?.address ||
                        "123 Đường XYZ, Quận 1, TP.HCM",
                    phone: booking.branch?.phone || "1900 1234",
                    email: booking.branch?.email || "info@abchotel.com",
                    website: booking.branch?.website || "www.abchotel.com",
                },
            };

            localStorage.setItem(
                `payment_${booking.id}`,
                JSON.stringify({
                    booking: formattedBooking,
                    paymentInfo: paymentInfo,
                    pdfPath: result?.pdfPath || null,
                })
            );

            message.success("Hóa đơn đã được tạo và gửi cho khách hàng!");
            setShowPrintModal(false);

            navigate(`/hotel/invoice/${booking.id}`);
        } catch (error) {
            console.error("Error generating invoice:", error);
            message.error("Có lỗi khi tạo hóa đơn: " + error.message);
            setLoading(false);
        }
    };

    const handleSendInvoiceEmail = async (values) => {
        try {
            setSendingEmail(true);
            const { email } = values;
            if (!email) {
                message.error("Email là bắt buộc");
                setSendingEmail(false);
                return;
            }
            if (!hotelInvoice || !hotelInvoice.id) {
                message.error("Không tìm thấy hóa đơn khách sạn để gửi email");
                setSendingEmail(false);
                return;
            }
            await sendHotelInvoiceByEmail(hotelInvoice.id, email);
            message.success(`Đã gửi hóa đơn thành công đến: ${email}`);
            setShowEmailModal(false);
            emailForm.resetFields();
        } catch (error) {
            message.error(
                "Không thể gửi email: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setSendingEmail(false);
        }
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

    const serviceColumns = [
        {
            title: "Dịch vụ",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (text, record) =>
                record.quantity || (record.nights ? "1" : "1"),
        },
        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            render: (text, record) =>
                formatCurrency(record.pricePerNight || record.price || 0),
        },
        {
            title: "Thành tiền",
            key: "total",
            render: (text, record) => {
                const itemTotal = record.pricePerNight
                    ? record.pricePerNight * (record.nights || 1)
                    : (record.price || 0) * (record.quantity || 1);
                return formatCurrency(itemTotal);
            },
        },
    ];

    const getServicesData = () => {
        if (!booking) return [];

        const services = [];

        if (booking.room) {
            const checkIn = dayjs(booking.checkIn || booking.checkInDate);
            const checkOut = dayjs(booking.checkOut || booking.checkOutDate);
            let nights = checkOut.diff(checkIn, "day");
            if (nights <= 0) nights = 1;

            services.push({
                key: "room",
                name: `${booking.room.roomCode} - ${
                    booking.room.roomType?.name || "Phòng"
                }`,
                pricePerNight: booking.room.price,
                nights: nights,
                quantity: 1,
            });
        }

        if (booking.services && Array.isArray(booking.services)) {
            booking.services.forEach((service, index) => {
                services.push({
                    key: `service-${index}`,
                    name: service.name,
                    price: service.price,
                    quantity: service.quantity || 1,
                });
            });
        }

        return services;
    };

    const renderBankTransferSection = () => {
        if (bankAccounts.length === 0) {
            return (
                <Alert
                    message="Không có tài khoản ngân hàng"
                    description="Không tìm thấy thông tin tài khoản ngân hàng hoạt động trong hệ thống."
                    type="warning"
                    showIcon
                />
            );
        }

        const bankAccount =
            bankAccounts.find((acc) => acc.id === selectedBankId) ||
            bankAccounts[0];

        return (
            <div style={{ marginTop: 16 }}>
                <h4>Thông tin chuyển khoản:</h4>

                {bankAccounts.length > 1 && (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                            Chọn tài khoản ngân hàng:
                        </div>
                        <Radio.Group
                            value={selectedBankId}
                            onChange={(e) => setSelectedBankId(e.target.value)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            {bankAccounts.map((account) => (
                                <Radio key={account.id} value={account.id}>
                                    <Space>
                                        <span style={{ fontWeight: "bold" }}>
                                            {account.bankName}
                                        </span>
                                        <span style={{ color: "#888" }}>
                                            ({account.accountNumber})
                                        </span>
                                    </Space>
                                </Radio>
                            ))}
                        </Radio.Group>
                    </div>
                )}

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
                                    src={bankAccount.logoUrl}
                                    alt={bankAccount.bankName}
                                    style={{ width: "30px", height: "30px" }}
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
                            <b>{bankAccount.accountNumber}</b>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={
                                <span
                                    style={{
                                        fontWeight: "500",
                                    }}
                                >
                                    Chủ tài khoản
                                </span>
                            }
                            labelStyle={{ width: "150px" }}
                        >
                            <b>{bankAccount.accountName}</b>
                        </Descriptions.Item>
                        {bankAccount.swiftCode && (
                            <Descriptions.Item
                                label={
                                    <span
                                        style={{
                                            fontWeight: "500",
                                        }}
                                    >
                                        Mã Swift
                                    </span>
                                }
                                labelStyle={{ width: "150px" }}
                            >
                                <b>{bankAccount.swiftCode}</b>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item
                            label={
                                <span
                                    style={{
                                        fontWeight: "500",
                                    }}
                                >
                                    Nội dung
                                </span>
                            }
                            labelStyle={{ width: "150px" }}
                        >
                            <b>
                                Thanh toán {booking.room?.roomCode} -{" "}
                                {booking.id}
                            </b>
                        </Descriptions.Item>
                        <Descriptions.Item
                            label={
                                <span
                                    style={{
                                        fontWeight: "500",
                                    }}
                                >
                                    Số tiền
                                </span>
                            }
                            labelStyle={{ width: "150px" }}
                        >
                            <span
                                style={{
                                    color: "#f5222d",
                                    fontWeight: "bold",
                                }}
                            >
                                {formatCurrency(total)}
                            </span>
                        </Descriptions.Item>
                    </Descriptions>

                    <div
                        style={{
                            fontSize: "13px",
                            backgroundColor: "#e6f7ff",
                            padding: "10px",
                            borderRadius: "4px",
                            borderLeft: "4px solid #1890ff",
                        }}
                    >
                        <div style={{ marginBottom: "5px" }}>
                            <b>Lưu ý:</b>
                        </div>
                        <div>- Vui lòng ghi đúng nội dung chuyển khoản</div>
                        <div>
                            - Giữ lại biên lai chuyển khoản để đối chiếu nếu cần
                        </div>
                        <div>
                            - Nhập ghi chú vào ô bên dưới sau khi đã chuyển
                            khoản
                        </div>
                        {bankAccount.description && (
                            <div>- {bankAccount.description}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderBranchSelection = () => {
        return (
            <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: "bold" }}>
                    Chi nhánh thanh toán:
                </div>
                <Select
                    placeholder="Chọn chi nhánh"
                    style={{ width: "100%" }}
                    value={selectedBranchId}
                    onChange={(value) => setSelectedBranchId(value)}
                    disabled={processingPayment}
                    options={branches.map((branch) => ({
                        label: branch.name,
                        value: branch.id,
                    }))}
                />
            </div>
        );
    };

    if (loading && !booking) {
        return (
            <div
                className="payment-container"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh",
                }}
            >
                <Spin size="large" tip="Đang tải thông tin thanh toán..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-container">
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button
                            type="primary"
                            onClick={() => window.history.back()}
                        >
                            Quay lại
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="payment-container">
                <Alert
                    message="Không tìm thấy thông tin đặt phòng"
                    description="Không thể tìm thấy chi tiết đặt phòng cho mã đã chọn."
                    type="warning"
                    showIcon
                    action={
                        <Button
                            type="primary"
                            onClick={() => window.history.back()}
                        >
                            Quay lại
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="payment-container">
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Steps
                    current={currentStep}
                    items={steps}
                    className="payment-steps"
                />

                <Card className="payment-card">
                    <Descriptions title="Thông tin đặt phòng" bordered>
                        <Descriptions.Item label="Mã đặt phòng">
                            {booking.id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">
                            {booking.customer?.name || "Không có thông tin"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {booking.customer?.phone || "Không có thông tin"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng">
                            {booking.room?.roomCode || "Không có thông tin"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại phòng">
                            {booking.room?.roomType?.name ||
                                "Không có thông tin"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian">
                            {dayjs(
                                booking.checkIn || booking.checkInDate
                            ).format("DD/MM/YYYY")}{" "}
                            -{" "}
                            {dayjs(
                                booking.checkOut || booking.checkOutDate
                            ).format("DD/MM/YYYY")}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <div className="services-section">
                        <h3>Chi tiết dịch vụ</h3>
                        <Table
                            dataSource={getServicesData()}
                            columns={serviceColumns}
                            pagination={false}
                            footer={() => (
                                <div style={{ textAlign: "right" }}>
                                    {previousPayments.length > 0 && (
                                        <div style={{ marginBottom: "10px" }}>
                                            <strong>Đã thanh toán:</strong>{" "}
                                            {formatCurrency(
                                                previousPayments.reduce(
                                                    (sum, payment) =>
                                                        sum +
                                                        (payment.amount || 0),
                                                    0
                                                )
                                            )}
                                        </div>
                                    )}
                                    <strong>Tổng cần thanh toán:</strong>{" "}
                                    {formatCurrency(total)}
                                </div>
                            )}
                        />
                    </div>

                    <Divider />

                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Statistic
                            title="Số tiền cần thanh toán"
                            value={total}
                            formatter={(value) => formatCurrency(value)}
                            className="payment-total"
                        />

                        {renderBranchSelection()}

                        <div className="payment-methods">
                            <h4>Phương thức thanh toán</h4>
                            <Radio.Group
                                value={methodId}
                                onChange={handlePaymentMethodChange}
                                buttonStyle="solid"
                                style={{ width: "100%" }}
                            >
                                <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                >
                                    {paymentMethods.map((method) => (
                                        <Radio.Button
                                            key={method.id}
                                            value={method.id}
                                            style={{
                                                width: "100%",
                                                height: "46px",
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "8px 15px",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            <Space>
                                                {paymentMethodIcons[
                                                    method.type
                                                ] || (
                                                    <DollarOutlined
                                                        style={{
                                                            fontSize: "20px",
                                                        }}
                                                    />
                                                )}
                                                <span
                                                    style={{
                                                        fontWeight: "bold",
                                                        marginLeft: "8px",
                                                    }}
                                                >
                                                    {method.name}
                                                </span>
                                            </Space>
                                            {method.description && (
                                                <div
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#888",
                                                        marginLeft: 36,
                                                    }}
                                                >
                                                    {method.description}
                                                </div>
                                            )}
                                        </Radio.Button>
                                    ))}
                                </Space>
                            </Radio.Group>
                        </div>

                        {paymentMethod === "cash" && (
                            <div style={{ marginTop: 16 }}>
                                <h4>Thanh toán tiền mặt:</h4>
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
                                                backgroundColor: "#52c41a",
                                                borderRadius: "50%",
                                                marginRight: "15px",
                                            }}
                                        >
                                            <MoneyCollectOutlined
                                                style={{
                                                    fontSize: "24px",
                                                    color: "white",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontWeight: "bold",
                                                    fontSize: "16px",
                                                }}
                                            >
                                                Thanh toán bằng tiền mặt
                                            </div>
                                            <div
                                                style={{
                                                    color: "#888",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                Vui lòng nhập số tiền khách đưa
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "15px" }}>
                                        <div
                                            style={{
                                                fontWeight: "500",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            Số tiền cần thanh toán:
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "24px",
                                                fontWeight: "bold",
                                                color: "#f5222d",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            {formatCurrency(total)}
                                        </div>

                                        <div
                                            style={{
                                                fontWeight: "500",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            Tiền khách đưa:
                                        </div>
                                        <InputNumber
                                            style={{
                                                width: "100%",
                                                height: "40px",
                                                fontSize: "16px",
                                            }}
                                            value={receivedAmount}
                                            onChange={setReceivedAmount}
                                            formatter={(value) =>
                                                `${value}`.replace(
                                                    /\B(?=(\d{3})+(?!\d))/g,
                                                    "."
                                                )
                                            }
                                            parser={(value) =>
                                                value.replace(/\./g, "")
                                            }
                                            min={0}
                                        />

                                        {receivedAmount > 0 && (
                                            <div style={{ marginTop: "15px" }}>
                                                <div
                                                    style={{
                                                        fontWeight: "500",
                                                        marginBottom: "8px",
                                                    }}
                                                >
                                                    Tiền thừa:
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "20px",
                                                        fontWeight: "bold",
                                                        color:
                                                            change >= 0
                                                                ? "#52c41a"
                                                                : "#f5222d",
                                                    }}
                                                >
                                                    {formatCurrency(change)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {change < 0 && receivedAmount > 0 && (
                                        <div
                                            style={{
                                                fontSize: "13px",
                                                backgroundColor: "#fff1f0",
                                                padding: "10px",
                                                borderRadius: "4px",
                                                borderLeft: "4px solid #f5222d",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <div>
                                                <b>Lưu ý:</b> Số tiền khách đưa
                                                không đủ để thanh toán!
                                            </div>
                                        </div>
                                    )}

                                    {change >= 0 && receivedAmount > 0 && (
                                        <div
                                            style={{
                                                fontSize: "13px",
                                                backgroundColor: "#f6ffed",
                                                padding: "10px",
                                                borderRadius: "4px",
                                                borderLeft: "4px solid #52c41a",
                                            }}
                                        >
                                            <div>
                                                <b>Lưu ý:</b> Hãy nhớ trả lại
                                                tiền thừa cho khách!
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {paymentMethod === "bank_transfer" &&
                            renderBankTransferSection()}

                        {paymentMethod === "zalo_pay" && (
                            <div style={{ marginTop: 16 }}>
                                <h4>Thanh toán qua ZaloPay:</h4>
                                <div
                                    style={{
                                        textAlign: "center",
                                        marginTop: "16px",
                                        border: "1px solid #e8e8e8",
                                        padding: "20px",
                                        borderRadius: "8px",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "200px",
                                            height: "200px",
                                            margin: "0 auto",
                                            backgroundColor: "white",
                                            padding: "10px",
                                            border: "1px solid #d9d9d9",
                                            borderRadius: "4px",
                                            position: "relative",
                                            marginBottom: "15px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: "50%",
                                                transform:
                                                    "translate(-50%, -50%)",
                                                width: "40px",
                                                height: "40px",
                                                backgroundColor: "white",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                borderRadius: "4px",
                                                zIndex: 1,
                                            }}
                                        >
                                            <QrcodeOutlined
                                                style={{
                                                    fontSize: "30px",
                                                    color: "#00b3ff",
                                                }}
                                            />
                                        </div>

                                        <div
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                backgroundImage: `
                                                linear-gradient(to right, black 5px, transparent 5px),
                                                linear-gradient(to bottom, black 5px, transparent 5px)
                                            `,
                                                backgroundSize: "20px 20px",
                                                backgroundPosition: "0 0",
                                                padding: "10px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "15px",
                                                    left: "15px",
                                                    width: "40px",
                                                    height: "40px",
                                                    border: "8px solid black",
                                                    borderRight: "none",
                                                    borderBottom: "none",
                                                }}
                                            ></div>
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "15px",
                                                    right: "15px",
                                                    width: "40px",
                                                    height: "40px",
                                                    border: "8px solid black",
                                                    borderLeft: "none",
                                                    borderBottom: "none",
                                                }}
                                            ></div>
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: "15px",
                                                    left: "15px",
                                                    width: "40px",
                                                    height: "40px",
                                                    border: "8px solid black",
                                                    borderRight: "none",
                                                    borderTop: "none",
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: "10px" }}>
                                        <b>Số tiền:</b> {formatCurrency(total)}
                                    </div>
                                    <div
                                        style={{
                                            marginBottom: "5px",
                                            color: "#1890ff",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Quét mã QR để thanh toán qua ZaloPay
                                    </div>
                                    <div
                                        style={{
                                            color: "#888",
                                            fontSize: "12px",
                                        }}
                                    >
                                        Thanh toán tự động xác nhận sau khi hoàn
                                        tất
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 16 }}>
                            <h4>Ghi chú:</h4>
                            <textarea
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    borderRadius: "4px",
                                    borderColor: "#d9d9d9",
                                }}
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Nhập ghi chú thanh toán nếu có..."
                            />
                        </div>

                        {total <= 0 && (
                            <Alert
                                message="Không có khoản cần thanh toán"
                                description={`Tổng tiền phòng: ${formatCurrency(
                                    booking?.totalAmount || 0
                                )}, Đã thanh toán trước: ${formatCurrency(
                                    calculateTotalDeposit()
                                )}. Khách hàng đã thanh toán đủ, không cần thanh toán thêm.`}
                                type="info"
                                showIcon
                                style={{ marginTop: 16, marginBottom: 16 }}
                            />
                        )}

                        <Space style={{ marginTop: 24 }}>
                            <Button
                                icon={<RollbackOutlined />}
                                onClick={() => window.history.back()}
                            >
                                Quay lại
                            </Button>
                            <Tooltip
                                title={
                                    total <= 0
                                        ? "Không có số tiền cần thanh toán"
                                        : ""
                                }
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
                    </Space>
                </Card>

                <Modal
                    title={
                        <Space>
                            {paymentMethod === "cash" && (
                                <MoneyCollectOutlined />
                            )}
                            {paymentMethod === "bank_transfer" && (
                                <BankOutlined />
                            )}
                            {paymentMethod === "zalo_pay" && <QrcodeOutlined />}
                            {paymentMethod !== "cash" &&
                                paymentMethod !== "bank_transfer" &&
                                paymentMethod !== "zalo_pay" && (
                                    <DollarOutlined />
                                )}
                            <span>
                                Xác nhận thanh toán
                                {paymentMethod === "cash"
                                    ? " tiền mặt"
                                    : paymentMethod === "bank_transfer"
                                    ? " chuyển khoản"
                                    : paymentMethod === "zalo_pay"
                                    ? " ZaloPay"
                                    : ""}
                            </span>
                        </Space>
                    }
                    open={isModalVisible}
                    onOk={handlePayment}
                    onCancel={() => setIsModalVisible(false)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                    confirmLoading={processingPayment}
                >
                    <Descriptions column={1}>
                        <Descriptions.Item label="Tổng tiền">
                            {formatCurrency(total)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức">
                            {paymentMethod === "cash"
                                ? "Tiền mặt"
                                : paymentMethod === "card"
                                ? "Thẻ"
                                : paymentMethod === "bank_transfer"
                                ? "Chuyển khoản"
                                : paymentMethod === "zalo_pay"
                                ? "Thanh toán trực tuyến (ZaloPay)"
                                : paymentMethods.find((m) => m.id === methodId)
                                      ?.name || "Khác"}
                        </Descriptions.Item>
                        {paymentMethod === "cash" && (
                            <>
                                <Descriptions.Item label="Tiền nhận">
                                    {formatCurrency(receivedAmount)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tiền thừa">
                                    {formatCurrency(change)}
                                </Descriptions.Item>
                            </>
                        )}
                        {paymentMethod === "bank_transfer" && (
                            <Descriptions.Item label="Xác nhận">
                                Khách hàng đã chuyển khoản đúng số tiền
                            </Descriptions.Item>
                        )}
                        {paymentMethod === "zalo_pay" && (
                            <Descriptions.Item label="Xác nhận">
                                Giao dịch ZaloPay đã hoàn tất
                            </Descriptions.Item>
                        )}
                        {notes && (
                            <Descriptions.Item label="Ghi chú">
                                {notes}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Modal>

                <Modal
                    title={null}
                    open={showPrintModal}
                    onOk={() => {
                        navigate(`/hotel/invoice/${booking.id}`);
                    }}
                    onCancel={() => {
                        setShowPrintModal(false);
                        navigate(`/hotel/bookings`);
                    }}
                    width={550}
                    centered
                    closable={false}
                    footer={null}
                    className="payment-success-modal"
                    bodyStyle={{ padding: "32px 24px" }}
                >
                    <div style={{ textAlign: "center" }}>
                        <div style={{ marginBottom: "24px" }}>
                            <div className="success-icon-circle">
                                <CheckCircleOutlined
                                    style={{
                                        fontSize: "48px",
                                        color: "#52c41a",
                                    }}
                                />
                            </div>
                        </div>
                        <h2
                            style={{
                                fontSize: "24px",
                                fontWeight: "600",
                                margin: "16px 0 8px",
                                color: "#000",
                            }}
                        >
                            Thanh toán đã được xử lý thành công!
                        </h2>
                        <p
                            style={{
                                fontSize: "16px",
                                color: "#8c8c8c",
                                margin: "0 0 24px",
                            }}
                        >
                            Bạn có thể xem chi tiết hóa đơn hoặc gửi hóa đơn cho
                            khách hàng qua email.
                        </p>

                        <Divider style={{ margin: "24px 0" }} />

                        <Space
                            direction="vertical"
                            style={{ width: "100%", marginBottom: "16px" }}
                        >
                            <Button
                                icon={<MailOutlined />}
                                size="large"
                                block
                                onClick={() => setShowEmailModal(true)}
                                className="action-button"
                                style={{ marginBottom: "12px" }}
                            >
                                Gửi qua Email
                            </Button>

                            <Button
                                key="print"
                                icon={<PrinterOutlined />}
                                type="primary"
                                size="large"
                                block
                                onClick={() =>
                                    navigate(`/hotel/invoice/${booking.id}`)
                                }
                                className="action-button"
                                style={{ marginBottom: "12px" }}
                            >
                                Xem hóa đơn chi tiết
                            </Button>

                            <Button
                                key="back"
                                icon={<RollbackOutlined />}
                                size="large"
                                block
                                onClick={() => {
                                    setShowPrintModal(false);
                                    navigate(`/hotel/bookings?tab=2`);
                                }}
                                className="action-button"
                            >
                                Quay lại danh sách đặt phòng
                            </Button>
                        </Space>
                    </div>
                </Modal>

                <Modal
                    title={
                        <Space>
                            <MailOutlined />
                            <span>Gửi hóa đơn qua Email</span>
                        </Space>
                    }
                    open={showEmailModal}
                    onCancel={() => {
                        setShowEmailModal(false);
                        emailForm.resetFields();
                    }}
                    footer={null}
                    width={500}
                >
                    <div style={{ marginBottom: 20 }}>
                        <Alert
                            message="Thông tin hóa đơn"
                            description={
                                <div>
                                    <p>
                                        <b>Khách hàng:</b>{" "}
                                        {booking?.customer?.name ||
                                            "Chưa có thông tin"}
                                    </p>
                                    <p>
                                        <b>Phòng:</b>{" "}
                                        {booking?.room?.roomCode ||
                                            "Chưa có thông tin"}{" "}
                                        - {booking?.room?.roomType?.name || ""}
                                    </p>
                                    <p>
                                        <b>Tổng thanh toán:</b>{" "}
                                        {formatCurrency(
                                            booking?.totalAmount || 0
                                        )}
                                    </p>
                                </div>
                            }
                            type="info"
                            showIcon
                        />
                    </div>

                    <Form
                        form={emailForm}
                        layout="vertical"
                        onFinish={handleSendInvoiceEmail}
                        initialValues={{
                            email: booking?.customer?.email || "",
                        }}
                    >
                        <Form.Item
                            label="Email người nhận"
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập email",
                                },
                                {
                                    type: "email",
                                    message: "Email không hợp lệ",
                                },
                            ]}
                            extra={
                                booking?.customer?.email
                                    ? "Email mặc định của khách hàng đã được điền sẵn"
                                    : "Khách hàng chưa có email, vui lòng nhập email người nhận"
                            }
                        >
                            <Input
                                placeholder="Nhập email người nhận"
                                prefix={<MailOutlined />}
                            />
                        </Form.Item>

                        <div style={{ textAlign: "right", marginTop: 16 }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setShowEmailModal(false);
                                        emailForm.resetFields();
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={sendingEmail}
                                    icon={<MailOutlined />}
                                >
                                    Gửi hóa đơn
                                </Button>
                            </Space>
                        </div>
                    </Form>
                </Modal>
            </Space>
        </div>
    );
}
