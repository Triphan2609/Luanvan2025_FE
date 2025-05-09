import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Card,
    Select,
    Button,
    Space,
    Row,
    Col,
    message,
    Tag,
    Tooltip,
    Popconfirm,
    Modal,
    Typography,
    Badge,
    Spin,
    Empty,
    Divider,
    Dropdown,
} from "antd";
import {
    EditOutlined,
    UserOutlined,
    CloseOutlined,
    SwapOutlined,
    CheckOutlined,
    TableOutlined,
    InfoCircleOutlined,
    SettingOutlined,
    ReloadOutlined,
    DownOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { tableApi } from "../../../../api/restaurantApi";
import { areasRestaurantApi } from "../../../../api/areasRestaurantApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";
import "./TableLayout.css";

const { Option } = Select;
const { Text, Title } = Typography;

const TableStatus = {
    AVAILABLE: "available",
    OCCUPIED: "occupied",
    RESERVED: "reserved",
    MAINTENANCE: "maintenance",
};

const TableLayout = ({ tables, onUpdateTable, refreshTables }) => {
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isSwapModalVisible, setIsSwapModalVisible] = useState(false);
    const [sourceTable, setSourceTable] = useState(null);
    const [targetTable, setTargetTable] = useState(null);
    const [availableTables, setAvailableTables] = useState([]);
    const [areas, setAreas] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Memoize filtered tables to avoid unnecessary filtering
    const filteredTables = useMemo(() => {
        if (!tables || tables.length === 0) return [];

        if (selectedArea) {
            return tables.filter((table) => table.areaId === selectedArea);
        }

        return [...tables];
    }, [tables, selectedArea]);

    // Use memoized count for statistics
    const tableStats = useMemo(() => {
        return {
            total: filteredTables.length,
            available: filteredTables.filter(
                (t) => t.status === TableStatus.AVAILABLE
            ).length,
            occupied: filteredTables.filter(
                (t) => t.status === TableStatus.OCCUPIED
            ).length,
            reserved: filteredTables.filter(
                (t) => t.status === TableStatus.RESERVED
            ).length,
            maintenance: filteredTables.filter(
                (t) => t.status === TableStatus.MAINTENANCE
            ).length,
        };
    }, [filteredTables]);

    // Use useCallback for fetching data
    const fetchBranches = useCallback(async () => {
        if (branches.length > 0) return; // Skip if we already have branches

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
            // Reset selected area
            setSelectedArea(null);
        } catch (error) {
            console.error("Error fetching areas:", error);
            message.error("Không thể tải danh sách khu vực");
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

    const getStatusColor = (status) => {
        switch (status) {
            case TableStatus.AVAILABLE:
                return "#52c41a";
            case TableStatus.OCCUPIED:
                return "#f5222d";
            case TableStatus.RESERVED:
                return "#faad14";
            case TableStatus.MAINTENANCE:
                return "#8c8c8c";
            default:
                return "#1890ff";
        }
    };

    const handleBranchChange = useCallback((value) => {
        setSelectedBranch(value);
        setSelectedArea(null);
    }, []);

    const handleAreaChange = useCallback((value) => {
        setSelectedArea(value);
    }, []);

    const handleStatusChange = useCallback(
        async (table, newStatus) => {
            try {
                setLoading(true);
                await tableApi.updateTable(table.id, { status: newStatus });
                message.success(
                    `Trạng thái bàn đã được cập nhật thành ${getStatusText(
                        newStatus
                    )}`
                );
                refreshTables();
            } catch (error) {
                message.error("Không thể cập nhật trạng thái bàn!");
                console.error("Error updating table status:", error);
            } finally {
                setLoading(false);
            }
        },
        [refreshTables]
    );

    const startTableSwap = useCallback(
        (table) => {
            setSourceTable(table);
            // Filter only available tables for the swap
            const available = tables.filter(
                (t) => t.id !== table.id && t.status === TableStatus.AVAILABLE
            );
            setAvailableTables(available);

            if (available.length === 0) {
                message.warning("Không có bàn trống nào để chuyển");
                return;
            }

            setIsSwapModalVisible(true);
        },
        [tables]
    );

    const handleTableSwap = useCallback(async () => {
        if (!sourceTable || !targetTable) {
            message.error("Vui lòng chọn bàn cần chuyển đến");
            return;
        }

        try {
            setLoading(true);
            // Change source table to available
            await tableApi.updateTable(sourceTable.id, {
                status: TableStatus.AVAILABLE,
            });

            // Change target table to occupied
            await tableApi.updateTable(targetTable.id, {
                status: TableStatus.OCCUPIED,
            });

            message.success("Chuyển bàn thành công");
            setIsSwapModalVisible(false);
            setSourceTable(null);
            setTargetTable(null);
            refreshTables();
        } catch (error) {
            message.error("Không thể chuyển bàn");
            console.error("Error swapping tables:", error);
        } finally {
            setLoading(false);
        }
    }, [sourceTable, targetTable, refreshTables]);

    const getAreaName = (areaId) => {
        if (!areaId) return "Không xác định";
        const foundArea = areas.find((a) => a.id === areaId);
        return foundArea ? foundArea.name : "Không xác định";
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

    const renderTableCard = (table) => {
        const isAvailable = table.status === TableStatus.AVAILABLE;
        const isOccupied = table.status === TableStatus.OCCUPIED;
        const isReserved = table.status === TableStatus.RESERVED;
        const isMaintenance = table.status === TableStatus.MAINTENANCE;

        return (
            <Card
                key={table.id}
                className="table-layout-card"
                style={{
                    borderColor: getStatusColor(table.status),
                }}
                hoverable
            >
                <div className="table-layout-header">
                    <Badge.Ribbon
                        text={table.isVIP ? "VIP" : ""}
                        color={table.isVIP ? "purple" : ""}
                    >
                        <div className="table-number">
                            <TableOutlined /> <b>{table.tableNumber}</b>
                        </div>
                    </Badge.Ribbon>
                    <Tag color={getStatusColor(table.status)}>
                        {getStatusText(table.status)}
                    </Tag>
                </div>

                <div className="table-layout-info">
                    <div>
                        <InfoCircleOutlined /> Khu vực:{" "}
                        {getAreaName(table.areaId)}
                    </div>
                    <div>
                        <UserOutlined /> Sức chứa: {table.capacity} người
                    </div>
                </div>

                <Divider style={{ margin: "8px 0" }} />

                <div className="table-layout-actions">
                    <Space size="small">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onUpdateTable(table)}
                        >
                            Sửa
                        </Button>

                        {isOccupied && (
                            <Button
                                type="primary"
                                size="small"
                                icon={<SwapOutlined />}
                                onClick={() => startTableSwap(table)}
                            >
                                Chuyển bàn
                            </Button>
                        )}

                        <Popconfirm
                            title="Đổi trạng thái bàn?"
                            okText="Đồng ý"
                            cancelText="Hủy"
                            disabled={loading}
                        >
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: "1",
                                            label: "Trống",
                                            icon: <Badge color="#52c41a" />,
                                            disabled: isAvailable,
                                            onClick: () =>
                                                handleStatusChange(
                                                    table,
                                                    TableStatus.AVAILABLE
                                                ),
                                        },
                                        {
                                            key: "2",
                                            label: "Đang sử dụng",
                                            icon: <Badge color="#f5222d" />,
                                            disabled: isOccupied,
                                            onClick: () =>
                                                handleStatusChange(
                                                    table,
                                                    TableStatus.OCCUPIED
                                                ),
                                        },
                                        {
                                            key: "3",
                                            label: "Đã đặt trước",
                                            icon: <Badge color="#faad14" />,
                                            disabled: isReserved,
                                            onClick: () =>
                                                handleStatusChange(
                                                    table,
                                                    TableStatus.RESERVED
                                                ),
                                        },
                                        {
                                            key: "4",
                                            label: "Bảo trì",
                                            icon: <Badge color="#8c8c8c" />,
                                            disabled: isMaintenance,
                                            onClick: () =>
                                                handleStatusChange(
                                                    table,
                                                    TableStatus.MAINTENANCE
                                                ),
                                        },
                                    ],
                                }}
                            >
                                <Button size="small" icon={<SettingOutlined />}>
                                    Trạng thái <DownOutlined />
                                </Button>
                            </Dropdown>
                        </Popconfirm>
                    </Space>
                </div>
            </Card>
        );
    };

    return (
        <Card className="table-layout-container">
            <div className="table-layout-filters">
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={12} md={7}>
                        <div className="filter-label">Chọn chi nhánh:</div>
                        <Select
                            placeholder="Chọn chi nhánh"
                            style={{ width: "100%" }}
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
                    </Col>
                    <Col xs={24} sm={12} md={7}>
                        <div className="filter-label">Chọn khu vực:</div>
                        <Select
                            placeholder="Chọn khu vực"
                            style={{ width: "100%" }}
                            value={selectedArea}
                            onChange={handleAreaChange}
                            loading={loading}
                            allowClear
                        >
                            <Option value={null}>Tất cả khu vực</Option>
                            {areas.map((area) => (
                                <Option key={area.id} value={area.id}>
                                    {area.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col
                        xs={24}
                        sm={24}
                        md={10}
                        className="table-layout-buttons"
                    >
                        <Button
                            onClick={refreshTables}
                            icon={<ReloadOutlined />}
                            style={{ marginRight: 8 }}
                        >
                            Làm mới
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => onUpdateTable(null)}
                            icon={<PlusOutlined />}
                        >
                            Thêm bàn mới
                        </Button>
                    </Col>
                </Row>
            </div>

            <div className="status-legend">
                <Badge
                    color="#52c41a"
                    text={`Trống (${tableStats.available})`}
                    style={{ marginRight: 16 }}
                />
                <Badge
                    color="#f5222d"
                    text={`Đang sử dụng (${tableStats.occupied})`}
                    style={{ marginRight: 16 }}
                />
                <Badge
                    color="#faad14"
                    text={`Đã đặt trước (${tableStats.reserved})`}
                    style={{ marginRight: 16 }}
                />
                <Badge
                    color="#1890ff"
                    text={`Bảo trì (${tableStats.maintenance})`}
                />
            </div>

            <Spin spinning={loading}>
                {filteredTables.length > 0 ? (
                    <Row gutter={[16, 16]} className="table-layout-grid">
                        {filteredTables.map((table) => (
                            <Col
                                key={table.id}
                                xs={24}
                                sm={12}
                                md={8}
                                lg={6}
                                xl={4}
                            >
                                {renderTableCard(table)}
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty
                        description={
                            selectedArea
                                ? "Không có bàn trong khu vực này"
                                : "Không có bàn nào"
                        }
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </Spin>

            <Modal
                title={`Chuyển bàn ${sourceTable?.tableNumber || ""}`}
                visible={isSwapModalVisible}
                onCancel={() => {
                    setIsSwapModalVisible(false);
                    setSourceTable(null);
                    setTargetTable(null);
                }}
                onOk={handleTableSwap}
                confirmLoading={loading}
                okText="Chuyển bàn"
                cancelText="Hủy bỏ"
                width={500}
            >
                <p>Chọn bàn cần chuyển đến:</p>
                <Select
                    placeholder="Chọn bàn"
                    style={{ width: "100%" }}
                    onChange={(value) => {
                        const table = availableTables.find(
                            (t) => t.id === value
                        );
                        setTargetTable(table);
                    }}
                    value={targetTable?.id}
                >
                    {availableTables.map((table) => (
                        <Option key={table.id} value={table.id}>
                            {table.tableNumber} - {getAreaName(table.areaId)} -{" "}
                            {table.capacity} người
                        </Option>
                    ))}
                </Select>
                <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                        Thao tác này sẽ chuyển khách từ bàn{" "}
                        {sourceTable?.tableNumber} sang bàn đã chọn. Trạng thái
                        của bàn sẽ được cập nhật tự động.
                    </Text>
                </div>
            </Modal>
        </Card>
    );
};

export default TableLayout;
