import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Card,
    Row,
    Col,
    Select,
    Empty,
    Spin,
    Typography,
    Tabs,
    Badge,
    Tooltip,
    Button,
    message,
    Modal,
    Form,
    Input,
    InputNumber,
    Switch,
} from "antd";
import {
    TableOutlined,
    PlusOutlined,
    EditOutlined,
    LockOutlined,
    UnlockOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { tableApi } from "../../../../api/restaurantApi";
import { areasRestaurantApi } from "../../../../api/areasRestaurantApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";
import "./TableByArea.styles.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Hàm tạo style cho các trạng thái bàn
const getTableStatusStyle = (status) => {
    switch (status) {
        case "available":
            return {
                background: "#52c41a",
                color: "white",
                borderColor: "#52c41a",
            };
        case "occupied":
            return {
                background: "#f5222d",
                color: "white",
                borderColor: "#f5222d",
            };
        case "reserved":
            return {
                background: "#faad14",
                color: "white",
                borderColor: "#faad14",
            };
        case "maintenance":
            return {
                background: "#1890ff",
                color: "white",
                borderColor: "#1890ff",
            };
        default:
            return {};
    }
};

// Component hiển thị bàn
const TableItem = ({ table, onEditTable }) => {
    const statusStyle = getTableStatusStyle(table.status);

    return (
        <Tooltip
            title={
                <>
                    <div>Bàn: {table.tableNumber}</div>
                    <div>Số chỗ: {table.capacity}</div>
                    <div>
                        Trạng thái:{" "}
                        {table.status === "available"
                            ? "Trống"
                            : table.status === "occupied"
                            ? "Đang sử dụng"
                            : table.status === "reserved"
                            ? "Đã đặt trước"
                            : "Bảo trì"}
                    </div>
                    {table.isVIP && <div>VIP: Có</div>}
                </>
            }
            color={statusStyle.background}
            placement="top"
        >
            <Badge.Ribbon text={table.isVIP ? "VIP" : ""} color="purple">
                <Card
                    size="small"
                    style={{
                        width: 120,
                        height: 100,
                        margin: "8px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
                        transition: "all 0.3s",
                        ...statusStyle,
                    }}
                    hoverable
                    onClick={() => onEditTable(table)}
                >
                    <TableOutlined style={{ fontSize: 24 }} />
                    <div style={{ marginTop: 8, fontWeight: "bold" }}>
                        {table.tableNumber}
                    </div>
                    <div style={{ fontSize: 12 }}>{table.capacity} người</div>
                </Card>
            </Badge.Ribbon>
        </Tooltip>
    );
};

const TableByArea = () => {
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [areas, setAreas] = useState([]);
    const [tables, setTables] = useState([]);
    const [activeAreaKey, setActiveAreaKey] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);

    // Use useMemo to cache the filtered tables
    const tablesByArea = useMemo(() => {
        if (!activeAreaKey || !tables || tables.length === 0) return [];
        return tables.filter(
            (table) => table.areaId === parseInt(activeAreaKey)
        );
    }, [tables, activeAreaKey]);

    // Use useCallback for fetching data to prevent unnecessary recreations
    const fetchBranches = useCallback(async () => {
        if (branches.length > 0) return; // Prevent redundant API calls if we already have branches

        try {
            setLoading(true);
            const branchesData = await getRestaurantBranches();
            setBranches(branchesData);
            if (branchesData && branchesData.length > 0) {
                setSelectedBranch(branchesData[0].id);
            }
        } catch (error) {
            console.error("Error fetching branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        } finally {
            setLoading(false);
        }
    }, [branches.length]);

    const fetchAreas = useCallback(async (branchId) => {
        try {
            setLoading(true);
            const areasData = await areasRestaurantApi.getAreas({ branchId });
            setAreas(areasData);
            if (areasData && areasData.length > 0) {
                setActiveAreaKey(areasData[0].id.toString());
            } else {
                setActiveAreaKey("");
                setTables([]);
            }
        } catch (error) {
            console.error("Error fetching areas:", error);
            message.error("Không thể tải danh sách khu vực");
            setAreas([]);
            setActiveAreaKey("");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTablesByArea = useCallback(async (areaId) => {
        try {
            setLoading(true);
            const tablesData = await tableApi.getTablesByArea(areaId);
            setTables(tablesData);
        } catch (error) {
            console.error("Error fetching tables by area:", error);
            message.error("Không thể tải danh sách bàn");
            setTables([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        if (selectedBranch) {
            fetchAreas(selectedBranch);
        }
    }, [selectedBranch, fetchAreas]);

    useEffect(() => {
        if (activeAreaKey) {
            fetchTablesByArea(activeAreaKey);
        }
    }, [activeAreaKey, fetchTablesByArea]);

    const handleBranchChange = useCallback((value) => {
        setSelectedBranch(value);
        setActiveAreaKey("");
        setTables([]);
    }, []);

    const handleAreaChange = (key) => {
        setActiveAreaKey(key);
    };

    const showTableModal = (table = null) => {
        setIsEditing(!!table);
        setCurrentTable(table);
        setIsModalVisible(true);

        if (table) {
            form.setFieldsValue({
                tableNumber: table.tableNumber,
                capacity: table.capacity,
                isVIP: table.isVIP,
                status: table.status,
                areaId: table.areaId,
                branchId: table.branchId,
                isActive: table.isActive,
            });
        } else {
            form.setFieldsValue({
                tableNumber: "",
                capacity: 4,
                isVIP: false,
                status: "available",
                areaId: activeAreaKey ? parseInt(activeAreaKey) : null,
                branchId: selectedBranch,
                isActive: true,
            });
        }
    };

    const handleTableModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleTableSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (isEditing) {
                await tableApi.updateTable(currentTable.id, values);
                message.success("Cập nhật bàn thành công");
            } else {
                await tableApi.createTable(values);
                message.success("Tạo bàn mới thành công");
            }

            setIsModalVisible(false);
            if (activeAreaKey) {
                fetchTablesByArea(activeAreaKey);
            }
        } catch (error) {
            console.error("Error saving table:", error);
            message.error("Lỗi khi lưu thông tin bàn");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            title={
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>Quản lý bàn theo khu vực</span>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showTableModal()}
                        disabled={!activeAreaKey}
                    >
                        Thêm bàn mới
                    </Button>
                </div>
            }
            className="table-by-area-card"
        >
            <div style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Chọn chi nhánh"
                    style={{ width: 250 }}
                    value={selectedBranch}
                    onChange={handleBranchChange}
                    loading={loading}
                >
                    {branches.map((branch) => (
                        <Option key={branch.id} value={branch.id}>
                            {branch.name}
                        </Option>
                    ))}
                </Select>
            </div>

            <Spin spinning={loading}>
                {areas.length > 0 ? (
                    <div className="area-layout">
                        <div className="area-sidebar">
                            <Tabs
                                tabPosition="left"
                                activeKey={activeAreaKey}
                                onChange={handleAreaChange}
                                style={{ height: "100%" }}
                            >
                                {areas.map((area) => (
                                    <TabPane
                                        tab={
                                            <span
                                                style={{
                                                    padding: "8px 0",
                                                    display: "block",
                                                }}
                                            >
                                                <SettingOutlined />
                                                {area.name}
                                            </span>
                                        }
                                        key={area.id}
                                    />
                                ))}
                            </Tabs>
                        </div>
                        <div className="area-content">
                            {areas.map(
                                (area) =>
                                    area.id.toString() === activeAreaKey && (
                                        <div
                                            key={area.id}
                                            style={{ padding: 16 }}
                                        >
                                            <div
                                                style={{
                                                    marginBottom: 16,
                                                    padding: "12px 16px",
                                                    backgroundColor: "#f5f5f5",
                                                    borderRadius: "4px",
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <div>
                                                    <Title
                                                        level={5}
                                                        style={{ margin: 0 }}
                                                    >
                                                        Khu vực: {area.name}
                                                    </Title>
                                                    {area.description && (
                                                        <Text type="secondary">
                                                            {area.description}
                                                        </Text>
                                                    )}
                                                </div>
                                                <div>
                                                    <Button
                                                        type="primary"
                                                        icon={<PlusOutlined />}
                                                        onClick={() =>
                                                            showTableModal()
                                                        }
                                                    >
                                                        Thêm bàn
                                                    </Button>
                                                </div>
                                            </div>

                                            {tablesByArea.length > 0 ? (
                                                <div>
                                                    <div
                                                        style={{
                                                            marginBottom: 16,
                                                        }}
                                                    >
                                                        <Badge
                                                            color="#52c41a"
                                                            text="Trống"
                                                            style={{
                                                                marginRight: 16,
                                                            }}
                                                        />
                                                        <Badge
                                                            color="#f5222d"
                                                            text="Đang sử dụng"
                                                            style={{
                                                                marginRight: 16,
                                                            }}
                                                        />
                                                        <Badge
                                                            color="#faad14"
                                                            text="Đã đặt trước"
                                                            style={{
                                                                marginRight: 16,
                                                            }}
                                                        />
                                                        <Badge
                                                            color="#1890ff"
                                                            text="Bảo trì"
                                                        />
                                                    </div>
                                                    <Row
                                                        gutter={[16, 16]}
                                                        style={{
                                                            marginTop: 16,
                                                        }}
                                                    >
                                                        {tablesByArea.map(
                                                            (table) => (
                                                                <Col
                                                                    key={
                                                                        table.id
                                                                    }
                                                                    xs={12}
                                                                    sm={8}
                                                                    md={6}
                                                                    lg={4}
                                                                    xl={4}
                                                                >
                                                                    <TableItem
                                                                        table={
                                                                            table
                                                                        }
                                                                        onEditTable={
                                                                            showTableModal
                                                                        }
                                                                    />
                                                                </Col>
                                                            )
                                                        )}
                                                    </Row>
                                                </div>
                                            ) : (
                                                <Empty
                                                    description="Không có bàn nào trong khu vực này"
                                                    image={
                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                    }
                                                />
                                            )}
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                ) : (
                    <Empty
                        description={
                            <span>
                                Không có khu vực nào trong chi nhánh này.
                                <Button
                                    type="link"
                                    onClick={() => {
                                        if (selectedBranch) {
                                            areasRestaurantApi
                                                .createDefaultAreas(
                                                    selectedBranch
                                                )
                                                .then(() => {
                                                    message.success(
                                                        "Đã tạo khu vực mặc định"
                                                    );
                                                    fetchAreas(selectedBranch);
                                                })
                                                .catch((err) => {
                                                    message.error(
                                                        "Không thể tạo khu vực mặc định"
                                                    );
                                                    console.error(err);
                                                });
                                        } else {
                                            message.warning(
                                                "Vui lòng chọn chi nhánh trước"
                                            );
                                        }
                                    }}
                                >
                                    Tạo khu vực mặc định
                                </Button>
                            </span>
                        }
                    />
                )}
            </Spin>

            <Modal
                title={isEditing ? "Cập nhật thông tin bàn" : "Thêm bàn mới"}
                visible={isModalVisible}
                onCancel={handleTableModalCancel}
                onOk={handleTableSubmit}
                confirmLoading={loading}
                width={700}
                maskClosable={false}
                destroyOnClose={true}
                okText={isEditing ? "Cập nhật" : "Tạo mới"}
                cancelText="Hủy bỏ"
                className="table-form-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        isActive: true,
                        isVIP: false,
                        status: "available",
                        capacity: 4,
                    }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="tableNumber"
                                label="Số bàn"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập số bàn",
                                    },
                                ]}
                            >
                                <Input
                                    placeholder="VD: B01, B02, ..."
                                    prefix={<TableOutlined />}
                                    maxLength={10}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="capacity"
                                label="Số chỗ"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập số chỗ",
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    max={50}
                                    style={{ width: "100%" }}
                                    placeholder="Số người có thể ngồi"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn trạng thái",
                                    },
                                ]}
                            >
                                <Select>
                                    <Option value="available">
                                        <Badge color="#52c41a" text="Trống" />
                                    </Option>
                                    <Option value="occupied">
                                        <Badge
                                            color="#f5222d"
                                            text="Đang sử dụng"
                                        />
                                    </Option>
                                    <Option value="reserved">
                                        <Badge
                                            color="#faad14"
                                            text="Đã đặt trước"
                                        />
                                    </Option>
                                    <Option value="maintenance">
                                        <Badge color="#1890ff" text="Bảo trì" />
                                    </Option>
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
                                        message: "Vui lòng chọn khu vực",
                                    },
                                ]}
                            >
                                <Select>
                                    {areas.map((area) => (
                                        <Option key={area.id} value={area.id}>
                                            {area.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="branchId" hidden>
                        <Input />
                    </Form.Item>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="isVIP"
                                label="Bàn VIP"
                                valuePropName="checked"
                                extra="Các bàn VIP có thể được tính phí cao hơn"
                            >
                                <Switch
                                    checkedChildren="VIP"
                                    unCheckedChildren="Thường"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="isActive"
                                label="Hoạt động"
                                valuePropName="checked"
                                extra="Chỉ các bàn đang hoạt động mới có thể được đặt"
                            >
                                <Switch
                                    checkedChildren={<UnlockOutlined />}
                                    unCheckedChildren={<LockOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Card>
    );
};

export default TableByArea;
