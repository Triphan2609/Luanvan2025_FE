import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tooltip,
    DatePicker,
    Input,
    Select,
    Row,
    Col,
    Statistic,
    Divider,
    message,
    Modal,
    Typography,
    Badge,
    Descriptions,
    Spin,
    Tag,
} from "antd";
import {
    SearchOutlined,
    ReloadOutlined,
    PrinterOutlined,
    EyeOutlined,
    FileTextOutlined,
    DollarOutlined,
    MailOutlined,
    FilterOutlined,
    BankOutlined,
    DownloadOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
    getAllRestaurantInvoices,
    getRestaurantInvoiceById,
    createRestaurantInvoice,
    updateRestaurantInvoiceStatus,
    sendRestaurantInvoiceByEmail,
} from "../../../../api/paymentsApi";
import { tableApi } from "../../../../api/restaurantApi";
import "./PaymentManagement.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

// Format date và time detail
const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    return dayjs(dateTime).format("DD/MM/YYYY HH:mm:ss");
};

// Format date cho hiển thị ngắn gọn
const formatDate = (date) => {
    if (!date) return "N/A";
    return dayjs(date).format("DD/MM/YYYY");
};

// Format time
const formatTime = (time) => {
    if (!time) return "N/A";
    return dayjs(time).format("HH:mm:ss");
};

// Tính số ngày lưu trú
const calculateStayDuration = (checkInDate, checkOutDate) => {
    if (!checkInDate || !checkOutDate) return 0;

    const startDate = dayjs(checkInDate);
    const endDate = dayjs(checkOutDate);

    // Tính số ngày chênh lệch, làm tròn lên
    const days = Math.ceil(endDate.diff(startDate, "day", true));
    return days > 0 ? days : 1; // Tối thiểu 1 ngày
};

// Helper function to get status text and color
const getStatusInfo = (status) => {
    switch (status) {
        case "pending":
            return { text: "Chờ thanh toán", color: "orange" };
        case "paid":
            return { text: "Đã thanh toán", color: "green" };
        case "refunded":
            return { text: "Đã hoàn tiền", color: "blue" };
        case "canceled":
            return { text: "Đã hủy", color: "red" };
        case "overdue":
            return { text: "Quá hạn", color: "volcano" };
        default:
            return { text: "Không xác định", color: "default" };
    }
};

const RestaurantPaymentManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [tables, setTables] = useState([]);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [invoiceDetails, setInvoiceDetails] = useState(null);
    const [emailInput, setEmailInput] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);
    const [pdfVisible, setPdfVisible] = useState(false);
    const pdfContentRef = useRef(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        dateRange: null,
        searchText: "",
        tableId: "",
    });
    const [statistics, setStatistics] = useState({
        totalInvoices: 0,
        totalRevenue: 0,
    });

    useEffect(() => {
        fetchTables();
    }, []);
    useEffect(() => {
        fetchInvoices();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchTables = async () => {
        try {
            const tablesData = await tableApi.getAllTables();
            setTables(Array.isArray(tablesData) ? tablesData : []);
        } catch (error) {
            setTables([]);
            message.error("Không thể tải danh sách bàn");
        }
    };

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const { page = 1, limit = 10 } = pagination;
            const { dateRange, searchText, tableId } = filters;

            const params = {
                page,
                limit,
                searchText,
                tableId,
                startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
                endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
            };

            const response = await getAllRestaurantInvoices(params);
            const data = Array.isArray(response)
                ? response
                : response.items || [];
            setInvoices(data);
            setPagination({ ...pagination, total: data.length });
            setStatistics({
                totalInvoices: data.length,
                totalRevenue: data.reduce(
                    (sum, invoice) => sum + Number(invoice.finalAmount),
                    0
                ),
            });
        } catch (error) {
            message.error("Không thể tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = async (invoice) => {
        try {
            setLoading(true);
            setSelectedInvoice(invoice);
            const invoiceData = await getRestaurantInvoiceById(invoice.id);
            setInvoiceDetails(invoiceData);
            setViewModalVisible(true);
        } catch (error) {
            message.error("Không thể xem chi tiết hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (invoice) => {
        try {
            setSelectedInvoice(invoice);
            setPdfVisible(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (pdfContentRef.current) {
                const canvas = await html2canvas(pdfContentRef.current, {
                    scale: 2,
                    logging: true,
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
                pdf.save(
                    `restaurant-invoice-${
                        invoice.invoiceNumber || "download"
                    }.pdf`
                );
            }
            setPdfVisible(false);
        } catch (error) {
            message.error("Không thể tải file PDF");
            setPdfVisible(false);
        }
    };

    const handleTableChange = (pagination) => {
        setPagination({ ...pagination });
    };
    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, current: 1 });
    };
    const handleResetFilters = () => {
        setFilters({ dateRange: null, searchText: "", tableId: "" });
        setPagination({ ...pagination, current: 1 });
    };
    const showEmailModal = (invoice) => {
        setSelectedInvoice(invoice);
        setEmailInput(invoice.customer?.email || "");
        setEmailModalVisible(true);
    };
    const handleSendEmail = async () => {
        if (!emailInput) {
            message.error("Vui lòng nhập địa chỉ email");
            return;
        }
        try {
            setSendingEmail(true);
            await sendRestaurantInvoiceByEmail(selectedInvoice.id, emailInput);
            message.success("Đã gửi hóa đơn qua email thành công");
            setEmailModalVisible(false);
        } catch (error) {
            message.error("Không thể gửi hóa đơn qua email");
        } finally {
            setSendingEmail(false);
        }
    };
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const columns = [
        {
            title: "Mã hóa đơn",
            dataIndex: "invoiceNumber",
            key: "invoiceNumber",
            render: (text) => (
                <span style={{ fontWeight: "bold" }}>{text}</span>
            ),
        },
        {
            title: "Bàn",
            dataIndex: "tableNumber",
            key: "tableNumber",
            render: (_, record) => (
                <Text>
                    {record.tableNumber || record.table?.tableNumber || "-"}
                </Text>
            ),
        },
        {
            title: "Khách hàng",
            dataIndex: "customer",
            key: "customer",
            render: (customer) => (
                <Text>{customer?.name || "Khách vãng lai"}</Text>
            ),
        },
        {
            title: "Ngày phát hành",
            dataIndex: "issueDate",
            key: "issueDate",
            render: (date) => (
                <Space direction="vertical" size={0}>
                    <Text>{formatDate(date)}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {formatTime(date)}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Thành tiền",
            dataIndex: "finalAmount",
            key: "finalAmount",
            align: "right",
            render: (amount) => (
                <Text strong style={{ color: "#1890ff" }}>
                    {formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const { text, color } = getStatusInfo(status);
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            align: "center",
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewInvoice(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Tải xuống">
                        <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownloadInvoice(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Gửi qua email">
                        <Button
                            type="text"
                            icon={<MailOutlined />}
                            onClick={() => showEmailModal(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="restaurant-invoice-management">
            <Card
                title={
                    <Space>
                        <DollarOutlined />
                        <span>Quản lý hóa đơn thanh toán nhà hàng</span>
                    </Space>
                }
                className="invoice-card"
            >
                {/* Statistics */}
                <Row gutter={24} className="statistics-section">
                    <Col xs={24} sm={12}>
                        <Card className="statistic-card">
                            <Statistic
                                title="Tổng số hóa đơn"
                                value={statistics.totalInvoices}
                                prefix={<FileTextOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Card className="statistic-card revenue-card">
                            <Statistic
                                title="Tổng doanh thu"
                                value={formatCurrency(statistics.totalRevenue)}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: "#3f8600" }}
                            />
                        </Card>
                    </Col>
                </Row>
                {/* Filters */}
                <Card
                    title={
                        <Space>
                            <FilterOutlined />
                            <span>Bộ lọc tìm kiếm</span>
                        </Space>
                    }
                    className="filter-card"
                >
                    <div className="filter-section">
                        <Space wrap>
                            <RangePicker
                                value={filters.dateRange}
                                onChange={(dates) =>
                                    handleFilterChange("dateRange", dates)
                                }
                                format="DD/MM/YYYY"
                                placeholder={["Từ ngày", "Đến ngày"]}
                                style={{ width: 280 }}
                                showTime={{ format: "HH:mm" }}
                            />
                            <Select
                                placeholder="Bàn"
                                style={{ width: 180 }}
                                value={filters.tableId}
                                onChange={(value) =>
                                    handleFilterChange("tableId", value)
                                }
                                allowClear
                            >
                                {Array.isArray(tables) &&
                                    tables.map((table) => (
                                        <Option key={table.id} value={table.id}>
                                            {table.tableNumber}
                                        </Option>
                                    ))}
                            </Select>
                            <Input
                                placeholder="Tìm kiếm theo mã hóa đơn, khách hàng, bàn"
                                value={filters.searchText}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "searchText",
                                        e.target.value
                                    )
                                }
                                prefix={<SearchOutlined />}
                                allowClear
                                style={{ width: 280 }}
                            />
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleResetFilters}
                            >
                                Đặt lại bộ lọc
                            </Button>
                        </Space>
                    </div>
                </Card>
                {/* Invoices Table */}
                <Card className="table-card">
                    <Table
                        columns={columns}
                        dataSource={invoices}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} trong ${total} hóa đơn`,
                        }}
                        onChange={handleTableChange}
                        className="invoice-table"
                        scroll={{ x: 900 }}
                    />
                </Card>
            </Card>
            {/* Email Modal */}
            <Modal
                title="Gửi hóa đơn qua email"
                open={emailModalVisible}
                onOk={handleSendEmail}
                onCancel={() => setEmailModalVisible(false)}
                confirmLoading={sendingEmail}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Text>Mã hóa đơn: {selectedInvoice?.invoiceNumber}</Text>
                    <Text>
                        Khách hàng:{" "}
                        {selectedInvoice?.customer?.name || "Khách vãng lai"}
                    </Text>
                    <Input
                        placeholder="Nhập địa chỉ email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        prefix={<MailOutlined />}
                        style={{ marginTop: 16 }}
                    />
                </Space>
            </Modal>
            {/* View Invoice Modal */}
            <Modal
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>Chi tiết hóa đơn</span>
                    </Space>
                }
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                width={800}
                footer={[
                    <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadInvoice(selectedInvoice)}
                    >
                        Tải xuống PDF
                    </Button>,
                    <Button
                        key="email"
                        icon={<MailOutlined />}
                        onClick={() => {
                            setViewModalVisible(false);
                            showEmailModal(selectedInvoice);
                        }}
                    >
                        Gửi qua email
                    </Button>,
                    <Button
                        key="close"
                        onClick={() => setViewModalVisible(false)}
                    >
                        Đóng
                    </Button>,
                ]}
            >
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : invoiceDetails ? (
                    <div className="invoice-detail">
                        <Descriptions
                            title="Thông tin hóa đơn"
                            bordered
                            column={{
                                xxl: 2,
                                xl: 2,
                                lg: 2,
                                md: 1,
                                sm: 1,
                                xs: 1,
                            }}
                        >
                            <Descriptions.Item label="Mã hóa đơn">
                                {selectedInvoice?.invoiceNumber}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày phát hành">
                                <Space direction="vertical" size={0}>
                                    <Text>
                                        {formatDate(selectedInvoice?.issueDate)}
                                    </Text>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                    >
                                        <ClockCircleOutlined
                                            style={{ marginRight: 4 }}
                                        />
                                        {formatTime(selectedInvoice?.issueDate)}
                                    </Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Bàn">
                                {selectedInvoice?.table?.tableNumber || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {selectedInvoice?.customer?.name ||
                                    "Khách vãng lai"}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider />
                        <Descriptions
                            title="Chi tiết món ăn"
                            bordered
                            column={1}
                            className="payment-details"
                        >
                            {(selectedInvoice?.items || []).map((item, idx) => (
                                <Descriptions.Item
                                    key={item.id || idx}
                                    label={`${item.name} x${item.quantity}`}
                                >
                                    {formatCurrency(item.price * item.quantity)}
                                </Descriptions.Item>
                            ))}
                            <Descriptions.Item label="Tổng tiền">
                                <Text
                                    strong
                                    style={{
                                        color: "#1890ff",
                                        fontSize: "16px",
                                    }}
                                >
                                    {formatCurrency(
                                        selectedInvoice?.finalAmount || 0
                                    )}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                        {selectedInvoice?.notes && (
                            <>
                                <Divider />
                                <div className="notes-section">
                                    <Title level={5}>Ghi chú</Title>
                                    <Paragraph>
                                        {selectedInvoice.notes}
                                    </Paragraph>
                                </div>
                            </>
                        )}
                        <Divider />
                        <Descriptions
                            title="Thông tin hệ thống"
                            bordered
                            column={2}
                            size="small"
                        >
                            <Descriptions.Item label="Thời gian tạo">
                                {formatDateTime(selectedInvoice?.createdAt)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lần cập nhật cuối">
                                {formatDateTime(selectedInvoice?.updatedAt)}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : (
                    <div className="no-data">
                        <Text>Không thể tải thông tin hóa đơn</Text>
                    </div>
                )}
            </Modal>
            {/* Hidden div for PDF generation */}
            <div
                ref={pdfContentRef}
                style={{
                    position: pdfVisible ? "fixed" : "absolute",
                    left: pdfVisible ? "50%" : "-9999px",
                    top: pdfVisible ? "50%" : 0,
                    transform: pdfVisible ? "translate(-50%, -50%)" : "none",
                    width: "210mm",
                    height: "297mm",
                    padding: "20mm",
                    backgroundColor: "white",
                    zIndex: pdfVisible ? 9999 : -1,
                    visibility: pdfVisible ? "visible" : "hidden",
                    border: pdfVisible ? "1px solid #ccc" : "none",
                    boxShadow: pdfVisible ? "0 0 10px rgba(0,0,0,0.2)" : "none",
                    overflow: "auto",
                }}
            >
                {selectedInvoice && (
                    <div className="invoice-pdf-content">
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "30px",
                            }}
                        >
                            <h1
                                style={{
                                    fontSize: "28px",
                                    fontWeight: "bold",
                                    marginBottom: "15px",
                                }}
                            >
                                HÓA ĐƠN NHÀ HÀNG
                            </h1>
                            <p style={{ fontSize: "16px", margin: "5px 0" }}>
                                Số hóa đơn: {selectedInvoice.invoiceNumber}
                            </p>
                            <p style={{ fontSize: "16px", margin: "5px 0" }}>
                                Ngày:{" "}
                                {dayjs(selectedInvoice.issueDate).format(
                                    "DD/MM/YYYY"
                                )}
                            </p>
                        </div>
                        <div style={{ marginBottom: "30px" }}>
                            <h2
                                style={{
                                    fontSize: "20px",
                                    borderBottom: "2px solid #333",
                                    paddingBottom: "8px",
                                    marginBottom: "15px",
                                }}
                            >
                                Thông tin khách hàng
                            </h2>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Tên:</strong>{" "}
                                {selectedInvoice?.customer?.name ||
                                    "Khách vãng lai"}
                            </p>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Điện thoại:</strong>{" "}
                                {selectedInvoice?.customer?.phone || "N/A"}
                            </p>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Email:</strong>{" "}
                                {selectedInvoice?.customer?.email || "N/A"}
                            </p>
                        </div>
                        <div style={{ marginBottom: "30px" }}>
                            <h2
                                style={{
                                    fontSize: "20px",
                                    borderBottom: "2px solid #333",
                                    paddingBottom: "8px",
                                    marginBottom: "15px",
                                }}
                            >
                                Thông tin bàn
                            </h2>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Bàn:</strong>{" "}
                                {selectedInvoice?.table?.tableNumber || "-"}
                            </p>
                        </div>
                        <div style={{ marginBottom: "30px" }}>
                            <h2
                                style={{
                                    fontSize: "20px",
                                    borderBottom: "2px solid #333",
                                    paddingBottom: "8px",
                                    marginBottom: "15px",
                                }}
                            >
                                Chi tiết món ăn
                            </h2>
                            <ul
                                style={{
                                    fontSize: "16px",
                                    margin: 0,
                                    padding: 0,
                                    listStyle: "none",
                                }}
                            >
                                {(selectedInvoice?.items || []).map(
                                    (item, idx) => (
                                        <li
                                            key={item.id || idx}
                                            style={{ marginBottom: "8px" }}
                                        >
                                            {item.name} x{item.quantity}:{" "}
                                            {formatCurrency(
                                                item.price * item.quantity
                                            )}
                                        </li>
                                    )
                                )}
                            </ul>
                            <p
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    margin: "15px 0",
                                    color: "#1890ff",
                                    borderTop: "1px solid #ccc",
                                    paddingTop: "10px",
                                }}
                            >
                                Thành tiền:{" "}
                                {formatCurrency(
                                    selectedInvoice?.finalAmount || 0
                                )}
                            </p>
                        </div>
                        {selectedInvoice?.notes && (
                            <div
                                style={{
                                    marginTop: "20px",
                                    marginBottom: "30px",
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: "20px",
                                        borderBottom: "2px solid #333",
                                        paddingBottom: "8px",
                                        marginBottom: "15px",
                                    }}
                                >
                                    Ghi chú
                                </h2>
                                <p style={{ fontSize: "16px" }}>
                                    {selectedInvoice.notes}
                                </p>
                            </div>
                        )}
                        <div style={{ marginTop: "50px", textAlign: "center" }}>
                            <p
                                style={{
                                    fontSize: "14px",
                                    fontStyle: "italic",
                                }}
                            >
                                Cảm ơn quý khách đã sử dụng dịch vụ của chúng
                                tôi!
                            </p>
                            <p style={{ fontSize: "14px", marginTop: "10px" }}>
                                Ngày in: {dayjs().format("DD/MM/YYYY HH:mm")}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantPaymentManagement;
