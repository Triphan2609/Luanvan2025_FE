import React, { useState } from "react";
import { Card, Row, Col, Typography, Space, Select, DatePicker, Table, Statistic, Divider } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { DollarOutlined, ShopOutlined, HomeOutlined, RiseOutlined, FallOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Constants
const COLORS = {
    primary: "#1890ff",
    success: "#52c41a",
    warning: "#faad14",
    error: "#f5222d",
    hotel: "#722ed1",
    restaurant: "#13c2c2",
    total: "#eb2f96",
};

export default function Revenue() {
    // States
    const [timeRange, setTimeRange] = useState("month");
    const [branch, setBranch] = useState("all");
    const [dateRange, setDateRange] = useState(null);

    // Sample data
    const branchRevenue = [
        { name: "Chi nhánh 1", hotel: 450000000, restaurant: 280000000 },
        { name: "Chi nhánh 2", hotel: 380000000, restaurant: 320000000 },
        { name: "Chi nhánh 3", hotel: 520000000, restaurant: 250000000 },
    ];

    const monthlyData = [
        { month: "T1", hotel: 150000000, restaurant: 80000000 },
        { month: "T2", hotel: 180000000, restaurant: 95000000 },
        { month: "T3", hotel: 220000000, restaurant: 120000000 },
        { month: "T4", hotel: 190000000, restaurant: 110000000 },
    ];

    const serviceRevenue = [
        { name: "Phòng khách sạn", value: 1350000000, color: COLORS.hotel },
        { name: "Nhà hàng", value: 850000000, color: COLORS.restaurant },
    ];

    const detailedRevenue = [
        {
            id: "1",
            date: "2024-04-26",
            branch: "Chi nhánh 1",
            hotel: 15000000,
            restaurant: 8500000,
            total: 23500000,
            growth: 12.5,
        },
        // ...more data
    ];

    const columns = [
        {
            title: "Ngày",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Chi nhánh",
            dataIndex: "branch",
            key: "branch",
        },
        {
            title: "Khách sạn",
            dataIndex: "hotel",
            key: "hotel",
            align: "right",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
        },
        {
            title: "Nhà hàng",
            dataIndex: "restaurant",
            key: "restaurant",
            align: "right",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
        },
        {
            title: "Tổng doanh thu",
            dataIndex: "total",
            key: "total",
            align: "right",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
        },
        {
            title: "Tăng trưởng",
            dataIndex: "growth",
            key: "growth",
            align: "right",
            render: (value) => (
                <Space>
                    {value >= 0 ? <RiseOutlined style={{ color: COLORS.success }} /> : <FallOutlined style={{ color: COLORS.error }} />}
                    <span style={{ color: value >= 0 ? COLORS.success : COLORS.error }}>{Math.abs(value)}%</span>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Header & Filters */}
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                        <Title level={3}>Thống kê Doanh thu</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Select value={branch} onChange={setBranch} style={{ width: 200 }}>
                                <Select.Option value="all">Tất cả chi nhánh</Select.Option>
                                <Select.Option value="1">Chi nhánh 1</Select.Option>
                                <Select.Option value="2">Chi nhánh 2</Select.Option>
                                <Select.Option value="3">Chi nhánh 3</Select.Option>
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
                                title="Tổng doanh thu"
                                value={2200000000}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: COLORS.total }}
                                suffix="VNĐ"
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
                                title="Doanh thu Khách sạn"
                                value={1350000000}
                                prefix={<HomeOutlined />}
                                valueStyle={{ color: COLORS.hotel }}
                                suffix="VNĐ"
                            />
                            <div style={{ marginTop: 8 }}>
                                <small style={{ color: COLORS.success }}>
                                    <RiseOutlined /> Tăng 18% so với kỳ trước
                                </small>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Doanh thu Nhà hàng"
                                value={850000000}
                                prefix={<ShopOutlined />}
                                valueStyle={{ color: COLORS.restaurant }}
                                suffix="VNĐ"
                            />
                            <div style={{ marginTop: 8 }}>
                                <small style={{ color: COLORS.success }}>
                                    <RiseOutlined /> Tăng 12% so với kỳ trước
                                </small>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row gutter={16}>
                    <Col span={16}>
                        <Card title="Doanh thu theo thời gian">
                            <BarChart width={800} height={300} data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="hotel" name="Khách sạn" fill={COLORS.hotel} />
                                <Bar dataKey="restaurant" name="Nhà hàng" fill={COLORS.restaurant} />
                            </BarChart>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Tỷ trọng doanh thu">
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={serviceRevenue}
                                    cx={150}
                                    cy={150}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {serviceRevenue.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </Card>
                    </Col>
                </Row>

                {/* Detailed Table */}
                <Card title="Chi tiết doanh thu">
                    <Table columns={columns} dataSource={detailedRevenue} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
                </Card>
            </Space>
        </div>
    );
}
