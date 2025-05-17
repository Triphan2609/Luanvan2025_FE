import React, { useRef, useEffect, useState } from "react";
import {
    Button,
    Card,
    Space,
    Result,
    message,
    Spin,
    Modal,
    Alert,
    Form,
    Input,
} from "antd";
import {
    PrinterOutlined,
    RollbackOutlined,
    DownloadOutlined,
    MailOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import InvoiceTemplate from "./InvoiceTemplate";
import { getBookingById } from "../../../../../api/bookingsApi";
import {
    getPaymentsByBookingId,
    sendInvoiceByEmail,
    getHotelInvoiceByBookingId,
    sendHotelInvoiceByEmail,
} from "../../../../../api/paymentsApi";
import "./print.css";

export default function Invoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(false);
    const invoiceRef = useRef();
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailForm] = Form.useForm();

    const fetchInvoiceData = async () => {
        try {
            setLoading(true);
            setError(null);

            // First try to get data from localStorage
            const savedData = localStorage.getItem(`payment_${id}`);
            if (savedData) {
                try {
                    setData(JSON.parse(savedData));
                    setLoading(false);
                    return;
                } catch (parseError) {
                    console.error("Error parsing saved data:", parseError);
                    // If parsing fails, continue to fetch from API
                }
            }

            // If no data in localStorage, fetch from API
            const hotelInvoice = await getHotelInvoiceByBookingId(id);
            if (!hotelInvoice) {
                setError("Không tìm thấy hóa đơn cho booking này");
                setLoading(false);
                return;
            }
            // Lấy thông tin booking từ hotelInvoice
            const booking = hotelInvoice.booking;
            // Lấy payments nếu cần (có thể lấy từ hotelInvoice.payments nếu backend trả về)
            // Format lại dữ liệu như cũ
            const services = [];
            if (booking.room) {
                const checkInDate = new Date(
                    booking.checkIn || booking.checkInDate
                );
                const checkOutDate = new Date(
                    booking.checkOut || booking.checkOutDate
                );
                let days = Math.ceil(
                    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
                );
                if (days <= 0) days = 1;
                services.push({
                    name: `${booking.room.roomCode} - ${
                        booking.room.roomType?.name || "Phòng"
                    }`,
                    pricePerNight: booking.room.price,
                    nights: days,
                    quantity: 1,
                });
            }
            if (booking.services && Array.isArray(booking.services)) {
                booking.services.forEach((service) => {
                    services.push({
                        name: service.name,
                        price: service.price,
                        quantity: service.quantity || 1,
                    });
                });
            }
            const bookingData = {
                id: booking.id,
                customerName: booking.customer?.name || "Khách hàng",
                phone: booking.customer?.phone || "",
                email: booking.customer?.email || "",
                roomNumber: booking.room?.roomCode || "",
                roomType: booking.room?.roomType?.name || "",
                checkIn: new Date(
                    booking.checkIn || booking.checkInDate
                ).toLocaleDateString("vi-VN"),
                checkOut: new Date(
                    booking.checkOut || booking.checkOutDate
                ).toLocaleDateString("vi-VN"),
                services: services,
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
            const paymentInfo = {
                method: hotelInvoice.method?.type || "cash",
                amount:
                    hotelInvoice.finalAmount || hotelInvoice.totalAmount || 0,
                date: hotelInvoice.issueDate || new Date().toISOString(),
                notes: hotelInvoice.notes || "",
            };
            const formattedData = {
                booking: bookingData,
                paymentInfo: paymentInfo,
                hotelInvoice: hotelInvoice,
            };
            setData(formattedData);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi tải thông tin hóa đơn:", error);
            setError(error.message || "Có lỗi khi tải thông tin hóa đơn");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoiceData();
    }, [id]);

    const handlePrint = useReactToPrint({
        content: () => invoiceRef.current,
        onBeforeGetContent: () =>
            message.loading({
                content: "Đang chuẩn bị in...",
                key: "print-loading",
            }),
        onAfterPrint: () =>
            message.success({
                content: "In hóa đơn thành công!",
                key: "print-loading",
            }),
        onError: (error) => {
            console.error("Print error:", error);
            message.error({
                content: "Có lỗi xảy ra khi in!",
                key: "print-loading",
            });
        },
        // Configure print options
        pageStyle: "@page { size: A4 portrait; margin: 0mm; }",
        documentTitle: `Hóa đơn-${id}`,
    });

    const handleDownloadPDF = async () => {
        try {
            message.loading({
                content: "Đang tạo file PDF...",
                key: "pdf-loading",
            });

            const element = invoiceRef.current;
            if (!element) {
                throw new Error("Không tìm thấy nội dung để tạo PDF");
            }

            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`hoa-don-${data.booking.id}.pdf`);

            message.success({
                content: "Tải file PDF thành công!",
                key: "pdf-loading",
            });
        } catch (error) {
            console.error("Lỗi khi tạo PDF:", error);
            message.error({
                content: "Có lỗi khi tạo file PDF: " + error.message,
                key: "pdf-loading",
            });
        }
    };

    const handleSendEmail = () => {
        setShowEmailModal(true);
        // Pre-fill the email if customer email exists
        if (data?.booking?.email) {
            emailForm.setFieldsValue({ email: data.booking.email });
        }
    };

    const handleSendEmailSubmit = async (values) => {
        try {
            setSendingEmail(true);
            const { email } = values;

            if (!email) {
                message.error("Email là bắt buộc");
                setSendingEmail(false);
                return;
            }

            message.loading({
                content: "Đang gửi email...",
                key: "email-sending",
            });

            // Gọi API gửi hóa đơn qua email với hotelInvoiceId
            if (!data?.hotelInvoice?.id) {
                message.error("Không tìm thấy mã hóa đơn để gửi email");
                setSendingEmail(false);
                return;
            }
            await sendHotelInvoiceByEmail(data.hotelInvoice.id, email);
            message.success({
                content: `Đã gửi hóa đơn thành công đến: ${email}`,
                key: "email-sending",
            });
            setShowEmailModal(false);
            emailForm.resetFields();
        } catch (error) {
            console.error("Lỗi khi gửi email:", error);
            message.error({
                content:
                    "Không thể gửi email: " +
                    (error.message || "Lỗi không xác định"),
                key: "email-sending",
            });
        } finally {
            setSendingEmail(false);
        }
    };

    const ActionButtons = () => (
        <Space size="middle">
            <Button
                icon={<RollbackOutlined />}
                onClick={() => navigate("/hotel/bookings")}
            >
                Quay lại quản lý đặt phòng
            </Button>
            <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={handlePrint}
            >
                In hóa đơn
            </Button>
            <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadPDF}
            >
                Tải PDF
            </Button>
            {data?.booking?.email && (
                <Button
                    icon={<MailOutlined />}
                    onClick={handleSendEmail}
                    loading={sendingEmail}
                >
                    Gửi qua Email
                </Button>
            )}
        </Space>
    );

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <Spin tip="Đang tải thông tin hóa đơn..." size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Result
                status="error"
                title="Lỗi khi tải hóa đơn"
                subTitle={error}
                extra={[
                    <Button
                        key="retry"
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={fetchInvoiceData}
                    >
                        Thử lại
                    </Button>,
                    <Button
                        key="back"
                        onClick={() => navigate("/hotel/bookings")}
                        icon={<RollbackOutlined />}
                    >
                        Quay lại quản lý đặt phòng
                    </Button>,
                ]}
            />
        );
    }

    if (!data) {
        return (
            <Result
                status="404"
                title="Không tìm thấy hóa đơn"
                subTitle="Hóa đơn bạn đang tìm không tồn tại hoặc đã bị xóa"
                extra={
                    <Button
                        type="primary"
                        onClick={() => navigate("/hotel/bookings")}
                        icon={<RollbackOutlined />}
                    >
                        Quay lại quản lý đặt phòng
                    </Button>
                }
            />
        );
    }

    return (
        <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
            <Card>
                <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                >
                    <Alert
                        message="Lưu ý khi in hóa đơn"
                        description="Khi in hóa đơn, hãy chọn định dạng giấy A4 và bỏ chọn các phần header/footer trong cài đặt in để có kết quả tốt nhất."
                        type="info"
                        showIcon
                        closable
                        style={{ marginBottom: 16 }}
                    />
                    <Space
                        style={{ justifyContent: "flex-end", width: "100%" }}
                    >
                        <ActionButtons />
                    </Space>

                    <div
                        className="invoice-container"
                        style={{ maxWidth: "210mm", margin: "0 auto" }}
                    >
                        <div className="invoice-content" ref={invoiceRef}>
                            <InvoiceTemplate
                                booking={data.booking}
                                paymentInfo={data.paymentInfo}
                            />
                        </div>
                    </div>
                </Space>
            </Card>

            {/* Email sending modal */}
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
            >
                <Form
                    form={emailForm}
                    layout="vertical"
                    onFinish={handleSendEmailSubmit}
                >
                    <Form.Item
                        label="Email"
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
                    >
                        <Input
                            placeholder="Nhập email người nhận"
                            prefix={<MailOutlined />}
                        />
                    </Form.Item>

                    <Alert
                        message="Lưu ý"
                        description="Hóa đơn sẽ được gửi dưới dạng file PDF đính kèm tới email được chỉ định."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

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
        </div>
    );
}
