import React, { useState, useEffect } from "react";
import {
    Card,
    Row,
    Col,
    DatePicker,
    Select,
    Button,
    Table,
    Space,
    Divider,
    Typography,
    Form,
    Alert,
    Tabs,
    Tag,
    Tooltip,
    Calendar,
    Badge,
    Empty,
    Statistic,
} from "antd";
import {
    SearchOutlined,
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Line } from "@ant-design/charts";
import { getEmployees } from "../../../../api/employeesApi";
import { getAttendanceIntegration } from "../../../../api/salaryApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const PayrollAttendancePage = () => {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);
    const [integrationData, setIntegrationData] = useState(null);

    // Fetch initial employees data
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Fetch data when employee or date range changes
    useEffect(() => {
        if (selectedEmployee) {
            fetchIntegrationData();
        }
    }, [selectedEmployee, dateRange]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await getEmployees();

            // Đảm bảo employees luôn là mảng
            if (Array.isArray(response)) {
                setEmployees(response);
            } else if (response && Array.isArray(response.data)) {
                // Nếu response có định dạng { data: [...], total: ... }
                setEmployees(response.data);
            } else {
                // Trường hợp không có dữ liệu hoặc format không đúng
                setEmployees([]);
                console.warn(
                    "Dữ liệu nhân viên không đúng định dạng:",
                    response
                );
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setEmployees([]); // Đảm bảo là mảng rỗng trong trường hợp lỗi
            setLoading(false);
        }
    };

    const fetchIntegrationData = async () => {
        if (!selectedEmployee) return;

        try {
            setLoading(true);
            const data = await getAttendanceIntegration(
                selectedEmployee,
                dateRange[0].format("YYYY-MM-DD"),
                dateRange[1].format("YYYY-MM-DD")
            );
            setIntegrationData(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching integration data:", error);
            setLoading(false);
        }
    };

    const handleEmployeeChange = (value) => {
        setSelectedEmployee(value);
    };

    const handleDateRangeChange = (dates) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    // Convert attendance status to badge color
    const getAttendanceStatusColor = (status) => {
        const statusColors = {
            present: "success",
            absent: "error",
            late: "warning",
            early_leave: "warning",
            on_leave: "processing",
            pending: "default",
        };
        return statusColors[status] || "default";
    };

    // Render attendance calendar
    const renderAttendanceCalendar = () => {
        if (!integrationData || !integrationData.attendances) {
            return <Empty description="Không có dữ liệu chấm công" />;
        }

        const attendanceMap = {};
        integrationData.attendances.forEach((attendance) => {
            const date = dayjs(attendance.date).format("YYYY-MM-DD");
            attendanceMap[date] = attendance;
        });

        const dateCellRender = (value) => {
            const dateStr = value.format("YYYY-MM-DD");
            const attendance = attendanceMap[dateStr];

            if (!attendance) {
                return null;
            }

            return (
                <Tooltip
                    title={
                        <>
                            <div>
                                <strong>Trạng thái:</strong>{" "}
                                {attendance.status === "present"
                                    ? "Có mặt"
                                    : attendance.status === "absent"
                                    ? "Vắng mặt"
                                    : attendance.status === "late"
                                    ? "Đi muộn"
                                    : attendance.status === "early_leave"
                                    ? "Về sớm"
                                    : attendance.status === "on_leave"
                                    ? "Nghỉ phép"
                                    : "Chưa xác định"}
                            </div>
                            {attendance.check_in && (
                                <div>
                                    <strong>Giờ vào:</strong>{" "}
                                    {dayjs(attendance.check_in).format(
                                        "HH:mm:ss"
                                    )}
                                </div>
                            )}
                            {attendance.check_out && (
                                <div>
                                    <strong>Giờ ra:</strong>{" "}
                                    {dayjs(attendance.check_out).format(
                                        "HH:mm:ss"
                                    )}
                                </div>
                            )}
                            {attendance.working_hours && (
                                <div>
                                    <strong>Số giờ làm:</strong>{" "}
                                    {attendance.working_hours.toFixed(1)} giờ
                                </div>
                            )}
                        </>
                    }
                >
                    <Badge
                        status={getAttendanceStatusColor(attendance.status)}
                        text={attendance.working_hours?.toFixed(1) + "h"}
                    />
                </Tooltip>
            );
        };

        return (
            <Card
                title={
                    <Space>
                        <CalendarOutlined />
                        <span>Lịch chấm công</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Calendar
                    fullscreen={false}
                    dateCellRender={dateCellRender}
                    validRange={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
                />
            </Card>
        );
    };

    // Render payroll-attendance correlation chart
    const renderCorrelationChart = () => {
        if (
            !integrationData ||
            !integrationData.payrolls ||
            !integrationData.dailyData
        ) {
            return <Empty description="Không có dữ liệu để hiển thị" />;
        }

        const chartData = integrationData.dailyData.map((item) => ({
            date: dayjs(item.date).format("DD/MM"),
            hours: item.working_hours || 0,
            salary: item.daily_pay || 0,
        }));

        return (
            <Card
                title={
                    <Space>
                        <LineChartOutlined />
                        <span>Tương quan giữa giờ làm và lương</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Line
                    data={chartData}
                    xField="date"
                    yField="value"
                    seriesField="category"
                    point
                    smooth
                    legend={{ position: "top" }}
                    meta={{
                        date: { alias: "Ngày" },
                        value: {
                            alias: "Giá trị",
                            formatter: (v, datum) => {
                                if (datum.category === "salary") {
                                    return formatCurrency(v);
                                }
                                return `${v.toFixed(1)} giờ`;
                            },
                        },
                    }}
                    geometryOptions={[
                        {
                            geometry: "line",
                            color: ["#2196F3", "#FF9800"],
                        },
                        {
                            geometry: "point",
                            color: ["#2196F3", "#FF9800"],
                        },
                    ]}
                />
            </Card>
        );
    };

    // Render attendance summary
    const renderAttendanceSummary = () => {
        if (!integrationData || !integrationData.summary) {
            return null;
        }

        const { summary } = integrationData;

        return (
            <Card
                title={
                    <Space>
                        <CheckCircleOutlined />
                        <span>Tổng hợp chấm công</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Row gutter={16}>
                    <Col span={6}>
                        <Statistic
                            title="Tổng số ngày làm việc"
                            value={summary.totalWorkingDays || 0}
                            prefix={<CalendarOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Tổng giờ làm việc"
                            value={summary.totalWorkingHours?.toFixed(1) || 0}
                            suffix="giờ"
                            prefix={<ClockCircleOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Giờ làm trung bình/ngày"
                            value={summary.averageHoursPerDay?.toFixed(1) || 0}
                            suffix="giờ/ngày"
                            prefix={<ClockCircleOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Tổng lương ước tính"
                            value={formatCurrency(summary.estimatedSalary || 0)}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Col>
                </Row>

                <Divider style={{ margin: "24px 0" }} />

                <Row gutter={16}>
                    <Col span={4}>
                        <Statistic
                            title="Có mặt"
                            value={summary.presentCount || 0}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Đi muộn"
                            value={summary.lateCount || 0}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Về sớm"
                            value={summary.earlyLeaveCount || 0}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Vắng mặt"
                            value={summary.absentCount || 0}
                            valueStyle={{ color: "#f5222d" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Nghỉ phép"
                            value={summary.onLeaveCount || 0}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Chưa xác định"
                            value={summary.pendingCount || 0}
                            valueStyle={{ color: "#bfbfbf" }}
                        />
                    </Col>
                </Row>
            </Card>
        );
    };

    // Render payroll summary
    const renderPayrollSummary = () => {
        if (!integrationData || !integrationData.payrolls) {
            return <Empty description="Không có dữ liệu bảng lương" />;
        }

        const columns = [
            {
                title: "Mã bảng lương",
                dataIndex: "payroll_code",
                key: "payroll_code",
                render: (text) => <a>{text}</a>,
            },
            {
                title: "Kỳ lương",
                key: "period",
                render: (_, record) => (
                    <Text>
                        {dayjs(record.period_start).format("DD/MM/YYYY")} -{" "}
                        {dayjs(record.period_end).format("DD/MM/YYYY")}
                    </Text>
                ),
            },
            {
                title: "Số giờ làm việc",
                dataIndex: "total_working_hours",
                key: "total_working_hours",
                render: (hours) => `${hours.toFixed(1)} giờ`,
            },
            {
                title: "Lương gộp",
                dataIndex: "gross_pay",
                key: "gross_pay",
                render: (value) => formatCurrency(value),
            },
            {
                title: "Lương thực lãnh",
                dataIndex: "net_pay",
                key: "net_pay",
                render: (value) => formatCurrency(value),
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                render: (status) => {
                    const statusMap = {
                        draft: {
                            color: "warning",
                            text: "Nháp",
                        },
                        finalized: {
                            color: "success",
                            text: "Đã hoàn thiện",
                        },
                        paid: {
                            color: "green",
                            text: "Đã thanh toán",
                        },
                    };
                    const { color, text } = statusMap[status] || {
                        color: "default",
                        text: status,
                    };
                    return <Tag color={color}>{text}</Tag>;
                },
            },
        ];

        return (
            <Card
                title={
                    <Space>
                        <DollarOutlined />
                        <span>Bảng lương của nhân viên</span>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={integrationData.payrolls}
                    rowKey="id"
                    pagination={false}
                />
            </Card>
        );
    };

    return (
        <div className="payroll-attendance">
            <Card
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>Tích hợp Chấm công - Lương</span>
                    </Space>
                }
            >
                <Form layout="inline" style={{ marginBottom: 24 }}>
                    <Form.Item
                        label="Nhân viên"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn nhân viên",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            style={{ width: 300 }}
                            onChange={handleEmployeeChange}
                            value={selectedEmployee}
                            loading={loading}
                            showSearch
                            optionFilterProp="children"
                        >
                            {Array.isArray(employees)
                                ? employees.map((emp) => (
                                      <Option key={emp.id} value={emp.id}>
                                          {emp.employee_code} - {emp.name} -{" "}
                                          {emp.department?.name ||
                                              "Chưa có phòng ban"}
                                      </Option>
                                  ))
                                : null}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Khoảng thời gian">
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="DD/MM/YYYY"
                            allowClear={false}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={fetchIntegrationData}
                            loading={loading}
                            disabled={!selectedEmployee}
                        >
                            Xem dữ liệu
                        </Button>
                    </Form.Item>
                </Form>

                {!selectedEmployee && (
                    <Alert
                        message="Vui lòng chọn nhân viên để xem dữ liệu"
                        type="info"
                        showIcon
                    />
                )}

                {selectedEmployee && integrationData && (
                    <>
                        <Divider />

                        {renderAttendanceSummary()}

                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Lịch chấm công" key="1">
                                {renderAttendanceCalendar()}
                            </TabPane>
                            <TabPane tab="Biểu đồ tương quan" key="2">
                                {renderCorrelationChart()}
                            </TabPane>
                            <TabPane tab="Bảng lương" key="3">
                                {renderPayrollSummary()}
                            </TabPane>
                        </Tabs>
                    </>
                )}

                {selectedEmployee && !integrationData && !loading && (
                    <Empty description="Không có dữ liệu trong khoảng thời gian này" />
                )}
            </Card>
        </div>
    );
};

export default PayrollAttendancePage;
