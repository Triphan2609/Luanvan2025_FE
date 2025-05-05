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
    message,
} from "antd";
import {
    SearchOutlined,
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getEmployees } from "../../../../api/employeesApi";
import { getAttendanceIntegration } from "../../../../api/salaryApi";
import { getBranches } from "../../../../api/branchesApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const PayrollAttendancePage = () => {
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);
    const [integrationData, setIntegrationData] = useState(null);

    // Fetch initial employees and branches data
    useEffect(() => {
        fetchEmployees();
        fetchBranches();
    }, []);

    // Fetch data when employee or date range changes
    useEffect(() => {
        if (selectedEmployee) {
            fetchIntegrationData();
        }
    }, [selectedEmployee, dateRange]);

    const fetchBranches = async () => {
        try {
            const response = await getBranches();
            setBranches(response || []);
        } catch (error) {
            console.error("Error fetching branches:", error);
            setBranches([]);
        }
    };

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
        if (!selectedBranch) {
            message.warning("Vui lòng chọn chi nhánh trước");
            return;
        }

        if (!selectedEmployee) {
            message.warning("Vui lòng chọn nhân viên");
            return;
        }

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

    const handleBranchChange = (value) => {
        setSelectedBranch(value);

        // Reset selected employee và dữ liệu khi thay đổi chi nhánh
        if (selectedEmployee) {
            setSelectedEmployee(null);
            setIntegrationData(null);
        }
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

    // Filter employees by branch
    const getFilteredEmployees = () => {
        if (!selectedBranch) return employees;
        return employees.filter(
            (emp) => emp.branch && emp.branch.id === selectedBranch
        );
    };

    // Get branch name by ID
    const getBranchName = (branchId) => {
        const branch = branches.find((b) => b.id === branchId);
        return branch ? branch.name : "N/A";
    };

    // Render attendance summary
    const renderAttendanceSummary = () => {
        if (!integrationData || !integrationData.summary) {
            return null;
        }

        const { summary, dailyData } = integrationData;

        // Tính tổng lương ước tính từ dailyData nếu summary.estimatedSalary = 0
        const calculatedEstimatedSalary =
            summary.estimatedSalary > 0
                ? summary.estimatedSalary
                : dailyData && dailyData.length > 0
                ? dailyData.reduce(
                      (total, item) => total + (item.daily_pay || 0),
                      0
                  )
                : 0;

        // Tính lương trung bình theo giờ
        const calculatedHourlyRate =
            summary.totalWorkingHours > 0
                ? calculatedEstimatedSalary / summary.totalWorkingHours
                : 0;

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
                            value={formatCurrency(calculatedEstimatedSalary)}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Col>
                </Row>

                {/* Thêm thông tin chi nhánh nếu có */}
                {integrationData.employee &&
                    integrationData.employee.branch && (
                        <Row style={{ marginTop: 16 }}>
                            <Col span={24}>
                                <Alert
                                    message={
                                        <Space>
                                            <BankOutlined />
                                            <span>
                                                <strong>Chi nhánh:</strong>{" "}
                                                {
                                                    integrationData.employee
                                                        .branch.name
                                                }
                                                {integrationData.employee.branch
                                                    .type &&
                                                    ` (${
                                                        integrationData.employee
                                                            .branch.type ===
                                                        "hotel"
                                                            ? "Khách sạn"
                                                            : integrationData
                                                                  .employee
                                                                  .branch
                                                                  .type ===
                                                              "restaurant"
                                                            ? "Nhà hàng"
                                                            : integrationData
                                                                  .employee
                                                                  .branch.type
                                                    })`}
                                            </span>
                                        </Space>
                                    }
                                    type="info"
                                    showIcon={false}
                                />
                            </Col>
                        </Row>
                    )}

                <Divider style={{ margin: "24px 0" }} />

                {/* Render các thống kê khác như cũ */}
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
                                            summary.totalWorkingDays &&
                                            summary.totalWorkingHours
                                                ? summary.totalWorkingHours /
                                                  summary.totalWorkingDays
                                                : 0
                                        }
                                        formatter={(value) => (
                                            <span>
                                                {value.toFixed(1)} giờ/ngày
                                            </span>
                                        )}
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Lương TB/giờ"
                                        value={calculatedHourlyRate}
                                        valueStyle={{ color: "#3f8600" }}
                                        formatter={(value) => (
                                            <span>
                                                {value > 0
                                                    ? formatCurrency(value)
                                                    : "0 đ"}
                                                /giờ
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
                                    {attendance.working_hours !== undefined && (
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
                                    attendance.working_hours !== undefined
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
                title: "Chi nhánh",
                key: "branch",
                render: (_, record) => {
                    const branchName = record.branch
                        ? record.branch.name
                        : record.employee && record.employee.branch
                        ? record.employee.branch.name
                        : "N/A";

                    const branchType = record.branch
                        ? record.branch.type
                        : record.employee && record.employee.branch
                        ? record.employee.branch.type
                        : null;

                    return (
                        <span>
                            {branchName}
                            {branchType && (
                                <Tag
                                    color={
                                        branchType === "hotel"
                                            ? "blue"
                                            : branchType === "restaurant"
                                            ? "orange"
                                            : "default"
                                    }
                                    style={{ marginLeft: 5 }}
                                >
                                    {branchType === "hotel"
                                        ? "Khách sạn"
                                        : branchType === "restaurant"
                                        ? "Nhà hàng"
                                        : branchType}
                                </Tag>
                            )}
                        </span>
                    );
                },
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

        // Lấy thông tin chi nhánh nếu có
        const employeeBranch =
            integrationData.employee && integrationData.employee.branch
                ? integrationData.employee.branch
                : null;

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
            // Thêm thông tin chi nhánh nếu cần
            {
                title: "Chi nhánh",
                key: "branch",
                render: (_, record) => {
                    // Ưu tiên lấy branch từ record trước, nếu không có thì lấy từ employee
                    const branch = record.branch || employeeBranch;

                    if (!branch) return "N/A";

                    return (
                        <Space>
                            <span>{branch.name}</span>
                            {branch.type && (
                                <Tag
                                    color={
                                        branch.type === "hotel"
                                            ? "blue"
                                            : branch.type === "restaurant"
                                            ? "orange"
                                            : "default"
                                    }
                                >
                                    {branch.type === "hotel"
                                        ? "Khách sạn"
                                        : branch.type === "restaurant"
                                        ? "Nhà hàng"
                                        : branch.type}
                                </Tag>
                            )}
                        </Space>
                    );
                },
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

                    if (!attendance || attendance.working_hours === undefined) {
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
                        {employeeBranch && (
                            <Tag
                                color={
                                    employeeBranch.type === "hotel"
                                        ? "blue"
                                        : employeeBranch.type === "restaurant"
                                        ? "orange"
                                        : "default"
                                }
                            >
                                {employeeBranch.name || "Chi nhánh"}
                            </Tag>
                        )}
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
                    {/* Thêm filter chi nhánh */}
                    <Form.Item
                        label="Chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chi nhánh trước",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn chi nhánh trước"
                            style={{ width: 200 }}
                            onChange={handleBranchChange}
                            value={selectedBranch}
                            allowClear
                        >
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                    {branch.type &&
                                        ` (${
                                            branch.type === "hotel"
                                                ? "Khách sạn"
                                                : branch.type === "restaurant"
                                                ? "Nhà hàng"
                                                : branch.type
                                        })`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

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
                            placeholder={
                                selectedBranch
                                    ? "Chọn nhân viên"
                                    : "Vui lòng chọn chi nhánh trước"
                            }
                            style={{ width: 300 }}
                            onChange={handleEmployeeChange}
                            value={selectedEmployee}
                            loading={loading}
                            showSearch
                            optionFilterProp="children"
                            disabled={!selectedBranch}
                        >
                            {getFilteredEmployees().map((emp) => (
                                <Option key={emp.id} value={emp.id}>
                                    {emp.employee_code} - {emp.name} -{" "}
                                    {emp.department?.name ||
                                        "Chưa có phòng ban"}
                                    {emp.branch && ` (${emp.branch.name})`}
                                </Option>
                            ))}
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

                {!selectedBranch && (
                    <Alert
                        message="Vui lòng chọn chi nhánh để tiếp tục"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {selectedBranch && !selectedEmployee && (
                    <Alert
                        message="Vui lòng chọn nhân viên để xem dữ liệu"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
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
