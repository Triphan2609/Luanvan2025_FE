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
    Typography,
    Table,
    Row,
    Col,
    Input,
    Form,
} from "antd";
import {
    PrinterOutlined,
    RollbackOutlined,
    MailOutlined,
    FilePdfOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";
import {
    getRestaurantInvoiceById,
    sendRestaurantInvoiceByEmail,
} from "../../../../api/paymentsApi";
import { useSelector } from "react-redux";
import { restaurantOrderApi } from "../../../../api/restaurantOrderApi";
import { selectAccount } from "../../../../store/authSlice";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { areasRestaurantApi } from "../../../../api/areasRestaurantApi";

const { Title, Text } = Typography;

const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function RestaurantInvoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailForm] = Form.useForm();
    const invoiceRef = useRef();
    const account = useSelector(selectAccount) || {};
    const [order, setOrder] = useState(null);
    const [areaName, setAreaName] = useState("");

    useEffect(() => {
        const fetchInvoiceAndOrder = async () => {
            try {
                setLoading(true);
                const data = await getRestaurantInvoiceById(id);
                setInvoice(data);
                let orderObj = null;
                if (data.restaurantOrder) {
                    orderObj = data.restaurantOrder;
                    setOrder(orderObj);
                } else if (data.restaurantOrderId) {
                    orderObj = await restaurantOrderApi.getById(
                        data.restaurantOrderId
                    );
                    setOrder(orderObj);
                } else {
                    setOrder(null);
                }
                // Lấy tên khu vực
                let area =
                    orderObj?.table?.area ||
                    orderObj?.area ||
                    orderObj?.table?.areaId ||
                    orderObj?.table?.area_id;
                if (typeof area === "object" && area !== null) {
                    setAreaName(area.name || "");
                } else if (
                    typeof area === "string" ||
                    typeof area === "number"
                ) {
                    try {
                        const areaObj = await areasRestaurantApi.getAreaById(
                            area
                        );
                        setAreaName(areaObj?.name || "");
                    } catch {
                        setAreaName("");
                    }
                } else {
                    setAreaName("");
                }
            } catch (err) {
                setError("Không tìm thấy hóa đơn nhà hàng");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceAndOrder();
    }, [id]);

    const handlePrint = useReactToPrint({
        content: () => invoiceRef.current,
        documentTitle: `HoaDonNhaHang-${id}`,
    });

    const handleSendEmail = () => setShowEmailModal(true);
    const handleSendEmailSubmit = async (values) => {
        setSendingEmail(true);
        try {
            await sendRestaurantInvoiceByEmail(id, values.email);
            message.success("Đã gửi hóa đơn qua email!");
            setShowEmailModal(false);
        } catch (err) {
            message.error("Gửi email thất bại!");
        } finally {
            setSendingEmail(false);
        }
    };

    const handleExportPDF = async () => {
        if (!invoiceRef.current) return;
        const input = invoiceRef.current;
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`HoaDonNhaHang-${invoice?.invoiceNumber || id}.pdf`);
    };

    if (loading) return <Spin tip="Đang tải hóa đơn..." />;
    if (error) return <Alert message={error} type="error" />;
    if (!invoice) return null;

    const branch = invoice.branch || {};
    const table = order?.table || {};
    const items = order?.items || [];
    const total = invoice.finalAmount || invoice.totalAmount || 0;
    const paymentMethod = invoice.payments?.[0]?.method?.name || "";
    const paidAt = invoice.payments?.[0]?.createdAt || invoice.issueDate;

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 50,
            render: (_, __, idx) => idx + 1,
        },
        { title: "Món ăn", dataIndex: "name", key: "name" },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            align: "right",
        },

        {
            title: "Đơn giá",
            dataIndex: "price",
            key: "price",
            align: "right",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Thành tiền",
            key: "total",
            align: "right",
            render: (_, r) => formatCurrency(r.price * r.quantity),
        },
        { title: "Ghi chú", dataIndex: "note", key: "note", align: "left" },
    ];

    return (
        <div style={{ background: "#f5f6fa", minHeight: "100vh", padding: 24 }}>
            <Card
                style={{
                    maxWidth: 800,
                    margin: "0 auto",
                    boxShadow: "0 2px 8px #f0f1f2",
                }}
            >
                <div
                    ref={invoiceRef}
                    style={{
                        background: "#fff",
                        padding: 32,
                        position: "relative",
                    }}
                >
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
                    <Row
                        justify="space-between"
                        align="top"
                        style={{
                            marginBottom: 32,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <Col span={12}>
                            <Title level={2} style={{ color: "#1677ff" }}>
                                {branch.name || "DNC Restaurant"}
                            </Title>
                            <div>
                                <Text>
                                    {branch.address || "Địa chỉ nhà hàng"}
                                </Text>
                            </div>
                            <div>
                                <Text>Điện thoại: {branch.phone || ""}</Text>
                            </div>
                        </Col>
                        <Col span={12} style={{ textAlign: "right" }}>
                            <Title level={2} style={{ margin: 0 }}>
                                HÓA ĐƠN NHÀ HÀNG
                            </Title>
                            <div style={{ marginTop: 8 }}>
                                <Text>Số: </Text>
                                <Text strong>{invoice.invoiceNumber}</Text>
                                <br />
                                <Text>Ngày: </Text>
                                <Text strong>
                                    {dayjs(paidAt).format("DD/MM/YYYY HH:mm")}
                                </Text>
                            </div>
                        </Col>
                    </Row>
                    <Row
                        gutter={24}
                        style={{
                            marginBottom: 24,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <Col span={8}>
                            <Text strong>Bàn: </Text>
                            {order?.tableNumber || table.tableNumber || ""}
                        </Col>
                        <Col span={8}>
                            <Text strong>Khu vực: </Text>
                            {areaName || table.area || order?.area || ""}
                        </Col>
                        <Col span={8}>
                            <Text strong>Nhân viên: </Text>
                            {account.fullName ||
                                account.name ||
                                account.username ||
                                order?.staffName ||
                                ""}
                        </Col>
                        <Col span={8}>
                            <Text strong>Mã đơn hàng: </Text>
                            {order?.id || "---"}
                        </Col>
                        <Col span={8}>
                            <Text strong>Thời gian vào bàn: </Text>
                            {order?.createdAt
                                ? dayjs(order.createdAt).format(
                                      "DD/MM/YYYY HH:mm"
                                  )
                                : "---"}
                        </Col>
                        <Col span={8}>
                            <Text strong>Số khách: </Text>
                            {order?.guestCount || "---"}
                        </Col>
                    </Row>
                    <Table
                        dataSource={items}
                        columns={columns}
                        pagination={false}
                        rowKey="id"
                        style={{
                            marginBottom: 24,
                            position: "relative",
                            zIndex: 1,
                        }}
                        bordered
                        locale={{ emptyText: "Không có món ăn nào" }}
                    />
                    <Row
                        justify="end"
                        style={{
                            marginBottom: 16,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <Col>
                            <Text strong style={{ fontSize: 18 }}>
                                Tổng tiền: {formatCurrency(total)}
                            </Text>
                        </Col>
                    </Row>
                    <Row
                        gutter={24}
                        style={{
                            marginBottom: 8,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <Col span={12}>
                            <Text strong>Ghi chú: </Text>
                            {invoice.notes || ""}
                        </Col>
                    </Row>
                </div>
                <Space style={{ marginTop: 24 }}>
                    <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                        In hóa đơn
                    </Button>
                    <Button icon={<MailOutlined />} onClick={handleSendEmail}>
                        Gửi email
                    </Button>
                    <Button
                        icon={<FilePdfOutlined />}
                        onClick={handleExportPDF}
                    >
                        Xuất PDF
                    </Button>
                    <Button
                        icon={<RollbackOutlined />}
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </Space>
                <Modal
                    title="Gửi hóa đơn qua email"
                    open={showEmailModal}
                    onCancel={() => setShowEmailModal(false)}
                    onOk={() => emailForm.submit()}
                    confirmLoading={sendingEmail}
                >
                    <Form
                        form={emailForm}
                        onFinish={handleSendEmailSubmit}
                        layout="vertical"
                    >
                        <Form.Item
                            name="email"
                            label="Email khách hàng"
                            rules={[
                                {
                                    required: true,
                                    type: "email",
                                    message: "Nhập email hợp lệ",
                                },
                            ]}
                        >
                            <Input placeholder="example@email.com" />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
}
