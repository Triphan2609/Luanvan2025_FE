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
    Dropdown,
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
    UploadOutlined,
    MoreOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { debounce } from "lodash";
import * as XLSX from "xlsx";
import CustomerForm from "./Modals/CustomerForm";
import CustomerDetail from "./Drawer/CustomerDetail";
import CustomerExportModal from "./Modals/CustomerExportModal";
import CustomerImportModal from "./Modals/CustomerImportModal";
import BatchActionsModal from "./Modals/BatchActionsModal";
import {
    getCustomers,
    getCustomerStats,
    toggleCustomerStatus,
    getCustomerById,
    createCustomer,
    updateCustomer,
    getCustomersByStatus,
    importCustomers,
    batchToggleStatus,
    batchUpdateType,
    batchDeleteCustomers,
    batchAssignBranch,
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
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    // Thêm state mới để quản lý thao tác hàng loạt
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);

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

            const response = await getCustomers(params);

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
    useEffect(() => {}, [searchText, filters]);

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
            title: "Chi nhánh",
            dataIndex: "branchId",
            key: "branch",
            width: 150,
            render: (branchId, record) => {
                // Trường hợp branch là object và có name
                if (
                    record.branch &&
                    typeof record.branch === "object" &&
                    record.branch.name
                ) {
                    return record.branch.name;
                }

                // Trường hợp có branchId, tìm tên chi nhánh từ danh sách branches
                if (branchId) {
                    const branch = branches.find(
                        (b) => String(b.id) === String(branchId)
                    );
                    if (branch) {
                        return branch.name;
                    }
                    return `Chi nhánh ${branchId}`;
                }

                return "Không có chi nhánh";
            },
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
            fixed: "right",
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

    // Cấu hình rowSelection cho Table
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedKeys, selectedRows) => {
            setSelectedRowKeys(selectedKeys);
            setSelectedRows(selectedRows);
        },
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            {
                key: "select-active",
                text: "Chọn tất cả khách hàng đang hoạt động",
                onSelect: () => {
                    const keys = filteredCustomers
                        .filter(
                            (customer) =>
                                customer.status === CUSTOMER_STATUS.ACTIVE
                        )
                        .map((item) => item.id);
                    setSelectedRowKeys(keys);
                    setSelectedRows(
                        filteredCustomers.filter((item) =>
                            keys.includes(item.id)
                        )
                    );
                },
            },
            {
                key: "select-blocked",
                text: "Chọn tất cả khách hàng đã khóa",
                onSelect: () => {
                    const keys = filteredCustomers
                        .filter(
                            (customer) =>
                                customer.status === CUSTOMER_STATUS.BLOCKED
                        )
                        .map((item) => item.id);
                    setSelectedRowKeys(keys);
                    setSelectedRows(
                        filteredCustomers.filter((item) =>
                            keys.includes(item.id)
                        )
                    );
                },
            },
            {
                key: "select-vip",
                text: "Chọn tất cả khách hàng VIP",
                onSelect: () => {
                    const keys = filteredCustomers
                        .filter(
                            (customer) => customer.type === CUSTOMER_TYPE.VIP
                        )
                        .map((item) => item.id);
                    setSelectedRowKeys(keys);
                    setSelectedRows(
                        filteredCustomers.filter((item) =>
                            keys.includes(item.id)
                        )
                    );
                },
            },
            {
                key: "select-normal",
                text: "Chọn tất cả khách hàng thường",
                onSelect: () => {
                    const keys = filteredCustomers
                        .filter(
                            (customer) => customer.type === CUSTOMER_TYPE.NORMAL
                        )
                        .map((item) => item.id);
                    setSelectedRowKeys(keys);
                    setSelectedRows(
                        filteredCustomers.filter((item) =>
                            keys.includes(item.id)
                        )
                    );
                },
            },
        ],
    };

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
                const newCustomer = await createCustomer(values);

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

    // Handle import modal
    const handleImport = async (data) => {
        try {
            // Chuyển đổi dữ liệu từ Excel sang định dạng API
            const customersToImport = data.map((item) => ({
                name: item["Họ và tên"],
                phone: item["Số điện thoại"],
                email: item["Email"],
                idNumber: item["CCCD/Passport"],
                birthday: item["Ngày sinh (YYYY-MM-DD)"],
                address: item["Địa chỉ"],
                type: item["Loại khách hàng"],
                branchId: item["Chi nhánh ID"]
                    ? parseInt(item["Chi nhánh ID"])
                    : undefined,
                note: item["Ghi chú"],
                gender: item["Giới tính"],
            }));

            // Validate dữ liệu trước khi gửi
            if (!customersToImport.length) {
                message.error("Không có dữ liệu khách hàng để import!");
                return;
            }

            // Kiểm tra trường bắt buộc
            const invalidRecords = customersToImport.filter(
                (customer, index) => {
                    const errors = [];

                    // Kiểm tra các trường bắt buộc
                    if (!customer.name) errors.push("Họ tên");
                    if (!customer.phone) errors.push("Số điện thoại");
                    if (!customer.idNumber) errors.push("CCCD/Passport");
                    if (!customer.type) errors.push("Loại khách hàng");

                    // Kiểm tra giá trị loại khách hàng
                    if (
                        customer.type &&
                        !["normal", "vip"].includes(customer.type)
                    ) {
                        errors.push(
                            `Loại khách hàng '${customer.type}' không hợp lệ (phải là 'normal' hoặc 'vip')`
                        );
                    }

                    // Kiểm tra giá trị giới tính
                    if (
                        customer.gender &&
                        !["male", "female", "other"].includes(customer.gender)
                    ) {
                        errors.push(
                            `Giới tính '${customer.gender}' không hợp lệ (phải là 'male', 'female' hoặc 'other')`
                        );
                    }

                    if (errors.length > 0) {
                        message.error(
                            `Dòng ${index + 2} (${
                                customer.name || "Không có tên"
                            }): ${errors.join(", ")}`
                        );
                        return true;
                    }
                    return false;
                }
            );

            if (invalidRecords.length > 0) {
                message.error(
                    `Có ${invalidRecords.length} dòng dữ liệu không hợp lệ. Vui lòng kiểm tra lại!`
                );
                return;
            }

            // Gửi dữ liệu lên server
            const result = await importCustomers(customersToImport);
            message.success(`Import thành công ${result.imported} khách hàng!`);

            // Refresh danh sách khách hàng
            fetchAllCustomers();
            fetchCustomerStats();
        } catch (error) {
            console.error("Lỗi khi import:", error);

            // Hiển thị thông báo lỗi chi tiết
            if (
                error.importResults &&
                error.importResults.errors &&
                error.importResults.errors.length > 0
            ) {
                const errorDetails = error.importResults.errors
                    .map(
                        (e) =>
                            `- ${e.customer.name || "Không có tên"} (${
                                e.customer.phone || "Không có SĐT"
                            }): ${e.error}`
                    )
                    .join("\n");

                message.error(
                    <div>
                        <p>Import không hoàn tất. Chi tiết lỗi:</p>
                        <pre style={{ maxHeight: "200px", overflow: "auto" }}>
                            {errorDetails}
                        </pre>
                    </div>
                );
            } else {
                message.error(
                    "Không thể import danh sách khách hàng: " +
                        (error.message || "Lỗi không xác định")
                );
            }
        }
    };

    // Thêm xử lý thao tác hàng loạt
    const handleBatchActionClick = () => {
        if (selectedRowKeys.length === 0) {
            message.warning(
                "Vui lòng chọn ít nhất một khách hàng để thực hiện thao tác hàng loạt"
            );
            return;
        }
        setIsBatchModalVisible(true);
    };

    const handleBatchToggleStatus = async (ids, status) => {
        setLoading(true);
        try {
            await batchToggleStatus(ids, status);
            message.success(
                `Đã cập nhật trạng thái của ${ids.length} khách hàng thành ${
                    status === CUSTOMER_STATUS.ACTIVE ? "kích hoạt" : "khóa"
                }`
            );

            // Cập nhật state của khách hàng đã thay đổi
            setCustomers((prevCustomers) =>
                prevCustomers.map((customer) =>
                    ids.includes(customer.id)
                        ? { ...customer, status }
                        : customer
                )
            );

            // Làm mới thống kê
            fetchCustomerStats();

            // Xóa chọn
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            console.error("Error in batch toggle status:", error);
            message.error(
                "Không thể cập nhật trạng thái hàng loạt: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBatchUpdateType = async (ids, type) => {
        setLoading(true);
        try {
            await batchUpdateType(ids, type);
            message.success(
                `Đã cập nhật loại của ${ids.length} khách hàng thành ${
                    type === CUSTOMER_TYPE.VIP ? "VIP" : "thường"
                }`
            );

            // Cập nhật state của khách hàng đã thay đổi
            setCustomers((prevCustomers) =>
                prevCustomers.map((customer) =>
                    ids.includes(customer.id) ? { ...customer, type } : customer
                )
            );

            // Làm mới thống kê
            fetchCustomerStats();

            // Xóa chọn
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            console.error("Error in batch update type:", error);
            message.error(
                "Không thể cập nhật loại khách hàng hàng loạt: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBatchDelete = async (ids) => {
        setLoading(true);
        try {
            await batchDeleteCustomers(ids);
            message.success(`Đã xóa ${ids.length} khách hàng thành công`);

            // Xóa các khách hàng đã chọn khỏi state
            setCustomers((prevCustomers) =>
                prevCustomers.filter((customer) => !ids.includes(customer.id))
            );

            // Làm mới thống kê
            fetchCustomerStats();

            // Xóa chọn
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            console.error("Error in batch delete:", error);
            message.error(
                "Không thể xóa khách hàng hàng loạt: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleBatchAssignBranch = async (ids, branchId) => {
        setLoading(true);
        try {
            await batchAssignBranch(ids, branchId);

            // Tìm tên chi nhánh để hiển thị trong thông báo
            const branchName =
                branches.find((b) => b.id === branchId)?.name || branchId;

            message.success(
                `Đã gán ${ids.length} khách hàng vào chi nhánh ${branchName}`
            );

            // Cập nhật state của khách hàng đã thay đổi
            setCustomers((prevCustomers) =>
                prevCustomers.map((customer) =>
                    ids.includes(customer.id)
                        ? { ...customer, branchId }
                        : customer
                )
            );

            // Xóa chọn
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            console.error("Error in batch assign branch:", error);
            message.error(
                "Không thể gán chi nhánh hàng loạt: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
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
                .batch-action-button {
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
                                            style={{ width: 600 }}
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
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        onClick={() =>
                                            setIsImportModalVisible(true)
                                        }
                                    >
                                        Import khách hàng
                                    </Button>
                                    <Button
                                        className="export-button"
                                        icon={<DownloadOutlined />}
                                        onClick={handleOpenExportModal}
                                    >
                                        Xuất Excel
                                    </Button>
                                    {selectedRowKeys.length > 0 && (
                                        <Button
                                            type="primary"
                                            className="batch-action-button"
                                            icon={<SettingOutlined />}
                                            onClick={handleBatchActionClick}
                                        >
                                            Thao tác hàng loạt (
                                            {selectedRowKeys.length})
                                        </Button>
                                    )}
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
                            {selectedRowKeys.length > 0 && (
                                <Button
                                    size="small"
                                    type="primary"
                                    onClick={handleBatchActionClick}
                                >
                                    Thao tác với {selectedRowKeys.length} khách
                                    hàng đã chọn
                                </Button>
                            )}
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
                        rowSelection={rowSelection}
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

            <CustomerImportModal
                open={isImportModalVisible}
                onCancel={() => setIsImportModalVisible(false)}
                onImport={handleImport}
                branches={branches}
            />

            <BatchActionsModal
                open={isBatchModalVisible}
                onCancel={() => setIsBatchModalVisible(false)}
                selectedCustomers={selectedRows}
                onToggleStatus={handleBatchToggleStatus}
                onUpdateType={handleBatchUpdateType}
                onDelete={handleBatchDelete}
                onAssignBranch={handleBatchAssignBranch}
                branches={branches}
                CUSTOMER_TYPE={CUSTOMER_TYPE}
                CUSTOMER_STATUS={CUSTOMER_STATUS}
            />
        </div>
    );
}
