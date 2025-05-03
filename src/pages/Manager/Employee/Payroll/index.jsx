import React, { useState, useEffect } from "react";
import {
    Card,
    Button,
    Table,
    Space,
    Tag,
    DatePicker,
    Select,
    Input,
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
    Statistic,
    Descriptions,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    TeamOutlined,
    PrinterOutlined,
    DownloadOutlined,
    FileTextOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getDepartments } from "../../../../api/departmentsApi";
import { getRoles } from "../../../../api/rolesEmployeeApi";
import {
    createPayroll,
    getPayrolls,
    getPayroll,
    updatePayrollStatus,
    deletePayroll,
    getPayrollStats,
} from "../../../../api/salaryApi";

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
    const [payrolls, setPayrolls] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [currentPayroll, setCurrentPayroll] = useState(null);
    const [filterForm] = Form.useForm();
    const [createForm] = Form.useForm();
    const [activeTab, setActiveTab] = useState("all");
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
        const fetchData = async () => {
            try {
                const [departmentsData, employeesData] = await Promise.all([
                    getDepartments(),
                    getRoles(),
                ]);

                setDepartments(departmentsData);
                setEmployees(employeesData);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            }
        };

        fetchData();
    }, []);

    // Effect to fetch payrolls when filters change
    useEffect(() => {
        fetchPayrolls();
        fetchPayrollStats();
    }, [dateRange, activeTab]);

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
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

            // Đảm bảo department_id là số nếu có
            if (formValues.department_id) {
                filters.department_id = Number(formValues.department_id);
                if (isNaN(filters.department_id)) {
                    delete filters.department_id;
                }
            }

            // Đảm bảo employee_id là số nếu có
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
                filters.search = formValues.search;
            }

            const data = await getPayrolls(filters);
            setPayrolls(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching payrolls:", error);
            message.error("Không thể tải dữ liệu bảng lương");
            setPayrolls([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPayrollStats = async () => {
        try {
            // Đảm bảo định dạng ngày đúng
            const startDateStr = dateRange[0].format("YYYY-MM-DD");
            const endDateStr = dateRange[1].format("YYYY-MM-DD");

            // Lấy department_id từ form nếu có
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

    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();

            // Format dates
            values.period_start =
                values.period.length > 0
                    ? values.period[0].format("YYYY-MM-DD")
                    : null;
            values.period_end =
                values.period.length > 0
                    ? values.period[1].format("YYYY-MM-DD")
                    : null;

            // Remove period field
            delete values.period;

            setLoading(true);
            await createPayroll(values);
            message.success("Tạo bảng lương thành công");
            setCreateModalVisible(false);
            createForm.resetFields();
            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error creating payroll:", error);
            message.error("Không thể tạo bảng lương");
            setLoading(false);
        }
    };

    const handleViewDetail = async (id) => {
        try {
            setLoading(true);
            const data = await getPayroll(id);
            setCurrentPayroll(data);
            setDetailModalVisible(true);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching payroll details:", error);
            message.error("Không thể tải thông tin chi tiết bảng lương");
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setLoading(true);
            await updatePayrollStatus(id, { status: newStatus });
            message.success("Cập nhật trạng thái thành công");
            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error updating status:", error);
            message.error("Không thể cập nhật trạng thái");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await deletePayroll(id);
            message.success("Xóa bảng lương thành công");
            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error deleting payroll:", error);
            message.error("Không thể xóa bảng lương");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handleDateRangeChange = (dates) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    const handleSearch = () => {
        fetchPayrolls();
        fetchPayrollStats();
    };

    const handleReset = () => {
        filterForm.resetFields();
        fetchPayrolls();
        fetchPayrollStats();
    };

    const columns = [
        {
            title: "Mã bảng lương",
            dataIndex: "payroll_code",
            key: "payroll_code",
            width: 120,
            render: (text, record) => (
                <Button
                    type="link"
                    style={{ padding: 0 }}
                    onClick={() => handleViewDetail(record.id)}
                >
                    {text}
                </Button>
            ),
        },
        {
            title: "Nhân viên",
            dataIndex: ["employee", "name"],
            key: "employee_name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary">
                        {record.employee?.department?.name ||
                            "Chưa có phòng ban"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Chức vụ",
            dataIndex: ["employee", "role", "name"],
            key: "role_name",
            render: (text) => text || "Chưa có chức vụ",
        },
        {
            title: "Kỳ lương",
            key: "period",
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
        },
        {
            title: "Tổng thời gian",
            dataIndex: "total_working_hours",
            key: "working_hours",
            render: (hours) => `${hours.toFixed(1)} giờ`,
            sorter: (a, b) => a.total_working_hours - b.total_working_hours,
        },
        {
            title: "Lương gộp",
            dataIndex: "gross_pay",
            key: "gross_pay",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
            sorter: (a, b) => a.gross_pay - b.gross_pay,
        },
        {
            title: "Lương thực lãnh",
            dataIndex: "net_pay",
            key: "net_pay",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
            sorter: (a, b) => a.net_pay - b.net_pay,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        ghost
                        icon={<FileTextOutlined />}
                        onClick={() => handleViewDetail(record.id)}
                    />

                    {record.status === PayrollStatus.DRAFT && (
                        <>
                            <Tooltip title="Hoàn thiện">
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<CheckCircleOutlined />}
                                    onClick={() =>
                                        handleStatusChange(
                                            record.id,
                                            PayrollStatus.FINALIZED
                                        )
                                    }
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Bạn có chắc chắn muốn xóa?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button
                                    type="primary"
                                    danger
                                    ghost
                                    icon={<DeleteOutlined />}
                                />
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
                                    handleStatusChange(
                                        record.id,
                                        PayrollStatus.PAID
                                    )
                                }
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

    // Statistics for displaying in cards
    const renderStatistics = () => (
        <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng số bảng lương"
                        value={statistics.totalPayrolls || 0}
                        prefix={<FileTextOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng nhân viên"
                        value={statistics.totalEmployees || 0}
                        prefix={<UserOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng lương gộp"
                        value={new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(statistics.totalGrossPay || 0)}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng lương thực lãnh"
                        value={new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(statistics.totalNetPay || 0)}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );

    return (
        <div>
            <Card
                title={
                    <Space>
                        <DollarOutlined />
                        <span>Quản lý bảng lương</span>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        Tạo bảng lương
                    </Button>
                }
            >
                <Form
                    form={filterForm}
                    layout="vertical"
                    onFinish={handleSearch}
                    initialValues={{}}
                >
                    <Row gutter={16}>
                        <Col span={5}>
                            <Form.Item name="department_id" label="Phòng ban">
                                <Select
                                    allowClear
                                    placeholder="Chọn phòng ban"
                                    onChange={fetchPayrolls}
                                >
                                    {departments.map((dept) => (
                                        <Option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name="employee_id" label="Nhân viên">
                                <Select
                                    allowClear
                                    placeholder="Chọn nhân viên"
                                    onChange={fetchPayrolls}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {employees.map((emp) => (
                                        <Option key={emp.id} value={emp.id}>
                                            {emp.employee_code} - {emp.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name="period_type" label="Loại kỳ lương">
                                <Select
                                    allowClear
                                    placeholder="Chọn loại kỳ lương"
                                    onChange={fetchPayrolls}
                                >
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
                        <Col span={6}>
                            <Form.Item label="Khoảng thời gian">
                                <RangePicker
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label=" " colon={false}>
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SearchOutlined />}
                                    >
                                        Tìm
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        icon={<FilterOutlined />}
                                    >
                                        Đặt lại
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <Divider style={{ margin: "8px 0 16px" }} />

                {renderStatistics()}

                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    style={{ marginTop: 16 }}
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
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bảng lương`,
                    }}
                />
            </Card>

            {/* Modal tạo bảng lương mới */}
            <Modal
                title="Tạo bảng lương mới"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                onOk={handleCreate}
                confirmLoading={loading}
                width={600}
            >
                <Form form={createForm} layout="vertical">
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
                                >
                                    {employees.map((emp) => (
                                        <Option key={emp.id} value={emp.id}>
                                            {emp.employee_code} - {emp.name} -{" "}
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
                                initialValue={PayrollPeriodType.MONTHLY}
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
                title={`Chi tiết bảng lương - ${
                    currentPayroll?.payroll_code || ""
                }`}
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setCurrentPayroll(null);
                }}
                footer={[
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
            >
                {currentPayroll ? (
                    <>
                        <Descriptions
                            title="Thông tin nhân viên"
                            bordered
                            column={2}
                        >
                            <Descriptions.Item label="Mã nhân viên">
                                {currentPayroll.employee?.employee_code}
                            </Descriptions.Item>
                            <Descriptions.Item label="Họ và tên">
                                {currentPayroll.employee?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phòng ban">
                                {currentPayroll.employee?.department?.name ||
                                    "Chưa có phòng ban"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chức vụ">
                                {currentPayroll.employee?.role?.name ||
                                    "Chưa có chức vụ"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions
                            title="Thông tin kỳ lương"
                            bordered
                            column={2}
                        >
                            <Descriptions.Item label="Kỳ lương">
                                {dayjs(currentPayroll.period_start).format(
                                    "DD/MM/YYYY"
                                )}{" "}
                                -{" "}
                                {dayjs(currentPayroll.period_end).format(
                                    "DD/MM/YYYY"
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại kỳ lương">
                                {periodTypeLabels[currentPayroll.period_type]}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={statusColors[currentPayroll.status]}
                                >
                                    {statusLabels[currentPayroll.status]}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày thanh toán">
                                {currentPayroll.payment_date
                                    ? dayjs(currentPayroll.payment_date).format(
                                          "DD/MM/YYYY"
                                      )
                                    : "Chưa thanh toán"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Descriptions
                            title="Chi tiết lương"
                            bordered
                            column={2}
                        >
                            <Descriptions.Item label="Lương cơ bản">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(currentPayroll.base_salary)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số giờ làm việc">
                                {currentPayroll.total_working_hours.toFixed(1)}{" "}
                                giờ
                            </Descriptions.Item>
                            <Descriptions.Item label="Số giờ tăng ca">
                                {currentPayroll.overtime_hours.toFixed(1)} giờ
                            </Descriptions.Item>
                            <Descriptions.Item label="Số giờ ca đêm">
                                {currentPayroll.night_shift_hours.toFixed(1)}{" "}
                                giờ
                            </Descriptions.Item>
                            <Descriptions.Item label="Lương tăng ca">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(currentPayroll.overtime_pay)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lương ca đêm">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(currentPayroll.night_shift_pay)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phụ cấp">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(currentPayroll.allowances)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thuế">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(currentPayroll.tax)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Bảo hiểm">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(currentPayroll.insurance)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khấu trừ khác">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(
                                    currentPayroll.deductions -
                                        currentPayroll.tax -
                                        currentPayroll.insurance
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Tổng lương gộp"
                                    value={new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(currentPayroll.gross_pay)}
                                    precision={0}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Lương thực lãnh"
                                    value={new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(currentPayroll.net_pay)}
                                    precision={0}
                                    valueStyle={{ color: "#3f8600" }}
                                />
                            </Col>
                        </Row>

                        {currentPayroll.notes && (
                            <>
                                <Divider />
                                <div>
                                    <Text strong>Ghi chú:</Text>
                                    <p>{currentPayroll.notes}</p>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        Đang tải dữ liệu...
                    </div>
                )}
            </Modal>
        </div>
    );
}
