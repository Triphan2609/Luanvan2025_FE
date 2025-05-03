import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Card,
    Space,
    Popconfirm,
    Tag,
    message,
    Drawer,
    Form,
    Input,
    Select,
    Row,
    Col,
    Typography,
    Tabs,
    Badge,
    Spin,
    Tooltip,
    Statistic,
    Modal,
    Descriptions,
    Divider,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    DollarOutlined,
    BankOutlined,
    UserOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    UnorderedListOutlined,
    SettingOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import {
    getSalaryConfigs,
    createSalaryConfig,
    updateSalaryConfig,
    updateSalaryConfigStatus,
    deleteSalaryConfig,
    getSalaryTypes,
    getSalaryConfigById,
} from "../../../../api/salaryApi";
import { getDepartments } from "../../../../api/departmentsApi";
import { getRoles } from "../../../../api/rolesEmployeeApi";
import SalaryConfigForm from "./SalaryConfigForm";
import "./styles.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SalaryConfigPage = () => {
    const [form] = Form.useForm();
    const [salaryConfigs, setSalaryConfigs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [activeTab, setActiveTab] = useState("monthly");
    const [departmentFilter, setDepartmentFilter] = useState(null);
    const [roleFilter, setRoleFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [drawerWidth, setDrawerWidth] = useState(700);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        byType: {},
        byDepartment: {},
    });
    const [salaryTypes, setSalaryTypes] = useState({
        types: ["monthly", "hourly", "shift"],
        labels: {
            monthly: "Lương tháng",
            hourly: "Lương giờ",
            shift: "Lương ca",
        },
    });
    const [viewingConfig, setViewingConfig] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Fetch salary configurations
    const fetchSalaryConfigs = async (filters = {}) => {
        setLoading(true);
        try {
            // Xây dựng filter params
            const queryParams = { ...filters };

            // Xử lý trường hợp đặc biệt cho trạng thái
            if (statusFilter !== null && statusFilter !== undefined) {
                queryParams.is_active = statusFilter;
            }

            // Xử lý trường hợp đặc biệt cho loại lương
            if (activeTab !== "all" && !queryParams.salary_type) {
                queryParams.salary_type = activeTab;
            }

            // Xử lý tìm kiếm
            if (searchText && !queryParams.search) {
                queryParams.search = searchText.trim();
            }

            console.log("Fetching with params:", queryParams);
            const configs = await getSalaryConfigs(queryParams);

            setSalaryConfigs(configs);
            calculateStats(configs);

            // Hiển thị thông báo kết quả tìm kiếm khi có áp dụng bộ lọc
            const hasFilters = Object.keys(queryParams).length > 0;
            if (hasFilters) {
                if (configs.length === 0) {
                    message.info(
                        "Không tìm thấy cấu hình lương nào phù hợp với bộ lọc"
                    );
                } else {
                    message.success(
                        `Đã tìm thấy ${configs.length} cấu hình lương`
                    );
                }
            }
        } catch (error) {
            console.error("Error fetching salary configs:", error);
            message.error(
                "Không thể tải cấu hình lương. Vui lòng thử lại sau."
            );
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats from configs
    const calculateStats = (configs) => {
        const total = configs.length;
        const active = configs.filter((c) => c.is_active).length;
        const inactive = total - active;

        // Count by type
        const byType = {};
        salaryTypes.types.forEach((type) => {
            byType[type] = configs.filter((c) => c.salary_type === type).length;
        });

        // Count by department
        const byDepartment = {};
        configs.forEach((config) => {
            const deptName = config.department?.name || "Không xác định";
            byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;
        });

        setStats({
            total,
            active,
            inactive,
            byType,
            byDepartment,
        });
    };

    // Fetch departments, roles, and salary types
    const fetchDepartmentsAndRoles = async () => {
        setLoading(true);

        // Fetch departments
        try {
            const deptsResponse = await getDepartments();
            setDepartments(deptsResponse);
        } catch (error) {
            message.error(
                "Không thể tải dữ liệu phòng ban. Vui lòng thử lại sau."
            );
        }

        // Fetch ALL roles - these will be filtered by department client-side
        try {
            const rolesResponse = await getRoles();
            setRoles(rolesResponse);
        } catch (error) {
            message.error(
                "Không thể tải dữ liệu chức vụ. Vui lòng thử lại sau."
            );
        }

        // Fetch salary types but use default values if API fails
        try {
            const typesResponse = await getSalaryTypes();
            // Set salary types if API returns valid data
            if (
                typesResponse &&
                typesResponse.types &&
                typesResponse.types.length > 0
            ) {
                setSalaryTypes(typesResponse);
            }
            // If API returns invalid data, we'll keep using the default values
        } catch (error) {
            // Sử dụng giá trị mặc định khi API lỗi
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchDepartmentsAndRoles();
    }, []);

    useEffect(() => {
        const filters = {};
        if (departmentFilter) filters.department_id = departmentFilter;
        if (roleFilter) filters.role_id = roleFilter;
        if (statusFilter !== null) filters.is_active = statusFilter;
        if (activeTab !== "all") filters.salary_type = activeTab;
        if (searchText) filters.search = searchText;

        fetchSalaryConfigs(filters);
    }, [departmentFilter, roleFilter, statusFilter, activeTab, searchText]);

    // Adjust drawer width based on screen size
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDrawerWidth(width * 0.95);
            } else if (width < 1200) {
                setDrawerWidth(width * 0.7);
            } else {
                setDrawerWidth(800);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handle form submission
    const handleSubmit = async (values) => {
        console.log("Form submitted with values:", values);
        setSubmitting(true);
        try {
            // Ensure salary_type is properly set
            if (!values.salary_type) {
                values.salary_type = activeTab;
            }

            // Validate form based on salary type
            if (values.salary_type === "hourly" && !values.hourly_rate) {
                message.error("Vui lòng nhập mức lương giờ cho loại lương giờ");
                setSubmitting(false);
                return;
            }

            if (values.salary_type === "shift" && !values.shift_rate) {
                message.error("Vui lòng nhập mức lương ca cho loại lương ca");
                setSubmitting(false);
                return;
            }

            if (editingConfig) {
                // Update existing config
                await updateSalaryConfig(editingConfig.id, values);
                message.success("Cập nhật cấu hình lương thành công!");
            } else {
                // Create new config
                const result = await createSalaryConfig(values);
                message.success("Tạo mới cấu hình lương thành công!");
            }
            setDrawerVisible(false);
            form.resetFields();
            fetchSalaryConfigs();
        } catch (error) {
            console.error("Error in form submission:", error);
            // Hiển thị thông báo lỗi chi tiết hơn
            if (error.response?.data?.message) {
                message.error(`Lỗi: ${error.response.data.message}`);
            } else {
                message.error(
                    editingConfig
                        ? "Không thể cập nhật cấu hình lương. Vui lòng thử lại."
                        : "Không thể tạo cấu hình lương. Vui lòng thử lại."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Function to normalize salary type value
    const normalizeSalaryType = (typeValue) => {
        if (!typeValue) return "monthly"; // Default type

        // Convert to lowercase string
        const normalizedType = String(typeValue).toLowerCase().trim();

        // Check if it's a valid type
        const validTypes = ["monthly", "hourly", "shift"];
        if (validTypes.includes(normalizedType)) {
            return normalizedType;
        }

        // Map potential values to valid types
        const typeMapping = {
            monthly: "monthly",
            month: "monthly",
            tháng: "monthly",
            hourly: "hourly",
            hour: "hourly",
            giờ: "hourly",
            shift: "shift",
            ca: "shift",
        };

        // Return mapped value or default
        return typeMapping[normalizedType] || "monthly";
    };

    // Handle showing the form drawer
    const showDrawer = async (config = null) => {
        // Clear previous state first
        form.resetFields();
        setSelectedDepartment(null);
        setSelectedRole(null);
        setEditingConfig(null);

        // Set drawer visible first so form can mount
        setDrawerVisible(true);

        // Short timeout to ensure drawer is open and form is mounted
        setTimeout(() => {
            if (config) {
                // Normalize salary_type
                const normalizedType = normalizeSalaryType(config.salary_type);

                // Ensure department_id and role_id are numbers
                const departmentId = parseInt(config.department_id, 10);
                const roleId = parseInt(config.role_id, 10);

                // Set edit config
                setEditingConfig(config);

                // Set active tab
                setActiveTab(normalizedType);

                // Set the department ID first to trigger role filtering
                setSelectedDepartment(departmentId);

                // Set the role after a short delay to ensure department is set
                setTimeout(() => {
                    // Set all form values
                    form.setFieldsValue({
                        department_id: departmentId,
                        role_id: roleId,
                        salary_type: normalizedType,
                        base_salary: config.base_salary,
                        hourly_rate: config.hourly_rate,
                        shift_rate: config.shift_rate,
                        overtime_multiplier: config.overtime_multiplier,
                        night_shift_multiplier: config.night_shift_multiplier,
                        holiday_multiplier: config.holiday_multiplier,
                        meal_allowance: config.meal_allowance,
                        transport_allowance: config.transport_allowance,
                        housing_allowance: config.housing_allowance,
                        position_allowance: config.position_allowance,
                        attendance_bonus: config.attendance_bonus,
                        tax_rate: config.tax_rate,
                        insurance_rate: config.insurance_rate,
                        standard_hours_per_day:
                            config.standard_hours_per_day || 8,
                        standard_days_per_month:
                            config.standard_days_per_month || 22,
                        is_active: config.is_active,
                        description: config.description,
                    });

                    // Set the role after form values are set
                    setSelectedRole(roleId);
                }, 300); // Shorter delay as we don't need to fetch roles from API
            } else {
                // Set default values for new config
                form.setFieldsValue({
                    salary_type: activeTab,
                    overtime_multiplier: 1.5,
                    night_shift_multiplier: 1.3,
                    holiday_multiplier: 2.0,
                    tax_rate: 0.1,
                    insurance_rate: 0.105,
                    standard_hours_per_day: 8,
                    standard_days_per_month: 22,
                    is_active: true,
                });
            }
        }, 100);
    };

    // Handle status change
    const handleStatusChange = async (id, isActive) => {
        try {
            setLoading(true);

            // Lấy thông tin cấu hình lương hiện tại để hiển thị thông báo
            const config = await getSalaryConfigById(id);
            const deptName = config.department?.name || "Phòng ban";
            const roleName = config.role?.name || "Chức vụ";

            const updatedConfig = await updateSalaryConfigStatus(id, isActive);

            message.success(
                <div>
                    <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
                        {isActive
                            ? "Kích hoạt cấu hình lương thành công!"
                            : "Khóa cấu hình lương thành công!"}
                    </div>
                    <div>
                        Đã {isActive ? "kích hoạt" : "khóa"} cấu hình lương cho:
                        <Tag color="blue" style={{ margin: "0 4px" }}>
                            {roleName}
                        </Tag>
                        tại
                        <Tag color="green" style={{ margin: "0 4px" }}>
                            {deptName}
                        </Tag>
                    </div>
                </div>,
                5 // Hiển thị thông báo lâu hơn
            );

            fetchSalaryConfigs();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            console.error("Chi tiết lỗi:", error.response?.data);
            message.error(
                "Không thể cập nhật trạng thái cấu hình lương. Vui lòng thử lại sau."
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await deleteSalaryConfig(id);
            message.success("Xóa cấu hình lương thành công!");
            fetchSalaryConfigs();
        } catch (error) {
            message.error("Không thể xóa cấu hình lương.");
        }
    };

    // Handle showing the details modal
    const showDetailsModal = async (id) => {
        try {
            setLoading(true);
            const config = await getSalaryConfigById(id);
            setViewingConfig(config);
            setDetailModalVisible(true);
        } catch (error) {
            message.error("Không thể tải thông tin chi tiết cấu hình lương.");
        } finally {
            setLoading(false);
        }
    };

    // Format currency for display
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    // Format percentage for display
    const formatPercentage = (value) => {
        if (value === null || value === undefined) return "N/A";
        return `${(value * 100).toFixed(2)}%`;
    };

    // Reset filters
    const resetFilters = () => {
        setDepartmentFilter(null);
        setRoleFilter(null);
        setStatusFilter(null);
        setActiveTab("monthly");
        setSearchText("");
        // Gọi API để lấy tất cả dữ liệu
        fetchSalaryConfigs({});
    };

    // Table columns definition
    const columns = [
        {
            title: "Phòng ban",
            dataIndex: "department",
            key: "department",
            render: (_, record) =>
                record.department?.name || "Không có phòng ban",
            sorter: (a, b) => {
                const nameA = a.department?.name || "";
                const nameB = b.department?.name || "";
                return nameA.localeCompare(nameB, "vi");
            },
            sortDirections: ["ascend", "descend"],
            width: 180,
        },
        {
            title: "Chức vụ",
            dataIndex: "role",
            key: "role",
            render: (_, record) => record.role?.name || "Không có chức vụ",
            sorter: (a, b) => {
                const nameA = a.role?.name || "";
                const nameB = b.role?.name || "";
                return nameA.localeCompare(nameB, "vi");
            },
            sortDirections: ["ascend", "descend"],
            width: 180,
        },
        {
            title: "Loại lương",
            dataIndex: "salary_type",
            key: "salary_type",
            render: (type) => {
                const salaryTypeColors = {
                    monthly: "blue",
                    hourly: "green",
                    shift: "orange",
                };

                // Đảm bảo type là string
                const typeString = String(type || "").toLowerCase();

                return (
                    <Tag color={salaryTypeColors[typeString] || "default"}>
                        {(salaryTypes.labels &&
                            salaryTypes.labels[typeString]) ||
                            typeString ||
                            "Không xác định"}
                    </Tag>
                );
            },
            sorter: (a, b) => {
                // Sắp xếp theo giá trị enum của loại lương
                const typeOrder = { monthly: 1, hourly: 2, shift: 3 };
                const typeA = String(a.salary_type || "").toLowerCase();
                const typeB = String(b.salary_type || "").toLowerCase();
                return (typeOrder[typeA] || 999) - (typeOrder[typeB] || 999);
            },
            sortDirections: ["ascend", "descend"],
            width: 140,
        },

        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (isActive, record) => {
                const statusColors = {
                    active: { color: "#52c41a", text: "Đang sử dụng" },
                    inactive: { color: "#ff4d4f", text: "Đã khóa" },
                };
                return (
                    <Tooltip
                        title={`Nhấn để ${
                            isActive ? "khóa" : "kích hoạt"
                        } cấu hình lương này`}
                        placement="topRight"
                    >
                        <Tag
                            color={
                                isActive
                                    ? statusColors.active.color
                                    : statusColors.inactive.color
                            }
                            style={{
                                cursor: "pointer",
                                fontSize: "14px",
                                padding: "2px 10px",
                                borderRadius: "4px",
                            }}
                            icon={
                                isActive ? (
                                    <CheckCircleOutlined />
                                ) : (
                                    <CloseCircleOutlined />
                                )
                            }
                            onClick={() => {
                                Modal.confirm({
                                    title: isActive
                                        ? "Khóa cấu hình lương"
                                        : "Kích hoạt cấu hình lương",
                                    icon: isActive ? (
                                        <CloseCircleOutlined
                                            style={{
                                                color: statusColors.inactive
                                                    .color,
                                            }}
                                        />
                                    ) : (
                                        <CheckCircleOutlined
                                            style={{
                                                color: statusColors.active
                                                    .color,
                                            }}
                                        />
                                    ),
                                    content: isActive
                                        ? `Bạn có chắc chắn muốn khóa cấu hình lương cho ${
                                              record.role?.name || "chức vụ này"
                                          } ở ${
                                              record.department?.name ||
                                              "phòng ban này"
                                          }?`
                                        : `Bạn có chắc chắn muốn kích hoạt cấu hình lương cho ${
                                              record.role?.name || "chức vụ này"
                                          } ở ${
                                              record.department?.name ||
                                              "phòng ban này"
                                          }?`,
                                    okText: "Xác nhận",
                                    cancelText: "Hủy",
                                    okButtonProps: {
                                        danger: isActive,
                                        type: isActive ? "primary" : "primary",
                                    },
                                    onOk: () =>
                                        handleStatusChange(
                                            record.id,
                                            !isActive
                                        ),
                                });
                            }}
                        >
                            {isActive
                                ? statusColors.active.text
                                : statusColors.inactive.text}
                        </Tag>
                    </Tooltip>
                );
            },
            sorter: (a, b) => {
                // Sort active status with true (active) first
                return (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
            },
            width: 160,
            align: "center",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="default"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => showDetailsModal(record.id)}
                        title="Xem chi tiết"
                    />
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => showDrawer(record)}
                        title="Chỉnh sửa"
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa cấu hình lương này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            title="Xóa"
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 170,
            fixed: "right",
        },
    ];

    // Filter controls component
    const FilterControls = () => (
        <>
            <Row gutter={[16, 16]} className="filter-row" align="middle">
                <Col xs={24} sm={12} lg={6}>
                    <Select
                        placeholder="Lọc theo phòng ban"
                        allowClear
                        showSearch
                        style={{ width: "100%" }}
                        value={departmentFilter}
                        onChange={(value) => setDepartmentFilter(value)}
                        options={departments.map((dept) => ({
                            value: dept.id,
                            label: dept.name,
                        }))}
                        filterOption={(input, option) =>
                            (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Select
                        placeholder="Lọc theo chức vụ"
                        allowClear
                        showSearch
                        style={{ width: "100%" }}
                        value={roleFilter}
                        onChange={(value) => setRoleFilter(value)}
                        options={roles.map((role) => ({
                            value: role.id,
                            label: role.name,
                        }))}
                        filterOption={(input, option) =>
                            (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                        }
                        disabled={!departmentFilter && roles.length > 30}
                        loading={loading}
                    />
                    {!departmentFilter && roles.length > 30 && (
                        <Text
                            type="secondary"
                            style={{ fontSize: "12px", display: "block" }}
                        >
                            Vui lòng chọn phòng ban trước để lọc chức vụ
                        </Text>
                    )}
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Select
                        placeholder="Loại lương"
                        allowClear
                        style={{ width: "100%" }}
                        value={activeTab !== "all" ? activeTab : undefined}
                        onChange={(value) => setActiveTab(value || "all")}
                        options={[
                            ...salaryTypes.types.map((type) => ({
                                value: type,
                                label: salaryTypes.labels[type] || type,
                            })),
                            { value: "all", label: "Tất cả loại lương" },
                        ]}
                    />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        style={{ width: "100%" }}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value)}
                        options={[
                            { value: true, label: "Đang sử dụng" },
                            { value: false, label: "Đã khóa" },
                        ]}
                    />
                </Col>
                <Col xs={24} lg={4}>
                    <Input.Search
                        placeholder="Tìm kiếm..."
                        allowClear
                        enterButton
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={(value) => {
                            setSearchText(value);
                            // Thực hiện tìm kiếm ngay khi người dùng nhấn Enter hoặc nút tìm kiếm
                            const filters = {};
                            if (departmentFilter)
                                filters.department_id = departmentFilter;
                            if (roleFilter) filters.role_id = roleFilter;
                            if (statusFilter !== null)
                                filters.is_active = statusFilter;
                            if (activeTab !== "all")
                                filters.salary_type = activeTab;
                            filters.search = value;
                            fetchSalaryConfigs(filters);
                        }}
                    />
                </Col>
            </Row>
            <Row justify="end" style={{ marginTop: 16 }}>
                <Space>
                    <Button
                        icon={<SearchOutlined />}
                        onClick={() => {
                            const filters = {};
                            if (departmentFilter)
                                filters.department_id = departmentFilter;
                            if (roleFilter) filters.role_id = roleFilter;
                            if (statusFilter !== null)
                                filters.is_active = statusFilter;
                            if (activeTab !== "all")
                                filters.salary_type = activeTab;
                            if (searchText) filters.search = searchText;
                            fetchSalaryConfigs(filters);
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        icon={<UnorderedListOutlined />}
                        onClick={resetFilters}
                    >
                        Xóa bộ lọc
                    </Button>
                    <Button
                        icon={<SearchOutlined />}
                        loading={loading}
                        onClick={() => fetchSalaryConfigs({})}
                    >
                        Tải lại
                    </Button>
                </Space>
            </Row>
        </>
    );

    // Stats cards component
    const StatsCards = () => (
        <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="stat-card" hoverable>
                    <Statistic
                        title="Tổng cấu hình lương"
                        value={stats.total}
                        prefix={<SettingOutlined />}
                        valueStyle={{ color: "#1677ff" }}
                    />
                    <div className="stat-footer">
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                resetFilters();
                                fetchSalaryConfigs({});
                            }}
                        >
                            Xem tất cả
                        </Button>
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="stat-card" hoverable>
                    <Statistic
                        title="Đang sử dụng"
                        value={stats.active}
                        valueStyle={{ color: "#3f8600" }}
                        prefix={<CheckCircleOutlined />}
                        suffix={
                            <small style={{ fontSize: "14px" }}>
                                {stats.total > 0
                                    ? ` (${Math.round(
                                          (stats.active / stats.total) * 100
                                      )}%)`
                                    : ""}
                            </small>
                        }
                    />
                    <div className="stat-footer">
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                resetFilters();
                                setStatusFilter(true);
                                fetchSalaryConfigs({ is_active: true });
                            }}
                        >
                            Lọc theo trạng thái
                        </Button>
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="stat-card" hoverable>
                    <Statistic
                        title="Đã khóa"
                        value={stats.inactive}
                        valueStyle={{ color: "#cf1322" }}
                        prefix={<CloseCircleOutlined />}
                        suffix={
                            <small style={{ fontSize: "14px" }}>
                                {stats.total > 0
                                    ? ` (${Math.round(
                                          (stats.inactive / stats.total) * 100
                                      )}%)`
                                    : ""}
                            </small>
                        }
                    />
                    <div className="stat-footer">
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                resetFilters();
                                setStatusFilter(false);
                                fetchSalaryConfigs({ is_active: false });
                            }}
                        >
                            Lọc theo trạng thái
                        </Button>
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="stat-card" hoverable>
                    <Statistic
                        title={`Lương ${
                            activeTab !== "all"
                                ? (salaryTypes.labels &&
                                      salaryTypes.labels[activeTab]) ||
                                  activeTab
                                : "tất cả"
                        }`}
                        value={
                            activeTab !== "all"
                                ? stats.byType[activeTab] || 0
                                : stats.total
                        }
                        prefix={
                            activeTab === "monthly" ? (
                                <BankOutlined />
                            ) : activeTab === "hourly" ? (
                                <ClockCircleOutlined />
                            ) : activeTab === "shift" ? (
                                <TeamOutlined />
                            ) : (
                                <DollarOutlined />
                            )
                        }
                        valueStyle={{
                            color:
                                activeTab === "monthly"
                                    ? "#1677ff"
                                    : activeTab === "hourly"
                                    ? "#52c41a"
                                    : activeTab === "shift"
                                    ? "#fa8c16"
                                    : "#722ed1",
                        }}
                    />
                    <div className="stat-footer">
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                setActiveTab(
                                    activeTab === "all" ? "monthly" : "all"
                                );
                            }}
                        >
                            {activeTab === "all"
                                ? "Lọc theo loại"
                                : "Xem tất cả loại"}
                        </Button>
                    </div>
                </Card>
            </Col>
        </Row>
    );

    // Component for displaying the config details in a modal
    const SalaryConfigDetails = ({ config }) => {
        if (!config) return null;

        return (
            <div className="salary-config-details">
                <Descriptions
                    title="Thông tin cơ bản"
                    bordered
                    layout="vertical"
                >
                    <Descriptions.Item label="Phòng ban" span={2}>
                        {config.department?.name || "Không có phòng ban"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chức vụ" span={2}>
                        {config.role?.name || "Không có chức vụ"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại lương" span={2}>
                        <Tag
                            color={
                                config.salary_type === "monthly"
                                    ? "blue"
                                    : config.salary_type === "hourly"
                                    ? "green"
                                    : config.salary_type === "shift"
                                    ? "orange"
                                    : "default"
                            }
                        >
                            {(salaryTypes.labels &&
                                salaryTypes.labels[config.salary_type]) ||
                                config.salary_type}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={2}>
                        {config.is_active ? (
                            <Tag
                                className="status-active"
                                icon={<CheckCircleOutlined />}
                            >
                                Đang sử dụng
                            </Tag>
                        ) : (
                            <Tag
                                className="status-inactive"
                                icon={<CloseCircleOutlined />}
                            >
                                Đã khóa
                            </Tag>
                        )}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Thông tin lương</Divider>

                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="Lương cơ bản" span={2}>
                        {formatCurrency(config.base_salary)}
                    </Descriptions.Item>

                    {config.salary_type === "hourly" && (
                        <Descriptions.Item label="Lương theo giờ" span={2}>
                            {formatCurrency(config.hourly_rate)}
                            <small> /giờ</small>
                        </Descriptions.Item>
                    )}

                    {config.salary_type === "shift" && (
                        <Descriptions.Item label="Lương theo ca" span={2}>
                            {formatCurrency(config.shift_rate)}
                            <small> /ca</small>
                        </Descriptions.Item>
                    )}

                    <Descriptions.Item label="Số giờ tiêu chuẩn/ngày" span={2}>
                        {config.standard_hours_per_day} giờ
                    </Descriptions.Item>

                    <Descriptions.Item
                        label="Số ngày tiêu chuẩn/tháng"
                        span={2}
                    >
                        {config.standard_days_per_month} ngày
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Hệ số lương</Divider>

                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="Hệ số làm thêm giờ" span={2}>
                        {config.overtime_multiplier}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hệ số ca đêm" span={2}>
                        {config.night_shift_multiplier}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hệ số ngày lễ" span={2}>
                        {config.holiday_multiplier}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Phụ cấp</Divider>

                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="Phụ cấp ăn uống" span={2}>
                        {formatCurrency(config.meal_allowance)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phụ cấp đi lại" span={2}>
                        {formatCurrency(config.transport_allowance)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phụ cấp nhà ở" span={2}>
                        {formatCurrency(config.housing_allowance)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phụ cấp chức vụ" span={2}>
                        {formatCurrency(config.position_allowance)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thưởng chuyên cần" span={2}>
                        {formatCurrency(config.attendance_bonus)}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">Khấu trừ</Divider>

                <Descriptions bordered layout="vertical">
                    <Descriptions.Item label="Thuế suất TNCN" span={2}>
                        {formatPercentage(config.tax_rate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tỷ lệ BHXH, BHYT, BHTN" span={2}>
                        {formatPercentage(config.insurance_rate)}
                    </Descriptions.Item>
                </Descriptions>

                {config.description && (
                    <>
                        <Divider orientation="left">Mô tả</Divider>
                        <Card>
                            <p>{config.description}</p>
                        </Card>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="salary-config-page">
            <div className="page-header">
                <div>
                    <Title level={3}>
                        <DollarOutlined /> Quản lý cấu hình lương
                    </Title>
                    <Text type="secondary">
                        Quản lý các cấu hình lương cho từng phòng ban và chức vụ
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showDrawer()}
                    loading={loading}
                >
                    Thêm cấu hình lương
                </Button>
            </div>

            <StatsCards />

            <Card className="filter-card">
                <FilterControls />
            </Card>

            <Card className="data-card">
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key)}
                    className="tab-container"
                >
                    {salaryTypes.types.map((type) => (
                        <TabPane
                            tab={
                                <span>
                                    {type === "monthly" ? (
                                        <BankOutlined />
                                    ) : type === "hourly" ? (
                                        <ClockCircleOutlined />
                                    ) : type === "shift" ? (
                                        <TeamOutlined />
                                    ) : (
                                        <DollarOutlined />
                                    )}
                                    <span style={{ marginLeft: 8 }}>
                                        {salaryTypes.labels[type] || type}
                                    </span>
                                </span>
                            }
                            key={type}
                        />
                    ))}
                    <TabPane
                        tab={
                            <span>
                                <UnorderedListOutlined />
                                <span style={{ marginLeft: 8 }}>Tất cả</span>
                            </span>
                        }
                        key="all"
                    />
                </Tabs>

                <Table
                    columns={columns}
                    dataSource={salaryConfigs}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng cộng ${total} cấu hình`,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        showQuickJumper: true,
                        position: ["bottomRight"],
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
                                <p>Không tìm thấy cấu hình lương nào</p>
                                <p style={{ fontSize: "13px", color: "#999" }}>
                                    Thử thay đổi bộ lọc hoặc thêm mới một cấu
                                    hình lương
                                </p>
                            </div>
                        ),
                    }}
                    onChange={(pagination, filters, sorter) => {
                        console.log("Table params changed:", {
                            pagination,
                            filters,
                            sorter,
                        });
                        // Có thể thêm xử lý khi có thay đổi trong sort hoặc phân trang
                    }}
                />
            </Card>

            {/* Details Modal */}
            <Modal
                title={
                    <div>
                        <DollarOutlined /> Chi tiết cấu hình lương
                    </div>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    viewingConfig && (
                        <Button
                            key="status"
                            type={
                                viewingConfig.is_active ? "default" : "primary"
                            }
                            danger={viewingConfig.is_active}
                            icon={
                                viewingConfig.is_active ? (
                                    <CloseCircleOutlined />
                                ) : (
                                    <CheckCircleOutlined />
                                )
                            }
                            onClick={() => {
                                Modal.confirm({
                                    title: viewingConfig.is_active
                                        ? "Khóa cấu hình lương"
                                        : "Kích hoạt cấu hình lương",
                                    icon: viewingConfig.is_active ? (
                                        <CloseCircleOutlined
                                            style={{ color: "#ff4d4f" }}
                                        />
                                    ) : (
                                        <CheckCircleOutlined
                                            style={{ color: "#52c41a" }}
                                        />
                                    ),
                                    content: viewingConfig.is_active
                                        ? `Bạn có chắc chắn muốn khóa cấu hình lương cho ${
                                              viewingConfig.role?.name ||
                                              "chức vụ này"
                                          } ở ${
                                              viewingConfig.department?.name ||
                                              "phòng ban này"
                                          }?`
                                        : `Bạn có chắc chắn muốn kích hoạt cấu hình lương cho ${
                                              viewingConfig.role?.name ||
                                              "chức vụ này"
                                          } ở ${
                                              viewingConfig.department?.name ||
                                              "phòng ban này"
                                          }?`,
                                    okText: "Xác nhận",
                                    cancelText: "Hủy",
                                    okButtonProps: {
                                        danger: viewingConfig.is_active,
                                    },
                                    onOk: async () => {
                                        await handleStatusChange(
                                            viewingConfig.id,
                                            !viewingConfig.is_active
                                        );
                                        setDetailModalVisible(false);
                                    },
                                });
                            }}
                        >
                            {viewingConfig.is_active
                                ? "Khóa cấu hình"
                                : "Kích hoạt cấu hình"}
                        </Button>
                    ),
                    <Button
                        key="edit"
                        type="primary"
                        loading={loading}
                        onClick={() => {
                            setDetailModalVisible(false);
                            showDrawer(viewingConfig);
                        }}
                    >
                        <EditOutlined /> Chỉnh sửa
                    </Button>,
                    <Button
                        key="close"
                        onClick={() => setDetailModalVisible(false)}
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
                    <SalaryConfigDetails config={viewingConfig} />
                )}
            </Modal>

            <Drawer
                title={
                    editingConfig
                        ? "Chỉnh sửa cấu hình lương"
                        : "Thêm cấu hình lương mới"
                }
                placement="right"
                closable={true}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={drawerWidth}
                className="salary-drawer"
                footer={
                    <div style={{ textAlign: "right" }}>
                        <Button
                            onClick={() => setDrawerVisible(false)}
                            style={{ marginRight: 8 }}
                            disabled={submitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => form.submit()}
                            loading={submitting}
                        >
                            {editingConfig ? "Cập nhật" : "Tạo mới"}
                        </Button>
                    </div>
                }
            >
                <SalaryConfigForm
                    form={form}
                    salaryTypes={salaryTypes}
                    departments={departments}
                    roles={roles}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={setSelectedDepartment}
                    selectedRole={selectedRole}
                    setSelectedRole={setSelectedRole}
                    editingConfig={editingConfig}
                    onFinish={handleSubmit}
                />
            </Drawer>
        </div>
    );
};

export default SalaryConfigPage;
