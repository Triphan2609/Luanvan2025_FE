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
    PlusCircleOutlined,
    MinusCircleOutlined,
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

        // Create a map for shifts by date
        const shiftsMap = {};
        if (integrationData.employeeShifts) {
            integrationData.employeeShifts.forEach((shift) => {
                const date = dayjs(shift.date).format("YYYY-MM-DD");
                if (!shiftsMap[date]) {
                    shiftsMap[date] = [];
                }
                shiftsMap[date].push(shift);
            });
        }

        const dateCellRender = (value) => {
            const dateStr = value.format("YYYY-MM-DD");
            const attendance = attendanceMap[dateStr];
            const shifts = shiftsMap[dateStr] || [];

            if (!attendance && shifts.length === 0) {
                return null;
            }

            return (
                <Tooltip
                    title={
                        <>
                            {attendance && (
                                <>
                                    <div>
                                        <strong>Trạng thái:</strong>{" "}
                                        {attendance.status === "approved"
                                            ? "Có mặt"
                                            : attendance.status === "rejected"
                                            ? "Vắng mặt"
                                            : attendance.status === "pending"
                                            ? "Chưa xác định"
                                            : attendance.status}
                                    </div>
                                    {attendance.check_in && (
                                        <div>
                                            <strong>Giờ vào:</strong>{" "}
                                            {attendance.check_in}
                                        </div>
                                    )}
                                    {attendance.check_out && (
                                        <div>
                                            <strong>Giờ ra:</strong>{" "}
                                            {attendance.check_out}
                                        </div>
                                    )}
                                    {attendance.working_hours && (
                                        <div>
                                            <strong>Số giờ làm:</strong>{" "}
                                            {attendance.working_hours.toFixed(
                                                1
                                            )}{" "}
                                            giờ
                                        </div>
                                    )}
                                </>
                            )}

                            {shifts.length > 0 && (
                                <>
                                    <Divider style={{ margin: "5px 0" }} />
                                    <div>
                                        <strong>Ca làm việc:</strong>
                                    </div>
                                    {shifts.map((shift, index) => (
                                        <div key={index}>
                                            {shift.shift?.name} (
                                            {shift.shift?.start_time} -{" "}
                                            {shift.shift?.end_time})
                                            <Tag
                                                color={
                                                    shift.status === "completed"
                                                        ? "success"
                                                        : shift.status ===
                                                          "missed"
                                                        ? "error"
                                                        : shift.status ===
                                                          "pending"
                                                        ? "warning"
                                                        : "default"
                                                }
                                                style={{ marginLeft: 5 }}
                                            >
                                                {shift.status === "completed"
                                                    ? "Hoàn thành"
                                                    : shift.status === "missed"
                                                    ? "Vắng mặt"
                                                    : shift.status === "pending"
                                                    ? "Chờ xác nhận"
                                                    : shift.status}
                                            </Tag>
                                        </div>
                                    ))}
                                </>
                            )}
                        </>
                    }
                >
                    <div>
                        {attendance && (
                            <Badge
                                status={getAttendanceStatusColor(
                                    attendance.status
                                )}
                                text={
                                    attendance.working_hours
                                        ? `${attendance.working_hours.toFixed(
                                              1
                                          )} giờ`
                                        : ""
                                }
                            />
                        )}
                        {shifts.length > 0 && !attendance && (
                            <Badge
                                status="warning"
                                text={`${shifts.length} ca làm việc`}
                            />
                        )}
                    </div>
                </Tooltip>
            );
        };

        return (
            <div className="attendance-calendar">
                <Calendar
                    fullscreen={false}
                    dateCellRender={dateCellRender}
                    headerRender={({ value, onChange }) => {
                        const start = dayjs(dateRange[0]);
                        const end = dayjs(dateRange[1]);
                        return (
                            <div style={{ padding: "8px 0" }}>
                                <Typography.Title level={4}>
                                    Lịch làm việc từ{" "}
                                    {start.format("DD/MM/YYYY")} đến{" "}
                                    {end.format("DD/MM/YYYY")}
                                </Typography.Title>
                            </div>
                        );
                    }}
                    disabledDate={(current) => {
                        // Only show dates within the selected range
                        return (
                            current < dayjs(dateRange[0]).startOf("day") ||
                            current > dayjs(dateRange[1]).endOf("day")
                        );
                    }}
                />
            </div>
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

        // Format daily data for the chart
        const chartData = [];

        integrationData.dailyData.forEach((item) => {
            // Add working hours data point
            chartData.push({
                date: dayjs(item.date).format("DD/MM"),
                value: item.working_hours || 0,
                category: "Giờ làm việc",
            });

            // Add salary data point
            chartData.push({
                date: dayjs(item.date).format("DD/MM"),
                value: item.daily_pay || 0,
                category: "Lương ngày",
            });
        });

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
                    tooltip={{
                        formatter: (datum) => {
                            if (datum.category === "Lương ngày") {
                                return {
                                    name: datum.category,
                                    value: formatCurrency(datum.value),
                                };
                            }
                            return {
                                name: datum.category,
                                value: `${datum.value.toFixed(1)} giờ`,
                            };
                        },
                    }}
                    color={["#2196F3", "#FF9800"]}
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
                        <span>Tổng hợp chấm công và ca làm việc</span>
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
                            title="Tổng ca lịch trình"
                            value={summary.totalScheduledShifts || 0}
                            prefix={<CalendarOutlined />}
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
                    <Col span={8}>
                        <Card title="Điểm danh" size="small">
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Statistic
                                        title="Có mặt"
                                        value={summary.presentCount || 0}
                                        valueStyle={{ color: "#52c41a" }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Đi muộn"
                                        value={summary.lateCount || 0}
                                        valueStyle={{ color: "#faad14" }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Về sớm"
                                        value={summary.earlyLeaveCount || 0}
                                        valueStyle={{ color: "#faad14" }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Vắng mặt"
                                        value={summary.absentCount || 0}
                                        valueStyle={{ color: "#f5222d" }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Nghỉ phép"
                                        value={summary.onLeaveCount || 0}
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Chờ duyệt"
                                        value={summary.pendingCount || 0}
                                        valueStyle={{ color: "#bfbfbf" }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Ca làm việc" size="small">
                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <Statistic
                                        title="Đã hoàn thành"
                                        value={summary.completedShifts || 0}
                                        valueStyle={{ color: "#52c41a" }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Vắng mặt"
                                        value={summary.missedShifts || 0}
                                        valueStyle={{ color: "#f5222d" }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title="Tỷ lệ hoàn thành"
                                        value={
                                            summary.totalScheduledShifts
                                                ? Math.round(
                                                      (summary.completedShifts /
                                                          summary.totalScheduledShifts) *
                                                          100
                                                  )
                                                : 0
                                        }
                                        suffix="%"
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title="Thời gian & Lương" size="small">
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic
                                        title="Giờ TB/ngày"
                                        value={
                                            summary.averageHoursPerDay?.toFixed(
                                                1
                                            ) || 0
                                        }
                                        suffix="giờ/ngày"
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Lương TB/giờ"
                                        value={
                                            summary.totalWorkingHours &&
                                            summary.estimatedSalary
                                                ? Math.round(
                                                      summary.estimatedSalary /
                                                          summary.totalWorkingHours
                                                  )
                                                : 0
                                        }
                                        valueStyle={{ color: "#3f8600" }}
                                        formatter={(value) => (
                                            <span>
                                                {formatCurrency(value)}/giờ
                                            </span>
                                        )}
                                    />
                                </Col>
                            </Row>
                        </Card>
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
                render: (hours) => `${hours?.toFixed(1) || 0} giờ`,
            },
            {
                title: "Giờ tăng ca",
                dataIndex: "overtime_hours",
                key: "overtime_hours",
                render: (hours, record) => (
                    <Space direction="vertical" size={0}>
                        <span className="overtime-value">
                            {hours ? hours.toFixed(1) + " giờ" : "0 giờ"}
                        </span>
                        {hours > 0 && (
                            <Tag color="orange" style={{ marginTop: 3 }}>
                                x
                                {record.overtime_multiplier?.toFixed(2) ||
                                    "1.50"}
                            </Tag>
                        )}
                    </Space>
                ),
            },
            {
                title: "Giờ ca đêm",
                dataIndex: "night_shift_hours",
                key: "night_shift_hours",
                render: (hours, record) => (
                    <Space direction="vertical" size={0}>
                        <span className="night-shift-value">
                            {hours ? hours.toFixed(1) + " giờ" : "0 giờ"}
                        </span>
                        {hours > 0 && (
                            <Tag color="blue" style={{ marginTop: 3 }}>
                                x
                                {record.night_shift_multiplier?.toFixed(2) ||
                                    "1.30"}
                            </Tag>
                        )}
                    </Space>
                ),
            },
            {
                title: (
                    <span>
                        <PlusCircleOutlined style={{ color: "#52c41a" }} />{" "}
                        Lương gộp
                    </span>
                ),
                dataIndex: "gross_pay",
                key: "gross_pay",
                render: (value) => (
                    <span className="allowance-value">
                        {formatCurrency(value)}
                    </span>
                ),
            },
            {
                title: <span>Lương thực lãnh</span>,
                dataIndex: "net_pay",
                key: "net_pay",
                render: (value) => (
                    <Text strong style={{ color: "#3f8600" }}>
                        {formatCurrency(value)}
                    </Text>
                ),
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

    // Create a new method to render a table of scheduled shifts
    const renderEmployeeShifts = () => {
        if (
            !integrationData ||
            !integrationData.employeeShifts ||
            integrationData.employeeShifts.length === 0
        ) {
            return <Empty description="Không có dữ liệu ca làm việc" />;
        }

        const columns = [
            {
                title: "Ngày",
                dataIndex: "date",
                key: "date",
                render: (date) => dayjs(date).format("DD/MM/YYYY"),
            },
            {
                title: "Mã lịch",
                dataIndex: "schedule_code",
                key: "schedule_code",
            },
            {
                title: "Ca làm việc",
                key: "shift",
                render: (_, record) => (
                    <span>{record.shift?.name || "N/A"}</span>
                ),
            },
            {
                title: "Thời gian",
                key: "time",
                render: (_, record) => (
                    <span>
                        {record.shift?.start_time} - {record.shift?.end_time}
                    </span>
                ),
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                render: (status) => {
                    let color = "default";
                    let text = status;

                    if (status === "pending") {
                        color = "warning";
                        text = "Chờ xác nhận";
                    } else if (status === "completed") {
                        color = "success";
                        text = "Hoàn thành";
                    } else if (status === "missed") {
                        color = "error";
                        text = "Vắng mặt";
                    }

                    return <Tag color={color}>{text}</Tag>;
                },
            },
            {
                title: "Điểm danh",
                key: "attendance",
                render: (_, record) => {
                    // Find matching attendance for this shift
                    const attendance = integrationData.attendances.find(
                        (att) =>
                            dayjs(att.date).format("YYYY-MM-DD") ===
                            dayjs(record.date).format("YYYY-MM-DD")
                    );

                    if (!attendance) {
                        return <Tag color="default">Chưa điểm danh</Tag>;
                    }

                    let color = "default";
                    let text = attendance.status;

                    if (attendance.status === "approved") {
                        color = "success";
                        text = "Có mặt";
                    } else if (attendance.status === "rejected") {
                        color = "error";
                        text = "Vắng mặt";
                    } else if (attendance.status === "pending") {
                        color = "warning";
                        text = "Chờ xác nhận";
                    }

                    return <Tag color={color}>{text}</Tag>;
                },
            },
            {
                title: "Giờ làm việc",
                key: "working_hours",
                render: (_, record) => {
                    // Find matching attendance for this shift
                    const attendance = integrationData.attendances.find(
                        (att) =>
                            dayjs(att.date).format("YYYY-MM-DD") ===
                            dayjs(record.date).format("YYYY-MM-DD")
                    );

                    if (!attendance || !attendance.working_hours) {
                        return "-";
                    }

                    return `${attendance.working_hours.toFixed(1)} giờ`;
                },
            },
        ];

        return (
            <Card
                title={
                    <Space>
                        <CalendarOutlined />
                        <span>Lịch trình ca làm việc</span>
                    </Space>
                }
                style={{ marginBottom: 24 }}
            >
                <Table
                    columns={columns}
                    dataSource={integrationData.employeeShifts}
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
                            <TabPane tab="Ca làm việc" key="2">
                                {renderEmployeeShifts()}
                            </TabPane>
                            <TabPane tab="Biểu đồ tương quan" key="3">
                                {renderCorrelationChart()}
                            </TabPane>
                            <TabPane tab="Bảng lương" key="4">
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
