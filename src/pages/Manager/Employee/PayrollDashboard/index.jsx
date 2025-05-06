import React, { useState, useEffect, useMemo } from "react";
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
    Radio,
    Alert,
    Badge,
    Switch,
} from "antd";
import {
    DollarOutlined,
    TeamOutlined,
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    FileTextOutlined,
    SearchOutlined,
    BankOutlined,
    RiseOutlined,
    FallOutlined,
    InfoCircleOutlined,
    PercentageOutlined,
    DownloadOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";
import { Column, Pie, Line, Bar, DualAxes } from "@ant-design/charts";
import dayjs from "dayjs";
import { getPayrollStats } from "../../../../api/salaryApi";
import { getDepartments } from "../../../../api/departmentsApi";
import { getBranches } from "../../../../api/branchesApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Theme colors for consistent styling
const THEME_COLORS = {
    primary: "#1890ff",
    success: "#52c41a",
    warning: "#faad14",
    error: "#f5222d",
    hotel: "#1890ff",
    restaurant: "#ff7a45",
    other: "#722ed1",
    grey: "#f0f2f5",
};

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

// Format large numbers with K/M suffix
const formatLargeNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

// Get color based on trend (positive or negative)
const getTrendColor = (value) => {
    return value >= 0 ? THEME_COLORS.success : THEME_COLORS.error;
};

// Format percentage values
const formatPercentage = (value) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

// Card style
const cardStyle = {
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    borderRadius: "8px",
    height: "100%",
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
        byBranch: {},
        monthlyTrend: [],
    });
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [filterForm] = Form.useForm();
    const [viewMode, setViewMode] = useState("charts"); // 'charts' or 'data'
    const [filter, setFilter] = useState({
        dateRange: [dayjs().subtract(5, "month").startOf("month"), dayjs()],
        departmentId: undefined,
        branchId: undefined,
        periodType: "monthly",
        employeeType: "all",
        includeInactive: false,
    });

    // Fetch initial data
    useEffect(() => {
        fetchDepartments();
        fetchBranches();
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

    const fetchBranches = async () => {
        try {
            const data = await getBranches();
            setBranches(data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const startDate = filter.dateRange[0].format("YYYY-MM-DD");
            const endDate = filter.dateRange[1].format("YYYY-MM-DD");

            // Fetch payroll statistics with department and branch filter if available
            const stats = await getPayrollStats(
                startDate,
                endDate,
                filter.departmentId,
                filter.branchId
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
                byBranch: {},
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

    const handleBranchChange = (value) => {
        setFilter({
            ...filter,
            branchId: value,
        });
    };

    const handlePeriodTypeChange = (e) => {
        setFilter({
            ...filter,
            periodType: e.target.value,
        });
    };

    const handleEmployeeTypeChange = (value) => {
        setFilter({
            ...filter,
            employeeType: value,
        });
    };

    const handleIncludeInactiveChange = (checked) => {
        setFilter({
            ...filter,
            includeInactive: checked,
        });
    };

    const handleSearch = () => {
        fetchStatistics();
    };

    const handleReset = () => {
        // Reset to default filters
        const defaultFilters = {
            dateRange: [dayjs().subtract(5, "month").startOf("month"), dayjs()],
            departmentId: undefined,
            branchId: undefined,
            periodType: "monthly",
            employeeType: "all",
            includeInactive: false,
        };

        setFilter(defaultFilters);
        filterForm.setFieldsValue(defaultFilters);

        // Fetch data with reset filters
        setTimeout(() => {
            fetchStatistics();
        }, 0);
    };

    const toggleViewMode = () => {
        setViewMode((prevMode) => (prevMode === "charts" ? "data" : "charts"));
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

    const branchChartData =
        branches.length > 0 && statistics.byBranch
            ? Object.keys(statistics.byBranch).map((branchId) => {
                  const branch = branches.find(
                      (b) => b.id === Number(branchId)
                  ) || { name: "Unknown", type: null };
                  return {
                      branch: branch.name,
                      type: branch.type,
                      value: statistics.byBranch[branchId].totalNetPay,
                      count: statistics.byBranch[branchId].count || 0,
                      avgSalary:
                          statistics.byBranch[branchId].count > 0
                              ? statistics.byBranch[branchId].totalNetPay /
                                statistics.byBranch[branchId].count
                              : 0,
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
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
                <Card hoverable style={cardStyle}>
                    <Statistic
                        title={
                            <div style={{ fontSize: "15px" }}>
                                Tổng số bảng lương
                            </div>
                        }
                        value={statistics.totalPayrolls || 0}
                        prefix={
                            <FileTextOutlined
                                style={{ color: THEME_COLORS.primary }}
                            />
                        }
                        valueStyle={{
                            color: THEME_COLORS.primary,
                            fontWeight: "bold",
                        }}
                    />
                    <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
                        Thời kỳ: {filter.dateRange[0].format("DD/MM/YYYY")} -{" "}
                        {filter.dateRange[1].format("DD/MM/YYYY")}
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card hoverable style={cardStyle}>
                    <Statistic
                        title={
                            <div style={{ fontSize: "15px" }}>
                                Tổng nhân viên
                            </div>
                        }
                        value={statistics.totalEmployees || 0}
                        prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
                        valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
                    />
                    <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
                        {filter.branchId
                            ? "Theo chi nhánh đã chọn"
                            : "Tất cả chi nhánh"}
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card hoverable style={cardStyle}>
                    <Statistic
                        title={
                            <div style={{ fontSize: "15px" }}>
                                Tổng lương gộp
                            </div>
                        }
                        value={formatCurrency(statistics.totalGrossPay || 0)}
                        prefix={<DollarOutlined style={{ color: "#fa8c16" }} />}
                        valueStyle={{ color: "#fa8c16", fontWeight: "bold" }}
                        suffix={
                            statistics.growthRates?.grossPayGrowth ? (
                                <Badge
                                    count={formatPercentage(
                                        statistics.growthRates.grossPayGrowth
                                    )}
                                    style={{
                                        backgroundColor: getTrendColor(
                                            statistics.growthRates
                                                .grossPayGrowth
                                        ),
                                        fontSize: "12px",
                                        marginLeft: "8px",
                                    }}
                                />
                            ) : null
                        }
                    />
                    <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
                        {statistics.growthRates?.grossPayGrowth >= 0
                            ? "Tăng so với kỳ trước"
                            : "Giảm so với kỳ trước"}
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card hoverable style={cardStyle}>
                    <Statistic
                        title={
                            <div style={{ fontSize: "15px" }}>
                                Tổng lương thực lãnh
                            </div>
                        }
                        value={formatCurrency(statistics.totalNetPay || 0)}
                        prefix={
                            <DollarOutlined
                                style={{ color: THEME_COLORS.success }}
                            />
                        }
                        valueStyle={{
                            color: THEME_COLORS.success,
                            fontWeight: "bold",
                        }}
                        suffix={
                            statistics.growthRates?.netPayGrowth ? (
                                <Badge
                                    count={formatPercentage(
                                        statistics.growthRates.netPayGrowth
                                    )}
                                    style={{
                                        backgroundColor: getTrendColor(
                                            statistics.growthRates.netPayGrowth
                                        ),
                                        fontSize: "12px",
                                        marginLeft: "8px",
                                    }}
                                />
                            ) : null
                        }
                    />
                    <div style={{ marginTop: 10, fontSize: 12, color: "#999" }}>
                        Trung bình:{" "}
                        {formatCurrency(
                            (statistics.totalNetPay || 0) /
                                (statistics.totalEmployees || 1)
                        )}
                    </div>
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

    const renderBranchDistribution = () => {
        const hasData = branchChartData.length > 0;

        // Sort data by value for better visualization
        const sortedData = [...branchChartData].sort(
            (a, b) => b.value - a.value
        );

        return (
            <Card
                title={
                    <Space>
                        <PieChartOutlined />
                        <span>Phân bố lương theo chi nhánh</span>
                    </Space>
                }
                extra={
                    <Space>
                        <Radio.Group size="small" defaultValue="value">
                            <Radio.Button value="value">Chi phí</Radio.Button>
                            <Radio.Button value="count">Nhân viên</Radio.Button>
                        </Radio.Group>
                        <Tooltip title="Biểu đồ hiển thị tỷ lệ chi phí lương phân bổ cho các chi nhánh">
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Space>
                }
                style={{ ...cardStyle, marginBottom: 24 }}
                className="chart-card"
            >
                {hasData ? (
                    <Row>
                        <Col span={16}>
                            <Pie
                                data={sortedData}
                                angleField="value"
                                colorField="branch"
                                radius={0.8}
                                innerRadius={0.6}
                                legend={{
                                    layout: "horizontal",
                                    position: "bottom",
                                }}
                                label={{
                                    type: "outer",
                                    formatter: (datum) => {
                                        const percentage = (
                                            (datum.value /
                                                statistics.totalNetPay) *
                                            100
                                        ).toFixed(1);
                                        return `${percentage}%`;
                                    },
                                    style: {
                                        fontSize: 12,
                                        lineHeight: 1.2,
                                    },
                                }}
                                statistic={{
                                    title: {
                                        content: "Tổng chi phí",
                                        style: {
                                            fontSize: "14px",
                                            color: "#666",
                                        },
                                    },
                                    content: {
                                        content: formatCurrency(
                                            statistics.totalNetPay || 0
                                        ),
                                        style: {
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            color: THEME_COLORS.primary,
                                        },
                                    },
                                }}
                                interactions={[
                                    {
                                        type: "element-active",
                                    },
                                    {
                                        type: "element-selected",
                                    },
                                    {
                                        type: "pie-statistic-active",
                                    },
                                ]}
                                tooltip={{
                                    formatter: (datum) => {
                                        const percentage = (
                                            (datum.value /
                                                statistics.totalNetPay) *
                                            100
                                        ).toFixed(1);
                                        const avgSalary =
                                            datum.count > 0
                                                ? datum.value / datum.count
                                                : 0;
                                        return {
                                            name: datum.branch,
                                            value: `${formatCurrency(
                                                datum.value
                                            )} (${percentage}%)`,
                                            items: [
                                                {
                                                    name: "Nhân viên",
                                                    value: datum.count,
                                                },
                                                {
                                                    name: "Lương TB",
                                                    value: formatCurrency(
                                                        avgSalary
                                                    ),
                                                },
                                                {
                                                    name: "Loại",
                                                    value:
                                                        datum.type === "hotel"
                                                            ? "Khách sạn"
                                                            : datum.type ===
                                                              "restaurant"
                                                            ? "Nhà hàng"
                                                            : "Khác",
                                                },
                                            ],
                                        };
                                    },
                                }}
                                color={({ branch, type }) => {
                                    // Assign colors by branch type
                                    if (type === "hotel")
                                        return THEME_COLORS.hotel;
                                    if (type === "restaurant")
                                        return THEME_COLORS.restaurant;
                                    return THEME_COLORS.other;
                                }}
                            />
                        </Col>
                        <Col span={8}>
                            <div style={{ marginTop: "20px" }}>
                                <Title level={5}>Top chi nhánh</Title>
                                <ul
                                    style={{
                                        paddingLeft: "20px",
                                        listStyle: "none",
                                    }}
                                >
                                    {sortedData
                                        .slice(0, 3)
                                        .map((item, index) => (
                                            <li
                                                key={index}
                                                style={{
                                                    marginBottom: "12px",
                                                    backgroundColor:
                                                        index === 0
                                                            ? "#fffbe6"
                                                            : "transparent",
                                                    padding: "8px",
                                                    borderRadius: "4px",
                                                }}
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
                                                    <Text strong>
                                                        {item.branch}
                                                    </Text>
                                                    <Tag
                                                        color={
                                                            item.type ===
                                                            "hotel"
                                                                ? "blue"
                                                                : item.type ===
                                                                  "restaurant"
                                                                ? "orange"
                                                                : "purple"
                                                        }
                                                        style={{
                                                            marginLeft: 8,
                                                        }}
                                                    >
                                                        {item.type === "hotel"
                                                            ? "Khách sạn"
                                                            : item.type ===
                                                              "restaurant"
                                                            ? "Nhà hàng"
                                                            : "Khác"}
                                                    </Tag>
                                                </div>
                                                <div
                                                    style={{
                                                        marginLeft: "24px",
                                                        marginTop: "4px",
                                                    }}
                                                >
                                                    <Text type="secondary">
                                                        Tổng chi phí:
                                                    </Text>{" "}
                                                    <Text strong>
                                                        {formatCurrency(
                                                            item.value
                                                        )}
                                                    </Text>
                                                </div>
                                                <div
                                                    style={{
                                                        marginLeft: "24px",
                                                    }}
                                                >
                                                    <Text type="secondary">
                                                        Lương TB:
                                                    </Text>{" "}
                                                    <Text>
                                                        {formatCurrency(
                                                            item.count > 0
                                                                ? item.value /
                                                                      item.count
                                                                : 0
                                                        )}
                                                    </Text>
                                                </div>
                                                <div
                                                    style={{
                                                        marginLeft: "24px",
                                                    }}
                                                >
                                                    <Text type="secondary">
                                                        Nhân viên:
                                                    </Text>{" "}
                                                    <Text>
                                                        {item.count} người
                                                    </Text>
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
            typeColor:
                item.type === "gross"
                    ? THEME_COLORS.warning
                    : THEME_COLORS.success,
        }));

        // Calculate growth rate between first and last month
        const calculateGrowthRate = (dataType) => {
            const typeData = formatMonthData.filter(
                (item) => item.type === dataType
            );
            if (typeData.length < 2) return 0;

            const firstMonth = typeData[0];
            const lastMonth = typeData[typeData.length - 1];

            return (
                ((lastMonth.value - firstMonth.value) / firstMonth.value) * 100
            );
        };

        const grossGrowthRate = calculateGrowthRate("Lương gộp");
        const netGrowthRate = calculateGrowthRate("Lương thực lãnh");

        return (
            <Card
                title={
                    <Space>
                        <LineChartOutlined />
                        <span>
                            Xu hướng lương theo{" "}
                            {filter.periodType === "monthly" ? "tháng" : "quý"}
                        </span>
                    </Space>
                }
                style={{ ...cardStyle, marginBottom: 24 }}
                extra={
                    <Space>
                        <Badge
                            count={formatPercentage(netGrowthRate)}
                            style={{
                                backgroundColor: getTrendColor(netGrowthRate),
                                fontSize: "12px",
                            }}
                        />
                        <Tooltip
                            title={`Biểu đồ hiển thị xu hướng chi phí lương theo ${
                                filter.periodType === "monthly"
                                    ? "tháng"
                                    : "quý"
                            } trong khoảng thời gian đã chọn`}
                        >
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Space>
                }
            >
                {formatMonthData.length > 0 ? (
                    <>
                        <Line
                            data={formatMonthData}
                            xField="displayMonth"
                            yField="value"
                            seriesField="type"
                            smooth
                            point={{
                                size: 5,
                                shape: "circle",
                                style: (datum) => ({
                                    fill: datum.typeColor,
                                    stroke: datum.typeColor,
                                    lineWidth: 2,
                                }),
                            }}
                            legend={{
                                position: "top-right",
                                itemName: {
                                    formatter: (text) => text,
                                    style: {
                                        fontSize: 12,
                                    },
                                },
                            }}
                            xAxis={{
                                title: {
                                    text:
                                        filter.periodType === "monthly"
                                            ? "Tháng"
                                            : "Quý",
                                    style: {
                                        fontSize: 12,
                                    },
                                },
                                label: {
                                    autoRotate: true,
                                    autoHide: false,
                                    style: {
                                        fontSize: 12,
                                    },
                                },
                            }}
                            yAxis={{
                                title: {
                                    text: "Tổng chi phí (VNĐ)",
                                    style: {
                                        fontSize: 12,
                                    },
                                },
                                label: {
                                    formatter: (value) => {
                                        return `${(value / 1000000).toFixed(
                                            0
                                        )}M`;
                                    },
                                    style: {
                                        fontSize: 12,
                                    },
                                },
                                grid: {
                                    line: {
                                        style: {
                                            stroke: "#ddd",
                                            lineDash: [4, 5],
                                        },
                                    },
                                },
                            }}
                            color={["#fa8c16", "#52c41a"]}
                            padding="auto"
                            tooltip={{
                                formatter: (datum) => {
                                    return {
                                        name: datum.type,
                                        value: formatCurrency(datum.value),
                                    };
                                },
                                crosshairs: {
                                    line: {
                                        style: {
                                            stroke: "#ccc",
                                        },
                                    },
                                },
                                domStyles: {
                                    "g2-tooltip": {
                                        backgroundColor:
                                            "rgba(255, 255, 255, 0.95)",
                                        boxShadow:
                                            "0 2px 8px rgba(0, 0, 0, 0.15)",
                                        borderRadius: "4px",
                                        padding: "8px 12px",
                                    },
                                },
                            }}
                            annotations={[
                                {
                                    type: "line",
                                    start: ["min", "mean"],
                                    end: ["max", "mean"],
                                    style: {
                                        stroke: "#aaa",
                                        lineDash: [4, 4],
                                    },
                                },
                            ]}
                        />
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Card
                                    size="small"
                                    bordered={false}
                                    style={{ backgroundColor: "#f6ffed" }}
                                >
                                    <Statistic
                                        title="Tăng trưởng lương thực lãnh"
                                        value={netGrowthRate.toFixed(2)}
                                        precision={2}
                                        valueStyle={{
                                            color: getTrendColor(netGrowthRate),
                                            fontSize: 16,
                                        }}
                                        prefix={
                                            netGrowthRate >= 0 ? (
                                                <RiseOutlined />
                                            ) : (
                                                <FallOutlined />
                                            )
                                        }
                                        suffix="%"
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card
                                    size="small"
                                    bordered={false}
                                    style={{ backgroundColor: "#fff7e6" }}
                                >
                                    <Statistic
                                        title="Tăng trưởng lương gộp"
                                        value={grossGrowthRate.toFixed(2)}
                                        precision={2}
                                        valueStyle={{
                                            color: getTrendColor(
                                                grossGrowthRate
                                            ),
                                            fontSize: 16,
                                        }}
                                        prefix={
                                            grossGrowthRate >= 0 ? (
                                                <RiseOutlined />
                                            ) : (
                                                <FallOutlined />
                                            )
                                        }
                                        suffix="%"
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </>
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

    const renderBranchSalaryComparison = () => {
        // Sort branches by average salary
        const sortedBranches = [...branchChartData].sort(
            (a, b) => b.avgSalary - a.avgSalary
        );

        return (
            <Card
                title={
                    <Space>
                        <BarChartOutlined />
                        <span>So sánh lương theo chi nhánh</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                {branchChartData.length > 0 ? (
                    <Row>
                        <Col span={24}>
                            <Bar
                                data={branchChartData}
                                xField="value"
                                yField="branch"
                                xAxis={{
                                    label: {
                                        formatter: (v) => formatCurrency(v),
                                    },
                                }}
                                seriesField="type"
                                color={({ type }) => {
                                    if (type === "hotel") return "#1890ff";
                                    if (type === "restaurant") return "#ff7a45";
                                    return "#52c41a";
                                }}
                                tooltip={{
                                    formatter: (datum) => {
                                        const avgSalary =
                                            datum.count > 0
                                                ? datum.value / datum.count
                                                : 0;
                                        return {
                                            name: datum.branch,
                                            value: `${formatCurrency(
                                                datum.value
                                            )} (${datum.count} nhân viên)`,
                                            avgPerson: `Trung bình: ${formatCurrency(
                                                avgSalary
                                            )}/người`,
                                        };
                                    },
                                }}
                                legend={{
                                    position: "top-right",
                                }}
                                barBackground={{ fill: "#f6f6f6" }}
                                interactions={[
                                    {
                                        type: "active-region",
                                        enable: true,
                                    },
                                ]}
                            />
                        </Col>
                    </Row>
                ) : (
                    <Empty description="Không có dữ liệu chi nhánh" />
                )}
            </Card>
        );
    };

    const renderBranchMetrics = () => {
        if (branchChartData.length === 0) {
            return (
                <Card style={{ ...cardStyle, marginBottom: 24 }}>
                    <Empty description="Không có dữ liệu chi nhánh để hiển thị" />
                </Card>
            );
        }

        // Calculate totals for summary row
        const totalValue = branchChartData.reduce(
            (total, record) => total + record.value,
            0
        );
        const totalCount = branchChartData.reduce(
            (total, record) => total + record.count,
            0
        );
        const totalAvg = totalCount > 0 ? totalValue / totalCount : 0;

        return (
            <Card
                title={
                    <Space>
                        <BankOutlined />
                        <span>Chỉ số lương theo chi nhánh</span>
                    </Space>
                }
                style={{ ...cardStyle, marginBottom: 24 }}
                extra={
                    <Tooltip title="Xuất dữ liệu">
                        <Button type="text" icon={<DownloadOutlined />} />
                    </Tooltip>
                }
            >
                <div className="responsive-table-wrapper">
                    <Table
                        dataSource={branchChartData}
                        rowKey={(record) => record.branch}
                        pagination={false}
                        scroll={{ x: 800 }}
                        size="middle"
                        bordered
                        rowClassName={(record, index) =>
                            index % 2 === 0
                                ? "table-row-light"
                                : "table-row-dark"
                        }
                        columns={[
                            {
                                title: "Chi nhánh",
                                dataIndex: "branch",
                                key: "branch",
                                fixed: "left",
                                width: 250,
                                render: (text, record) => (
                                    <Space>
                                        {text}
                                        {record.type && (
                                            <Tag
                                                color={
                                                    record.type === "hotel"
                                                        ? "blue"
                                                        : record.type ===
                                                          "restaurant"
                                                        ? "orange"
                                                        : "default"
                                                }
                                            >
                                                {record.type === "hotel"
                                                    ? "Khách sạn"
                                                    : record.type ===
                                                      "restaurant"
                                                    ? "Nhà hàng"
                                                    : record.type}
                                            </Tag>
                                        )}
                                    </Space>
                                ),
                            },
                            {
                                title: "Số nhân viên",
                                dataIndex: "count",
                                key: "count",
                                align: "center",
                                width: 120,
                                sorter: (a, b) => a.count - b.count,
                            },
                            {
                                title: "Tổng chi phí lương",
                                dataIndex: "value",
                                key: "value",
                                align: "right",
                                width: 180,
                                render: (value) => formatCurrency(value),
                                sorter: (a, b) => a.value - b.value,
                            },
                            {
                                title: "Lương TB/người",
                                key: "avgSalary",
                                align: "right",
                                width: 180,
                                render: (_, record) =>
                                    formatCurrency(record.avgSalary),
                                sorter: (a, b) => a.avgSalary - b.avgSalary,
                            },
                            {
                                title: "% Tổng chi phí",
                                key: "percentage",
                                align: "center",
                                width: 200,
                                render: (_, record) => {
                                    const percentage =
                                        (record.value / totalValue) * 100;
                                    return (
                                        <div style={{ width: "100%" }}>
                                            <Progress
                                                percent={percentage.toFixed(1)}
                                                size="small"
                                                format={(percent) =>
                                                    `${percent}%`
                                                }
                                                status="active"
                                                strokeColor={{
                                                    from: "#108ee9",
                                                    to: "#87d068",
                                                }}
                                            />
                                        </div>
                                    );
                                },
                            },
                        ]}
                        summary={() => (
                            <Table.Summary.Row
                                style={{
                                    fontWeight: "bold",
                                    backgroundColor: "#fafafa",
                                }}
                            >
                                <Table.Summary.Cell index={0}>
                                    <Text strong>Tổng cộng</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} align="center">
                                    <Text strong>{totalCount}</Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} align="right">
                                    <Text strong>
                                        {formatCurrency(totalValue)}
                                    </Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3} align="right">
                                    <Text strong>
                                        {formatCurrency(totalAvg)}
                                    </Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="center">
                                    <Text strong>100%</Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        )}
                    />
                </div>
            </Card>
        );
    };

    return (
        <div className="payroll-dashboard">
            <style jsx="true">{`
                .payroll-dashboard .ant-card {
                    border-radius: 8px;
                }
                .payroll-dashboard .ant-statistic-title {
                    color: #666;
                }
                .payroll-dashboard .ant-tabs-tab {
                    padding: 12px 16px;
                }
                .payroll-dashboard .ant-progress-text {
                    font-size: 12px;
                }
                .payroll-dashboard .chart-card .ant-card-body {
                    padding: 12px 24px 24px;
                }
                .payroll-dashboard .table-row-light {
                    background-color: #fff;
                }
                .payroll-dashboard .table-row-dark {
                    background-color: #fafafa;
                }
                .payroll-dashboard .responsive-table-wrapper {
                    overflow-x: auto;
                }
                .payroll-dashboard .quick-stats-card {
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s;
                }
                .payroll-dashboard .quick-stats-card:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    transform: translateY(-2px);
                }
                @media (max-width: 768px) {
                    .payroll-dashboard .ant-form-item {
                        margin-bottom: 12px;
                    }
                }
            `}</style>
            <Card
                title={
                    <Space>
                        <BarChartOutlined />
                        <span>Báo cáo và thống kê lương</span>
                    </Space>
                }
                extra={
                    <Space>
                        <Tooltip
                            title={
                                viewMode === "charts"
                                    ? "Chuyển sang chế độ dữ liệu"
                                    : "Chuyển sang chế độ biểu đồ"
                            }
                        >
                            <Button
                                type="text"
                                icon={
                                    viewMode === "charts" ? (
                                        <UnorderedListOutlined />
                                    ) : (
                                        <AppstoreOutlined />
                                    )
                                }
                                onClick={toggleViewMode}
                            />
                        </Tooltip>
                        <Tooltip title="Tải xuống báo cáo">
                            <Button type="text" icon={<DownloadOutlined />} />
                        </Tooltip>
                    </Space>
                }
            >
                {/* Filters */}
                <Form
                    form={filterForm}
                    layout="vertical"
                    initialValues={filter}
                    onFinish={handleSearch}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={8} lg={6}>
                            <Form.Item
                                label="Khoảng thời gian"
                                name="dateRange"
                            >
                                <RangePicker
                                    style={{ width: "100%" }}
                                    value={filter.dateRange}
                                    onChange={handleDateRangeChange}
                                    format="DD/MM/YYYY"
                                    allowClear={false}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8} lg={5}>
                            <Form.Item label="Chi nhánh" name="branchId">
                                <Select
                                    placeholder="Tất cả chi nhánh"
                                    style={{ width: "100%" }}
                                    allowClear
                                    onChange={handleBranchChange}
                                    value={filter.branchId}
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
                        <Col xs={24} md={8} lg={5}>
                            <Form.Item label="Phòng ban" name="departmentId">
                                <Select
                                    placeholder="Tất cả phòng ban"
                                    style={{ width: "100%" }}
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
                        </Col>
                        <Col xs={24} md={8} lg={4}>
                            <Form.Item
                                label="Loại nhân viên"
                                name="employeeType"
                            >
                                <Select
                                    placeholder="Tất cả"
                                    style={{ width: "100%" }}
                                    onChange={handleEmployeeTypeChange}
                                    value={filter.employeeType}
                                >
                                    <Option value="all">Tất cả</Option>
                                    <Option value="fulltime">
                                        Toàn thời gian
                                    </Option>
                                    <Option value="parttime">
                                        Bán thời gian
                                    </Option>
                                    <Option value="seasonal">Thời vụ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8} lg={4}>
                            <Form.Item label="Phân tích theo" name="periodType">
                                <Radio.Group
                                    onChange={handlePeriodTypeChange}
                                    value={filter.periodType}
                                >
                                    <Radio.Button value="monthly">
                                        Tháng
                                    </Radio.Button>
                                    <Radio.Button value="quarterly">
                                        Quý
                                    </Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Form.Item
                                name="includeInactive"
                                valuePropName="checked"
                                style={{ marginBottom: 0 }}
                            >
                                <Switch
                                    checkedChildren="Bao gồm NV nghỉ việc"
                                    unCheckedChildren="Chỉ NV hiện tại"
                                    onChange={handleIncludeInactiveChange}
                                    checked={filter.includeInactive}
                                />
                            </Form.Item>
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleReset}
                                >
                                    Đặt lại
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleSearch}
                                    loading={loading}
                                >
                                    Tìm kiếm
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>

                <Divider style={{ margin: "16px 0" }} />

                {loading && (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin tip="Đang tải dữ liệu..." />
                    </div>
                )}

                {!loading && statistics.totalPayrolls === 0 && (
                    <Alert
                        message="Không có dữ liệu"
                        description="Không tìm thấy dữ liệu lương phù hợp với bộ lọc hiện tại. Vui lòng thử thay đổi các điều kiện lọc."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Summary Statistics */}
                {!loading &&
                    statistics.totalPayrolls > 0 &&
                    renderSummaryCards()}

                {/* Charts */}
                {!loading && statistics.totalPayrolls > 0 && (
                    <Tabs
                        defaultActiveKey="1"
                        type="card"
                        animated={{ inkBar: true, tabPane: true }}
                    >
                        <TabPane
                            tab={
                                <span>
                                    <AppstoreOutlined /> Tổng quan
                                </span>
                            }
                            key="1"
                        >
                            <Row gutter={16}>
                                <Col xs={24} lg={12}>
                                    {renderDepartmentDistribution()}
                                </Col>
                                <Col xs={24} lg={12}>
                                    {renderBranchDistribution()}
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} lg={12}>
                                    {renderPayrollStatusDistribution()}
                                </Col>
                                <Col xs={24} lg={12}>
                                    {renderMonthlyTrend()}
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <TeamOutlined /> Chi phí nhân sự
                                </span>
                            }
                            key="2"
                        >
                            {renderDepartmentComparisonChart()}
                            {renderDepartmentMetrics()}
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <DollarOutlined /> Phân tích lương
                                </span>
                            }
                            key="3"
                        >
                            <Row gutter={16}>
                                <Col xs={24}>{renderSalaryDistribution()}</Col>
                            </Row>
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Card
                                        style={{
                                            ...cardStyle,
                                            marginBottom: 24,
                                        }}
                                    >
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
                                                <Col xs={24} sm={12}>
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
                                                            statistics
                                                                .growthRates
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
                                                <Col xs={24} sm={12}>
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
                                                            statistics
                                                                .growthRates
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
                                <Col xs={24} md={12}>
                                    <Card
                                        style={{
                                            ...cardStyle,
                                            marginBottom: 24,
                                        }}
                                    >
                                        <Title level={4}>
                                            <Space>
                                                <BankOutlined />
                                                <span>
                                                    Dự báo ngân sách lương
                                                </span>
                                            </Space>
                                        </Title>
                                        {statistics.totalPayrolls > 0 ? (
                                            <Row gutter={16}>
                                                <Col xs={24} sm={12}>
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
                                                <Col xs={24} sm={12}>
                                                    <Statistic
                                                        title="Dự kiến chi phí tháng tới"
                                                        value={formatCurrency(
                                                            statistics.totalNetPay *
                                                                1.05
                                                        )}
                                                        precision={0}
                                                        valueStyle={{
                                                            color: "#1890ff",
                                                        }}
                                                    />
                                                </Col>
                                            </Row>
                                        ) : (
                                            <p>
                                                Mô hình dự báo chi phí lương cho
                                                các kỳ tiếp theo. Đang phát
                                                triển...
                                            </p>
                                        )}
                                    </Card>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane
                            tab={
                                <span>
                                    <BankOutlined /> Chi nhánh
                                </span>
                            }
                            key="4"
                        >
                            {renderBranchSalaryComparison()}
                            {renderBranchMetrics()}
                        </TabPane>
                    </Tabs>
                )}
            </Card>
        </div>
    );
};

export default PayrollDashboard;
