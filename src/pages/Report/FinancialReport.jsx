import React, { useState } from "react";
import { Divider, Card, Row, Col, Typography, Space, Select, DatePicker, Table, Statistic, Progress } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DollarOutlined, AccountBookOutlined, RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const COLORS = {
    revenue: "#1890ff",
    expense: "#f5222d",
    profit: "#52c41a",
    success: "#52c41a",
    warning: "#faad14",
    error: "#f5222d",
};

export default function FinancialReport() {
    const [timeRange, setTimeRange] = useState("month");
    const [branch, setBranch] = useState("all");
    const [dateRange, setDateRange] = useState(null);

    // Sample data
    const monthlyData = [
        {
            month: "T1",
            revenue: 2500000000,
            expense: 1800000000,
            profit: 700000000,
        },
        {
            month: "T2",
            revenue: 2800000000,
            expense: 2000000000,
            profit: 800000000,
        },
        {
            month: "T3",
            revenue: 3200000000,
            expense: 2300000000,
            profit: 900000000,
        },
        {
            month: "T4",
            revenue: 3000000000,
            expense: 2100000000,
            profit: 900000000,
        },
    ];

    const expenseCategories = [
        { name: "Nhân sự", value: 1200000000 },
        { name: "Nguyên liệu", value: 800000000 },
        { name: "Tiện ích", value: 300000000 },
        { name: "Marketing", value: 200000000 },
        { name: "Bảo trì", value: 150000000 },
    ];

    const columns = [
        {
            title: "Tháng",
            dataIndex: "month",
            key: "month",
        },
        {
            title: "Doanh thu",
            dataIndex: "revenue",
            key: "revenue",
            align: "right",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
        },
        {
            title: "Chi phí",
            dataIndex: "expense",
            key: "expense",
            align: "right",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
        },
        {
            title: "Lợi nhuận",
            dataIndex: "profit",
            key: "profit",
            align: "right",
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value),
        },
        {
            title: "Tỷ suất LN",
            key: "profitRate",
            align: "right",
            render: (_, record) => {
                const rate = ((record.profit / record.revenue) * 100).toFixed(1);
                const color = rate >= 30 ? COLORS.success : rate >= 20 ? COLORS.warning : COLORS.error;
                return <span style={{ color }}>{rate}%</span>;
            },
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Header & Filters */}
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                        <Title level={3}>Báo cáo Tài chính</Title>
                    </Col>
                    <Col>
                        <Space>
                            <Select value={branch} onChange={setBranch} style={{ width: 200 }}>
                                <Select.Option value="all">Tất cả chi nhánh</Select.Option>
                                <Select.Option value="1">Chi nhánh 1</Select.Option>
                                <Select.Option value="2">Chi nhánh 2</Select.Option>
                            </Select>
                            <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }}>
                                <Select.Option value="month">Theo tháng</Select.Option>
                                <Select.Option value="quarter">Theo quý</Select.Option>
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
                                value={3000000000}
                                precision={0}
                                valueStyle={{ color: COLORS.revenue }}
                                prefix={<DollarOutlined />}
                                suffix="VNĐ"
                            />
                            <div style={{ marginTop: 8 }}>
                                <span style={{ color: COLORS.success }}>
                                    <ArrowUpOutlined /> 15% so với kỳ trước
                                </span>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Tổng chi phí"
                                value={2100000000}
                                precision={0}
                                valueStyle={{ color: COLORS.expense }}
                                prefix={<AccountBookOutlined />}
                                suffix="VNĐ"
                            />
                            <div style={{ marginTop: 8 }}>
                                <span style={{ color: COLORS.error }}>
                                    <ArrowUpOutlined /> 10% so với kỳ trước
                                </span>
                            </div>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Lợi nhuận"
                                value={900000000}
                                precision={0}
                                valueStyle={{ color: COLORS.profit }}
                                prefix={<DollarOutlined />}
                                suffix="VNĐ"
                            />
                            <div style={{ marginTop: 8 }}>
                                <span style={{ color: COLORS.success }}>
                                    <ArrowUpOutlined /> 20% so với kỳ trước
                                </span>
                            </div>
                            <Divider style={{ margin: "12px 0" }} />
                            <Progress
                                percent={30}
                                status="active"
                                strokeColor={COLORS.profit}
                                format={(percent) => `Tỷ suất LN: ${percent}%`}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Charts */}
                <Row gutter={16}>
                    <Col span={16}>
                        <Card title="Biểu đồ doanh thu - chi phí - lợi nhuận">
                            <LineChart width={800} height={400} data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) =>
                                        new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(value)
                                    }
                                />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke={COLORS.revenue} strokeWidth={2} />
                                <Line type="monotone" dataKey="expense" name="Chi phí" stroke={COLORS.expense} strokeWidth={2} />
                                <Line type="monotone" dataKey="profit" name="Lợi nhuận" stroke={COLORS.profit} strokeWidth={2} />
                            </LineChart>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Cơ cấu chi phí">
                            <PieChart width={300} height={400}>
                                <Pie
                                    data={expenseCategories}
                                    cx={150}
                                    cy={200}
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {expenseCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(${(index * 360) / expenseCategories.length}, 70%, 50%)`} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) =>
                                        new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(value)
                                    }
                                />
                            </PieChart>
                        </Card>
                    </Col>
                </Row>

                {/* Detailed Table */}
                <Card title="Chi tiết theo thời gian">
                    <Table columns={columns} dataSource={monthlyData} pagination={false} bordered />
                </Card>
            </Space>
        </div>
    );
}
