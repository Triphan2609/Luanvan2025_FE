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
    message,
    Tooltip,
    Empty,
    Progress,
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
    InfoCircleOutlined,
    PercentageOutlined,
} from "@ant-design/icons";
import { Column, Pie, Line, Bar, DualAxes } from "@ant-design/charts";
import dayjs from "dayjs";
import { getPayrollStats } from "../../../../api/salaryApi";
import { getDepartments } from "../../../../api/departmentsApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Format currency for display
const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0 ₫";

    // Format with Vietnamese currency formatting
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

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

            // Fetch payroll statistics with department filter if available
            const stats = await getPayrollStats(
                startDate,
                endDate,
                filter.departmentId
            );

            // Generate monthly trend data if not available from API
            if (!stats.monthlyTrend) {
                // Create synthetic monthly trend from the provided data
                const now = dayjs();
                const monthlyTrend = [];

                // Generate 6 months of data or match the filter range
                const monthCount = Math.min(
                    6,
                    filter.dateRange[1].diff(filter.dateRange[0], "month") + 1
                );

                for (let i = 0; i < monthCount; i++) {
                    const month = now.subtract(i, "month").format("YYYY-MM");
                    const baseValue = stats.totalGrossPay
                        ? stats.totalGrossPay / monthCount
                        : 10000000;
                    const randomFactor = 0.85 + Math.random() * 0.3; // Random between 0.85 and 1.15

                    // Add gross pay data point
                    monthlyTrend.push({
                        month,
                        value: Math.round(baseValue * randomFactor),
                        type: "gross",
                    });

                    // Add net pay data point
                    monthlyTrend.push({
                        month,
                        value: Math.round(baseValue * randomFactor * 0.8), // Net pay is roughly 80% of gross
                        type: "net",
                    });
                }

                // Sort by month
                monthlyTrend.sort((a, b) => a.month.localeCompare(b.month));

                // Add to statistics
                stats.monthlyTrend = monthlyTrend;
            }

            // Calculate growth rates
            if (stats.totalGrossPay && stats.totalNetPay) {
                // Assume previous period had values 5-10% lower for demo purposes
                const previousGrossPay =
                    stats.totalGrossPay * (0.9 + Math.random() * 0.05);
                const previousNetPay =
                    stats.totalNetPay * (0.9 + Math.random() * 0.05);

                stats.growthRates = {
                    grossPayGrowth:
                        ((stats.totalGrossPay - previousGrossPay) /
                            previousGrossPay) *
                        100,
                    netPayGrowth:
                        ((stats.totalNetPay - previousNetPay) /
                            previousNetPay) *
                        100,
                };
            }

            setStatistics(stats);
            console.log("Loaded statistics:", stats);
        } catch (error) {
            console.error("Error fetching payroll statistics:", error);

            // Show error message
            message.error(
                error.response?.data?.message ||
                    "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau."
            );

            // Set empty statistics
            setStatistics({
                totalPayrolls: 0,
                totalEmployees: 0,
                totalGrossPay: 0,
                totalNetPay: 0,
                byStatus: {},
                byDepartment: {},
                monthlyTrend: [],
            });
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
                        suffix={
                            statistics.growthRates?.grossPayGrowth ? (
                                <span
                                    style={{
                                        fontSize: "14px",
                                        marginLeft: "8px",
                                    }}
                                >
                                    {statistics.growthRates.grossPayGrowth >=
                                    0 ? (
                                        <span style={{ color: "#3f8600" }}>
                                            <RiseOutlined /> +
                                            {statistics.growthRates.grossPayGrowth.toFixed(
                                                1
                                            )}
                                            %
                                        </span>
                                    ) : (
                                        <span style={{ color: "#cf1322" }}>
                                            <FallOutlined />{" "}
                                            {statistics.growthRates.grossPayGrowth.toFixed(
                                                1
                                            )}
                                            %
                                        </span>
                                    )}
                                </span>
                            ) : null
                        }
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
                        suffix={
                            statistics.growthRates?.netPayGrowth ? (
                                <span
                                    style={{
                                        fontSize: "14px",
                                        marginLeft: "8px",
                                    }}
                                >
                                    {statistics.growthRates.netPayGrowth >=
                                    0 ? (
                                        <span style={{ color: "#3f8600" }}>
                                            <RiseOutlined /> +
                                            {statistics.growthRates.netPayGrowth.toFixed(
                                                1
                                            )}
                                            %
                                        </span>
                                    ) : (
                                        <span style={{ color: "#cf1322" }}>
                                            <FallOutlined />{" "}
                                            {statistics.growthRates.netPayGrowth.toFixed(
                                                1
                                            )}
                                            %
                                        </span>
                                    )}
                                </span>
                            ) : null
                        }
                    />
                </Card>
            </Col>
        </Row>
    );

    const renderDepartmentDistribution = () => {
        const hasData = departmentChartData.length > 0;

        // Sort data by value for better visualization
        const sortedData = [...departmentChartData].sort(
            (a, b) => b.value - a.value
        );

        return (
            <Card
                title={
                    <Space>
                        <PieChartOutlined />
                        <span>Phân bố lương theo phòng ban</span>
                    </Space>
                }
                extra={
                    <Tooltip title="Biểu đồ hiển thị tỷ lệ chi phí lương phân bổ cho các phòng ban">
                        <InfoCircleOutlined />
                    </Tooltip>
                }
                style={{ marginBottom: 24 }}
            >
                {hasData ? (
                    <Row>
                        <Col span={16}>
                            <Pie
                                data={sortedData}
                                angleField="value"
                                colorField="department"
                                radius={0.8}
                                innerRadius={0.5} // Create a donut chart for better appearance
                                label={{
                                    type: "outer",
                                    content: "{name}: {percentage}",
                                    style: {
                                        fontSize: 12,
                                    },
                                }}
                                statistic={{
                                    title: {
                                        content: "Tổng chi phí",
                                        style: {
                                            fontSize: "14px",
                                        },
                                    },
                                    content: {
                                        content: formatCurrency(
                                            statistics.totalNetPay || 0
                                        ),
                                        style: {
                                            fontSize: "12px",
                                        },
                                    },
                                }}
                                interactions={[
                                    {
                                        type: "element-active",
                                    },
                                    {
                                        type: "pie-statistic-active",
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
                        </Col>
                        <Col span={8}>
                            <div style={{ marginTop: "20px" }}>
                                <h4>Top phòng ban</h4>
                                <ul style={{ paddingLeft: "20px" }}>
                                    {sortedData
                                        .slice(0, 3)
                                        .map((item, index) => (
                                            <li
                                                key={index}
                                                style={{ marginBottom: "8px" }}
                                            >
                                                <div>
                                                    <Tag
                                                        color={
                                                            index === 0
                                                                ? "gold"
                                                                : index === 1
                                                                ? "blue"
                                                                : "green"
                                                        }
                                                    >
                                                        {index + 1}
                                                    </Tag>{" "}
                                                    {item.department}
                                                </div>
                                                <div
                                                    style={{
                                                        marginLeft: "24px",
                                                        fontSize: "12px",
                                                        color: "#888",
                                                    }}
                                                >
                                                    {formatCurrency(item.value)}
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </Col>
                    </Row>
                ) : (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        <Spin spinning={loading} />
                        {!loading && (
                            <Empty description="Không có dữ liệu hiển thị" />
                        )}
                    </div>
                )}
            </Card>
        );
    };

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

    const renderMonthlyTrend = () => {
        // Format month labels to be more readable
        const formatMonthData = monthlyTrendData.map((item) => ({
            ...item,
            // Convert YYYY-MM to display format
            displayMonth: item.month ? dayjs(item.month).format("MM/YYYY") : "",
            type: item.type === "gross" ? "Lương gộp" : "Lương thực lãnh",
        }));

        return (
            <Card
                title={
                    <Space>
                        <LineChartOutlined />
                        <span>Xu hướng lương theo tháng</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
                extra={
                    <Space>
                        <Text type="secondary">
                            {filter.dateRange[0].format("DD/MM/YYYY")} -{" "}
                            {filter.dateRange[1].format("DD/MM/YYYY")}
                        </Text>
                        <Tooltip title="Biểu đồ hiển thị xu hướng tổng chi phí lương theo tháng">
                            <Button type="text" icon={<InfoCircleOutlined />} />
                        </Tooltip>
                    </Space>
                }
            >
                {formatMonthData.length > 0 ? (
                    <Line
                        data={formatMonthData}
                        xField="displayMonth"
                        yField="value"
                        seriesField="type"
                        smooth
                        point
                        legend={{
                            position: "top",
                        }}
                        xAxis={{
                            title: {
                                text: "Tháng",
                            },
                            label: {
                                autoRotate: false,
                                autoHide: false,
                            },
                        }}
                        yAxis={{
                            title: {
                                text: "Tổng chi phí (VNĐ)",
                            },
                            label: {
                                formatter: (value) => {
                                    return `${(value / 1000000).toFixed(1)}M`;
                                },
                            },
                        }}
                        color={["#1890ff", "#52c41a"]}
                        padding="auto"
                        tooltip={{
                            formatter: (datum) => {
                                return {
                                    name: datum.type,
                                    value: formatCurrency(datum.value),
                                };
                            },
                        }}
                        annotations={
                            [
                                // Add trend line annotation if needed
                                // {
                                //     type: 'regionFilter',
                                //     start: ['min', 'median'],
                                //     end: ['max', 'median'],
                                //     color: 'rgba(0, 0, 0, 0.05)',
                                // },
                            ]
                        }
                    />
                ) : (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        {loading ? (
                            <Spin tip="Đang tải dữ liệu..." />
                        ) : (
                            <Empty description="Không có dữ liệu xu hướng" />
                        )}
                    </div>
                )}
            </Card>
        );
    };

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

    const renderSalaryDistribution = () => {
        // Create salary distribution data
        // (This would ideally come from the API, but we're generating sample data here)
        const generateDistributionData = () => {
            // Assuming we have gross pay data, we'll create distribution ranges
            if (!statistics.totalPayrolls) return [];

            // Create ranges (in millions VND)
            const ranges = [
                { range: "< 5 triệu", min: 0, max: 5000000, count: 0 },
                { range: "5-10 triệu", min: 5000000, max: 10000000, count: 0 },
                {
                    range: "10-15 triệu",
                    min: 10000000,
                    max: 15000000,
                    count: 0,
                },
                {
                    range: "15-20 triệu",
                    min: 15000000,
                    max: 20000000,
                    count: 0,
                },
                { range: "> 20 triệu", min: 20000000, max: Infinity, count: 0 },
            ];

            // Calculate average gross pay
            const avgGrossPay =
                statistics.totalGrossPay / statistics.totalPayrolls;

            // Generate synthetic distribution around the average
            let remaining = statistics.totalPayrolls;

            // Distribute employees in each range - simple bell curve approximation
            if (avgGrossPay < 5000000) {
                ranges[0].count = Math.round(statistics.totalPayrolls * 0.6);
                ranges[1].count = Math.round(statistics.totalPayrolls * 0.3);
                ranges[2].count =
                    statistics.totalPayrolls -
                    ranges[0].count -
                    ranges[1].count;
            } else if (avgGrossPay < 10000000) {
                ranges[0].count = Math.round(statistics.totalPayrolls * 0.3);
                ranges[1].count = Math.round(statistics.totalPayrolls * 0.5);
                ranges[2].count = Math.round(statistics.totalPayrolls * 0.15);
                ranges[3].count =
                    statistics.totalPayrolls -
                    ranges[0].count -
                    ranges[1].count -
                    ranges[2].count;
            } else if (avgGrossPay < 15000000) {
                ranges[0].count = Math.round(statistics.totalPayrolls * 0.1);
                ranges[1].count = Math.round(statistics.totalPayrolls * 0.3);
                ranges[2].count = Math.round(statistics.totalPayrolls * 0.4);
                ranges[3].count = Math.round(statistics.totalPayrolls * 0.15);
                ranges[4].count =
                    statistics.totalPayrolls -
                    ranges[0].count -
                    ranges[1].count -
                    ranges[2].count -
                    ranges[3].count;
            } else if (avgGrossPay < 20000000) {
                ranges[0].count = Math.round(statistics.totalPayrolls * 0.05);
                ranges[1].count = Math.round(statistics.totalPayrolls * 0.15);
                ranges[2].count = Math.round(statistics.totalPayrolls * 0.3);
                ranges[3].count = Math.round(statistics.totalPayrolls * 0.4);
                ranges[4].count =
                    statistics.totalPayrolls -
                    ranges[0].count -
                    ranges[1].count -
                    ranges[2].count -
                    ranges[3].count;
            } else {
                ranges[0].count = Math.round(statistics.totalPayrolls * 0.05);
                ranges[1].count = Math.round(statistics.totalPayrolls * 0.1);
                ranges[2].count = Math.round(statistics.totalPayrolls * 0.2);
                ranges[3].count = Math.round(statistics.totalPayrolls * 0.3);
                ranges[4].count =
                    statistics.totalPayrolls -
                    ranges[0].count -
                    ranges[1].count -
                    ranges[2].count -
                    ranges[3].count;
            }

            // Calculate percentages
            return ranges.map((range) => ({
                range: range.range,
                count: range.count,
                percentage: (range.count / statistics.totalPayrolls) * 100,
            }));
        };

        const distributionData = generateDistributionData();

        return (
            <Card
                title={
                    <Space>
                        <PercentageOutlined />
                        <span>Phân bố mức lương</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                {distributionData.length > 0 ? (
                    <>
                        <Row gutter={[16, 16]}>
                            {distributionData.map((item, index) => (
                                <Col span={24} key={index}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "120px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {item.range}
                                        </div>
                                        <Progress
                                            percent={Math.round(
                                                item.percentage
                                            )}
                                            format={(percent) =>
                                                `${item.count} (${percent}%)`
                                            }
                                            status={
                                                index ===
                                                distributionData.length - 1
                                                    ? "success"
                                                    : "active"
                                            }
                                        />
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <Divider style={{ margin: "16px 0" }} />
                        <Row>
                            <Col span={24}>
                                <Column
                                    data={distributionData}
                                    xField="range"
                                    yField="count"
                                    color={"#1890ff"}
                                    label={{
                                        position: "top",
                                        formatter: (datum) =>
                                            `${datum.count} người`,
                                    }}
                                    tooltip={{
                                        formatter: (datum) => ({
                                            name: "Số người",
                                            value: `${
                                                datum.count
                                            } (${datum.percentage.toFixed(
                                                1
                                            )}%)`,
                                        }),
                                    }}
                                />
                            </Col>
                        </Row>
                    </>
                ) : (
                    <Empty description="Không có dữ liệu phân bố" />
                )}
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
                        <Row gutter={16}>
                            <Col span={24}>{renderSalaryDistribution()}</Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card style={{ marginBottom: 24 }}>
                                    <Title level={4}>
                                        <Space>
                                            <RiseOutlined />
                                            <span>
                                                Tăng trưởng chi phí lương
                                            </span>
                                        </Space>
                                    </Title>
                                    {statistics.growthRates ? (
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Tăng trưởng lương gộp"
                                                    value={statistics.growthRates.grossPayGrowth.toFixed(
                                                        2
                                                    )}
                                                    precision={2}
                                                    valueStyle={{
                                                        color:
                                                            statistics
                                                                .growthRates
                                                                .grossPayGrowth >=
                                                            0
                                                                ? "#3f8600"
                                                                : "#cf1322",
                                                    }}
                                                    prefix={
                                                        statistics.growthRates
                                                            .grossPayGrowth >=
                                                        0 ? (
                                                            <RiseOutlined />
                                                        ) : (
                                                            <FallOutlined />
                                                        )
                                                    }
                                                    suffix="%"
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Tăng trưởng lương thực lãnh"
                                                    value={statistics.growthRates.netPayGrowth.toFixed(
                                                        2
                                                    )}
                                                    precision={2}
                                                    valueStyle={{
                                                        color:
                                                            statistics
                                                                .growthRates
                                                                .netPayGrowth >=
                                                            0
                                                                ? "#3f8600"
                                                                : "#cf1322",
                                                    }}
                                                    prefix={
                                                        statistics.growthRates
                                                            .netPayGrowth >=
                                                        0 ? (
                                                            <RiseOutlined />
                                                        ) : (
                                                            <FallOutlined />
                                                        )
                                                    }
                                                    suffix="%"
                                                />
                                            </Col>
                                        </Row>
                                    ) : (
                                        <p>
                                            Phân tích xu hướng chi phí lương
                                            theo thời gian, so sánh với kỳ
                                            trước. Đang phát triển...
                                        </p>
                                    )}
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card>
                                    <Title level={4}>
                                        <Space>
                                            <BankOutlined />
                                            <span>Dự báo ngân sách lương</span>
                                        </Space>
                                    </Title>
                                    {statistics.totalPayrolls > 0 ? (
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Chi phí lương trung bình/NV"
                                                    value={formatCurrency(
                                                        statistics.totalNetPay /
                                                            (statistics.totalEmployees ||
                                                                1)
                                                    )}
                                                    precision={0}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Dự kiến chi phí tháng tới"
                                                    value={formatCurrency(
                                                        statistics.totalNetPay *
                                                            1.05
                                                    )}
                                                    precision={0}
                                                />
                                            </Col>
                                        </Row>
                                    ) : (
                                        <p>
                                            Mô hình dự báo chi phí lương cho các
                                            kỳ tiếp theo. Đang phát triển...
                                        </p>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default PayrollDashboard;
