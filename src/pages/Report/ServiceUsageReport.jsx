import React, { useState } from "react";
import { Card, Row, Col, Typography, Space, Select, DatePicker, Table, Statistic, Divider, Tabs } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { HomeOutlined, ShopOutlined, CustomerServiceOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = {
    room: "#722ed1",
    table: "#13c2c2",
    service: "#eb2f96",
    success: "#52c41a",
    warning: "#faad14",
    error: "#f5222d",
};

export default function ServiceUsageReport() {
    const [timeRange, setTimeRange] = useState("month");
    const [branch, setBranch] = useState("all");
    const [dateRange, setDateRange] = useState(null);

    // Sample data
    const monthlyBookings = [
        { month: "T1", rooms: 120, tables: 350, services: 200 },
        { month: "T2", rooms: 150, tables: 380, services: 220 },
        { month: "T3", rooms: 180, tables: 420, services: 250 },
        { month: "T4", rooms: 160, tables: 400, services: 230 },
    ];

    const popularServices = [
        { name: "Phòng Deluxe", count: 80, type: "room" },
        { name: "Phòng Suite", count: 45, type: "room" },
        { name: "Bàn VIP", count: 120, type: "table" },
        { name: "Spa", count: 65, type: "service" },
        { name: "Gym", count: 50, type: "service" },
    ];

    const detailedColumns = {
        rooms: [
            { title: "Loại phòng", dataIndex: "type", key: "type" },
            { title: "Số lượng đặt", dataIndex: "bookings", key: "bookings" },
            { title: "Tỷ lệ lấp đầy", dataIndex: "occupancy", key: "occupancy", render: (value) => `${value}%` },
            { title: "Đánh giá TB", dataIndex: "rating", key: "rating" },
            {
                title: "So với tháng trước",
                dataIndex: "growth",
                key: "growth",
                render: (value) => (
                    <Space>
                        {value >= 0 ? <RiseOutlined style={{ color: COLORS.success }} /> : <FallOutlined style={{ color: COLORS.error }} />}
                        <span style={{ color: value >= 0 ? COLORS.success : COLORS.error }}>{Math.abs(value)}%</span>
                    </Space>
                ),
            },
        ],
        tables: [
            { title: "Khu vực", dataIndex: "area", key: "area" },
            { title: "Số lượt đặt", dataIndex: "bookings", key: "bookings" },
            { title: "Tỷ lệ lấp đầy", dataIndex: "occupancy", key: "occupancy", render: (value) => `${value}%` },
            { title: "Số khách TB/bàn", dataIndex: "avgGuests", key: "avgGuests" },
            {
                title: "So với tháng trước",
                dataIndex: "growth",
                key: "growth",
                render: (value) => (
                    <Space>
                        {value >= 0 ? <RiseOutlined style={{ color: COLORS.success }} /> : <FallOutlined style={{ color: COLORS.error }} />}
                        <span style={{ color: value >= 0 ? COLORS.success : COLORS.error }}>{Math.abs(value)}%</span>
                    </Space>
                ),
            },
        ],
    };

    const roomData = [
        {
            type: "Deluxe",
            bookings: 80,
            occupancy: 85,
            rating: 4.5,
            growth: 12,
        },
        {
            type: "Suite",
            bookings: 45,
            occupancy: 75,
            rating: 4.8,
            growth: -5,
        },
    ];

    const tableData = [
        {
            area: "Khu VIP",
            bookings: 120,
            occupancy: 90,
            avgGuests: 6,
            growth: 15,
        },
        {
            area: "Khu thường",
            bookings: 280,
            occupancy: 75,
            avgGuests: 4,
            growth: 8,
        },
    ];

    const items = [
        {
            key: "rooms",
            label: (
                <span>
                    <HomeOutlined /> Đặt phòng
                </span>
            ),
            children: <Table columns={detailedColumns.rooms} dataSource={roomData} pagination={false} />,
        },
        {
            key: "tables",
            label: (
                <span>
                    <ShopOutlined /> Đặt bàn
                </span>
            ),
            children: <Table columns={detailedColumns.tables} dataSource={tableData} pagination={false} />,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Header & Filters */}
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                        <Title level={3}>Thống kê Sử dụng Dịch vụ</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Select value={branch} onChange={setBranch} style={{ width: 200 }}>
                                <Select.Option value="all">Tất cả chi nhánh</Select.Option>
                                <Select.Option value="1">Chi nhánh 1</Select.Option>
                                <Select.Option value="2">Chi nhánh 2</Select.Option>
                            </Select>
                            <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }}>
                                <Select.Option value="day">Theo ngày</Select.Option>
                                <Select.Option value="week">Theo tuần</Select.Option>
                                <Select.Option value="month">Theo tháng</Select.Option>
                                <Select.Option value="year">Theo năm</Select.Option>
                            </Select>
                            <RangePicker onChange={setDateRange} style={{ width: 250 }} />
                        </Space>
                    </Col>
                </Row>

                {/* Summary Statistics */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng số đặt phòng"
                                value={610}
                                prefix={<HomeOutlined />}
                                valueStyle={{ color: COLORS.room }}
                            />
                            <div style={{ marginTop: 8 }}>
                                <small style={{ color: COLORS.success }}>
                                    <RiseOutlined /> Tăng 15% so với kỳ trước
                                </small>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng số đặt bàn"
                                value={1550}
                                prefix={<ShopOutlined />}
                                valueStyle={{ color: COLORS.table }}
                            />
                            <div style={{ marginTop: 8 }}>
                                <small style={{ color: COLORS.success }}>
                                    <RiseOutlined /> Tăng 12% so với kỳ trước
                                </small>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng lượt sử dụng dịch vụ"
                                value={900}
                                prefix={<CustomerServiceOutlined />}
                                valueStyle={{ color: COLORS.service }}
                            />
                            <div style={{ marginTop: 8 }}>
                                <small style={{ color: COLORS.success }}>
                                    <RiseOutlined /> Tăng 8% so với kỳ trước
                                </small>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row gutter={16}>
                    <Col span={16}>
                        <Card title="Thống kê theo thời gian">
                            <LineChart width={800} height={300} data={monthlyBookings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="rooms" name="Đặt phòng" stroke={COLORS.room} />
                                <Line type="monotone" dataKey="tables" name="Đặt bàn" stroke={COLORS.table} />
                                <Line type="monotone" dataKey="services" name="Dịch vụ" stroke={COLORS.service} />
                            </LineChart>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Top dịch vụ được sử dụng">
                            <BarChart
                                width={300}
                                height={300}
                                data={popularServices}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" />
                                <Tooltip />
                                <Bar dataKey="count" fill={COLORS.room}>
                                    {popularServices.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.type]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </Card>
                    </Col>
                </Row>

                {/* Detailed Tables */}
                <Card>
                    <Tabs defaultActiveKey="rooms" items={items} />
                </Card>
            </Space>
        </div>
    );
}
