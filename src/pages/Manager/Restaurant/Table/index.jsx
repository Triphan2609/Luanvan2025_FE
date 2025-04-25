import React, { useState, useMemo } from "react";
import { Card, Select, Row, Col, Tag, Button, Space, Typography, Empty, Input, Divider, Badge, Statistic, message } from "antd";
import {
    UserAddOutlined,
    SwapOutlined,
    CreditCardOutlined,
    TableOutlined,
    SearchOutlined,
    TeamOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import TableDetailDrawer from "./Drawer/TableDetailDrawer";
import AddTableModal from "./Modals/AddTableModal";
import AddServiceModal from "./Modals/AddServiceModal"; // Thêm dòng này

const { Title, Text } = Typography;

const areas = [
    { id: 0, name: "Tất cả khu vực" },
    { id: 1, name: "Phòng ăn chung" },
    { id: 2, name: "Phòng riêng" },
    { id: 3, name: "Phòng VIP" },
];

const tableStatusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "available", label: "Còn trống" },
    { value: "occupied", label: "Đang sử dụng" },
];

const initialTables = [
    {
        id: 1,
        name: "Bàn 1",
        seats: 4,
        status: "available",
        areaId: 1,
        orders: [],
    },
    {
        id: 2,
        name: "Bàn 2",
        seats: 2,
        status: "occupied",
        areaId: 2,
        orders: [{ name: "Gà chiên", quantity: 1, price: 120000, status: "cooking" }],
    },
    {
        id: 3,
        name: "Bàn 3",
        seats: 6,
        status: "occupied",
        areaId: 3,
        orders: [{ name: "Lẩu thái", quantity: 1, price: 350000, status: "done" }],
    },
    {
        id: 4,
        name: "Bàn VIP 1",
        seats: 8,
        status: "available",
        areaId: 3,
        orders: [],
    },
    {
        id: 5,
        name: "Bàn VIP 2",
        seats: 8,
        status: "available",
        areaId: 3,
        orders: [],
    },
    {
        id: 6,
        name: "Bàn VIP 3",
        seats: 8,
        status: "available",
        areaId: 3,
        orders: [],
    },
];

export default function TableManagement() {
    // State Management
    const [tables, setTables] = useState(initialTables);
    const [selectedArea, setSelectedArea] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTable, setSelectedTable] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false); // Thêm dòng này

    // Memoized Values
    const areaTableCounts = useMemo(() => {
        return areas.map((area) => ({
            value: area.id, // Thêm value để Select component có thể nhận diện
            label: `${area.name} (${area.id === 0 ? tables.length : tables.filter((t) => t.areaId === area.id).length})`,
        }));
    }, [tables]);

    const filteredTables = useMemo(() => {
        return tables.filter((table) => {
            const areaMatch = selectedArea === 0 || table.areaId === selectedArea;
            const statusMatch = selectedStatus === "all" || table.status === selectedStatus;
            const nameMatch = table.name.toLowerCase().includes(searchKeyword.toLowerCase());
            return areaMatch && statusMatch && nameMatch;
        });
    }, [tables, selectedArea, selectedStatus, searchKeyword]);

    const stats = useMemo(
        () => ({
            total: filteredTables.length,
            available: filteredTables.filter((t) => t.status === "available").length,
            occupied: filteredTables.filter((t) => t.status === "occupied").length,
            totalSeats: filteredTables.reduce((sum, table) => sum + table.seats, 0),
        }),
        [filteredTables]
    );

    // Event Handlers
    const handleOpenDrawer = (table) => {
        setSelectedTable(table);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedTable(null);
        setIsDrawerOpen(false);
    };

    const handleTableAction = (e, table, action) => {
        e.stopPropagation();
        switch (action) {
            case "add":
                handleOpenDrawer(table);
                break;
            case "bill":
                // Handle bill action
                message.info("Chức năng tạm tính đang được phát triển");
                break;
            case "change":
                handleOpenDrawer(table);
                break;
            default:
                break;
        }
    };

    const handleChangeTable = (sourceId, targetId) => {
        setTables((prev) => {
            const updatedTables = prev.map((table) => {
                if (table.id === sourceId) {
                    return { ...table, status: "available", orders: [] };
                }
                if (table.id === targetId) {
                    return {
                        ...table,
                        status: "occupied",
                        orders: prev.find((t) => t.id === sourceId)?.orders || [],
                    };
                }
                return table;
            });
            return updatedTables;
        });
        message.success("Chuyển bàn thành công");
    };

    return (
        <>
            {/* Statistics Card */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Statistic title="Tổng số bàn" value={stats.total} prefix={<TableOutlined />} valueStyle={{ color: "#1890ff" }} />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Còn trống"
                            value={stats.available}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Đang sử dụng"
                            value={stats.occupied}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Tổng chỗ ngồi"
                            value={stats.totalSeats}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Main Management Card */}
            <Card
                title={
                    <Space>
                        <AppstoreOutlined />
                        <span>Quản lý Bàn ăn</span>
                    </Space>
                }
                extra={
                    <Space size="middle">
                        <Select
                            value={selectedArea}
                            onChange={setSelectedArea}
                            options={areaTableCounts}
                            style={{ width: 200 }}
                            placeholder="Chọn khu vực"
                        />
                        <Select
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            options={tableStatusOptions}
                            style={{ width: 160 }}
                            placeholder="Trạng thái bàn"
                        />
                        <Input.Search
                            allowClear
                            placeholder="Tìm theo tên bàn..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                            Thêm bàn mới
                        </Button>
                    </Space>
                }
            >
                <Row gutter={[16, 16]}>
                    {filteredTables.length > 0 ? (
                        filteredTables.map((table) => (
                            <Col key={table.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable
                                    onClick={() => handleOpenDrawer(table)}
                                    style={{
                                        borderColor: table.status === "occupied" ? "#ff4d4f" : "#52c41a",
                                    }}
                                >
                                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                        <Space style={{ justifyContent: "space-between", width: "100%" }}>
                                            <Title level={5} style={{ margin: 0 }}>
                                                <TableOutlined style={{ marginRight: 8 }} />
                                                {table.name}
                                            </Title>
                                            <Badge
                                                status={table.status === "available" ? "success" : "error"}
                                                text={table.status === "available" ? "Còn trống" : "Đang sử dụng"}
                                            />
                                        </Space>

                                        <Space direction="vertical" style={{ width: "100%" }}>
                                            <Space style={{ justifyContent: "space-between", width: "100%" }}>
                                                <Text type="secondary">
                                                    <TeamOutlined /> {table.seats} chỗ
                                                </Text>
                                                <Tag color={table.areaId === 3 ? "gold" : "blue"}>
                                                    {areas.find((a) => a.id === table.areaId)?.name}
                                                </Tag>
                                            </Space>

                                            {table.status === "occupied" && (
                                                <Text type="secondary">Đơn hiện tại: {table.orders?.length || 0} món</Text>
                                            )}
                                        </Space>

                                        <Divider style={{ margin: "8px 0" }} />

                                        <Space direction="vertical" style={{ width: "100%" }}>
                                            {table.status === "available" ? (
                                                <Button
                                                    type="primary"
                                                    icon={<UserAddOutlined />}
                                                    block
                                                    onClick={(e) => handleTableAction(e, table, "add")}
                                                >
                                                    Thêm khách hàng
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        type="primary"
                                                        icon={<CreditCardOutlined />}
                                                        block
                                                        onClick={(e) => handleTableAction(e, table, "bill")}
                                                    >
                                                        Tạm tính
                                                    </Button>
                                                    <Button
                                                        icon={<SwapOutlined />}
                                                        block
                                                        onClick={(e) => handleTableAction(e, table, "change")}
                                                    >
                                                        Chuyển bàn
                                                    </Button>
                                                </>
                                            )}
                                        </Space>
                                    </Space>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col span={24}>
                            <Empty description="Không có bàn phù hợp" />
                        </Col>
                    )}
                </Row>
            </Card>

            {/* Drawers and Modals */}
            <TableDetailDrawer
                open={isDrawerOpen}
                onClose={handleCloseDrawer}
                table={selectedTable}
                allTables={tables}
                setTables={setTables}
                onChangeTable={handleChangeTable}
            />

            {isAddModalOpen && (
                <AddTableModal
                    open={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={(newTable) => {
                        setTables((prev) => [...prev, { ...newTable, id: Date.now() }]);
                        setIsAddModalOpen(false);
                    }}
                    areas={areas.filter((a) => a.id !== 0)}
                />
            )}

            <AddServiceModal
                open={isServiceModalOpen}
                onClose={() => setIsServiceModalOpen(false)}
                onAdd={(newService) => {
                    if (selectedTable) {
                        setTables((prev) =>
                            prev.map((table) =>
                                table.id === selectedTable.id
                                    ? {
                                          ...table,
                                          orders: [...table.orders, { ...newService, id: Date.now() }],
                                      }
                                    : table
                            )
                        );
                        message.success("Thêm dịch vụ thành công");
                    }
                    setIsServiceModalOpen(false);
                }}
            />
        </>
    );
}
