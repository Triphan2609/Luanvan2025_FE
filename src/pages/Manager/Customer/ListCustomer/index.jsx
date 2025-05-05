import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Input,
    Row,
    Col,
    Select,
    Tooltip,
    Badge,
    Statistic,
    Popconfirm,
    message,
    Tag,
} from "antd";
import {
    UserAddOutlined,
    SearchOutlined,
    EditOutlined,
    EyeOutlined,
    StopOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { debounce } from "lodash";
import * as XLSX from "xlsx";
import CustomerForm from "./Modals/CustomerForm";
import CustomerDetail from "./Drawer/CustomerDetail";
import CustomerExportModal from "./Modals/CustomerExportModal";
import {
    getCustomers,
    getCustomerStats,
    toggleCustomerStatus,
    getCustomerById,
    createCustomer,
    updateCustomer,
    getCustomersByStatus,
} from "../../../../api/customersApi";
import { getBranches } from "../../../../api/branchesApi";

const { Title } = Typography;
const { Search } = Input;

// Constants
const CUSTOMER_TYPE = {
    NORMAL: "normal",
    VIP: "vip",
};

const CUSTOMER_STATUS = {
    ACTIVE: "active",
    BLOCKED: "blocked",
};

const TYPE_COLORS = {
    [CUSTOMER_TYPE.NORMAL]: "#52c41a",
    [CUSTOMER_TYPE.VIP]: "#722ed1",
};

const STATUS_COLORS = {
    [CUSTOMER_STATUS.ACTIVE]: "#52c41a",
    [CUSTOMER_STATUS.BLOCKED]: "#ff4d4f",
};

export default function CustomerList() {
    // States
    const [searchText, setSearchText] = useState("");
    const [filters, setFilters] = useState({
        type: "all",
        status: "all",
        branchId: undefined,
    });
    const [sortedInfo, setSortedInfo] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ["10", "20", "50", "100"],
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [statistics, setStatistics] = useState({
        totalCustomers: 0,
        totalVipCustomers: 0,
        totalActiveCustomers: 0,
    });
    const [branches, setBranches] = useState([]);
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);

    // Fetch all customers on initial load
    useEffect(() => {
        fetchAllCustomers();
        fetchCustomerStats();
        fetchBranches();
    }, []);

    // Fetch all customers without filters for client-side filtering
    const fetchAllCustomers = async () => {
        setLoading(true);
        try {
            const params = {
                limit: 1000, // Get a larger set for client-side filtering
            };

            console.log("Fetching all customers for client-side filtering");
            const response = await getCustomers(params);
            console.log("Fetched customers:", response);

            setCustomers(response.data);
            setPagination((prev) => ({
                ...prev,
                total: response.total,
            }));
        } catch (error) {
            console.error("Error fetching all customers:", error);
            message.error(
                "Không thể tải danh sách khách hàng: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    // Filter customers on client side with useMemo
    const filteredCustomers = useMemo(() => {
        // Start with all customers
        return (
            customers
                // Filter by search text
                .filter(
                    (customer) =>
                        !searchText ||
                        `${customer.name} ${customer.phone} ${
                            customer.idNumber || ""
                        } ${customer.email || ""}`
                            .toLowerCase()
                            .includes(searchText.toLowerCase())
                )
                // Filter by customer type
                .filter(
                    (customer) =>
                        filters.type === "all" || customer.type === filters.type
                )
                // Filter by customer status
                .filter(
                    (customer) =>
                        filters.status === "all" ||
                        customer.status === filters.status
                )
                // Filter by branch
                .filter(
                    (customer) =>
                        !filters.branchId ||
                        customer.branchId === filters.branchId
                )
        );
    }, [customers, searchText, filters]);

    // Apply sorting to filtered customers
    const sortedCustomers = useMemo(() => {
        if (!sortedInfo.columnKey) {
            return filteredCustomers;
        }

        return [...filteredCustomers].sort((a, b) => {
            const aValue = a[sortedInfo.columnKey];
            const bValue = b[sortedInfo.columnKey];

            if (typeof aValue === "string" && typeof bValue === "string") {
                return sortedInfo.order === "ascend"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            // For numeric values
            return sortedInfo.order === "ascend"
                ? aValue - bValue
                : bValue - aValue;
        });
    }, [filteredCustomers, sortedInfo]);

    // Calculate paginated data based on current page and page size
    const paginatedCustomers = useMemo(() => {
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return sortedCustomers.slice(startIndex, endIndex);
    }, [sortedCustomers, pagination.current, pagination.pageSize]);

    // Update pagination total whenever filtered results change
    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            total: filteredCustomers.length,
        }));
    }, [filteredCustomers]);

    // Update form values when filters change
    useEffect(() => {
        console.log("Current filters:", filters);
    }, [searchText, filters]);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchText(value);
            setPagination((prev) => ({ ...prev, current: 1 }));
        }, 300),
        []
    );

    // Fetch customer statistics
    const fetchCustomerStats = async () => {
        try {
            const stats = await getCustomerStats();
            setStatistics(stats);
        } catch (error) {
            message.error(
                "Không thể tải thống kê khách hàng: " +
                    (error.message || "Lỗi không xác định")
            );
        }
    };

    // Fetch branches
    const fetchBranches = async () => {
        try {
            const data = await getBranches();
            setBranches(data || []);
        } catch (error) {
            console.error("Error fetching branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        }
    };

    // Debug function to test status filtering
    const testStatusFilter = async (status) => {
        try {
            console.log(`Testing direct status filter with value: ${status}`);
            const response = await getCustomersByStatus(status);
            console.log(
                `Direct test result: Found ${response.total} customers with status "${status}"`
            );
        } catch (error) {
            console.error("Error testing status filter:", error);
        }
    };

    // For debugging - test both status values on component mount
    useEffect(() => {
        testStatusFilter(CUSTOMER_STATUS.ACTIVE);
        testStatusFilter(CUSTOMER_STATUS.BLOCKED);
    }, []);

    // Utility function to highlight search text
    const highlightText = (text, search) => {
        if (!search || !text) return text;

        const index = text.toLowerCase().indexOf(search.toLowerCase());
        if (index === -1) return text;

        return (
            <>
                {text.substring(0, index)}
                <span style={{ backgroundColor: "#ffc069", padding: "0 2px" }}>
                    {text.substring(index, index + search.length)}
                </span>
                {text.substring(index + search.length)}
            </>
        );
    };

    const columns = [
        {
            title: "Mã KH",
            dataIndex: "customer_code",
            key: "customer_code",
            width: 100,
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === "customer_code" && sortedInfo.order,
        },
        {
            title: "Họ tên",
            dataIndex: "name",
            key: "name",
            sorter: true,
            sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
            render: (text, record) => (
                <span className="customer-name">
                    {searchText ? highlightText(text, searchText) : text}
                </span>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 120,
            sorter: true,
            sortOrder: sortedInfo.columnKey === "phone" && sortedInfo.order,
            render: (text) =>
                searchText ? highlightText(text, searchText) : text,
        },
        {
            title: "Loại khách hàng",
            dataIndex: "type",
            key: "type",
            width: 150,
            sorter: true,
            sortOrder: sortedInfo.columnKey === "type" && sortedInfo.order,
            render: (type) => (
                <Tag color={TYPE_COLORS[type]}>
                    {type === CUSTOMER_TYPE.VIP ? "Khách VIP" : "Khách thường"}
                </Tag>
            ),
        },
        {
            title: "Số lần đặt",
            dataIndex: "totalBookings",
            key: "totalBookings",
            width: 120,
            align: "right",
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === "totalBookings" && sortedInfo.order,
        },
        {
            title: "Tổng chi tiêu",
            dataIndex: "totalSpent",
            key: "totalSpent",
            width: 150,
            align: "right",
            sorter: true,
            sortOrder:
                sortedInfo.columnKey === "totalSpent" && sortedInfo.order,
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            sorter: true,
            sortOrder: sortedInfo.columnKey === "status" && sortedInfo.order,
            render: (status) => {
                console.log(`Rendering status: ${status}`);
                return (
                    <Badge
                        status={
                            status === CUSTOMER_STATUS.ACTIVE
                                ? "success"
                                : "error"
                        }
                        text={
                            status === CUSTOMER_STATUS.ACTIVE
                                ? `Đang hoạt động (${status})`
                                : `Đã khóa (${status})`
                        }
                    />
                );
            },
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip
                        title={
                            record.status === CUSTOMER_STATUS.ACTIVE
                                ? "Khóa"
                                : "Mở khóa"
                        }
                    >
                        <Popconfirm
                            title={`${
                                record.status === CUSTOMER_STATUS.ACTIVE
                                    ? "Khóa"
                                    : "Mở khóa"
                            } khách hàng`}
                            description={`Bạn có chắc chắn muốn ${
                                record.status === CUSTOMER_STATUS.ACTIVE
                                    ? "khóa"
                                    : "mở khóa"
                            } khách hàng này?`}
                            onConfirm={() => handleToggleStatus(record)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button
                                danger={
                                    record.status === CUSTOMER_STATUS.ACTIVE
                                }
                                icon={
                                    record.status === CUSTOMER_STATUS.ACTIVE ? (
                                        <StopOutlined />
                                    ) : (
                                        <CheckCircleOutlined />
                                    )
                                }
                                size="small"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Handlers
    const handleToggleStatus = async (record) => {
        try {
            console.log(
                `Toggling status for customer: ${record.id}, current status: ${record.status}`
            );

            const updatedCustomer = await toggleCustomerStatus(record.id);

            message.success(
                `${
                    record.status === CUSTOMER_STATUS.ACTIVE
                        ? "Khóa"
                        : "Mở khóa"
                } khách hàng thành công`
            );

            // Update customer in local state
            setCustomers((prevCustomers) =>
                prevCustomers.map((customer) =>
                    customer.id === record.id
                        ? {
                              ...customer,
                              status:
                                  customer.status === CUSTOMER_STATUS.ACTIVE
                                      ? CUSTOMER_STATUS.BLOCKED
                                      : CUSTOMER_STATUS.ACTIVE,
                          }
                        : customer
                )
            );

            // Update statistics after status change
            fetchCustomerStats();
        } catch (error) {
            console.error("Error toggling customer status:", error);
            message.error(
                "Không thể thay đổi trạng thái khách hàng: " +
                    (error.message || "Lỗi không xác định")
            );
        }
    };

    const handleTableChange = (pagination, _, sorter) => {
        setSortedInfo(sorter);
        setPagination(pagination);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        debouncedSearch(value);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleFilterChange = (key, value) => {
        console.log(`Filter changed: ${key} = ${value}`);

        if (key === "status") {
            console.log(`Status filter changed to: ${value}`);
            // Ensure we're using the exact constant values
            if (
                value !== "all" &&
                value !== CUSTOMER_STATUS.ACTIVE &&
                value !== CUSTOMER_STATUS.BLOCKED
            ) {
                console.warn(`Warning: Unexpected status value: ${value}`);
            }
        }

        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleReset = () => {
        setSearchText("");
        setFilters({
            type: "all",
            status: "all",
            branchId: undefined,
        });
        setSortedInfo({});
        setPagination({
            ...pagination,
            current: 1,
        });
        fetchAllCustomers();
        message.success("Đã đặt lại tất cả bộ lọc");
    };

    // Add handlers
    const handleAdd = () => {
        setEditingCustomer(null);
        setIsModalVisible(true);
    };

    const handleEdit = async (record) => {
        try {
            setLoading(true);
            // Get the most up-to-date customer data before editing
            const customer = await getCustomerById(record.id);
            setEditingCustomer(customer);
            setIsModalVisible(true);
        } catch (error) {
            message.error(
                "Không thể tải thông tin khách hàng để chỉnh sửa: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (record) => {
        try {
            // Get the most up-to-date customer data
            const customer = await getCustomerById(record.id);
            setSelectedCustomer(customer);
            setIsDrawerVisible(true);
        } catch (error) {
            message.error(
                "Không thể tải thông tin khách hàng: " +
                    (error.message || "Lỗi không xác định")
            );
        }
    };

    const handleSubmit = async (values) => {
        try {
            // Update or create customer via API
            if (editingCustomer) {
                const updatedCustomer = await updateCustomer(
                    editingCustomer.id,
                    values
                );
                message.success("Cập nhật thông tin khách hàng thành công");

                // Update customer in local state
                setCustomers((prevCustomers) =>
                    prevCustomers.map((customer) =>
                        customer.id === editingCustomer.id
                            ? { ...customer, ...updatedCustomer }
                            : customer
                    )
                );
            } else {
                console.log("Đang gửi dữ liệu khách hàng mới:", values);
                const newCustomer = await createCustomer(values);
                console.log("Kết quả tạo khách hàng:", newCustomer);
                message.success("Thêm khách hàng mới thành công");

                // Add new customer to local state
                setCustomers((prevCustomers) => [
                    newCustomer,
                    ...prevCustomers,
                ]);
            }

            setIsModalVisible(false);
            // Refresh statistics
            fetchCustomerStats();
        } catch (error) {
            console.error("Lỗi chi tiết:", error);
            message.error(
                editingCustomer
                    ? `Không thể cập nhật khách hàng: ${
                          error.message || "Lỗi không xác định"
                      }`
                    : `Không thể thêm khách hàng mới: ${
                          error.message || "Lỗi không xác định"
                      }`
            );
        }
    };

    // Handle export modal
    const handleOpenExportModal = () => {
        setIsExportModalVisible(true);
    };

    return (
        <div style={{ padding: 24 }}>
            <style jsx="true">{`
                .customer-list-table .ant-table-thead > tr > th {
                    background-color: #f7f7f7;
                    color: #333;
                    font-weight: 600;
                }
                .customer-list-table
                    .ant-table-tbody
                    > tr.ant-table-row:hover
                    > td {
                    background-color: #e6f7ff;
                }
                .customer-list-table .customer-name {
                    font-weight: 500;
                }
                .filter-section {
                    margin-bottom: 16px;
                    border-radius: 8px;
                    padding: 16px;
                    background-color: #f9f9f9;
                    border: 1px solid #f0f0f0;
                }
                .filter-actions {
                    display: flex;
                    justify-content: flex-end;
                }
                .customer-stat-card {
                    border-radius: 8px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }
                .main-filters {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                .filter-item {
                    margin-right: 8px;
                    margin-bottom: 8px;
                }
                .export-button {
                    margin-left: 8px;
                }
                .filter-status {
                    margin-bottom: 16px;
                    padding: 8px 12px;
                    background-color: #f7f7f7;
                    border-radius: 4px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .filter-status-text {
                    font-size: 14px;
                }
                .filter-badge {
                    font-weight: bold;
                    margin: 0 4px;
                }
                .refresh-button {
                    margin-left: 8px;
                }
            `}</style>
            <Card>
                <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                >
                    {/* Header Section */}
                    <Row gutter={[16, 16]}>
                        <Col span={6}>
                            <Statistic
                                title="Tổng số khách hàng"
                                value={statistics.totalCustomers}
                                prefix={<UserAddOutlined />}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Khách VIP"
                                value={statistics.totalVipCustomers}
                                valueStyle={{
                                    color: TYPE_COLORS[CUSTOMER_TYPE.VIP],
                                }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Khách đang hoạt động"
                                value={statistics.totalActiveCustomers}
                                valueStyle={{
                                    color: STATUS_COLORS[
                                        CUSTOMER_STATUS.ACTIVE
                                    ],
                                }}
                            />
                        </Col>
                    </Row>

                    {/* Quick Filters */}
                    <div className="filter-section">
                        <Row gutter={[16, 16]} align="middle">
                            <Col flex="auto">
                                <div className="main-filters">
                                    <div className="filter-item">
                                        <Input.Search
                                            placeholder="Tìm kiếm theo tên, SĐT, CCCD"
                                            value={searchText}
                                            onChange={handleSearchChange}
                                            onSearch={handleSearch}
                                            style={{ width: 300 }}
                                            allowClear
                                        />
                                    </div>
                                    <div className="filter-item">
                                        <Select
                                            value={filters.type}
                                            onChange={(value) => {
                                                console.log(
                                                    `Type selected from dropdown: ${value}`
                                                );
                                                handleFilterChange(
                                                    "type",
                                                    value
                                                );
                                            }}
                                            style={{ width: 150 }}
                                        >
                                            <Select.Option value="all">
                                                Tất cả loại
                                            </Select.Option>
                                            <Select.Option
                                                value={CUSTOMER_TYPE.NORMAL}
                                            >
                                                Khách thường
                                            </Select.Option>
                                            <Select.Option
                                                value={CUSTOMER_TYPE.VIP}
                                            >
                                                Khách VIP
                                            </Select.Option>
                                        </Select>
                                    </div>
                                    <div className="filter-item">
                                        <Select
                                            value={filters.status}
                                            onChange={(value) => {
                                                console.log(
                                                    `Status selected from dropdown: ${value}`
                                                );
                                                handleFilterChange(
                                                    "status",
                                                    value
                                                );
                                            }}
                                            style={{ width: 180 }}
                                        >
                                            <Select.Option value="all">
                                                Tất cả trạng thái
                                            </Select.Option>
                                            <Select.Option
                                                value={CUSTOMER_STATUS.ACTIVE}
                                            >
                                                Đang hoạt động (
                                                {CUSTOMER_STATUS.ACTIVE})
                                            </Select.Option>
                                            <Select.Option
                                                value={CUSTOMER_STATUS.BLOCKED}
                                            >
                                                Đã khóa (
                                                {CUSTOMER_STATUS.BLOCKED})
                                            </Select.Option>
                                        </Select>
                                    </div>
                                    <div className="filter-item">
                                        <Select
                                            value={filters.branchId}
                                            onChange={(value) => {
                                                console.log(
                                                    `Branch selected from dropdown: ${value}`
                                                );
                                                handleFilterChange(
                                                    "branchId",
                                                    value
                                                );
                                            }}
                                            style={{ width: 180 }}
                                            allowClear
                                            placeholder="Chọn chi nhánh"
                                        >
                                            {branches.map((branch) => (
                                                <Select.Option
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="filter-item">
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={handleReset}
                                        >
                                            Đặt lại
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                            <Col>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<UserAddOutlined />}
                                        onClick={handleAdd}
                                    >
                                        Thêm khách hàng
                                    </Button>
                                    <Button
                                        className="export-button"
                                        icon={<DownloadOutlined />}
                                        onClick={handleOpenExportModal}
                                    >
                                        Xuất Excel
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                    </div>

                    {/* Filter Status Bar */}
                    <div className="filter-status">
                        <div className="filter-status-text">
                            {filteredCustomers.length === customers.length ? (
                                <span>
                                    Hiển thị tất cả{" "}
                                    <span className="filter-badge">
                                        {customers.length}
                                    </span>{" "}
                                    khách hàng
                                </span>
                            ) : (
                                <span>
                                    Tìm thấy{" "}
                                    <span className="filter-badge">
                                        {filteredCustomers.length}
                                    </span>{" "}
                                    khách hàng trên tổng số{" "}
                                    <span className="filter-badge">
                                        {customers.length}
                                    </span>
                                    {(searchText ||
                                        filters.type !== "all" ||
                                        filters.status !== "all" ||
                                        filters.branchId) && (
                                        <span>
                                            {" "}
                                            (Đang lọc theo các tiêu chí đã chọn)
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                        <Space>
                            {(searchText ||
                                filters.type !== "all" ||
                                filters.status !== "all" ||
                                filters.branchId) && (
                                <Button
                                    size="small"
                                    icon={<ReloadOutlined />}
                                    onClick={handleReset}
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                            <Button
                                className="refresh-button"
                                size="small"
                                icon={<ReloadOutlined />}
                                onClick={fetchAllCustomers}
                                disabled={loading}
                            >
                                Làm mới dữ liệu
                            </Button>
                        </Space>
                    </div>

                    {/* Table Section */}
                    <Table
                        columns={columns}
                        dataSource={paginatedCustomers}
                        rowKey="id"
                        pagination={{
                            ...pagination,
                            showTotal: (total) => `Tổng ${total} khách hàng`,
                        }}
                        onChange={handleTableChange}
                        loading={loading}
                        bordered
                        size="middle"
                        scroll={{ x: "max-content" }}
                    />
                </Space>
            </Card>

            <CustomerForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingCustomer={editingCustomer}
                CUSTOMER_TYPE={CUSTOMER_TYPE}
            />

            <CustomerDetail
                open={isDrawerVisible}
                onClose={() => setIsDrawerVisible(false)}
                customerData={selectedCustomer}
                TYPE_COLORS={TYPE_COLORS}
                STATUS_COLORS={STATUS_COLORS}
                CUSTOMER_TYPE={CUSTOMER_TYPE}
                CUSTOMER_STATUS={CUSTOMER_STATUS}
            />

            <CustomerExportModal
                open={isExportModalVisible}
                onCancel={() => setIsExportModalVisible(false)}
                data={customers}
                branches={branches}
                customerTypes={CUSTOMER_TYPE}
                customerStatuses={CUSTOMER_STATUS}
            />
        </div>
    );
}
