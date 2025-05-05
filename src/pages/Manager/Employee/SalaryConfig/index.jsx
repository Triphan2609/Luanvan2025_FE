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
    BuildOutlined,
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
import {
    getDepartments,
    getDepartmentsByBranch,
} from "../../../../api/departmentsApi";
import { getRoles } from "../../../../api/rolesEmployeeApi";
import { getBranches } from "../../../../api/branchesApi";
import SalaryConfigForm from "./SalaryConfigForm";
import "./styles.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SalaryConfigPage = () => {
    const [form] = Form.useForm();
    const [salaryConfigs, setSalaryConfigs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
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
    const [branchFilter, setBranchFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [drawerWidth, setDrawerWidth] = useState(700);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        byType: {},
        byDepartment: {},
        byBranch: {},
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
    const [selectedBranch, setSelectedBranch] = useState(null);

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

            // Add branch filter
            if (branchFilter) {
                queryParams.branch_id = branchFilter;
            }

            const configs = await getSalaryConfigs(queryParams);

            setSalaryConfigs(configs);
            calculateStats(configs);
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

        // Count by branch
        const byBranch = {};
        configs.forEach((config) => {
            const branchName =
                config.department?.branch?.name || "Không xác định";
            byBranch[branchName] = (byBranch[branchName] || 0) + 1;
        });

        setStats({
            total,
            active,
            inactive,
            byType,
            byDepartment,
            byBranch,
        });
    };

    // Fetch departments, branches, roles, and salary types
    const fetchDepartmentsAndRoles = async () => {
        setLoading(true);

        try {
            // Fetch branches
            const branchesResponse = await getBranches();
            setBranches(branchesResponse || []);

            // Fetch departments
            const deptsResponse = await getDepartments();
            setDepartments(deptsResponse || []);

            // Fetch ALL roles
            const rolesResponse = await getRoles();
            setRoles(rolesResponse || []);

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
        } catch (error) {
            message.error(
                "Không thể tải dữ liệu ban đầu. Vui lòng thử lại sau."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartmentsAndRoles();
    }, []);

    useEffect(() => {
        const filters = {};
        if (departmentFilter) filters.department_id = departmentFilter;
        if (roleFilter) filters.role_id = roleFilter;
        if (branchFilter) filters.branch_id = branchFilter;
        if (statusFilter !== null) filters.is_active = statusFilter;
        if (activeTab !== "all") filters.salary_type = activeTab;
        if (searchText) filters.search = searchText;

        fetchSalaryConfigs(filters);
    }, [
        departmentFilter,
        roleFilter,
        branchFilter,
        statusFilter,
        activeTab,
        searchText,
    ]);

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
        setSubmitting(false); // Reset submitting state
        let editConfig = null;

        // If editing existing config, fetch details
        if (config) {
            try {
                // Nếu có ID, fetch đầy đủ thông tin cấu hình
                if (config.id) {
                    setLoading(true);
                    const configDetail = await getSalaryConfigById(config.id);
                    setLoading(false);
                    editConfig = configDetail;

                    // Chuẩn bị dữ liệu form
                    form.setFieldsValue({
                        ...configDetail,
                        salary_type: configDetail.salary_type,
                        department_id: configDetail.department_id,
                        role_id: configDetail.role_id,
                        branch_id: configDetail.department?.branch_id || null,
                    });

                    // Set active tab based on salary type
                    if (configDetail.salary_type) {
                        // Force as string for safety
                        const salaryTypeStr = String(
                            configDetail.salary_type
                        ).toLowerCase();

                        // Set active tab if valid type
                        if (
                            salaryTypes &&
                            salaryTypes.types.includes(salaryTypeStr)
                        ) {
                            setActiveTab(salaryTypeStr);
                        } else {
                            // Fallback to monthly if invalid type
                            setActiveTab("monthly");
                        }
                    }

                    // Set selected department/role for dropdown filters
                    setSelectedDepartment(configDetail.department_id);
                    setSelectedRole(configDetail.role_id);
                    setSelectedBranch(
                        configDetail.department?.branch_id || null
                    );
                }
            } catch (error) {
                console.error("Error fetching config details:", error);
                message.error(
                    "Không thể tải thông tin cấu hình. Vui lòng thử lại."
                );
                form.resetFields();
            }
        } else {
            // If creating new config, reset form
            form.resetFields();
            form.setFieldsValue({
                overtime_multiplier: 1.5,
                night_shift_multiplier: 1.3,
                holiday_multiplier: 2.0,
                tax_rate: 0.1,
                insurance_rate: 0.105,
                standard_hours_per_day: 8,
                standard_days_per_month: 22,
                is_active: true,
                // Default base_salary to avoid NaN issues
                base_salary: 0,
            });

            // For new config use current active tab
            form.setFieldsValue({ salary_type: activeTab });
        }

        setEditingConfig(editConfig);
        setDrawerVisible(true);
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
        setSearchText("");
        setDepartmentFilter(null);
        setRoleFilter(null);
        setBranchFilter(null);
        setStatusFilter(null);
        setActiveTab("monthly");

        // Reset all departments list
        getDepartments()
            .then((deptsResponse) => {
                setDepartments(deptsResponse || []);
            })
            .catch((error) => {
                console.error("Error fetching departments:", error);
            });

        fetchSalaryConfigs({});
    };

    // Handle branch change
    const handleBranchChange = async (value) => {
        setBranchFilter(value);

        // Reset department filter when branch changes
        setDepartmentFilter(null);

        if (value) {
            try {
                // Fetch departments for the selected branch
                const deptsByBranch = await getDepartmentsByBranch(value);
                setDepartments(deptsByBranch || []);
            } catch (error) {
                console.error("Error fetching departments by branch:", error);
                message.error(
                    "Không thể tải danh sách phòng ban theo chi nhánh"
                );
            }
        } else {
            // If no branch selected, load all departments
            try {
                const allDepts = await getDepartments();
                setDepartments(allDepts || []);
            } catch (error) {
                console.error("Error fetching all departments:", error);
            }
        }
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
            title: "Phụ cấp",
            dataIndex: "allowances",
            key: "allowances",
            ellipsis: true,
            render: (_, record) => {
                const nonTaxable =
                    (record.meal_allowance || 0) +
                    (record.transport_allowance || 0) +
                    (record.phone_allowance || 0);
                const taxable =
                    (record.housing_allowance || 0) +
                    (record.position_allowance || 0) +
                    (record.responsibility_allowance || 0) +
                    (record.attendance_bonus || 0);
                const total = nonTaxable + taxable;

                return (
                    <Tooltip
                        title={
                            <>
                                <div>
                                    <Text className="allowance-value">
                                        Không tính thuế:{" "}
                                        {formatCurrency(nonTaxable)}
                                    </Text>
                                </div>
                                <div>
                                    <Text className="allowance-taxable-value">
                                        Tính thuế: {formatCurrency(taxable)}
                                    </Text>
                                </div>
                                <div>
                                    <Text strong>
                                        {total > 0
                                            ? "Chi tiết:"
                                            : "Không có phụ cấp"}
                                    </Text>
                                </div>
                                {record.meal_allowance > 0 && (
                                    <div>
                                        <small>
                                            - Ăn ca:{" "}
                                            <Text className="allowance-value">
                                                {formatCurrency(
                                                    record.meal_allowance
                                                )}
                                            </Text>
                                        </small>
                                    </div>
                                )}
                                {record.transport_allowance > 0 && (
                                    <div>
                                        <small>
                                            - Đi lại:{" "}
                                            <Text className="allowance-value">
                                                {formatCurrency(
                                                    record.transport_allowance
                                                )}
                                            </Text>
                                        </small>
                                    </div>
                                )}
                                {record.phone_allowance > 0 && (
                                    <div>
                                        <small>
                                            - Điện thoại:{" "}
                                            <Text className="allowance-value">
                                                {formatCurrency(
                                                    record.phone_allowance
                                                )}
                                            </Text>
                                        </small>
                                    </div>
                                )}
                                {record.housing_allowance > 0 && (
                                    <div>
                                        <small>
                                            - Nhà ở:{" "}
                                            <Text className="allowance-taxable-value">
                                                {formatCurrency(
                                                    record.housing_allowance
                                                )}
                                            </Text>
                                        </small>
                                    </div>
                                )}
                                {record.position_allowance > 0 && (
                                    <div>
                                        <small>
                                            - Chức vụ:{" "}
                                            <Text className="allowance-taxable-value">
                                                {formatCurrency(
                                                    record.position_allowance
                                                )}
                                            </Text>
                                        </small>
                                    </div>
                                )}
                                {record.responsibility_allowance > 0 && (
                                    <div>
                                        <small>
                                            - Trách nhiệm:{" "}
                                            <Text className="allowance-taxable-value">
                                                {formatCurrency(
                                                    record.responsibility_allowance
                                                )}
                                            </Text>
                                        </small>
                                    </div>
                                )}
                                {record.attendance_bonus > 0 && (
                                    <div>
                                        <small>
                                            - Chuyên cần:{" "}
                                            <Text className="allowance-taxable-value">
                                                {formatCurrency(
                                                    record.attendance_bonus
                                                )}
                                            </Text>
                                        </small>
                                    </div>
                                )}
                            </>
                        }
                        placement="topLeft"
                    >
                        <div>
                            {nonTaxable > 0 && (
                                <div>
                                    <Text className="allowance-value">
                                        {formatCurrency(nonTaxable)}
                                    </Text>
                                </div>
                            )}
                            {taxable > 0 && (
                                <div>
                                    <Text className="allowance-taxable-value">
                                        {formatCurrency(taxable)}
                                    </Text>
                                </div>
                            )}
                            {total === 0 && "Không có"}
                        </div>
                    </Tooltip>
                );
            },
            width: 150,
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
        <Row gutter={[16, 16]} className="mb-3">
            <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                    placeholder="Chọn chi nhánh"
                    style={{ width: "100%" }}
                    allowClear
                    value={branchFilter}
                    onChange={handleBranchChange}
                    suffixIcon={<BuildOutlined />}
                >
                    {branches.map((branch) => (
                        <Option key={branch.id} value={branch.id}>
                            {branch.name}
                        </Option>
                    ))}
                </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                    placeholder="Chọn phòng ban"
                    style={{ width: "100%" }}
                    allowClear
                    value={departmentFilter}
                    onChange={setDepartmentFilter}
                    suffixIcon={<TeamOutlined />}
                >
                    {departments.map((department) => (
                        <Option key={department.id} value={department.id}>
                            {department.name}
                        </Option>
                    ))}
                </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                    placeholder="Chọn chức vụ"
                    style={{ width: "100%" }}
                    allowClear
                    value={roleFilter}
                    onChange={setRoleFilter}
                    suffixIcon={<UserOutlined />}
                >
                    {roles.map((role) => (
                        <Option key={role.id} value={role.id}>
                            {role.name}
                        </Option>
                    ))}
                </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                    placeholder="Trạng thái"
                    style={{ width: "100%" }}
                    allowClear
                    value={statusFilter}
                    onChange={setStatusFilter}
                    suffixIcon={<CheckCircleOutlined />}
                >
                    <Option value={true}>Hoạt động</Option>
                    <Option value={false}>Không hoạt động</Option>
                </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={12}>
                <Input
                    placeholder="Tìm kiếm..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={() =>
                        fetchSalaryConfigs({ search: searchText })
                    }
                    allowClear
                    prefix={<SearchOutlined />}
                />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => fetchSalaryConfigs()}
                    style={{ marginRight: 8 }}
                >
                    Tìm kiếm
                </Button>
                <Button icon={<CloseCircleOutlined />} onClick={resetFilters}>
                    Đặt lại
                </Button>
            </Col>
        </Row>
    );

    // Stats cards component
    const StatsCards = () => (
        <div className="stats-container">
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Tổng số cấu hình"
                            value={stats.total}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Đang hoạt động"
                            value={stats.active}
                            valueStyle={{ color: "#52c41a" }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Không hoạt động"
                            value={stats.inactive}
                            valueStyle={{ color: "#f5222d" }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card className="stat-card">
                        <Statistic
                            title="Số lương loại"
                            value={Object.keys(stats.byType).length}
                            prefix={<SettingOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Thống kê theo loại lương</Divider>
            <Row gutter={[16, 16]}>
                {Object.entries(stats.byType).map(([type, count]) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={type}>
                        <Card className="stat-card">
                            <Statistic
                                title={
                                    salaryTypes.labels[type] ||
                                    `Loại lương ${type}`
                                }
                                value={count}
                                prefix={
                                    type === "monthly" ? (
                                        <BankOutlined />
                                    ) : type === "hourly" ? (
                                        <ClockCircleOutlined />
                                    ) : (
                                        <TeamOutlined />
                                    )
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Divider orientation="left">Thống kê theo chi nhánh</Divider>
            <Row gutter={[16, 16]}>
                {Object.entries(stats.byBranch).map(([branch, count]) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={branch}>
                        <Card className="stat-card">
                            <Statistic
                                title={branch}
                                value={count}
                                prefix={<BuildOutlined />}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Divider orientation="left">Thống kê theo phòng ban</Divider>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {Object.entries(stats.byDepartment).map(([dept, count]) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={dept}>
                        <Card className="stat-card">
                            <Statistic
                                title={dept}
                                value={count}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
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
                    <Descriptions.Item
                        label={
                            <Text className="allowance-value">
                                Phụ cấp không tính thuế
                            </Text>
                        }
                        span={4}
                    >
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <Tooltip title="Không tính thuế nếu ≤ 730.000đ/tháng">
                                    <span>Phụ cấp ăn uống: </span>
                                    <Text className="allowance-value">
                                        {formatCurrency(config.meal_allowance)}
                                    </Text>
                                </Tooltip>
                            </Col>
                            <Col span={12}>
                                <Tooltip title="Không tính thuế nếu theo thực tế">
                                    <span>Phụ cấp đi lại: </span>
                                    <Text className="allowance-value">
                                        {formatCurrency(
                                            config.transport_allowance
                                        )}
                                    </Text>
                                </Tooltip>
                            </Col>
                            <Col span={12}>
                                <Tooltip title="Không tính thuế nếu ≤ 1.000.000đ/tháng">
                                    <span>Phụ cấp điện thoại: </span>
                                    <Text className="allowance-value">
                                        {formatCurrency(config.phone_allowance)}
                                    </Text>
                                </Tooltip>
                            </Col>
                        </Row>
                    </Descriptions.Item>

                    <Descriptions.Item
                        label={
                            <Text className="allowance-taxable-value">
                                Phụ cấp tính thuế
                            </Text>
                        }
                        span={4}
                    >
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <span>Phụ cấp nhà ở: </span>
                                <Text className="allowance-taxable-value">
                                    {formatCurrency(config.housing_allowance)}
                                </Text>
                            </Col>
                            <Col span={12}>
                                <span>Phụ cấp chức vụ: </span>
                                <Text className="allowance-taxable-value">
                                    {formatCurrency(config.position_allowance)}
                                </Text>
                            </Col>
                            <Col span={12}>
                                <span>Phụ cấp trách nhiệm: </span>
                                <Text className="allowance-taxable-value">
                                    {formatCurrency(
                                        config.responsibility_allowance
                                    )}
                                </Text>
                            </Col>
                            <Col span={12}>
                                <span>Thưởng chuyên cần: </span>
                                <Text className="allowance-taxable-value">
                                    {formatCurrency(config.attendance_bonus)}
                                </Text>
                            </Col>
                        </Row>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngưỡng tính thuế" span={4}>
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <span>Ngưỡng phụ cấp ăn ca: </span>
                                <Text>
                                    {formatCurrency(
                                        config.meal_allowance_tax_threshold ||
                                            730000
                                    )}
                                </Text>
                            </Col>
                            <Col span={12}>
                                <span>Ngưỡng phụ cấp điện thoại: </span>
                                <Text>
                                    {formatCurrency(
                                        config.phone_allowance_tax_threshold ||
                                            1000000
                                    )}
                                </Text>
                            </Col>
                        </Row>
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
                onClose={() => {
                    setDrawerVisible(false);
                    setEditingConfig(null);
                    setSelectedDepartment(null);
                    setSelectedRole(null);
                    setSelectedBranch(null);
                    form.resetFields();
                }}
                open={drawerVisible}
                width={drawerWidth}
                bodyStyle={{ paddingBottom: 80 }}
                destroyOnClose={true}
                footer={
                    <div
                        style={{
                            textAlign: "right",
                        }}
                    >
                        <Button
                            onClick={() => {
                                setDrawerVisible(false);
                                setEditingConfig(null);
                                setSelectedDepartment(null);
                                setSelectedRole(null);
                                setSelectedBranch(null);
                                form.resetFields();
                            }}
                            style={{ marginRight: 8 }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => {
                                form.submit();
                            }}
                            loading={submitting}
                        >
                            {editingConfig ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                }
            >
                <SalaryConfigForm
                    form={form}
                    salaryTypes={salaryTypes}
                    departments={departments}
                    branches={branches}
                    roles={roles}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={setSelectedDepartment}
                    selectedRole={selectedRole}
                    setSelectedRole={setSelectedRole}
                    selectedBranch={selectedBranch}
                    setSelectedBranch={setSelectedBranch}
                    editingConfig={editingConfig}
                    onFinish={handleSubmit}
                />
            </Drawer>
        </div>
    );
};

export default SalaryConfigPage;
