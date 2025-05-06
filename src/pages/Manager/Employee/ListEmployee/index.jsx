import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Typography,
    Input,
    Select,
    Row,
    Col,
    Tooltip,
    Badge,
    Statistic,
    Avatar,
    message,
    Popconfirm,
    Modal,
    Menu,
    Divider,
    Tabs,
    Form,
    Radio,
    Alert,
    Dropdown,
    Progress,
} from "antd";
import {
    UserAddOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    FilterOutlined,
    PlusOutlined,
    ReloadOutlined,
    TeamOutlined,
    BuildOutlined,
    DownloadOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeDetail from "./components/EmployeeDetail";
import AdvancedFilterForm from "./components/AdvancedFilterForm";
import EmployeeStatistics from "./components/EmployeeStatistics";
import {
    getEmployees,
    deleteEmployee,
    getDepartments,
    getRoles,
    updateEmployeeStatus,
    bulkUpdateStatus,
    bulkDeleteEmployees,
} from "../../../../api/employeesApi";
import { getBranches } from "../../../../api/branchesApi";
import {
    EMPLOYEE_STATUS,
    EMPLOYEE_STATUS_LABELS,
    EMPLOYEE_STATUS_COLORS,
} from "../../../../constants/employee";
import AvatarUpload from "../../../../components/AvatarUpload";
import axios from "axios";
import ExportDataModal from "../../../../components/ExportDataModal";

const { Text, Title } = Typography;
const { Search } = Input;

export default function ListEmployee() {
    const hasMounted = useRef(false);

    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: "",
        department_id: undefined,
        role_id: undefined,
        branch_id: undefined,
        status: undefined,
    });
    const [modalVisible, setModalVisible] = useState({
        form: false,
        detail: false,
    });
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [form] = Form.useForm();
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [advancedFilterVisible, setAdvancedFilterVisible] = useState(false);

    useEffect(() => {
        async function loadInitialData() {
            setLoading(true);
            try {
                // Fetch departments, roles, branches and employees in parallel
                const [deptData, roleData, branchData] = await Promise.all([
                    getDepartments(),
                    getRoles(),
                    getBranches(),
                ]);
                setDepartments(deptData || []);
                setRoles(roleData || []);
                setBranches(branchData || []);

                // Now fetch employees
                await fetchEmployees();
            } catch (error) {
                console.error("Error loading initial data:", error);
                message.error("Không thể tải dữ liệu ban đầu");
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, []);

    // Separate effect for pagination changes
    useEffect(() => {
        if (hasMounted.current) {
            fetchEmployees();
        } else {
            hasMounted.current = true;
        }
    }, [pagination.current, pagination.pageSize]);

    useEffect(() => {
        // Update form values when filters change

        form.setFieldsValue({
            search: filters.search,
            department_id: filters.department_id,
            role_id: filters.role_id,
            branch_id: filters.branch_id,
            status: filters.status,
        });
    }, [filters, form]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters, // Include all filter parameters
            };

            // Use the wrapper function to call API
            const response = await getEmployees(params);

            if (response && response.data) {
                setEmployees(response.data);
                setPagination({
                    ...pagination,
                    total: response.total || 0,
                });
            } else {
                setEmployees([]);
                setPagination({
                    ...pagination,
                    total: 0,
                });
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
            message.error("Lỗi khi tải danh sách nhân viên");
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data || []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        }
    };

    const fetchRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data || []);
        } catch (error) {
            console.error("Error fetching roles:", error);
            setRoles([]);
        }
    };

    const handleTableChange = (pagination, _, sorter) => {
        setPagination(pagination);
        // Don't process filters from the table anymore, use our custom filter form
    };

    const handleSearch = (value) => {
        // Update search filter immediately
        const newFilters = {
            ...filters,
            search: value,
        };
        setFilters(newFilters);
        setPagination({ ...pagination, current: 1 });

        // Fetch immediately to show results
        fetchEmployees();
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPagination({ ...pagination, current: 1 });
    };

    const handleReset = () => {
        // Reset form values
        form.resetFields();

        // Reset filters state
        const resetFilters = {
            search: "",
            department_id: undefined,
            role_id: undefined,
            branch_id: undefined,
            status: undefined,
        };

        setFilters(resetFilters);
        setPagination({ ...pagination, current: 1 });

        // Fetch with reset filters immediately
        fetchEmployees();
        message.success("Đã đặt lại bộ lọc");
    };

    const handleView = (record) => {
        setSelectedEmployee(record);
        setModalVisible({ ...modalVisible, detail: true });
    };

    const handleEdit = (record) => {
        setSelectedEmployee(record);
        setModalVisible({ ...modalVisible, form: true });
    };

    const handleEditFromDetail = (record) => {
        setSelectedEmployee(record);
        setModalVisible({ ...modalVisible, form: true, detail: false });
    };

    const handleDelete = async (id) => {
        try {
            // Gọi API trực tiếp
            setLoading(true);
            const response = await axios.delete(
                `http://localhost:8000/api/employees/${id}`
            );

            message.success("Xóa nhân viên thành công");
            fetchEmployees();
        } catch (error) {
            console.error("Error deleting employee:", error);
            message.error(
                "Lỗi khi xóa nhân viên: " +
                    (error.response?.data?.message || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedEmployee(null);
        setModalVisible({ ...modalVisible, form: true });
    };

    const handleFormSubmit = () => {
        setModalVisible({ ...modalVisible, form: false });
        fetchEmployees();
    };

    const handleStatusChange = async (id, newStatus) => {
        console.log(
            "Cập nhật trạng thái cho ID:",
            id,
            "Trạng thái mới:",
            newStatus
        );

        const statusLabels = {
            active: "Đang làm việc",
            on_leave: "Nghỉ phép",
            inactive: "Ngừng làm việc",
        };

        const employee = employees.find((emp) => emp.id === id);
        if (!employee) {
            message.error("Không tìm thấy thông tin nhân viên");
            return;
        }

        Modal.confirm({
            title: `Cập nhật trạng thái nhân viên`,
            content: (
                <div>
                    <p>
                        Bạn có chắc chắn muốn thay đổi trạng thái của nhân viên:
                    </p>
                    <p>
                        <strong>{employee.name}</strong>
                    </p>
                    <p>
                        Từ:{" "}
                        <Badge
                            status={EMPLOYEE_STATUS_COLORS[employee.status]}
                            text={EMPLOYEE_STATUS_LABELS[employee.status]}
                        />
                    </p>
                    <p>
                        Thành:{" "}
                        <Badge
                            status={EMPLOYEE_STATUS_COLORS[newStatus]}
                            text={statusLabels[newStatus]}
                        />
                    </p>
                </div>
            ),
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    setLoading(true);
                    // Sử dụng cách gọi trực tiếp thay vì qua hàm wrapper

                    // Đảm bảo ID là số nguyên
                    const numericId = parseInt(id, 10);

                    const response = await axios.patch(
                        `http://localhost:8000/api/employees/${numericId}/status`,
                        { status: newStatus }
                    );

                    message.success(
                        `Cập nhật trạng thái thành "${statusLabels[newStatus]}" thành công`
                    );
                    fetchEmployees();
                } catch (error) {
                    console.error("Error updating employee status:", error);
                    message.error(
                        "Không thể cập nhật trạng thái nhân viên: " +
                            (error.response?.data?.message || error.message)
                    );
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleQuickBulkStatusUpdate = async (status) => {
        if (selectedRows.length === 0) {
            message.warning("Vui lòng chọn ít nhất một nhân viên");
            return;
        }

        // Map các trạng thái đến nhãn thân thiện hơn để hiển thị
        const statusLabels = {
            active: "Đang làm việc",
            on_leave: "Nghỉ phép",
            inactive: "Ngừng làm việc",
        };

        Modal.confirm({
            title: `Cập nhật trạng thái thành "${statusLabels[status]}"`,
            content: `Bạn có chắc chắn muốn thay đổi trạng thái của ${selectedRows.length} nhân viên thành "${statusLabels[status]}"?`,
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    setLoading(true);
                    const employeeIds = selectedRows.map(
                        (employee) => employee.id
                    );

                    console.log(
                        "Gọi API với IDs:",
                        employeeIds,
                        "và status:",
                        status
                    );

                    // Gọi API trực tiếp thay vì qua hàm wrapper
                    const response = await axios.post(
                        "http://localhost:8000/api/employees/bulk/status",
                        {
                            ids: employeeIds,
                            status: status,
                        }
                    );

                    message.success(
                        `Đã cập nhật trạng thái cho ${
                            response.data.affectedCount || 0
                        } nhân viên thành công`
                    );
                    setSelectedRows([]);
                    setSelectedRowKeys([]);
                    fetchEmployees();
                } catch (error) {
                    console.error("Error bulk updating status:", error);
                    message.error(
                        "Lỗi khi cập nhật trạng thái hàng loạt: " +
                            (error.response?.data?.message || error.message)
                    );
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleAdvancedFilterSubmit = (values) => {
        // Update filters state
        setFilters({
            search: values.search || "",
            department_id: values.department_id,
            role_id: values.role_id,
            branch_id: values.branch_id,
            status: values.status,
        });

        setPagination({ ...pagination, current: 1 });

        // Fetch data immediately
        fetchEmployees();
        message.success("Đã áp dụng bộ lọc");
    };

    const toggleAdvancedFilter = () => {
        setAdvancedFilterVisible(!advancedFilterVisible);
    };

    const columns = [
        {
            title: "Mã NV",
            dataIndex: "employee_code",
            key: "employee_code",
            width: 100,
            sorter: (a, b) => a.employee_code.localeCompare(b.employee_code),
        },
        {
            title: "Nhân viên",
            key: "employee",
            width: 250,
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (_, record) => (
                <Space>
                    <Avatar
                        src={record.avatar}
                        size={45}
                        style={{
                            backgroundColor: !record.avatar
                                ? "#1890ff"
                                : undefined,
                            fontSize: "18px",
                        }}
                    >
                        {!record.avatar && record.name
                            ? record.name.charAt(0).toUpperCase()
                            : ""}
                    </Avatar>
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.name}</Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            {record.email}
                        </Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: "Phòng ban",
            dataIndex: ["department", "name"],
            key: "department",
            width: 150,
            sorter: (a, b) =>
                (a.department?.name || "").localeCompare(
                    b.department?.name || ""
                ),
            render: (_, record) => (
                <Tag color="blue">{record.department?.name || "Chưa có"}</Tag>
            ),
        },
        {
            title: "Chức vụ",
            dataIndex: ["role", "name"],
            key: "role",
            width: 150,
            sorter: (a, b) =>
                (a.role?.name || "").localeCompare(b.role?.name || ""),
            render: (_, record) => (
                <Tag color="purple">{record.role?.name || "Chưa có"}</Tag>
            ),
        },
        {
            title: "Chi nhánh",
            dataIndex: ["branch", "name"],
            key: "branch",
            width: 150,
            sorter: (a, b) =>
                (a.branch?.name || "").localeCompare(b.branch?.name || ""),
            render: (_, record) => (
                <Tag color="cyan">{record.branch?.name || "Chưa có"}</Tag>
            ),
        },
        // {
        //     title: "Liên hệ",
        //     key: "contact",
        //     width: 150,
        //     sorter: (a, b) => a.phone.localeCompare(b.phone),
        //     render: (_, record) => (
        //         <Space direction="vertical" size={0}>
        //             <Text>{record.phone}</Text>
        //             <Text type="secondary" style={{ fontSize: "12px" }}>
        //                 {record.address && record.address.length > 15
        //                     ? record.address.substring(0, 15) + "..."
        //                     : record.address}
        //             </Text>
        //         </Space>
        //     ),
        // },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (status) => (
                <Badge
                    status={EMPLOYEE_STATUS_COLORS[status]}
                    text={EMPLOYEE_STATUS_LABELS[status]}
                />
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 160,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="default"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>

                    {/* Thay các nút riêng lẻ bằng dropdown menu */}
                    <Dropdown
                        menu={{
                            items: [
                                ...(record.status !== EMPLOYEE_STATUS.ACTIVE
                                    ? [
                                          {
                                              key: "active",
                                              icon: (
                                                  <CheckCircleOutlined
                                                      style={{ color: "green" }}
                                                  />
                                              ),
                                              label: "Đặt đang làm việc",
                                              onClick: () =>
                                                  handleStatusChange(
                                                      record.id,
                                                      "active"
                                                  ),
                                          },
                                      ]
                                    : []),
                                ...(record.status !== EMPLOYEE_STATUS.ON_LEAVE
                                    ? [
                                          {
                                              key: "on_leave",
                                              icon: (
                                                  <ClockCircleOutlined
                                                      style={{
                                                          color: "orange",
                                                      }}
                                                  />
                                              ),
                                              label: "Đặt nghỉ phép",
                                              onClick: () =>
                                                  handleStatusChange(
                                                      record.id,
                                                      "on_leave"
                                                  ),
                                          },
                                      ]
                                    : []),
                                ...(record.status !== EMPLOYEE_STATUS.INACTIVE
                                    ? [
                                          {
                                              key: "inactive",
                                              icon: (
                                                  <StopOutlined
                                                      style={{ color: "red" }}
                                                  />
                                              ),
                                              label: "Đặt ngừng làm việc",
                                              onClick: () =>
                                                  handleStatusChange(
                                                      record.id,
                                                      "inactive"
                                                  ),
                                          },
                                      ]
                                    : []),
                                ...(record.status === EMPLOYEE_STATUS.INACTIVE
                                    ? [
                                          {
                                              key: "delete",
                                              danger: true,
                                              icon: <DeleteOutlined />,
                                              label: "Xóa nhân viên",
                                              onClick: () => {
                                                  Modal.confirm({
                                                      title: "Xác nhận xóa",
                                                      content:
                                                          "Bạn có chắc chắn muốn xóa nhân viên này?",
                                                      onOk: () =>
                                                          handleDelete(
                                                              record.id
                                                          ),
                                                      okText: "Xóa",
                                                      cancelText: "Hủy",
                                                      okButtonProps: {
                                                          danger: true,
                                                      },
                                                  });
                                              },
                                          },
                                      ]
                                    : []),
                            ],
                        }}
                        placement="bottomRight"
                        trigger={["click"]}
                    >
                        <Button
                            type="default"
                            size="small"
                            icon={<MoreOutlined />}
                        />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
        },
    };

    const handleBulkDelete = () => {
        if (selectedRows.length === 0) {
            message.warning("Vui lòng chọn ít nhất một nhân viên");
            return;
        }

        // Lọc các nhân viên chỉ ở trạng thái inactive mới có thể xóa
        const inactiveEmployees = selectedRows.filter(
            (emp) => emp.status === EMPLOYEE_STATUS.INACTIVE
        );
        const nonInactiveEmployees = selectedRows.filter(
            (emp) => emp.status !== EMPLOYEE_STATUS.INACTIVE
        );

        if (inactiveEmployees.length === 0) {
            message.warning(
                "Không có nhân viên nào có thể xóa. Chỉ nhân viên có trạng thái 'Ngừng làm việc' mới có thể xóa."
            );
            return;
        }

        Modal.confirm({
            title: "Xác nhận xóa hàng loạt",
            width: 600,
            icon: <DeleteOutlined style={{ color: "red" }} />,
            content: (
                <div>
                    <p>
                        Bạn có chắc chắn muốn xóa {inactiveEmployees.length}{" "}
                        nhân viên đã chọn?
                    </p>
                    {nonInactiveEmployees.length > 0 && (
                        <div style={{ marginTop: 8, marginBottom: 8 }}>
                            <Alert
                                type="warning"
                                showIcon
                                message={`${nonInactiveEmployees.length} nhân viên không ở trạng thái "Ngừng làm việc" sẽ không bị xóa`}
                                description="Chỉ nhân viên có trạng thái 'Ngừng làm việc' mới có thể xóa"
                            />
                        </div>
                    )}
                    <div
                        style={{
                            maxHeight: "200px",
                            overflow: "auto",
                            border: "1px solid #f0f0f0",
                            padding: "8px",
                            marginTop: "8px",
                        }}
                    >
                        <Table
                            size="small"
                            pagination={false}
                            columns={[
                                {
                                    title: "Mã NV",
                                    dataIndex: "employee_code",
                                    width: 100,
                                },
                                {
                                    title: "Tên nhân viên",
                                    dataIndex: "name",
                                    width: 200,
                                },
                                {
                                    title: "Trạng thái",
                                    dataIndex: "status",
                                    width: 150,
                                    render: (status) => (
                                        <Badge
                                            status={
                                                EMPLOYEE_STATUS_COLORS[status]
                                            }
                                            text={
                                                EMPLOYEE_STATUS_LABELS[status]
                                            }
                                        />
                                    ),
                                },
                            ]}
                            dataSource={inactiveEmployees}
                            rowKey="id"
                        />
                    </div>
                    <div style={{ marginTop: 16, color: "red" }}>
                        <b>Lưu ý:</b> Hành động này không thể hoàn tác. Dữ liệu
                        sẽ bị xóa vĩnh viễn.
                    </div>
                </div>
            ),
            okText: "Xóa",
            okButtonProps: {
                danger: true,
            },
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    setLoading(true);
                    const employeeIds = inactiveEmployees.map(
                        (employee) => employee.id
                    );
                    console.log(
                        "Xóa nhân viên hàng loạt với IDs:",
                        employeeIds
                    );

                    // Gọi API trực tiếp
                    const response = await axios.post(
                        "http://localhost:8000/api/employees/bulk/delete",
                        {
                            ids: employeeIds,
                        }
                    );

                    message.success(
                        `Đã xóa ${
                            response.data.deletedCount || 0
                        } nhân viên thành công`
                    );
                    setSelectedRows([]);
                    setSelectedRowKeys([]);
                    fetchEmployees();
                } catch (error) {
                    console.error("Error bulk deleting:", error);
                    message.error(
                        "Lỗi khi xóa nhân viên hàng loạt: " +
                            (error.response?.data?.message || error.message)
                    );
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // Update the filter controls to include branch filter
    const renderFilterControls = () => (
        <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item name="search" style={{ marginBottom: 8, minWidth: 200 }}>
                <Input
                    placeholder="Tìm theo tên, email..."
                    prefix={<SearchOutlined />}
                    allowClear
                    onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                    }
                    value={filters.search}
                />
            </Form.Item>

            <Form.Item
                name="branch_id"
                style={{ marginBottom: 8, minWidth: 180 }}
            >
                <Select
                    placeholder="Chi nhánh"
                    allowClear
                    onChange={(value) => handleFilterChange("branch_id", value)}
                    value={filters.branch_id}
                >
                    {branches
                        .filter((b) => b.status === "active")
                        .map((branch) => (
                            <Select.Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Select.Option>
                        ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="department_id"
                style={{ marginBottom: 8, minWidth: 180 }}
            >
                <Select
                    placeholder="Phòng ban"
                    allowClear
                    onChange={(value) =>
                        handleFilterChange("department_id", value)
                    }
                    value={filters.department_id}
                >
                    {departments.map((dept) => (
                        <Select.Option key={dept.id} value={dept.id}>
                            {dept.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="role_id"
                style={{ marginBottom: 8, minWidth: 180 }}
            >
                <Select
                    placeholder="Chức vụ"
                    allowClear
                    onChange={(value) => handleFilterChange("role_id", value)}
                    value={filters.role_id}
                >
                    {roles.map((role) => (
                        <Select.Option key={role.id} value={role.id}>
                            {role.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="status" style={{ marginBottom: 8, minWidth: 180 }}>
                <Select
                    placeholder="Trạng thái"
                    allowClear
                    onChange={(value) => handleFilterChange("status", value)}
                    value={filters.status}
                >
                    {Object.entries(EMPLOYEE_STATUS_LABELS).map(
                        ([value, label]) => (
                            <Select.Option key={value} value={value}>
                                {label}
                            </Select.Option>
                        )
                    )}
                </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 8 }}>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    Đặt lại
                </Button>
            </Form.Item>
        </Form>
    );

    return (
        <div className="employee-list">
            <style jsx="true">{`
                .page-header {
                    margin-bottom: 24px;
                }
                .search-card {
                    margin-bottom: 16px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    border-radius: 8px;
                }
                .filter-card {
                    margin-bottom: 16px;
                }
                .ant-card-body {
                    padding: 16px;
                }
                .ant-table-thead th {
                    background-color: #f7f7f7;
                }
                .employee-table .inactive-row {
                    background-color: #fafafa;
                    opacity: 0.7;
                }
                .employee-table .on-leave-row {
                    background-color: #fffbe6;
                }
                @media (max-width: 768px) {
                    .search-col {
                        margin-bottom: 8px;
                    }
                }
                /* Table styles */
                .employee-table-wrapper {
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }
                .employee-table .ant-table-row:hover > td {
                    background-color: #e6f7ff !important;
                }
                .employee-table .ant-table-thead th {
                    background-color: #fafafa;
                }
                .employee-table .ant-table-column-sorter-up.active,
                .employee-table .ant-table-column-sorter-down.active {
                    color: #1890ff;
                }
                .employee-table
                    .ant-table-thead
                    th.ant-table-column-has-sorters:hover {
                    background: #f5f5f5;
                }
            `}</style>

            {/* Page header */}
            <div className="page-header">
                <Title level={2}>Quản lý nhân viên</Title>
            </div>

            {/* Statistics section */}
            <EmployeeStatistics
                employees={employees}
                departments={departments}
                roles={roles}
            />

            {/* Filter indicator */}
            {(filters.search ||
                filters.department_id ||
                filters.role_id ||
                filters.branch_id ||
                filters.status) && (
                <Alert
                    style={{ marginBottom: 16 }}
                    message={
                        <Space>
                            <span>Đang áp dụng bộ lọc:</span>
                            {filters.search && (
                                <Tag color="blue">
                                    Tìm kiếm: {filters.search}
                                </Tag>
                            )}
                            {filters.department_id && (
                                <Tag color="green">
                                    Phòng ban:{" "}
                                    {
                                        departments.find(
                                            (d) =>
                                                d.id === filters.department_id
                                        )?.name
                                    }
                                </Tag>
                            )}
                            {filters.role_id && (
                                <Tag color="purple">
                                    Chức vụ:{" "}
                                    {
                                        roles.find(
                                            (r) => r.id === filters.role_id
                                        )?.name
                                    }
                                </Tag>
                            )}
                            {filters.branch_id && (
                                <Tag color="cyan">
                                    Chi nhánh:{" "}
                                    {
                                        branches.find(
                                            (b) => b.id === filters.branch_id
                                        )?.name
                                    }
                                </Tag>
                            )}
                            {filters.status && (
                                <Tag color="orange">
                                    Trạng thái:{" "}
                                    {EMPLOYEE_STATUS_LABELS[filters.status]}
                                </Tag>
                            )}
                        </Space>
                    }
                    type="info"
                    showIcon
                    action={
                        <Button type="text" size="small" onClick={handleReset}>
                            Xóa bộ lọc
                        </Button>
                    }
                />
            )}

            {/* Filter form */}
            <Form
                form={form}
                onFinish={handleAdvancedFilterSubmit}
                onSubmit={(e) => {
                    if (e) e.preventDefault();
                }}
            >
                <AdvancedFilterForm
                    form={form}
                    departments={departments}
                    roles={roles}
                    branches={branches}
                    onFinish={handleAdvancedFilterSubmit}
                    onReset={handleReset}
                    loading={loading}
                    initialValues={filters}
                    isExpanded={advancedFilterVisible}
                    onToggleExpand={toggleAdvancedFilter}
                    onSearch={handleSearch}
                />
            </Form>

            {/* Action Bar */}
            <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: 16, marginTop: 16 }}
            >
                <Col>
                    {selectedRows.length > 0 && (
                        <Space>
                            <Text strong>
                                Đã chọn {selectedRows.length} nhân viên
                            </Text>

                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: "active",
                                            icon: (
                                                <CheckCircleOutlined
                                                    style={{
                                                        color: "green",
                                                    }}
                                                />
                                            ),
                                            label: "Đặt đang làm việc",
                                            onClick: () =>
                                                handleQuickBulkStatusUpdate(
                                                    "active"
                                                ),
                                        },
                                        {
                                            key: "on_leave",
                                            icon: (
                                                <ClockCircleOutlined
                                                    style={{
                                                        color: "orange",
                                                    }}
                                                />
                                            ),
                                            label: "Đặt nghỉ phép",
                                            onClick: () =>
                                                handleQuickBulkStatusUpdate(
                                                    "on_leave"
                                                ),
                                        },
                                        {
                                            key: "inactive",
                                            icon: (
                                                <StopOutlined
                                                    style={{
                                                        color: "red",
                                                    }}
                                                />
                                            ),
                                            label: "Đặt ngừng làm việc",
                                            onClick: () =>
                                                handleQuickBulkStatusUpdate(
                                                    "inactive"
                                                ),
                                        },
                                        {
                                            type: "divider",
                                        },
                                        {
                                            key: "delete",
                                            danger: true,
                                            icon: <DeleteOutlined />,
                                            label: "Xóa đã chọn",
                                            onClick: () => handleBulkDelete(),
                                        },
                                    ],
                                }}
                            >
                                <Button type="primary">
                                    Thao tác hàng loạt <DownOutlined />
                                </Button>
                            </Dropdown>

                            <Button
                                onClick={() => {
                                    setSelectedRows([]);
                                    setSelectedRowKeys([]);
                                }}
                            >
                                Bỏ chọn
                            </Button>
                        </Space>
                    )}
                </Col>
                <Col>
                    <Space>
                        <Button
                            onClick={fetchEmployees}
                            icon={<ReloadOutlined />}
                        >
                            Làm mới
                        </Button>
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={() => setExportModalVisible(true)}
                        >
                            Xuất Excel
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm nhân viên
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Table */}
            <div className="employee-table-wrapper">
                <Table
                    columns={columns}
                    dataSource={employees}
                    rowKey="id"
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng cộng ${total} nhân viên`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    onChange={handleTableChange}
                    loading={loading}
                    rowSelection={rowSelection}
                    size="middle"
                    scroll={{ x: "max-content" }}
                    className="employee-table"
                    rowClassName={(record) => {
                        if (record.status === EMPLOYEE_STATUS.INACTIVE)
                            return "inactive-row";
                        if (record.status === EMPLOYEE_STATUS.ON_LEAVE)
                            return "on-leave-row";
                        return "";
                    }}
                    locale={{
                        emptyText: filters.search ? (
                            <div style={{ padding: "20px 0" }}>
                                <div style={{ marginBottom: 16 }}>
                                    <SearchOutlined
                                        style={{
                                            fontSize: 24,
                                            color: "#999",
                                        }}
                                    />
                                </div>
                                <div>
                                    Không tìm thấy nhân viên nào phù hợp với bộ
                                    lọc
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <Button type="link" onClick={handleReset}>
                                        Xóa bộ lọc
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            "Không có dữ liệu"
                        ),
                        triggerDesc: "Nhấn để sắp xếp giảm dần",
                        triggerAsc: "Nhấn để sắp xếp tăng dần",
                        cancelSort: "Hủy sắp xếp",
                    }}
                />
            </div>

            <EmployeeForm
                open={modalVisible.form}
                onCancel={() =>
                    setModalVisible((prev) => ({ ...prev, form: false }))
                }
                onSubmit={() => {
                    handleFormSubmit();
                }}
                editingEmployee={selectedEmployee}
                departments={departments}
                roles={roles}
                branches={branches}
            >
                <Form.Item
                    name="avatar"
                    label="Ảnh đại diện"
                    valuePropName="value"
                >
                    <AvatarUpload />
                </Form.Item>
            </EmployeeForm>

            <EmployeeDetail
                open={modalVisible.detail}
                onClose={() =>
                    setModalVisible({ ...modalVisible, detail: false })
                }
                employee={selectedEmployee}
                onEdit={handleEditFromDetail}
            />

            {/* Modal xuất dữ liệu */}
            <ExportDataModal
                open={exportModalVisible}
                onCancel={() => setExportModalVisible(false)}
                data={employees}
                title="Xuất dữ liệu nhân viên"
                dataType="employees"
                fileName="danh_sach_nhan_vien"
                departments={departments}
                roles={roles}
                branches={branches}
            />
        </div>
    );
}
