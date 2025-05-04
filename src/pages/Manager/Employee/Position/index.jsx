import React, { useState, useEffect } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Input,
    Row,
    Col,
    Tag,
    Tooltip,
    message,
    Popconfirm,
    Tabs,
    Drawer,
    Spin,
    Statistic,
    Select,
    Divider,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    TeamOutlined,
    BuildOutlined,
    UserOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    BarChartOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import PositionForm from "./components/PositionForm";
import DepartmentForm from "./components/DepartmentForm";
import {
    getPositions,
    createPosition,
    updatePosition,
    deletePosition,
} from "../../../../api/positionsApi";
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../../../../api/departmentsApi";
import { getBranches } from "../../../../api/branchesApi";

const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// Constants
const POSITION_TYPES = {
    MANAGEMENT: "management",
    FRONT_DESK: "front_desk",
    HOUSEKEEPING: "housekeeping",
    RESTAURANT: "restaurant",
    SERVICE: "service",
    MAINTENANCE: "maintenance",
};

const POSITION_TYPE_LABELS = {
    [POSITION_TYPES.MANAGEMENT]: "Ban quản lý",
    [POSITION_TYPES.FRONT_DESK]: "Lễ tân",
    [POSITION_TYPES.HOUSEKEEPING]: "Buồng phòng",
    [POSITION_TYPES.RESTAURANT]: "Nhà hàng",
    [POSITION_TYPES.SERVICE]: "Dịch vụ",
    [POSITION_TYPES.MAINTENANCE]: "Bảo trì",
};

const POSITION_TYPE_COLORS = {
    [POSITION_TYPES.MANAGEMENT]: "blue",
    [POSITION_TYPES.FRONT_DESK]: "green",
    [POSITION_TYPES.HOUSEKEEPING]: "orange",
    [POSITION_TYPES.RESTAURANT]: "purple",
    [POSITION_TYPES.SERVICE]: "cyan",
    [POSITION_TYPES.MAINTENANCE]: "red",
};

export default function PositionManagement() {
    // States for Position
    const [searchText, setSearchText] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [positions, setPositions] = useState([]);
    const [loadingPositions, setLoadingPositions] = useState(false);
    const [positionSort, setPositionSort] = useState({
        field: "id",
        order: "ascend",
    });
    const [positionFilter, setPositionFilter] = useState({
        department: undefined,
        branch: undefined,
    });

    // States for Department
    const [departments, setDepartments] = useState([]);
    const [searchDeptText, setSearchDeptText] = useState("");
    const [isDepartmentDrawerVisible, setIsDepartmentDrawerVisible] =
        useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [departmentSort, setDepartmentSort] = useState({
        field: "id",
        order: "ascend",
    });
    const [departmentFilter, setDepartmentFilter] = useState({
        branch: undefined,
    });

    // States for Branch
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(false);

    // Fetch initial data
    useEffect(() => {
        fetchBranches();
        fetchPositions();
        fetchDepartments();
    }, []);

    // Fetch branches
    const fetchBranches = async () => {
        try {
            setLoadingBranches(true);
            const data = await getBranches();
            setBranches(data);
        } catch (error) {
            console.error("Error fetching branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        } finally {
            setLoadingBranches(false);
        }
    };

    // Filter departments when branch is selected
    useEffect(() => {
        if (departmentFilter.branch) {
            fetchDepartmentsByBranch(departmentFilter.branch);
        } else {
            fetchDepartments();
        }
    }, [departmentFilter.branch]);

    // Filter departments for positions when branch is selected
    useEffect(() => {
        if (positionFilter.branch) {
            fetchDepartmentsByBranch(positionFilter.branch);
            // Also reset department filter if not in the current branch
            if (positionFilter.department) {
                const dept = departments.find(
                    (d) => d.id === positionFilter.department
                );
                if (!dept || dept.branch_id !== positionFilter.branch) {
                    setPositionFilter((prev) => ({
                        ...prev,
                        department: undefined,
                    }));
                }
            }
        }
    }, [positionFilter.branch]);

    // Fetch positions
    const fetchPositions = async () => {
        try {
            setLoadingPositions(true);
            const data = await getPositions();
            setPositions(data);
        } catch (error) {
            console.error("Error fetching positions:", error);
            message.error("Không thể tải danh sách chức vụ");
        } finally {
            setLoadingPositions(false);
        }
    };

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            setLoadingDepartments(true);
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching departments:", error);
            message.error("Không thể tải danh sách phòng ban");
        } finally {
            setLoadingDepartments(false);
        }
    };

    // Fetch departments by branch
    const fetchDepartmentsByBranch = async (branchId) => {
        try {
            setLoadingDepartments(true);
            const data = await getDepartmentsByBranch(branchId);
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching departments by branch:", error);
            message.error("Không thể tải danh sách phòng ban theo chi nhánh");
        } finally {
            setLoadingDepartments(false);
        }
    };

    // Position handlers
    const handleAddPosition = () => {
        setSelectedPosition(null);
        setIsModalVisible(true);
    };

    const handleEditPosition = (record) => {
        setSelectedPosition(record);
        setIsModalVisible(true);
    };

    const handleDeletePosition = async (id) => {
        try {
            await deletePosition(id);
            message.success("Xóa chức vụ thành công");
            fetchPositions();
        } catch (error) {
            console.error("Error deleting position:", error);
            message.error(
                "Không thể xóa chức vụ. Có thể chức vụ đang được sử dụng."
            );
        }
    };

    const handlePositionSubmit = async (values) => {
        try {
            if (selectedPosition) {
                // Cập nhật chức vụ
                await updatePosition(selectedPosition.id, values);
                message.success("Cập nhật chức vụ thành công");
            } else {
                // Thêm chức vụ mới
                await createPosition(values);
                message.success("Thêm chức vụ mới thành công");
            }
            setIsModalVisible(false);
            fetchPositions();
        } catch (error) {
            console.error("Error saving position:", error);
            message.error(
                selectedPosition
                    ? "Lỗi khi cập nhật chức vụ"
                    : "Lỗi khi thêm chức vụ mới"
            );
        }
    };

    // Department handlers
    const handleAddDepartment = () => {
        setSelectedDepartment(null);
        setIsDepartmentDrawerVisible(true);
    };

    const handleEditDepartment = (record) => {
        setSelectedDepartment(record);
        setIsDepartmentDrawerVisible(true);
    };

    const handleDeleteDepartment = async (id) => {
        try {
            await deleteDepartment(id);
            message.success("Xóa phòng ban thành công");
            fetchDepartments();
        } catch (error) {
            console.error("Error deleting department:", error);
            message.error(
                "Không thể xóa phòng ban. Có thể phòng ban đang được sử dụng."
            );
        }
    };

    const handleDepartmentSubmit = async (values) => {
        try {
            if (selectedDepartment) {
                // Cập nhật phòng ban
                await updateDepartment(selectedDepartment.id, values);
                message.success("Cập nhật phòng ban thành công");
            } else {
                // Thêm phòng ban mới
                await createDepartment(values);
                message.success("Thêm phòng ban mới thành công");
            }
            setIsDepartmentDrawerVisible(false);
            fetchDepartments();
        } catch (error) {
            console.error("Error saving department:", error);
            message.error(
                selectedDepartment
                    ? "Lỗi khi cập nhật phòng ban"
                    : "Lỗi khi thêm phòng ban mới"
            );
        }
    };

    // Reset filters for positions
    const handleResetPositionFilters = () => {
        setSearchText("");
        setPositionFilter({
            department: undefined,
            branch: undefined,
        });
        setPositionSort({ field: "id", order: "ascend" });
    };

    // Reset filters for departments
    const handleResetDepartmentFilters = () => {
        setSearchDeptText("");
        setDepartmentFilter({
            branch: undefined,
        });
        setDepartmentSort({ field: "id", order: "ascend" });
    };

    // Position statistics
    const getPositionStats = () => {
        const totalPositions = positions.length;
        const positionsWithEmployees = positions.filter(
            (p) => p.employees && p.employees.length > 0
        ).length;
        const avgEmployeesPerPosition = positions.length
            ? (
                  positions.reduce(
                      (sum, p) => sum + (p.employees ? p.employees.length : 0),
                      0
                  ) / positions.length
              ).toFixed(1)
            : 0;

        return {
            totalPositions,
            positionsWithEmployees,
            avgEmployeesPerPosition,
        };
    };

    // Department statistics
    const getDepartmentStats = () => {
        const totalDepartments = departments.length;
        const departmentsWithEmployees = departments.filter(
            (d) => d.employees && d.employees.length > 0
        ).length;
        const avgEmployeesPerDepartment = departments.length
            ? (
                  departments.reduce(
                      (sum, d) => sum + (d.employees ? d.employees.length : 0),
                      0
                  ) / departments.length
              ).toFixed(1)
            : 0;

        return {
            totalDepartments,
            departmentsWithEmployees,
            avgEmployeesPerDepartment,
        };
    };

    // Handle table sort
    const handlePositionTableChange = (pagination, filters, sorter) => {
        if (sorter && sorter.field) {
            setPositionSort({
                field: sorter.field,
                order: sorter.order,
            });
        }
    };

    const handleDepartmentTableChange = (pagination, filters, sorter) => {
        if (sorter && sorter.field) {
            setDepartmentSort({
                field: sorter.field,
                order: sorter.order,
            });
        }
    };

    // Table columns for positions
    const positionColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            sorter: (a, b) => a.id - b.id,
            sortOrder: positionSort.field === "id" ? positionSort.order : null,
        },
        {
            title: "Chức vụ",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder:
                positionSort.field === "name" ? positionSort.order : null,
        },
        {
            title: "Phòng ban",
            dataIndex: "department",
            key: "department",
            render: (department) =>
                department ? (
                    <Tag color="blue">{department.name}</Tag>
                ) : (
                    <Tag color="red">Chưa có phòng ban</Tag>
                ),
            filters: departments.map((dept) => ({
                text: dept.name,
                value: dept.id,
            })),
            onFilter: (value, record) => record.department?.id === value,
            filteredValue: positionFilter.department
                ? [positionFilter.department]
                : null,
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Số nhân viên",
            dataIndex: "employees",
            key: "employees",
            width: 120,
            align: "center",
            render: (employees) => (employees ? employees.length : 0),
            sorter: (a, b) =>
                (a.employees ? a.employees.length : 0) -
                (b.employees ? b.employees.length : 0),
            sortOrder:
                positionSort.field === "employees" ? positionSort.order : null,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditPosition(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa chức vụ"
                            description="Bạn có chắc chắn muốn xóa chức vụ này?"
                            onConfirm={() => handleDeletePosition(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            disabled={
                                record.employees && record.employees.length > 0
                            }
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                disabled={
                                    record.employees &&
                                    record.employees.length > 0
                                }
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Table columns for departments
    const departmentColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            sorter: (a, b) => a.id - b.id,
            sortOrder:
                departmentSort.field === "id" ? departmentSort.order : null,
        },
        {
            title: "Tên phòng ban",
            dataIndex: "name",
            key: "name",
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder:
                departmentSort.field === "name" ? departmentSort.order : null,
        },
        {
            title: "Chi nhánh",
            dataIndex: ["branch", "name"],
            key: "branch",
            render: (text, record) =>
                record.branch?.name || "Chưa phân chi nhánh",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Số chức vụ",
            key: "positionCount",
            width: 120,
            align: "center",
            render: (_, record) => {
                const count = positions.filter(
                    (pos) => pos.department?.id === record.id
                ).length;
                return count;
            },
            sorter: (a, b) => {
                const countA = positions.filter(
                    (pos) => pos.department?.id === a.id
                ).length;
                const countB = positions.filter(
                    (pos) => pos.department?.id === b.id
                ).length;
                return countA - countB;
            },
            sortOrder:
                departmentSort.field === "positionCount"
                    ? departmentSort.order
                    : null,
        },
        {
            title: "Số nhân viên",
            dataIndex: "employees",
            key: "employees",
            width: 120,
            align: "center",
            render: (employees) => (employees ? employees.length : 0),
            sorter: (a, b) =>
                (a.employees ? a.employees.length : 0) -
                (b.employees ? b.employees.length : 0),
            sortOrder:
                departmentSort.field === "employees"
                    ? departmentSort.order
                    : null,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditDepartment(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Xóa phòng ban"
                            description="Bạn có chắc chắn muốn xóa phòng ban này?"
                            onConfirm={() => handleDeleteDepartment(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            disabled={
                                record.employees && record.employees.length > 0
                            }
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                disabled={
                                    record.employees &&
                                    record.employees.length > 0
                                }
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filteredPositions = positions.filter(
        (position) =>
            position.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (position.description &&
                position.description
                    .toLowerCase()
                    .includes(searchText.toLowerCase()))
    );

    const filteredDepartments = departments.filter(
        (department) =>
            department.name
                .toLowerCase()
                .includes(searchDeptText.toLowerCase()) ||
            (department.description &&
                department.description
                    .toLowerCase()
                    .includes(searchDeptText.toLowerCase()))
    );

    const positionStats = getPositionStats();
    const departmentStats = getDepartmentStats();

    return (
        <div style={{ padding: 24 }}>
            <Tabs defaultActiveKey="positions" type="card">
                <TabPane
                    tab={
                        <span>
                            <BuildOutlined /> Chức vụ
                        </span>
                    }
                    key="positions"
                >
                    <Card>
                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="large"
                        >
                            {/* Header */}
                            <Row
                                gutter={[16, 16]}
                                justify="space-between"
                                align="middle"
                            >
                                <Col>
                                    <Space align="center" size={16}>
                                        <BuildOutlined
                                            style={{ fontSize: 24 }}
                                        />
                                        <Title level={3} style={{ margin: 0 }}>
                                            Quản lý Chức vụ
                                        </Title>
                                    </Space>
                                </Col>
                            </Row>

                            {/* Statistics */}
                            <Card>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Statistic
                                            title="Tổng số chức vụ"
                                            value={positionStats.totalPositions}
                                            prefix={<BuildOutlined />}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Chức vụ có nhân viên"
                                            value={
                                                positionStats.positionsWithEmployees
                                            }
                                            prefix={<UserOutlined />}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Số nhân viên trung bình/chức vụ"
                                            value={
                                                positionStats.avgEmployeesPerPosition
                                            }
                                            prefix={<BarChartOutlined />}
                                        />
                                    </Col>
                                </Row>
                            </Card>

                            {/* Toolbar */}
                            <Row gutter={16} align="middle">
                                <Col flex="auto">
                                    <Space wrap>
                                        <Search
                                            placeholder="Tìm kiếm theo tên hoặc mô tả chức vụ"
                                            value={searchText}
                                            onChange={(e) =>
                                                setSearchText(e.target.value)
                                            }
                                            style={{ width: 300 }}
                                            allowClear
                                        />

                                        <Select
                                            placeholder="Chi nhánh"
                                            style={{ width: 200 }}
                                            onChange={(value) =>
                                                setPositionFilter((prev) => ({
                                                    ...prev,
                                                    branch: value,
                                                }))
                                            }
                                            value={positionFilter.branch}
                                            allowClear
                                            loading={loadingBranches}
                                        >
                                            {branches.map((branch) => (
                                                <Option
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.name}
                                                </Option>
                                            ))}
                                        </Select>

                                        <Select
                                            placeholder="Lọc theo phòng ban"
                                            style={{ width: 200 }}
                                            onChange={(value) =>
                                                setPositionFilter({
                                                    ...positionFilter,
                                                    department: value,
                                                })
                                            }
                                            value={positionFilter.department}
                                            allowClear
                                        >
                                            {departments.map((dept) => (
                                                <Option
                                                    key={dept.id}
                                                    value={dept.id}
                                                >
                                                    {dept.name}
                                                </Option>
                                            ))}
                                        </Select>

                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={handleResetPositionFilters}
                                        >
                                            Đặt lại
                                        </Button>
                                    </Space>
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddPosition}
                                    >
                                        Thêm chức vụ
                                    </Button>
                                </Col>
                            </Row>

                            <Divider style={{ margin: "12px 0" }} />

                            {/* Table */}
                            <Table
                                columns={positionColumns}
                                dataSource={filteredPositions}
                                rowKey="id"
                                bordered
                                loading={loadingPositions}
                                onChange={handlePositionTableChange}
                            />
                        </Space>
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <span>
                            <TeamOutlined /> Phòng ban
                        </span>
                    }
                    key="departments"
                >
                    <Card>
                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="large"
                        >
                            {/* Header */}
                            <Row
                                gutter={[16, 16]}
                                justify="space-between"
                                align="middle"
                            >
                                <Col>
                                    <Space align="center" size={16}>
                                        <TeamOutlined
                                            style={{ fontSize: 24 }}
                                        />
                                        <Title level={3} style={{ margin: 0 }}>
                                            Quản lý Phòng ban
                                        </Title>
                                    </Space>
                                </Col>
                            </Row>

                            {/* Statistics */}
                            <Card>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Statistic
                                            title="Tổng số phòng ban"
                                            value={
                                                departmentStats.totalDepartments
                                            }
                                            prefix={<TeamOutlined />}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Phòng ban có nhân viên"
                                            value={
                                                departmentStats.departmentsWithEmployees
                                            }
                                            prefix={<UserOutlined />}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Số nhân viên trung bình/phòng ban"
                                            value={
                                                departmentStats.avgEmployeesPerDepartment
                                            }
                                            prefix={<BarChartOutlined />}
                                        />
                                    </Col>
                                </Row>
                            </Card>

                            {/* Toolbar */}
                            <Row gutter={16} align="middle">
                                <Col flex="auto">
                                    <Space wrap>
                                        <Search
                                            placeholder="Tìm kiếm theo tên hoặc mô tả phòng ban"
                                            value={searchDeptText}
                                            onChange={(e) =>
                                                setSearchDeptText(
                                                    e.target.value
                                                )
                                            }
                                            style={{ width: 300 }}
                                            allowClear
                                        />
                                        <Select
                                            placeholder="Chi nhánh"
                                            style={{ width: 200 }}
                                            onChange={(value) =>
                                                setDepartmentFilter((prev) => ({
                                                    ...prev,
                                                    branch: value,
                                                }))
                                            }
                                            value={departmentFilter.branch}
                                            allowClear
                                            loading={loadingBranches}
                                        >
                                            {branches.map((branch) => (
                                                <Option
                                                    key={branch.id}
                                                    value={branch.id}
                                                >
                                                    {branch.name}
                                                </Option>
                                            ))}
                                        </Select>
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={
                                                handleResetDepartmentFilters
                                            }
                                        >
                                            Đặt lại
                                        </Button>
                                    </Space>
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddDepartment}
                                    >
                                        Thêm phòng ban
                                    </Button>
                                </Col>
                            </Row>

                            <Divider style={{ margin: "12px 0" }} />

                            {/* Table */}
                            <Table
                                columns={departmentColumns}
                                dataSource={filteredDepartments}
                                rowKey="id"
                                bordered
                                loading={loadingDepartments}
                                onChange={handleDepartmentTableChange}
                            />
                        </Space>
                    </Card>
                </TabPane>
            </Tabs>

            {/* Form Modal for Position */}
            <PositionForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handlePositionSubmit}
                editingPosition={selectedPosition}
            />

            {/* Drawer for Department */}
            <Drawer
                title={
                    selectedDepartment
                        ? "Cập nhật phòng ban"
                        : "Thêm phòng ban mới"
                }
                placement="right"
                onClose={() => setIsDepartmentDrawerVisible(false)}
                open={isDepartmentDrawerVisible}
                width={500}
                destroyOnClose
            >
                <DepartmentForm
                    onSubmit={handleDepartmentSubmit}
                    editingDepartment={selectedDepartment}
                />
            </Drawer>
        </div>
    );
}
