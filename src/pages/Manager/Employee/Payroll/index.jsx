import React, { useState, useEffect } from "react";
import {
    Card,
    Button,
    Table,
    Space,
    Tag,
    Form,
    Modal,
    Row,
    Col,
    Tabs,
    message,
    Badge,
    Popconfirm,
    Typography,
    Divider,
    Input,
    DatePicker,
    Select,
    Tooltip,
    Spin,
    InputNumber,
    Alert,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    DeleteOutlined,
    UserOutlined,
    PrinterOutlined,
    DownloadOutlined,
    FileTextOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getDepartments } from "../../../../api/departmentsApi";
import { getEmployees } from "../../../../api/employeesApi";
import {
    createPayroll,
    getPayrolls,
    getPayrollById as getPayroll,
    updatePayrollStatus,
    deletePayroll,
    getPayrollStats,
} from "../../../../api/salaryApi";
import PayrollDetail from "./PayrollDetail";
import FilterControls from "./FilterControls";
import StatisticsCards from "./StatisticsCards";
import "./styles.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const PayrollStatus = {
    DRAFT: "draft",
    FINALIZED: "finalized",
    PAID: "paid",
};

const statusColors = {
    [PayrollStatus.DRAFT]: "warning",
    [PayrollStatus.FINALIZED]: "success",
    [PayrollStatus.PAID]: "green",
};

const statusLabels = {
    [PayrollStatus.DRAFT]: "Nháp",
    [PayrollStatus.FINALIZED]: "Đã hoàn thiện",
    [PayrollStatus.PAID]: "Đã thanh toán",
};

const PayrollPeriodType = {
    MONTHLY: "monthly",
    BIWEEKLY: "biweekly",
};

const periodTypeLabels = {
    [PayrollPeriodType.MONTHLY]: "Tháng",
    [PayrollPeriodType.BIWEEKLY]: "Nửa tháng",
};

export default function PayrollPage() {
    // State for data
    const [payrolls, setPayrolls] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [currentPayroll, setCurrentPayroll] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [statusChangeLoading, setStatusChangeLoading] = useState({});

    // Forms
    const [filterForm] = Form.useForm();
    const [createForm] = Form.useForm();

    // Filters
    const [activeTab, setActiveTab] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState(null);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);

    // Statistics
    const [statistics, setStatistics] = useState({
        totalPayrolls: 0,
        totalEmployees: 0,
        totalGrossPay: 0,
        totalNetPay: 0,
        byStatus: {},
        byDepartment: {},
    });

    // Initial data load
    useEffect(() => {
        const fetchDepartmentsAndEmployees = async () => {
            try {
                const [departmentsData, employeesData] = await Promise.all([
                    getDepartments(),
                    getEmployees(),
                ]);

                setDepartments(departmentsData || []);
                // Employee API returns {data: [...], total: number}
                setEmployees(employeesData.data || []);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchDepartmentsAndEmployees();
    }, []);

    // Effect to fetch payrolls when filters change
    useEffect(() => {
        fetchPayrolls();
        fetchPayrollStats();
    }, [dateRange, activeTab]);

    // Fetch payrolls with filters
    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            // Build filter params
            const filters = {
                start_date: dateRange[0].format("YYYY-MM-DD"),
                end_date: dateRange[1].format("YYYY-MM-DD"),
            };

            // Add status filter if not on 'all' tab
            if (activeTab !== "all") {
                filters.status = activeTab;
            }

            // Add other filters from form
            const formValues = filterForm.getFieldsValue();

            // Ensure department_id is a number if present
            if (formValues.department_id) {
                filters.department_id = Number(formValues.department_id);
                if (isNaN(filters.department_id)) {
                    delete filters.department_id;
                }
            }

            // Ensure employee_id is a number if present
            if (formValues.employee_id) {
                filters.employee_id = Number(formValues.employee_id);
                if (isNaN(filters.employee_id)) {
                    delete filters.employee_id;
                }
            }

            if (formValues.period_type) {
                filters.period_type = formValues.period_type;
            }

            if (formValues.search) {
                filters.search = formValues.search.trim();
            }

            console.log("Fetching payrolls with filters:", filters);
            const data = await getPayrolls(filters);
            setPayrolls(Array.isArray(data) ? data : []);

            // Show search results message
            const hasFilters = Object.keys(filters).length > 0;
            if (hasFilters && formValues.search) {
                if (data.length === 0) {
                    message.info(
                        "Không tìm thấy bảng lương nào phù hợp với bộ lọc"
                    );
                } else {
                    message.success(`Đã tìm thấy ${data.length} bảng lương`);
                }
            }
        } catch (error) {
            console.error("Error fetching payrolls:", error);
            message.error("Không thể tải dữ liệu bảng lương");
            setPayrolls([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch payroll statistics
    const fetchPayrollStats = async () => {
        try {
            // Format dates correctly
            const startDateStr = dateRange[0].format("YYYY-MM-DD");
            const endDateStr = dateRange[1].format("YYYY-MM-DD");

            // Get department_id from form if present
            const formValues = filterForm.getFieldsValue();
            let departmentId = undefined;

            if (formValues.department_id) {
                departmentId = Number(formValues.department_id);
                if (isNaN(departmentId)) {
                    departmentId = undefined;
                }
            }

            const stats = await getPayrollStats(
                startDateStr,
                endDateStr,
                departmentId
            );

            setStatistics(
                stats || {
                    totalPayrolls: 0,
                    totalEmployees: 0,
                    totalGrossPay: 0,
                    totalNetPay: 0,
                    byStatus: {},
                    byDepartment: {},
                }
            );
        } catch (error) {
            console.error("Error fetching payroll stats:", error);
            // Set default empty statistics on error
            setStatistics({
                totalPayrolls: 0,
                totalEmployees: 0,
                totalGrossPay: 0,
                totalNetPay: 0,
                byStatus: {},
                byDepartment: {},
            });

            // Only show error message if it's not a 400 validation error
            if (!error.response || error.response.status !== 400) {
                message.error("Không thể tải thống kê bảng lương");
            }
        }
    };

    // Create new payroll
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            setSubmitting(true);

            // Format dates properly
            const periodStartDate = values.period?.[0].format("YYYY-MM-DD");
            const periodEndDate = values.period?.[1].format("YYYY-MM-DD");

            // Prepare attendance data if provided
            const attendanceData = {};
            if (values.attendance) {
                if (values.attendance.working_days) {
                    attendanceData.working_days =
                        values.attendance.working_days;
                }
                if (values.attendance.total_working_hours) {
                    attendanceData.total_working_hours =
                        values.attendance.total_working_hours;
                }
                if (values.attendance.overtime_hours) {
                    attendanceData.overtime_hours =
                        values.attendance.overtime_hours;
                }
                if (values.attendance.night_shift_hours) {
                    attendanceData.night_shift_hours =
                        values.attendance.night_shift_hours;
                }
                if (values.attendance.night_shift_multiplier) {
                    attendanceData.night_shift_multiplier =
                        values.attendance.night_shift_multiplier;
                } else if (
                    values.attendance.night_shift_hours &&
                    values.attendance.night_shift_hours > 0
                ) {
                    // Đảm bảo luôn có hệ số nếu có giờ làm ca đêm
                    attendanceData.night_shift_multiplier = 1.3; // Hệ số mặc định
                    console.log("Auto-added night shift multiplier 1.3");
                }
                if (values.attendance.holiday_hours) {
                    attendanceData.holiday_hours =
                        values.attendance.holiday_hours;
                }
            }

            // Validate night shift data for explicit log
            if (
                attendanceData.night_shift_hours &&
                attendanceData.night_shift_hours > 0
            ) {
                console.log(
                    `Night shift validation: ${
                        attendanceData.night_shift_hours
                    } hours with multiplier ${
                        attendanceData.night_shift_multiplier ||
                        "(not set - will use default)"
                    }`
                );

                // Double ensure night shift multiplier is present
                if (!attendanceData.night_shift_multiplier) {
                    attendanceData.night_shift_multiplier = 1.3;
                    console.log(
                        "Double ensured night shift multiplier is set to 1.3"
                    );
                }
            }

            // Create payroll
            const payrollData = {
                employee_id: values.employee_id,
                period_start: periodStartDate,
                period_end: periodEndDate,
                period_type: values.period_type,
                notes: values.notes,
                ...attendanceData,
            };

            // Log dữ liệu trước khi gửi
            console.log("Submitting payroll data:", payrollData);

            await createPayroll(payrollData);

            message.success("Tạo bảng lương thành công");
            setCreateModalVisible(false);
            createForm.resetFields();
            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error creating payroll:", error);

            if (error.response?.data?.message) {
                message.error(`Lỗi: ${error.response.data.message}`);
            } else {
                message.error("Không thể tạo bảng lương. Vui lòng thử lại.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // View payroll details
    const handleViewDetail = async (id) => {
        try {
            setLoading(true);
            const data = await getPayroll(id);
            setCurrentPayroll(data);
            setDetailModalVisible(true);
        } catch (error) {
            console.error("Error fetching payroll details:", error);
            message.error("Không thể tải thông tin chi tiết bảng lương");
        } finally {
            setLoading(false);
        }
    };

    // Change payroll status
    const handleStatusChange = async (id, newStatus) => {
        try {
            // Set loading state for this specific payroll
            setStatusChangeLoading((prev) => ({ ...prev, [id]: true }));

            await updatePayrollStatus(id, { status: newStatus });

            message.success(
                <div>
                    <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
                        {newStatus === PayrollStatus.FINALIZED
                            ? "Hoàn thiện bảng lương thành công!"
                            : newStatus === PayrollStatus.PAID
                            ? "Đánh dấu đã thanh toán thành công!"
                            : "Cập nhật trạng thái thành công!"}
                    </div>
                    <div>
                        Bảng lương đã được chuyển sang trạng thái{" "}
                        <Tag color={statusColors[newStatus]}>
                            {statusLabels[newStatus]}
                        </Tag>
                    </div>
                </div>,
                5
            );

            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error updating status:", error);
            message.error("Không thể cập nhật trạng thái bảng lương");
        } finally {
            setStatusChangeLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

    // Delete payroll
    const handleDelete = async (id) => {
        try {
            setStatusChangeLoading((prev) => ({ ...prev, [id]: true }));

            await deletePayroll(id);

            message.success("Xóa bảng lương thành công");
            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error deleting payroll:", error);
            message.error("Không thể xóa bảng lương");
        } finally {
            setStatusChangeLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

    // Handle tab change
    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    // Handle search button click
    const handleSearch = () => {
        fetchPayrolls();
        fetchPayrollStats();
    };

    // Reset filters
    const handleReset = () => {
        filterForm.resetFields();
        setSearchText("");
        setDepartmentFilter(null);
        setActiveTab("all");
        fetchPayrolls();
        fetchPayrollStats();
    };

    // Table columns definition
    const columns = [
        {
            title: "Mã bảng lương",
            dataIndex: "payroll_code",
            key: "payroll_code",
            width: 150,
            render: (text, record) => (
                <Button
                    type="link"
                    style={{ padding: 0, fontWeight: 500 }}
                    onClick={() => handleViewDetail(record.id)}
                >
                    {text}
                </Button>
            ),
            sorter: (a, b) => a.payroll_code.localeCompare(b.payroll_code),
        },
        {
            title: "Nhân viên",
            dataIndex: ["employee", "name"],
            key: "employee_name",
            width: 200,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary">
                        {record.employee?.department?.name ||
                            "Chưa có phòng ban"}
                    </Text>
                </Space>
            ),
            sorter: (a, b) => {
                const nameA = a.employee?.name || "";
                const nameB = b.employee?.name || "";
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: "Chức vụ",
            dataIndex: ["employee", "role", "name"],
            key: "role_name",
            width: 150,
            render: (text) => text || "Chưa có chức vụ",
            sorter: (a, b) => {
                const roleA = a.employee?.role?.name || "";
                const roleB = b.employee?.role?.name || "";
                return roleA.localeCompare(roleB);
            },
        },
        {
            title: "Kỳ lương",
            key: "period",
            width: 200,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        {dayjs(record.period_start).format("DD/MM/YYYY")} -{" "}
                        {dayjs(record.period_end).format("DD/MM/YYYY")}
                    </Text>
                    <Tag color="blue">
                        {periodTypeLabels[record.period_type]}
                    </Tag>
                </Space>
            ),
            sorter: (a, b) =>
                dayjs(a.period_start).valueOf() -
                dayjs(b.period_start).valueOf(),
        },
        {
            title: "Số ngày công",
            dataIndex: "working_days",
            key: "working_days",
            width: 130,
            render: (value) => (value || 0) + " ngày",
            sorter: (a, b) => (a.working_days || 0) - (b.working_days || 0),
        },
        {
            title: "Tổng giờ làm",
            dataIndex: "total_working_hours",
            key: "total_working_hours",
            width: 130,
            render: (value) => (value ? value.toFixed(1) + " giờ" : "0 giờ"),
            sorter: (a, b) =>
                (a.total_working_hours || 0) - (b.total_working_hours || 0),
        },
        {
            title: "Giờ làm đêm",
            dataIndex: "night_shift_hours",
            key: "night_shift_hours",
            width: 130,
            render: (value) => (
                <span className="night-shift-value">
                    {value ? value.toFixed(1) + " giờ" : "0 giờ"}
                </span>
            ),
            sorter: (a, b) =>
                (a.night_shift_hours || 0) - (b.night_shift_hours || 0),
        },
        {
            title: "Phụ cấp ca đêm",
            dataIndex: "night_shift_pay",
            key: "night_shift_pay",
            width: 150,
            render: (value) => (
                <span className="night-shift-value">
                    {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                    }).format(value || 0)}
                </span>
            ),
            sorter: (a, b) =>
                (a.night_shift_pay || 0) - (b.night_shift_pay || 0),
        },
        {
            title: "Tổng lương gộp",
            dataIndex: "gross_pay",
            key: "gross_pay",
            width: 150,
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value || 0),
            sorter: (a, b) => (a.gross_pay || 0) - (b.gross_pay || 0),
        },
        {
            title: "Lương thực lãnh",
            dataIndex: "net_pay",
            key: "net_pay",
            width: 150,
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value || 0),
            sorter: (a, b) => (a.net_pay || 0) - (b.net_pay || 0),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status) => (
                <Tag
                    color={statusColors[status]}
                    className={`status-${status}`}
                >
                    {statusLabels[status]}
                </Tag>
            ),
            filters: [
                {
                    text: statusLabels[PayrollStatus.DRAFT],
                    value: PayrollStatus.DRAFT,
                },
                {
                    text: statusLabels[PayrollStatus.FINALIZED],
                    value: PayrollStatus.FINALIZED,
                },
                {
                    text: statusLabels[PayrollStatus.PAID],
                    value: PayrollStatus.PAID,
                },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            ghost
                            icon={<FileTextOutlined />}
                            onClick={() => handleViewDetail(record.id)}
                        />
                    </Tooltip>

                    {record.status === PayrollStatus.DRAFT && (
                        <>
                            <Tooltip title="Hoàn thiện">
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<CheckCircleOutlined />}
                                    onClick={() =>
                                        Modal.confirm({
                                            title: "Hoàn thiện bảng lương",
                                            icon: (
                                                <CheckCircleOutlined
                                                    style={{ color: "#52c41a" }}
                                                />
                                            ),
                                            content: `Bạn có chắc chắn muốn hoàn thiện bảng lương cho nhân viên ${
                                                record.employee?.name || "này"
                                            }?`,
                                            okText: "Xác nhận",
                                            cancelText: "Hủy",
                                            onOk: () =>
                                                handleStatusChange(
                                                    record.id,
                                                    PayrollStatus.FINALIZED
                                                ),
                                        })
                                    }
                                    loading={statusChangeLoading[record.id]}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Xóa bảng lương"
                                description="Bạn có chắc chắn muốn xóa bảng lương này?"
                                icon={
                                    <ExclamationCircleOutlined
                                        style={{ color: "#ff4d4f" }}
                                    />
                                }
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Tooltip title="Xóa">
                                    <Button
                                        type="primary"
                                        danger
                                        ghost
                                        icon={<DeleteOutlined />}
                                        loading={statusChangeLoading[record.id]}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}

                    {record.status === PayrollStatus.FINALIZED && (
                        <Tooltip title="Đánh dấu đã thanh toán">
                            <Button
                                type="primary"
                                ghost
                                icon={<DollarOutlined />}
                                onClick={() =>
                                    Modal.confirm({
                                        title: "Đánh dấu đã thanh toán",
                                        icon: (
                                            <DollarOutlined
                                                style={{ color: "#13c2c2" }}
                                            />
                                        ),
                                        content: `Bạn có chắc chắn muốn đánh dấu bảng lương cho nhân viên ${
                                            record.employee?.name || "này"
                                        } là đã thanh toán?`,
                                        okText: "Xác nhận",
                                        cancelText: "Hủy",
                                        onOk: () =>
                                            handleStatusChange(
                                                record.id,
                                                PayrollStatus.PAID
                                            ),
                                    })
                                }
                                loading={statusChangeLoading[record.id]}
                            />
                        </Tooltip>
                    )}

                    <Tooltip title="In bảng lương">
                        <Button type="default" icon={<PrinterOutlined />} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="payroll-page">
            <div className="page-header">
                <div>
                    <Title level={3}>
                        <DollarOutlined /> Quản lý bảng lương
                    </Title>
                    <Text type="secondary">
                        Quản lý thanh toán lương cho nhân viên trong tổ chức
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                    size="large"
                >
                    Tạo bảng lương
                </Button>
            </div>

            {/* Statistics Cards */}
            <StatisticsCards
                statistics={statistics}
                statusFilters={PayrollStatus}
                resetFilters={handleReset}
                onChangeTab={handleTabChange}
            />

            {/* Filter Card */}
            <Card className="filter-card">
                <FilterControls
                    form={filterForm}
                    departments={departments}
                    employees={employees}
                    periodTypes={PayrollPeriodType}
                    periodTypeLabels={periodTypeLabels}
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    loading={loading}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onFetchData={fetchPayrolls}
                />
            </Card>

            {/* Data Card */}
            <Card className="data-card">
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    className="tab-container"
                >
                    <TabPane tab="Tất cả" key="all" />
                    <TabPane
                        tab={
                            <Badge
                                count={
                                    statistics.byStatus?.[
                                        PayrollStatus.DRAFT
                                    ] || 0
                                }
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#faad14",
                                    marginRight: "8px",
                                }}
                            >
                                Nháp
                            </Badge>
                        }
                        key={PayrollStatus.DRAFT}
                    />
                    <TabPane
                        tab={
                            <Badge
                                count={
                                    statistics.byStatus?.[
                                        PayrollStatus.FINALIZED
                                    ] || 0
                                }
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#52c41a",
                                    marginRight: "8px",
                                }}
                            >
                                Đã hoàn thiện
                            </Badge>
                        }
                        key={PayrollStatus.FINALIZED}
                    />
                    <TabPane
                        tab={
                            <Badge
                                count={
                                    statistics.byStatus?.[PayrollStatus.PAID] ||
                                    0
                                }
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#13c2c2",
                                    marginRight: "8px",
                                }}
                            >
                                Đã thanh toán
                            </Badge>
                        }
                        key={PayrollStatus.PAID}
                    />
                </Tabs>

                <Table
                    columns={columns}
                    dataSource={payrolls}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bảng lương`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    bordered
                    size="middle"
                    scroll={{ x: "max-content" }}
                    className="data-table"
                    locale={{
                        emptyText: (
                            <div style={{ padding: "20px 0" }}>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <SearchOutlined />
                                </div>
                                <p>Không tìm thấy bảng lương nào</p>
                                <p style={{ fontSize: "13px", color: "#999" }}>
                                    Thử thay đổi bộ lọc hoặc tạo mới một bảng
                                    lương
                                </p>
                            </div>
                        ),
                    }}
                />
            </Card>

            {/* Modal tạo bảng lương mới */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined />
                        <span>Tạo bảng lương mới</span>
                    </Space>
                }
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                onOk={handleCreate}
                confirmLoading={submitting}
                width={700}
                maskClosable={false}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    initialValues={{
                        period_type: PayrollPeriodType.MONTHLY,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="employee_id"
                                label="Nhân viên"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn nhân viên",
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn nhân viên"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children
                                            .toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {employees.map((emp) => (
                                        <Option key={emp.id} value={emp.id}>
                                            {emp.employee_code
                                                ? `${emp.employee_code} - `
                                                : ""}
                                            {emp.name} -{" "}
                                            {emp.department?.name ||
                                                "Chưa có phòng ban"}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="period"
                                label="Kỳ lương"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn kỳ lương",
                                    },
                                ]}
                            >
                                <RangePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder={["Từ ngày", "Đến ngày"]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="period_type"
                                label="Loại kỳ lương"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn loại kỳ lương",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn loại kỳ lương">
                                    {Object.keys(PayrollPeriodType).map(
                                        (key) => (
                                            <Option
                                                key={key}
                                                value={PayrollPeriodType[key]}
                                            >
                                                {
                                                    periodTypeLabels[
                                                        PayrollPeriodType[key]
                                                    ]
                                                }
                                            </Option>
                                        )
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider orientation="left">Thông tin chấm công</Divider>
                    <Alert
                        message="Nếu không điền các thông tin dưới đây, hệ thống sẽ tự động tính toán dựa trên dữ liệu chấm công đã được phê duyệt."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name={["attendance", "working_days"]}
                                label="Số ngày công"
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    placeholder="Số ngày công"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={["attendance", "total_working_hours"]}
                                label="Tổng số giờ làm việc"
                            >
                                <InputNumber
                                    min={0}
                                    step={0.5}
                                    style={{ width: "100%" }}
                                    placeholder="Tổng số giờ làm"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={["attendance", "overtime_hours"]}
                                label="Số giờ làm thêm"
                            >
                                <InputNumber
                                    min={0}
                                    step={0.5}
                                    style={{ width: "100%" }}
                                    placeholder="Số giờ làm thêm"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name={["attendance", "night_shift_hours"]}
                                label="Số giờ làm ca đêm"
                            >
                                <InputNumber
                                    min={0}
                                    step={0.5}
                                    style={{ width: "100%" }}
                                    placeholder="Số giờ ca đêm"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={["attendance", "night_shift_multiplier"]}
                                label="Hệ số lương ca đêm"
                            >
                                <InputNumber
                                    min={1}
                                    step={0.1}
                                    style={{ width: "100%" }}
                                    placeholder="Hệ số ca đêm (mặc định: 1.3)"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name={["attendance", "holiday_hours"]}
                                label="Số giờ làm ngày lễ"
                            >
                                <InputNumber
                                    min={0}
                                    step={0.5}
                                    style={{ width: "100%" }}
                                    placeholder="Số giờ ngày lễ"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập ghi chú (nếu có)"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal chi tiết bảng lương */}
            <Modal
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>
                            Chi tiết bảng lương -{" "}
                            {currentPayroll?.payroll_code || ""}
                        </span>
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setCurrentPayroll(null);
                }}
                footer={[
                    currentPayroll?.status === PayrollStatus.DRAFT && (
                        <Button
                            key="finalize"
                            type="primary"
                            ghost
                            icon={<CheckCircleOutlined />}
                            onClick={() =>
                                Modal.confirm({
                                    title: "Hoàn thiện bảng lương",
                                    icon: (
                                        <CheckCircleOutlined
                                            style={{ color: "#52c41a" }}
                                        />
                                    ),
                                    content: `Bạn có chắc chắn muốn hoàn thiện bảng lương này?`,
                                    okText: "Xác nhận",
                                    cancelText: "Hủy",
                                    onOk: async () => {
                                        await handleStatusChange(
                                            currentPayroll.id,
                                            PayrollStatus.FINALIZED
                                        );
                                        setDetailModalVisible(false);
                                    },
                                })
                            }
                        >
                            Hoàn thiện
                        </Button>
                    ),
                    currentPayroll?.status === PayrollStatus.FINALIZED && (
                        <Button
                            key="pay"
                            type="primary"
                            ghost
                            icon={<DollarOutlined />}
                            onClick={() =>
                                Modal.confirm({
                                    title: "Đánh dấu đã thanh toán",
                                    icon: (
                                        <DollarOutlined
                                            style={{ color: "#13c2c2" }}
                                        />
                                    ),
                                    content: `Bạn có chắc chắn muốn đánh dấu bảng lương này là đã thanh toán?`,
                                    okText: "Xác nhận",
                                    cancelText: "Hủy",
                                    onOk: async () => {
                                        await handleStatusChange(
                                            currentPayroll.id,
                                            PayrollStatus.PAID
                                        );
                                        setDetailModalVisible(false);
                                    },
                                })
                            }
                        >
                            Đánh dấu đã thanh toán
                        </Button>
                    ),
                    <Button
                        key="print"
                        type="primary"
                        icon={<PrinterOutlined />}
                    >
                        In bảng lương
                    </Button>,
                    <Button
                        key="download"
                        type="default"
                        icon={<DownloadOutlined />}
                    >
                        Xuất PDF
                    </Button>,
                    <Button
                        key="close"
                        onClick={() => {
                            setDetailModalVisible(false);
                            setCurrentPayroll(null);
                        }}
                    >
                        Đóng
                    </Button>,
                ]}
                width={800}
                bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin size="large" />
                        <p>Đang tải thông tin...</p>
                    </div>
                ) : (
                    <PayrollDetail
                        payroll={currentPayroll}
                        periodTypeLabels={periodTypeLabels}
                        statusLabels={statusLabels}
                        statusColors={statusColors}
                    />
                )}
            </Modal>
        </div>
    );
}
