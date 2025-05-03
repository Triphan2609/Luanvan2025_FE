import React, { useState } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
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
} from "antd";
import {
    UserAddOutlined,
    SearchOutlined,
    EditOutlined,
    EyeOutlined,
    StopOutlined,
    CheckCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import CustomerForm from "./Modals/CustomerForm";
import CustomerDetail from "./Drawer/CustomerDetail";

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
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortedInfo, setSortedInfo] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Sample data
    const [customers] = useState([
        {
            id: "1",
            name: "Nguyễn Văn A",
            phone: "0901234567",
            email: "nguyenvana@email.com",
            idNumber: "079201234567",
            type: CUSTOMER_TYPE.VIP,
            status: CUSTOMER_STATUS.ACTIVE,
            totalBookings: 15,
            totalSpent: 25000000,
            lastVisit: "2024-04-20",
        },
        // Add more sample data...
    ]);

    const columns = [
        {
            title: "Mã KH",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Họ tên",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 120,
        },
        {
            title: "Loại khách hàng",
            dataIndex: "type",
            key: "type",
            width: 150,
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
            sorter: (a, b) => a.totalBookings - b.totalBookings,
        },
        {
            title: "Tổng chi tiêu",
            dataIndex: "totalSpent",
            key: "totalSpent",
            width: 150,
            align: "right",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
            sorter: (a, b) => a.totalSpent - b.totalSpent,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => (
                <Badge
                    status={
                        status === CUSTOMER_STATUS.ACTIVE ? "success" : "error"
                    }
                    text={
                        status === CUSTOMER_STATUS.ACTIVE
                            ? "Đang hoạt động"
                            : "Đã khóa"
                    }
                />
            ),
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
    const handleToggleStatus = (record) => {
        message.success(
            `${
                record.status === CUSTOMER_STATUS.ACTIVE ? "Khóa" : "Mở khóa"
            } khách hàng thành công`
        );
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setSortedInfo(sorter);
        setPagination(pagination);
    };

    const handleReset = () => {
        setSearchText("");
        setFilterType("all");
        setFilterStatus("all");
        setSortedInfo({});
        setPagination({ ...pagination, current: 1 });
    };

    // Add handlers
    const handleAdd = () => {
        setEditingCustomer(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingCustomer(record);
        setIsModalVisible(true);
    };

    const handleViewDetails = (record) => {
        setSelectedCustomer(record);
        setIsDrawerVisible(true);
    };

    const handleSubmit = (values) => {
        if (editingCustomer) {
            // Update existing customer
            setCustomers(
                customers.map((item) =>
                    item.id === editingCustomer.id
                        ? { ...item, ...values }
                        : item
                )
            );
            message.success("Cập nhật thông tin khách hàng thành công");
        } else {
            // Add new customer
            const newCustomer = {
                ...values,
                id: `KH${Math.floor(Math.random() * 10000)}`,
                status: CUSTOMER_STATUS.ACTIVE,
                totalBookings: 0,
                totalSpent: 0,
                lastVisit: null,
            };
            setCustomers([...customers, newCustomer]);
            message.success("Thêm khách hàng mới thành công");
        }
        setIsModalVisible(false);
    };

    // Add components to render
    return (
        <div style={{ padding: 24 }}>
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
                                value={customers.length}
                                prefix={<UserAddOutlined />}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Khách VIP"
                                value={
                                    customers.filter(
                                        (c) => c.type === CUSTOMER_TYPE.VIP
                                    ).length
                                }
                                valueStyle={{
                                    color: TYPE_COLORS[CUSTOMER_TYPE.VIP],
                                }}
                            />
                        </Col>
                    </Row>

                    {/* Action Section */}
                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto">
                            <Space>
                                <Search
                                    placeholder="Tìm kiếm theo tên, SĐT, CCCD"
                                    value={searchText}
                                    onChange={(e) =>
                                        setSearchText(e.target.value)
                                    }
                                    style={{ width: 300 }}
                                    allowClear
                                />
                                <Select
                                    value={filterType}
                                    onChange={setFilterType}
                                    style={{ width: 150 }}
                                >
                                    <Select.Option value="all">
                                        Tất cả loại
                                    </Select.Option>
                                    <Select.Option value={CUSTOMER_TYPE.NORMAL}>
                                        Khách thường
                                    </Select.Option>
                                    <Select.Option value={CUSTOMER_TYPE.VIP}>
                                        Khách VIP
                                    </Select.Option>
                                </Select>
                                <Select
                                    value={filterStatus}
                                    onChange={setFilterStatus}
                                    style={{ width: 150 }}
                                >
                                    <Select.Option value="all">
                                        Tất cả trạng thái
                                    </Select.Option>
                                    <Select.Option
                                        value={CUSTOMER_STATUS.ACTIVE}
                                    >
                                        Đang hoạt động
                                    </Select.Option>
                                    <Select.Option
                                        value={CUSTOMER_STATUS.BLOCKED}
                                    >
                                        Đã khóa
                                    </Select.Option>
                                </Select>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleReset}
                                >
                                    Đặt lại
                                </Button>
                            </Space>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                onClick={handleAdd}
                            >
                                Thêm khách hàng
                            </Button>
                        </Col>
                    </Row>

                    {/* Table Section */}
                    <Table
                        columns={columns}
                        dataSource={customers}
                        rowKey="id"
                        pagination={pagination}
                        onChange={handleTableChange}
                        bordered
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
        </div>
    );
}
