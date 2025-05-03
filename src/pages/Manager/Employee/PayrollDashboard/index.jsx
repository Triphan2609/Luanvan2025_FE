import React, { useState, useEffect } from "react";
import {
    Card,
    Row,
    Col,
    DatePicker,
    Select,
    Button,
    Statistic,
    Table,
    Tabs,
    Tag,
    Space,
    Divider,
    Typography,
    Form,
    Spin,
} from "antd";
import {
    DollarOutlined,
    TeamOutlined,
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    FileTextOutlined,
    SearchOutlined,
    CalendarOutlined,
    BankOutlined,
    RiseOutlined,
    FallOutlined,
} from "@ant-design/icons";
import { Column, Pie, Line, Bar } from "@ant-design/charts";
import dayjs from "dayjs";
import { getPayrollStats } from "../../../../api/salaryApi";
import { getDepartments } from "../../../../api/departmentsApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const PayrollDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState({
        totalPayrolls: 0,
        totalEmployees: 0,
        totalGrossPay: 0,
        totalNetPay: 0,
        byStatus: {},
        byDepartment: {},
        monthlyTrend: [],
    });
    const [departments, setDepartments] = useState([]);
    const [filter, setFilter] = useState({
        dateRange: [dayjs().subtract(5, "month").startOf("month"), dayjs()],
        departmentId: undefined,
    });

    // Fetch initial data
    useEffect(() => {
        fetchDepartments();
        fetchStatistics();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const startDate = filter.dateRange[0].format("YYYY-MM-DD");
            const endDate = filter.dateRange[1].format("YYYY-MM-DD");

            const stats = await getPayrollStats(
                startDate,
                endDate,
                filter.departmentId
            );

            setStatistics(stats);
        } catch (error) {
            console.error("Error fetching payroll statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (dates) => {
        if (dates) {
            setFilter({
                ...filter,
                dateRange: dates,
            });
        }
    };

    const handleDepartmentChange = (value) => {
        setFilter({
            ...filter,
            departmentId: value,
        });
    };

    const handleSearch = () => {
        fetchStatistics();
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    // Prepare data for charts
    const departmentChartData =
        departments.length > 0 && statistics.byDepartment
            ? Object.keys(statistics.byDepartment).map((deptId) => {
                  const department = departments.find(
                      (d) => d.id === Number(deptId)
                  ) || { name: "Unknown" };
                  return {
                      department: department.name,
                      value: statistics.byDepartment[deptId].totalNetPay,
                      count: statistics.byDepartment[deptId].count,
                  };
              })
            : [];

    const statusChartData = statistics.byStatus
        ? Object.keys(statistics.byStatus).map((status) => {
              const statusLabels = {
                  draft: "Nháp",
                  finalized: "Đã hoàn thiện",
                  paid: "Đã thanh toán",
              };
              return {
                  status: statusLabels[status] || status,
                  value: statistics.byStatus[status],
              };
          })
        : [];

    const monthlyTrendData = statistics.monthlyTrend || [];

    // Visualization components
    const renderSummaryCards = () => (
        <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng số bảng lương"
                        value={statistics.totalPayrolls || 0}
                        prefix={<FileTextOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng nhân viên"
                        value={statistics.totalEmployees || 0}
                        prefix={<TeamOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng lương gộp"
                        value={formatCurrency(statistics.totalGrossPay || 0)}
                        prefix={<DollarOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng lương thực lãnh"
                        value={formatCurrency(statistics.totalNetPay || 0)}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: "#3f8600" }}
                    />
                </Card>
            </Col>
        </Row>
    );

    const renderDepartmentDistribution = () => (
        <Card
            title={
                <Space>
                    <PieChartOutlined />
                    <span>Phân bố lương theo phòng ban</span>
                </Space>
            }
            style={{ marginBottom: 24 }}
        >
            {departmentChartData.length > 0 ? (
                <Pie
                    data={departmentChartData}
                    angleField="value"
                    colorField="department"
                    radius={0.8}
                    label={{
                        type: "outer",
                        content: "{name}: {percentage}",
                    }}
                    interactions={[
                        {
                            type: "element-active",
                        },
                    ]}
                    tooltip={{
                        formatter: (datum) => {
                            return {
                                name: datum.department,
                                value: formatCurrency(datum.value),
                            };
                        },
                    }}
                />
            ) : (
                <div style={{ textAlign: "center", padding: 20 }}>
                    <Spin spinning={loading} />
                    {!loading && <Text>Không có dữ liệu hiển thị</Text>}
                </div>
            )}
        </Card>
    );

    const renderPayrollStatusDistribution = () => (
        <Card
            title={
                <Space>
                    <PieChartOutlined />
                    <span>Trạng thái bảng lương</span>
                </Space>
            }
            style={{ marginBottom: 24 }}
        >
            {statusChartData.length > 0 ? (
                <Pie
                    data={statusChartData}
                    angleField="value"
                    colorField="status"
                    radius={0.8}
                    label={{
                        type: "inner",
                        offset: "-30%",
                        content: "{percentage}",
                        style: {
                            fontSize: 14,
                            textAlign: "center",
                        },
                    }}
                    interactions={[
                        {
                            type: "element-active",
                        },
                    ]}
                />
            ) : (
                <div style={{ textAlign: "center", padding: 20 }}>
                    <Spin spinning={loading} />
                    {!loading && <Text>Không có dữ liệu hiển thị</Text>}
                </div>
            )}
        </Card>
    );

    const renderMonthlyTrend = () => (
        <Card
            title={
                <Space>
                    <LineChartOutlined />
                    <span>Xu hướng lương theo tháng</span>
                </Space>
            }
            style={{ marginBottom: 24 }}
        >
            {monthlyTrendData.length > 0 ? (
                <Line
                    data={monthlyTrendData}
                    xField="month"
                    yField="value"
                    seriesField="type"
                    smooth
                    point
                    legend={{
                        position: "top",
                    }}
                    tooltip={{
                        formatter: (datum) => {
                            return {
                                name:
                                    datum.type === "gross"
                                        ? "Lương gộp"
                                        : "Lương thực lãnh",
                                value: formatCurrency(datum.value),
                            };
                        },
                    }}
                />
            ) : (
                <div style={{ textAlign: "center", padding: 20 }}>
                    <Spin spinning={loading} />
                    {!loading && <Text>Không có dữ liệu xu hướng</Text>}
                </div>
            )}
        </Card>
    );

    const renderDepartmentComparisonChart = () => (
        <Card
            title={
                <Space>
                    <BarChartOutlined />
                    <span>So sánh chi phí nhân sự theo phòng ban</span>
                </Space>
            }
            style={{ marginBottom: 24 }}
        >
            {departmentChartData.length > 0 ? (
                <Bar
                    data={departmentChartData}
                    xField="value"
                    yField="department"
                    seriesField="department"
                    label={{
                        position: "right",
                        formatter: (datum) => formatCurrency(datum.value),
                    }}
                    tooltip={{
                        formatter: (datum) => {
                            return {
                                name: datum.department,
                                value: formatCurrency(datum.value),
                            };
                        },
                    }}
                />
            ) : (
                <div style={{ textAlign: "center", padding: 20 }}>
                    <Spin spinning={loading} />
                    {!loading && <Text>Không có dữ liệu để so sánh</Text>}
                </div>
            )}
        </Card>
    );

    const renderDepartmentMetrics = () => {
        // Convert byDepartment object to array and sort by total net pay
        const deptData = departmentChartData.sort((a, b) => b.value - a.value);

        const columns = [
            {
                title: "Phòng ban",
                dataIndex: "department",
                key: "department",
                render: (text) => <Tag color="blue">{text}</Tag>,
            },
            {
                title: "Số nhân viên",
                dataIndex: "count",
                key: "count",
                sorter: (a, b) => a.count - b.count,
            },
            {
                title: "Tổng chi phí",
                dataIndex: "value",
                key: "value",
                render: (value) => formatCurrency(value),
                sorter: (a, b) => a.value - b.value,
            },
            {
                title: "Chi phí trung bình/nhân viên",
                key: "average",
                render: (_, record) =>
                    formatCurrency(
                        record.count > 0 ? record.value / record.count : 0
                    ),
                sorter: (a, b) => a.value / a.count - b.value / b.count,
            },
        ];

        return (
            <Card
                title={
                    <Space>
                        <TeamOutlined />
                        <span>Thống kê chi phí theo phòng ban</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Table
                    columns={columns}
                    dataSource={deptData.map((item, index) => ({
                        ...item,
                        key: index,
                    }))}
                    loading={loading}
                    pagination={false}
                />
            </Card>
        );
    };

    return (
        <div className="payroll-dashboard">
            <Card
                title={
                    <Space>
                        <BarChartOutlined />
                        <span>Báo cáo và thống kê lương</span>
                    </Space>
                }
            >
                {/* Filters */}
                <Form layout="inline" style={{ marginBottom: 24 }}>
                    <Form.Item label="Khoảng thời gian">
                        <RangePicker
                            value={filter.dateRange}
                            onChange={handleDateRangeChange}
                            format="DD/MM/YYYY"
                            allowClear={false}
                        />
                    </Form.Item>
                    <Form.Item label="Phòng ban">
                        <Select
                            placeholder="Tất cả phòng ban"
                            style={{ width: 200 }}
                            allowClear
                            onChange={handleDepartmentChange}
                            value={filter.departmentId}
                        >
                            {departments.map((dept) => (
                                <Option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                            loading={loading}
                        >
                            Tìm kiếm
                        </Button>
                    </Form.Item>
                </Form>

                <Divider style={{ margin: "0 0 24px 0" }} />

                {/* Summary Statistics */}
                {renderSummaryCards()}

                {/* Charts */}
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Tổng quan" key="1">
                        <Row gutter={16}>
                            <Col span={12}>
                                {renderDepartmentDistribution()}
                            </Col>
                            <Col span={12}>
                                {renderPayrollStatusDistribution()}
                            </Col>
                        </Row>
                        {renderMonthlyTrend()}
                    </TabPane>
                    <TabPane tab="Chi phí nhân sự" key="2">
                        {renderDepartmentComparisonChart()}
                        {renderDepartmentMetrics()}
                    </TabPane>
                    <TabPane tab="Phân tích lương" key="3">
                        <Card style={{ marginBottom: 24 }}>
                            <Title level={4}>
                                <Space>
                                    <RiseOutlined />
                                    <span>Tăng trưởng chi phí lương</span>
                                </Space>
                            </Title>
                            <p>
                                Phân tích xu hướng chi phí lương theo thời gian,
                                so sánh với kỳ trước. Đang phát triển...
                            </p>
                        </Card>
                        <Card>
                            <Title level={4}>
                                <Space>
                                    <BankOutlined />
                                    <span>Dự báo ngân sách lương</span>
                                </Space>
                            </Title>
                            <p>
                                Mô hình dự báo chi phí lương cho các kỳ tiếp
                                theo. Đang phát triển...
                            </p>
                        </Card>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default PayrollDashboard;
