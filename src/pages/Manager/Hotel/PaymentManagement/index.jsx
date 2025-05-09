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
    getAllInvoices,
    sendInvoiceByEmail,
    getInvoiceByBookingId,
    downloadInvoicePdf,
} from "../../../../api/paymentsApi";
import { getHotelBranches } from "../../../../api/branchesApi";
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

const HotelPaymentManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [branches, setBranches] = useState([]);
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
        branchId: "",
    });
    const [statistics, setStatistics] = useState({
        totalInvoices: 0,
        totalRevenue: 0,
    });

    // Fetch branches when component mounts
    useEffect(() => {
        fetchBranches();
    }, []);

    // Fetch invoices when filters or pagination change
    useEffect(() => {
        fetchInvoices();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchBranches = async () => {
        try {
            const branchesData = await getHotelBranches();
            setBranches(branchesData);
        } catch (error) {
            console.error("Error fetching branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        }
    };

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                branchId: filters.branchId || undefined,
                searchText: filters.searchText || undefined,
            };

            // Add date filters if selected
            if (
                filters.dateRange &&
                filters.dateRange[0] &&
                filters.dateRange[1]
            ) {
                params.startDate = filters.dateRange[0].format("YYYY-MM-DD");
                params.endDate = filters.dateRange[1].format("YYYY-MM-DD");
            }

            const response = await getAllInvoices(params);

            setInvoices(response.items);
            setPagination({
                ...pagination,
                total: response.meta.total,
            });

            // Calculate statistics based on filtered results
            setStatistics({
                totalInvoices: response.meta.total,
                totalRevenue: response.items.reduce(
                    (sum, invoice) => sum + Number(invoice.finalAmount),
                    0
                ),
            });
        } catch (error) {
            console.error("Error fetching invoices:", error);
            message.error("Không thể tải danh sách hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    const handleViewInvoice = async (invoice) => {
        try {
            setLoading(true);
            setSelectedInvoice(invoice);
            const invoiceData = await getInvoiceByBookingId(invoice.bookingId);
            setInvoiceDetails(invoiceData);
            setViewModalVisible(true);
        } catch (error) {
            console.error("Error viewing invoice:", error);
            message.error("Không thể xem chi tiết hóa đơn");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (invoice, forceRegenerate = false) => {
        try {
            message.loading({
                content: "Đang chuẩn bị tải file PDF...",
                key: "pdf-loading",
                duration: 30, // Longer duration to allow for PDF generation
            });

            // Set the selected invoice first to ensure PDF content can access it
            setSelectedInvoice(invoice);

            // Try first with backend-generated PDF
            try {
                // Use the API function to get the PDF blob
                const apiBaseUrl =
                    import.meta.env.VITE_API_URL || "http://localhost:3000";
                const downloadUrl = `${apiBaseUrl}/payments/invoice/${
                    invoice.bookingId
                }/download${forceRegenerate ? "?forceRegenerate=true" : ""}`;

                console.log("Downloading PDF from:", downloadUrl);

                const response = await fetch(downloadUrl, {
                    method: "GET",
                    headers: {
                        Accept: "application/pdf",
                    },
                    credentials: "include", // Include cookies if needed for authentication
                });

                if (!response.ok) {
                    console.error(
                        "Error response from server:",
                        response.status,
                        response.statusText
                    );
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();

                if (blob.size === 0) {
                    console.error("Downloaded PDF has zero size");

                    // If this is already a retry with forceRegenerate, fall back to client-side generation
                    if (forceRegenerate) {
                        throw new Error(
                            "Downloaded PDF has zero size even after forcing regeneration"
                        );
                    }

                    // Try again with forceRegenerate flag
                    message.info({
                        content: "Đang tạo lại PDF trên server...",
                        key: "pdf-loading",
                    });

                    return handleDownloadInvoice(invoice, true);
                }

                // Create a URL for the blob
                const url = window.URL.createObjectURL(blob);

                // Create a temporary anchor element to trigger the download
                const link = document.createElement("a");
                link.href = url;
                link.download = `invoice-${
                    invoice.invoiceNumber || "download"
                }.pdf`;
                document.body.appendChild(link);
                link.click();

                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);

                message.success({
                    content: "Tải file PDF thành công!",
                    key: "pdf-loading",
                });
                return;
            } catch (backendError) {
                console.error("Lỗi khi tải file PDF từ backend:", backendError);

                // If backend PDF generation fails, fallback to client-side generation
                message.info({
                    content: "Đang tạo PDF từ dữ liệu hóa đơn...",
                    key: "pdf-loading",
                });

                // Get invoice details if not already loaded
                const data = await getInvoiceByBookingId(invoice.bookingId);
                setInvoiceDetails(data);

                // Set a small delay to ensure state updates have been processed
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Generate PDF using html2canvas and jsPDF
                if (pdfContentRef.current) {
                    // Make PDF content visible for capture
                    setPdfVisible(true);

                    // Wait for rendering
                    await new Promise((resolve) => setTimeout(resolve, 1000));

                    try {
                        const canvas = await html2canvas(
                            pdfContentRef.current,
                            {
                                scale: 2,
                                logging: true,
                                useCORS: true,
                                backgroundColor: "#ffffff",
                            }
                        );

                        const imgData = canvas.toDataURL("image/png");
                        const pdf = new jsPDF({
                            orientation: "portrait",
                            unit: "mm",
                            format: "a4",
                        });

                        const imgProps = pdf.getImageProperties(imgData);
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight =
                            (imgProps.height * pdfWidth) / imgProps.width;

                        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                        pdf.save(
                            `invoice-${invoice.invoiceNumber || "download"}.pdf`
                        );

                        message.success({
                            content: "Tải file PDF thành công!",
                            key: "pdf-loading",
                        });
                    } catch (canvasError) {
                        console.error("Lỗi khi tạo canvas:", canvasError);
                        throw new Error(
                            "Không thể tạo PDF: " + canvasError.message
                        );
                    } finally {
                        // Hide PDF content regardless of success or failure
                        setPdfVisible(false);
                    }
                } else {
                    throw new Error(
                        "Không thể tạo PDF: Nội dung không khả dụng"
                    );
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải file PDF:", error);
            message.error({
                content:
                    "Có lỗi khi tải file PDF: " +
                    (error.message || "Lỗi không xác định"),
                key: "pdf-loading",
            });
        }
    };

    const handleTableChange = (pagination) => {
        setPagination({
            ...pagination,
        });
    };

    const handleFilterChange = (key, value) => {
        setFilters({
            ...filters,
            [key]: value,
        });

        // Reset to first page when filters change
        setPagination({
            ...pagination,
            current: 1,
        });
    };

    const handleResetFilters = () => {
        setFilters({
            dateRange: null,
            searchText: "",
            branchId: "",
        });

        setPagination({
            ...pagination,
            current: 1,
        });
    };

    const showEmailModal = (invoice) => {
        setSelectedInvoice(invoice);
        setEmailInput(invoice.booking?.customer?.email || "");
        setEmailModalVisible(true);
    };

    const handleSendEmail = async () => {
        if (!emailInput) {
            message.error("Vui lòng nhập địa chỉ email");
            return;
        }

        try {
            setSendingEmail(true);
            await sendInvoiceByEmail(selectedInvoice.bookingId, emailInput);
            message.success("Đã gửi hóa đơn qua email thành công");
            setEmailModalVisible(false);
        } catch (error) {
            console.error("Error sending invoice email:", error);
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
            title: "Khách hàng",
            dataIndex: "booking",
            key: "customer",
            render: (booking) => (
                <Space direction="vertical" size={0}>
                    <Text strong>
                        {booking?.customer?.name || "Khách vãng lai"}
                    </Text>
                    {booking?.customer?.phone && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            {booking.customer.phone}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: "Phòng",
            dataIndex: "booking",
            key: "room",
            render: (booking) => (
                <Space>
                    <Badge color="blue" />
                    <Text>{booking?.room?.roomCode || "-"}</Text>
                </Space>
            ),
        },
        {
            title: "Chi nhánh",
            dataIndex: "booking",
            key: "branch",
            render: (booking) => booking?.branch?.name || "-",
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
            title: "Thời gian tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            responsive: ["lg"],
            render: (date) => (
                <Tooltip title={formatDateTime(date)}>
                    <span>{formatDate(date)}</span>
                </Tooltip>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            align: "center",
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
        <div className="hotel-invoice-management">
            <Card
                title={
                    <Space>
                        <DollarOutlined />
                        <span>Quản lý hóa đơn thanh toán khách sạn</span>
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
                                placeholder="Chi nhánh"
                                style={{ width: 180 }}
                                value={filters.branchId}
                                onChange={(value) =>
                                    handleFilterChange("branchId", value)
                                }
                                allowClear
                            >
                                {branches.map((branch) => (
                                    <Option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </Option>
                                ))}
                            </Select>
                            <Input
                                placeholder="Tìm kiếm theo mã hóa đơn, khách hàng, phòng"
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
                        scroll={{ x: "max-content" }}
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
                        {selectedInvoice?.booking?.customer?.name ||
                            "Khách vãng lai"}
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
                            <Descriptions.Item label="Khách hàng">
                                {selectedInvoice?.booking?.customer?.name ||
                                    "Khách vãng lai"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Liên hệ">
                                {selectedInvoice?.booking?.customer?.phone ||
                                    "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phòng">
                                {selectedInvoice?.booking?.room?.roomCode ||
                                    "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại phòng">
                                {selectedInvoice?.booking?.room?.roomType
                                    ?.name || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Nhận phòng" span={1}>
                                <Space direction="vertical" size={0}>
                                    <Text>
                                        {formatDate(
                                            selectedInvoice?.booking
                                                ?.checkInDate
                                        )}
                                    </Text>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                    >
                                        <CalendarOutlined
                                            style={{ marginRight: 4 }}
                                        />
                                        {formatTime(
                                            selectedInvoice?.booking
                                                ?.checkInTime ||
                                                selectedInvoice?.booking
                                                    ?.checkInDate
                                        )}
                                    </Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trả phòng" span={1}>
                                <Space direction="vertical" size={0}>
                                    <Text>
                                        {formatDate(
                                            selectedInvoice?.booking
                                                ?.checkOutDate
                                        )}
                                    </Text>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                    >
                                        <CalendarOutlined
                                            style={{ marginRight: 4 }}
                                        />
                                        {formatTime(
                                            selectedInvoice?.booking
                                                ?.checkOutTime ||
                                                selectedInvoice?.booking
                                                    ?.checkOutDate
                                        )}
                                    </Text>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label="Thời gian lưu trú"
                                span={1}
                            >
                                <Tag color="blue">
                                    {calculateStayDuration(
                                        selectedInvoice?.booking?.checkInDate,
                                        selectedInvoice?.booking?.checkOutDate
                                    )}{" "}
                                    ngày
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh" span={1}>
                                {selectedInvoice?.booking?.branch?.name ||
                                    selectedInvoice?.branch?.name ||
                                    "N/A"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions
                            title="Chi tiết thanh toán"
                            bordered
                            column={1}
                            className="payment-details"
                        >
                            <Descriptions.Item label="Giá phòng/đêm">
                                {formatCurrency(
                                    selectedInvoice?.booking?.room?.price || 0
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số đêm lưu trú">
                                {calculateStayDuration(
                                    selectedInvoice?.booking?.checkInDate,
                                    selectedInvoice?.booking?.checkOutDate
                                )}{" "}
                                đêm
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền phòng">
                                {formatCurrency(
                                    selectedInvoice?.totalAmount || 0
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giảm giá">
                                {formatCurrency(
                                    selectedInvoice?.discountAmount || 0
                                )}
                                {selectedInvoice?.booking?.discount > 0 && (
                                    <Text
                                        type="secondary"
                                        style={{ marginLeft: 8 }}
                                    >
                                        ({selectedInvoice?.booking?.discount}%)
                                    </Text>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item
                                label="Thành tiền"
                                className="final-amount"
                            >
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
                    width: "210mm", // A4 width
                    height: "297mm", // A4 height
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
                                HÓA ĐƠN
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
                                {selectedInvoice?.booking?.customer?.name ||
                                    "Khách vãng lai"}
                            </p>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Điện thoại:</strong>{" "}
                                {selectedInvoice?.booking?.customer?.phone ||
                                    "N/A"}
                            </p>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Email:</strong>{" "}
                                {selectedInvoice?.booking?.customer?.email ||
                                    "N/A"}
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
                                Chi tiết đặt phòng
                            </h2>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Phòng:</strong>{" "}
                                {selectedInvoice?.booking?.room?.roomCode ||
                                    "N/A"}
                            </p>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Loại phòng:</strong>{" "}
                                {selectedInvoice?.booking?.room?.roomType
                                    ?.name || "N/A"}
                            </p>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Ngày nhận phòng:</strong>{" "}
                                {dayjs(
                                    selectedInvoice?.booking?.checkInDate
                                ).format("DD/MM/YYYY")}
                            </p>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Ngày trả phòng:</strong>{" "}
                                {dayjs(
                                    selectedInvoice?.booking?.checkOutDate
                                ).format("DD/MM/YYYY")}
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
                                Chi tiết thanh toán
                            </h2>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Tổng tiền phòng:</strong>{" "}
                                {formatCurrency(
                                    selectedInvoice?.totalAmount || 0
                                )}
                            </p>
                            <p style={{ fontSize: "16px", margin: "8px 0" }}>
                                <strong>Giảm giá:</strong>{" "}
                                {formatCurrency(
                                    selectedInvoice?.discountAmount || 0
                                )}
                            </p>
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

                        <div
                            style={{
                                marginTop: "50px",
                                textAlign: "center",
                            }}
                        >
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

export default HotelPaymentManagement;
