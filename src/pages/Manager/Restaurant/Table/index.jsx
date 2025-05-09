import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Switch,
    Popconfirm,
    message,
    Card,
    Typography,
    Row,
    Col,
    Tag,
    Tabs,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    DesktopOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import { tableApi } from "../../../../api/restaurantApi";
import { areasRestaurantApi } from "../../../../api/areasRestaurantApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";
import TableLayout from "./TableLayout";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const TableStatus = {
    AVAILABLE: "available",
    OCCUPIED: "occupied",
    RESERVED: "reserved",
    MAINTENANCE: "maintenance",
};

const RestaurantTables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [form] = Form.useForm();
    const [branches, setBranches] = useState([]);
    const [areas, setAreas] = useState([]);
    const [activeTab, setActiveTab] = useState("list");
    const [filters, setFilters] = useState({
        tableNumber: "",
        status: "",
        areaId: "",
        isVIP: "",
        branchId: null,
    });
    const [filterBranchId, setFilterBranchId] = useState(null);
    const [tableStats, setTableStats] = useState({
        total: 0,
        available: 0,
        occupied: 0,
        reserved: 0,
        maintenance: 0,
    });

    useEffect(() => {
        fetchTables();
        fetchBranches();
        fetchAreas();
    }, [pagination.current, pagination.pageSize, filters, filterBranchId]);

    useEffect(() => {
        calculateTableStats();
    }, [tables]);

    const fetchTables = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
            };

            if (filterBranchId) {
                params.branchId = filterBranchId;
            }

            const response = await tableApi.getAllTables(params);

            if (Array.isArray(response)) {
                setTables(response);
                setPagination({
                    ...pagination,
                    total: response.length,
                });
            } else if (response && response.data) {
                setTables(response.data);
                setPagination({
                    ...pagination,
                    total: response.total || response.data.length,
                });
            } else {
                setTables([]);
                setPagination({
                    ...pagination,
                    total: 0,
                });
            }
        } catch (error) {
            message.error("Không thể tải danh sách bàn!");
            console.error("Error fetching tables:", error);
            setTables([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const branchesData = await getRestaurantBranches();
            setBranches(branchesData);
        } catch (error) {
            console.error("Error fetching branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        }
    };

    const fetchAreas = async (branchId = null) => {
        try {
            let areasData;
            if (branchId) {
                areasData = await areasRestaurantApi.getAreas({ branchId });
            } else {
                areasData = await areasRestaurantApi.getAreas();
            }
            setAreas(areasData);
        } catch (error) {
            console.error("Error fetching areas:", error);
            message.error("Không thể tải danh sách khu vực");
        }
    };

    const showModal = (record = null) => {
        setCurrentTable(record);
        setIsEditing(!!record);
        setIsModalVisible(true);

        if (record) {
            form.setFieldsValue({
                tableNumber: record.tableNumber,
                capacity: record.capacity,
                status: record.status,
                areaId: record.areaId,
                isVIP: record.isVIP,
                positionX: record.positionX,
                positionY: record.positionY,
                isActive: record.isActive,
                branchId: record.branchId,
            });

            if (record.branchId) {
                fetchAreas(record.branchId);
            }
        } else {
            form.resetFields();
            form.setFieldsValue({
                status: TableStatus.AVAILABLE,
                isVIP: false,
                isActive: true,
                capacity: 4,
                branchId:
                    filterBranchId ||
                    (branches.length > 0 ? branches[0].id : null),
            });

            if (filterBranchId) {
                fetchAreas(filterBranchId);
            } else if (branches.length > 0) {
                fetchAreas(branches[0].id);
            }
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Prepare the data object
            const tableData = {
                ...values,
                areaId: parseInt(values.areaId),
                branchId: parseInt(values.branchId),
            };

            if (isEditing) {
                await tableApi.updateTable(currentTable.id, tableData);
                message.success("Bàn đã được cập nhật!");
            } else {
                await tableApi.createTable(tableData);
                message.success("Bàn đã được tạo!");
            }

            setIsModalVisible(false);
            fetchTables();
        } catch (error) {
            message.error("Có lỗi xảy ra!");
            console.error("Error submitting table:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await tableApi.deleteTable(id);
            message.success("Bàn đã được xóa!");
            fetchTables();
        } catch (error) {
            message.error("Không thể xóa bàn!");
            console.error("Error deleting table:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
    };

    const handleBranchFilterChange = (value) => {
        setFilterBranchId(value);
        // When branch changes, fetch areas for that branch
        if (value) {
            fetchAreas(value);
        } else {
            fetchAreas();
        }
        // Reset area selection when branch changes
        handleFilterChange("areaId", "");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case TableStatus.AVAILABLE:
                return "green";
            case TableStatus.OCCUPIED:
                return "red";
            case TableStatus.RESERVED:
                return "orange";
            case TableStatus.MAINTENANCE:
                return "gray";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case TableStatus.AVAILABLE:
                return "Trống";
            case TableStatus.OCCUPIED:
                return "Đang sử dụng";
            case TableStatus.RESERVED:
                return "Đã đặt";
            case TableStatus.MAINTENANCE:
                return "Bảo trì";
            default:
                return "Không xác định";
        }
    };

    const getAreaName = (areaId) => {
        if (!areaId) return "Không xác định";
        const area = areas.find((a) => a.id === areaId);
        return area ? area.name : "Không xác định";
    };

    const columns = [
        {
            title: "Số bàn",
            dataIndex: "tableNumber",
            key: "tableNumber",
        },
        {
            title: "Sức chứa",
            dataIndex: "capacity",
            key: "capacity",
            sorter: true,
            render: (capacity) => `${capacity} người`,
        },
        {
            title: "Khu vực",
            dataIndex: "areaId",
            key: "areaId",
            render: (areaId) => getAreaName(areaId),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: "VIP",
            dataIndex: "isVIP",
            key: "isVIP",
            render: (isVIP) => (isVIP ? <Tag color="gold">VIP</Tag> : "Thường"),
        },
        {
            title: "Hoạt động",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "Hoạt động" : "Ngưng hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        size="small"
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa bàn này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const calculateTableStats = () => {
        const stats = {
            total: tables.length,
            available: tables.filter((t) => t.status === TableStatus.AVAILABLE)
                .length,
            occupied: tables.filter((t) => t.status === TableStatus.OCCUPIED)
                .length,
            reserved: tables.filter((t) => t.status === TableStatus.RESERVED)
                .length,
            maintenance: tables.filter(
                (t) => t.status === TableStatus.MAINTENANCE
            ).length,
        };
        setTableStats(stats);
    };

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >
                <Title level={3}>Quản lý Bàn Nhà hàng</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                >
                    Thêm bàn mới
                </Button>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={4}>
                    <Card
                        style={{
                            backgroundColor: "#f0f2f5",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "16px", color: "#595959" }}>
                            Tổng số bàn
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: "bold",
                                color: "#262626",
                            }}
                        >
                            {tableStats.total}
                        </div>
                    </Card>
                </Col>
                <Col span={5}>
                    <Card
                        style={{
                            backgroundColor: "#f6ffed",
                            borderColor: "#b7eb8f",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "16px", color: "#389e0d" }}>
                            Trống
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: "bold",
                                color: "#52c41a",
                            }}
                        >
                            {tableStats.available}
                        </div>
                    </Card>
                </Col>
                <Col span={5}>
                    <Card
                        style={{
                            backgroundColor: "#fff2f0",
                            borderColor: "#ffccc7",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "16px", color: "#cf1322" }}>
                            Đang sử dụng
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: "bold",
                                color: "#f5222d",
                            }}
                        >
                            {tableStats.occupied}
                        </div>
                    </Card>
                </Col>
                <Col span={5}>
                    <Card
                        style={{
                            backgroundColor: "#fffbe6",
                            borderColor: "#ffe58f",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "16px", color: "#d48806" }}>
                            Đã đặt trước
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: "bold",
                                color: "#faad14",
                            }}
                        >
                            {tableStats.reserved}
                        </div>
                    </Card>
                </Col>
                <Col span={5}>
                    <Card
                        style={{
                            backgroundColor: "#f9f9f9",
                            borderColor: "#d9d9d9",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "16px", color: "#8c8c8c" }}>
                            Bảo trì
                        </div>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: "bold",
                                color: "#8c8c8c",
                            }}
                        >
                            {tableStats.maintenance}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                <TabPane
                    tab={
                        <span>
                            <AppstoreOutlined />
                            Danh sách bàn
                        </span>
                    }
                    key="list"
                >
                    <Card>
                        <div
                            style={{
                                background: "#f9f9f9",
                                padding: "16px",
                                borderRadius: "4px",
                                marginBottom: "16px",
                            }}
                        >
                            <Row gutter={16}>
                                <Col xs={24} sm={12} md={6} lg={5}>
                                    <div
                                        style={{
                                            marginBottom: "8px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Tìm kiếm
                                    </div>
                                    <Input.Search
                                        placeholder="Tìm theo số bàn"
                                        allowClear
                                        onSearch={(value) =>
                                            handleFilterChange(
                                                "tableNumber",
                                                value
                                            )
                                        }
                                        style={{ width: "100%" }}
                                    />
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={5}>
                                    <div
                                        style={{
                                            marginBottom: "8px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Chi nhánh
                                    </div>
                                    <Select
                                        placeholder="Chi nhánh"
                                        allowClear
                                        style={{ width: "100%" }}
                                        onChange={handleBranchFilterChange}
                                        value={filterBranchId}
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
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={5}>
                                    <div
                                        style={{
                                            marginBottom: "8px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Khu vực
                                    </div>
                                    <Select
                                        placeholder="Khu vực"
                                        allowClear
                                        style={{ width: "100%" }}
                                        onChange={(value) =>
                                            handleFilterChange("areaId", value)
                                        }
                                        value={filters.areaId}
                                    >
                                        {areas.map((area) => (
                                            <Option
                                                key={area.id}
                                                value={area.id}
                                            >
                                                {area.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={5}>
                                    <div
                                        style={{
                                            marginBottom: "8px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Trạng thái
                                    </div>
                                    <Select
                                        placeholder="Trạng thái"
                                        allowClear
                                        style={{ width: "100%" }}
                                        onChange={(value) =>
                                            handleFilterChange("status", value)
                                        }
                                        value={filters.status}
                                    >
                                        <Option value={TableStatus.AVAILABLE}>
                                            <Tag color="green">Trống</Tag>
                                        </Option>
                                        <Option value={TableStatus.OCCUPIED}>
                                            <Tag color="red">Đang sử dụng</Tag>
                                        </Option>
                                        <Option value={TableStatus.RESERVED}>
                                            <Tag color="orange">Đã đặt</Tag>
                                        </Option>
                                        <Option value={TableStatus.MAINTENANCE}>
                                            <Tag color="gray">Bảo trì</Tag>
                                        </Option>
                                    </Select>
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={4}>
                                    <div
                                        style={{
                                            marginBottom: "8px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Loại bàn
                                    </div>
                                    <Select
                                        placeholder="Loại bàn"
                                        allowClear
                                        style={{ width: "100%" }}
                                        onChange={(value) =>
                                            handleFilterChange("isVIP", value)
                                        }
                                        value={filters.isVIP}
                                    >
                                        <Option value="true">
                                            <Tag color="purple">VIP</Tag>
                                        </Option>
                                        <Option value="false">
                                            <Tag color="default">Thường</Tag>
                                        </Option>
                                    </Select>
                                </Col>
                            </Row>
                        </div>

                        <Table
                            columns={columns}
                            dataSource={tables}
                            rowKey="id"
                            pagination={pagination}
                            loading={loading}
                            onChange={handleTableChange}
                            scroll={{ x: 1000 }}
                        />
                    </Card>
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <DesktopOutlined />
                            Sơ đồ bàn
                        </span>
                    }
                    key="layout"
                >
                    <TableLayout
                        tables={tables}
                        onUpdateTable={showModal}
                        refreshTables={fetchTables}
                    />
                </TabPane>
            </Tabs>

            <Modal
                title={isEditing ? "Chỉnh sửa bàn" : "Thêm bàn mới"}
                visible={isModalVisible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={loading}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: TableStatus.AVAILABLE,
                        isVIP: false,
                        isActive: true,
                        capacity: 4,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="tableNumber"
                                label="Số bàn"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập số bàn!",
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập số bàn" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="capacity"
                                label="Sức chứa"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập sức chứa!",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="branchId"
                                label="Chi nhánh"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn chi nhánh!",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn chi nhánh"
                                    onChange={(value) => {
                                        // When branch changes, fetch areas for that branch
                                        fetchAreas(value);
                                        // Reset area selection
                                        form.setFieldsValue({
                                            areaId: undefined,
                                        });
                                    }}
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
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="areaId"
                                label="Khu vực"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn khu vực!",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn khu vực">
                                    {areas.map((area) => (
                                        <Option key={area.id} value={area.id}>
                                            {area.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn trạng thái!",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value={TableStatus.AVAILABLE}>
                                        Trống
                                    </Option>
                                    <Option value={TableStatus.OCCUPIED}>
                                        Đang sử dụng
                                    </Option>
                                    <Option value={TableStatus.RESERVED}>
                                        Đã đặt
                                    </Option>
                                    <Option value={TableStatus.MAINTENANCE}>
                                        Bảo trì
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isVIP"
                                label="Bàn VIP"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="VIP"
                                    unCheckedChildren="Thường"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="isActive"
                                label="Hoạt động"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Hoạt động"
                                    unCheckedChildren="Ngưng hoạt động"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="positionX"
                                label="Vị trí X (Sơ đồ)"
                            >
                                <InputNumber style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="positionY"
                                label="Vị trí Y (Sơ đồ)"
                            >
                                <InputNumber style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default RestaurantTables;
