import React, { useState } from "react";
import { Card, Select, Row, Col, Tag, Button, Space, Typography, Empty, Input, Divider } from "antd";
import { UserAddOutlined, SwapOutlined, CreditCardOutlined, TableOutlined, SearchOutlined } from "@ant-design/icons";
import TableDetailDrawer from "./Drawer/TableDetailDrawer";

const { Title, Text } = Typography;

const areas = [
    { id: 0, name: "Tất cả khu vực" },
    { id: 1, name: "Phòng ăn chung" },
    { id: 2, name: "Phòng riêng" },
    { id: 3, name: "Phòng VIP" },
];

const statusColors = {
    available: "green",
    occupied: "volcano",
};

const tableStatusOptions = [
    { value: "all", label: "Tất cả" },
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
];

export default function TableManagement() {
    const [tables, setTables] = useState(initialTables);
    const [selectedArea, setSelectedArea] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedTable, setSelectedTable] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleOpenDrawer = (table) => {
        setSelectedTable(table);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setSelectedTable(null);
        setIsDrawerOpen(false);
    };

    const areaTableCounts = areas.map((area) => {
        const count = area.id === 0 ? tables.length : tables.filter((t) => t.areaId === area.id).length;
        return { ...area, label: `${area.name} (${count})` };
    });

    const filteredTables = tables.filter((table) => {
        const areaMatch = selectedArea === 0 || table.areaId === selectedArea;
        const statusMatch = selectedStatus === "all" || table.status === selectedStatus;
        const nameMatch = table.name.toLowerCase().includes(searchKeyword.toLowerCase());
        return areaMatch && statusMatch && nameMatch;
    });

    const totalTables = filteredTables.length;
    const availableCount = filteredTables.filter((t) => t.status === "available").length;
    const occupiedCount = filteredTables.filter((t) => t.status === "occupied").length;

    return (
        <>
            <Card
                title="Quản lý Bàn ăn"
                extra={
                    <Space>
                        <Select
                            value={selectedArea}
                            onChange={setSelectedArea}
                            options={areaTableCounts.map((a) => ({
                                value: a.id,
                                label: a.label,
                            }))}
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
                        <Input
                            allowClear
                            placeholder="Tìm theo tên bàn..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            prefix={<SearchOutlined />}
                            style={{ width: 200 }}
                        />
                    </Space>
                }
            >
                <Space style={{ marginBottom: 16 }}>
                    <Tag color="blue">Tổng: {totalTables}</Tag>
                    <Tag color="green">Còn trống: {availableCount}</Tag>
                    <Tag color="volcano">Đang sử dụng: {occupiedCount}</Tag>
                </Space>

                <Row gutter={[16, 16]}>
                    {filteredTables.length > 0 ? (
                        filteredTables.map((table) => (
                            <Col key={table.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable
                                    onClick={() => handleOpenDrawer(table)}
                                    style={{
                                        borderColor: table.status === "occupied" ? "#ff4d4f" : "#52c41a",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                        <Space
                                            align="center"
                                            style={{
                                                justifyContent: "space-between",
                                                width: "100%",
                                            }}
                                        >
                                            <Title level={5} style={{ marginBottom: 0 }}>
                                                <TableOutlined style={{ marginRight: 8 }} />
                                                {table.name}
                                            </Title>
                                            <Tag color={statusColors[table.status]}>
                                                {table.status === "available" ? "Còn trống" : "Đang sử dụng"}
                                            </Tag>
                                        </Space>
                                        <Text type="secondary">Số chỗ: {table.seats}</Text>

                                        {table.status === "available" ? (
                                            <Button
                                                type="dashed"
                                                icon={<UserAddOutlined />}
                                                block
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenDrawer(table);
                                                }}
                                            >
                                                Thêm khách hàng
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    icon={<CreditCardOutlined />}
                                                    block
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDrawer(table);
                                                    }}
                                                >
                                                    Tạm tính
                                                </Button>
                                                <Button
                                                    icon={<SwapOutlined />}
                                                    block
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenDrawer(table);
                                                    }}
                                                >
                                                    Chuyển bàn
                                                </Button>
                                            </>
                                        )}
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

            <TableDetailDrawer
                open={isDrawerOpen}
                onClose={handleCloseDrawer}
                table={selectedTable}
                allTables={tables}
                setTables={setTables}
            />
        </>
    );
}
