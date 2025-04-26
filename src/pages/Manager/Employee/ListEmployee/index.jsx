import React, { useState } from "react";
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
} from "antd";
import { UserAddOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FilterOutlined } from "@ant-design/icons";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeDetail from "./components/EmployeeDetail";

const { Title, Text } = Typography;
const { Search } = Input;

// Constants
const EMPLOYEE_STATUS = {
    ACTIVE: "active",
    ON_LEAVE: "on_leave",
};

const EMPLOYEE_ROLE = {
    ADMIN: "admin",
    MANAGER: "manager",
    RECEPTIONIST: "receptionist",
    STAFF: "staff",
};

const DEPARTMENT = {
    MANAGEMENT: "management",
    FRONT_DESK: "front_desk",
    HOUSEKEEPING: "housekeeping",
    RESTAURANT: "restaurant",
    MAINTENANCE: "maintenance",
};

export default function EmployeeManagement() {
    // States
    const [searchText, setSearchText] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterRole, setFilterRole] = useState("all");
    const [sortedInfo, setSortedInfo] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
    });

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Sample data
    const [employees, setEmployees] = useState([
        {
            id: "NV001",
            name: "Nguyễn Văn A",
            email: "nguyenvana@email.com",
            phone: "0901234567",
            department: DEPARTMENT.FRONT_DESK,
            role: EMPLOYEE_ROLE.RECEPTIONIST,
            status: EMPLOYEE_STATUS.ACTIVE,
            joinDate: "2024-01-01",
            avatar: "https://example.com/avatar1.jpg",
        },
        // Thêm dữ liệu mẫu...
    ]);

    const columns = [
        {
            title: "Mã NV",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Nhân viên",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space>
                    <Avatar src={record.avatar} />
                    <Space direction="vertical" size={0}>
                        <Text strong>{text}</Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            {record.email}
                        </Text>
                    </Space>
                </Space>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
        },
        {
            title: "Phòng ban",
            dataIndex: "department",
            key: "department",
            render: (department) => {
                const colors = {
                    [DEPARTMENT.MANAGEMENT]: "blue",
                    [DEPARTMENT.FRONT_DESK]: "green",
                    [DEPARTMENT.HOUSEKEEPING]: "orange",
                    [DEPARTMENT.RESTAURANT]: "purple",
                    [DEPARTMENT.MAINTENANCE]: "cyan",
                };
                const labels = {
                    [DEPARTMENT.MANAGEMENT]: "Quản lý",
                    [DEPARTMENT.FRONT_DESK]: "Lễ tân",
                    [DEPARTMENT.HOUSEKEEPING]: "Buồng phòng",
                    [DEPARTMENT.RESTAURANT]: "Nhà hàng",
                    [DEPARTMENT.MAINTENANCE]: "Kỹ thuật",
                };
                return <Tag color={colors[department]}>{labels[department]}</Tag>;
            },
            filters: Object.entries(DEPARTMENT).map(([_, value]) => ({
                text:
                    value === "management"
                        ? "Quản lý"
                        : value === "front_desk"
                        ? "Lễ tân"
                        : value === "housekeeping"
                        ? "Buồng phòng"
                        : value === "restaurant"
                        ? "Nhà hàng"
                        : "Kỹ thuật",
                value: value,
            })),
            onFilter: (value, record) => record.department === value,
        },
        {
            title: "Chức vụ",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                const colors = {
                    [EMPLOYEE_ROLE.ADMIN]: "red",
                    [EMPLOYEE_ROLE.MANAGER]: "purple",
                    [EMPLOYEE_ROLE.RECEPTIONIST]: "blue",
                    [EMPLOYEE_ROLE.STAFF]: "default",
                };
                const labels = {
                    [EMPLOYEE_ROLE.ADMIN]: "Quản trị",
                    [EMPLOYEE_ROLE.MANAGER]: "Quản lý",
                    [EMPLOYEE_ROLE.RECEPTIONIST]: "Lễ tân",
                    [EMPLOYEE_ROLE.STAFF]: "Nhân viên",
                };
                return <Tag color={colors[role]}>{labels[role]}</Tag>;
            },
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 120,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const configs = {
                    [EMPLOYEE_STATUS.ACTIVE]: { status: "success", text: "Đang làm việc" },
                    [EMPLOYEE_STATUS.INACTIVE]: { status: "error", text: "Đã nghỉ việc" },
                    [EMPLOYEE_STATUS.ON_LEAVE]: { status: "warning", text: "Tạm nghỉ" },
                };
                return <Badge status={configs[status].status} text={configs[status].text} />;
            },
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} size="small" />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small" />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Handlers
    const handleViewDetail = (record) => {
        setSelectedEmployee(record);
        setIsDetailVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedEmployee(record);
        setIsModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedEmployee(null);
        setIsModalVisible(true);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
        setSortedInfo(sorter);
    };

    const handleSubmit = (values) => {
        if (selectedEmployee) {
            // Cập nhật nhân viên
            setEmployees(employees.map((emp) => (emp.id === selectedEmployee.id ? { ...emp, ...values } : emp)));
            message.success("Cập nhật thông tin nhân viên thành công");
        } else {
            // Thêm nhân viên mới
            const newEmployee = {
                ...values,
                status: EMPLOYEE_STATUS.ACTIVE,
            };
            setEmployees([...employees, newEmployee]);
            message.success("Thêm nhân viên mới thành công");
        }
        setIsModalVisible(false);
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Thống kê */}
                    <Row gutter={16}>
                        <Col span={8}>
                            <Statistic title="Tổng nhân viên" value={employees.length} prefix={<UserAddOutlined />} />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Đang làm việc"
                                value={employees.filter((e) => e.status === EMPLOYEE_STATUS.ACTIVE).length}
                                valueStyle={{ color: "#52c41a" }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Tạm nghỉ"
                                value={employees.filter((e) => e.status === EMPLOYEE_STATUS.ON_LEAVE).length}
                                valueStyle={{ color: "#faad14" }}
                            />
                        </Col>
                    </Row>

                    {/* Thanh công cụ */}
                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto">
                            <Space wrap>
                                <Search
                                    placeholder="Tìm theo mã, tên hoặc số điện thoại"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: 300 }}
                                    allowClear
                                />
                                <Select
                                    value={filterDepartment}
                                    onChange={setFilterDepartment}
                                    style={{ width: 150 }}
                                    placeholder="Phòng ban"
                                >
                                    <Select.Option value="all">Tất cả phòng ban</Select.Option>
                                    {Object.entries(DEPARTMENT).map(([key, value]) => (
                                        <Select.Option key={key} value={value}>
                                            {value === "management"
                                                ? "Quản lý"
                                                : value === "front_desk"
                                                ? "Lễ tân"
                                                : value === "housekeeping"
                                                ? "Buồng phòng"
                                                : value === "restaurant"
                                                ? "Nhà hàng"
                                                : "Kỹ thuật"}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Select value={filterRole} onChange={setFilterRole} style={{ width: 150 }} placeholder="Chức vụ">
                                    <Select.Option value="all">Tất cả chức vụ</Select.Option>
                                    {Object.entries(EMPLOYEE_ROLE).map(([key, value]) => (
                                        <Select.Option key={key} value={value}>
                                            {value === "admin"
                                                ? "Quản trị"
                                                : value === "manager"
                                                ? "Quản lý"
                                                : value === "receptionist"
                                                ? "Lễ tân"
                                                : "Nhân viên"}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }} placeholder="Trạng thái">
                                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                                    <Select.Option value={EMPLOYEE_STATUS.ACTIVE}>Đang làm việc</Select.Option>
                                    <Select.Option value={EMPLOYEE_STATUS.ON_LEAVE}>Tạm nghỉ</Select.Option>
                                </Select>
                                <Button
                                    icon={<FilterOutlined />}
                                    onClick={() => {
                                        setSearchText("");
                                        setFilterDepartment("all");
                                        setFilterRole("all");
                                        setFilterStatus("all");
                                    }}
                                >
                                    Đặt lại
                                </Button>
                            </Space>
                        </Col>
                        <Col>
                            <Button type="primary" icon={<UserAddOutlined />} onClick={handleAdd}>
                                Thêm nhân viên
                            </Button>
                        </Col>
                    </Row>

                    {/* Bảng dữ liệu */}
                    <Table
                        columns={columns}
                        dataSource={employees}
                        rowKey="id"
                        pagination={pagination}
                        onChange={handleTableChange}
                        bordered
                    />
                </Space>
            </Card>

            <EmployeeForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingEmployee={selectedEmployee}
                EMPLOYEE_ROLE={EMPLOYEE_ROLE}
                DEPARTMENT={DEPARTMENT}
            />

            <EmployeeDetail
                open={isDetailVisible}
                onClose={() => setIsDetailVisible(false)}
                employee={selectedEmployee}
                DEPARTMENT={DEPARTMENT}
                EMPLOYEE_ROLE={EMPLOYEE_ROLE}
                EMPLOYEE_STATUS={EMPLOYEE_STATUS}
            />
        </div>
    );
}
