import React, { useState, useEffect } from "react";
import {
    Drawer,
    Descriptions,
    Avatar,
    Tag,
    Tabs,
    Row,
    Col,
    Card,
    Typography,
    Image,
    Divider,
    Button,
    Space,
    Timeline,
    Empty,
    Skeleton,
    Table,
    Badge,
    Calendar,
    Select,
    DatePicker,
    Tooltip,
    message,
} from "antd";
import {
    UserOutlined,
    CalendarOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    IdcardOutlined,
    EditOutlined,
    HistoryOutlined,
    CameraOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CarryOutOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import {
    EMPLOYEE_STATUS_LABELS,
    EMPLOYEE_STATUS_COLORS,
} from "../../../../../constants/employee";
import {
    getEmployeeShifts,
    updateEmployeeShiftStatus,
} from "../../../../../api/employeeShiftsApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Constants
const SCHEDULE_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
};

export default function EmployeeDetail({ open, onClose, employee, onEdit }) {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);

    useEffect(() => {
        if (employee && activeTab === "schedule") {
            fetchEmployeeSchedules();
        }
    }, [employee, activeTab, dateRange]);

    const fetchEmployeeSchedules = async () => {
        if (!employee) return;

        setLoading(true);
        try {
            const startDate = dateRange[0].format("YYYY-MM-DD");
            const endDate = dateRange[1].format("YYYY-MM-DD");

            const filter = {
                employeeId: employee.id,
                startDate,
                endDate,
            };

            const data = await getEmployeeShifts(filter);

            // Format schedules for display
            const formattedSchedules = data.map((schedule) => ({
                id: schedule.id,
                schedule_code: schedule.schedule_code,
                employeeId: schedule.employee?.id,
                employeeName:
                    schedule.employee?.name || schedule.employee?.fullname,
                department:
                    schedule.employee?.department?.name || "Chưa phân loại",
                departmentId: schedule.employee?.department?.id,
                departmentCode:
                    schedule.employee?.department?.code || "unknown",
                roleId: schedule.employee?.role?.id,
                roleName: schedule.employee?.role?.name || "Chưa có chức vụ",
                shiftId: schedule.shift?.id,
                shiftName: schedule.shift?.name,
                shiftTime: `${schedule.shift?.start_time || ""} - ${
                    schedule.shift?.end_time || ""
                }`,
                date: dayjs(schedule.date).format("YYYY-MM-DD"),
                status: schedule.status,
                attendance_status: schedule.attendance_status,
                check_in: schedule.check_in,
                check_out: schedule.check_out,
                note: schedule.note,
            }));

            setSchedules(formattedSchedules);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching employee schedules:", error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateEmployeeShiftStatus(id, newStatus);
            // Cập nhật trạng thái trong state
            setSchedules(
                schedules.map((s) =>
                    s.id === id ? { ...s, status: newStatus } : s
                )
            );
            message.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            message.error("Không thể cập nhật trạng thái");
        }
    };

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRange(dates);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    if (!employee) {
        return null;
    }

    const handleEdit = () => {
        onEdit && onEdit(employee);
        onClose();
    };

    const getStatusTagColor = (status) => {
        switch (status) {
            case SCHEDULE_STATUS.PENDING:
                return "warning";
            case SCHEDULE_STATUS.CONFIRMED:
                return "success";
            case SCHEDULE_STATUS.COMPLETED:
                return "default";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case SCHEDULE_STATUS.PENDING:
                return "Chờ xác nhận";
            case SCHEDULE_STATUS.CONFIRMED:
                return "Đã xác nhận";
            case SCHEDULE_STATUS.COMPLETED:
                return "Đã hoàn thành";
            default:
                return "Không xác định";
        }
    };

    // Group schedules by date for the calendar view
    const getSchedulesByDate = (date) => {
        const dateStr = date.format("YYYY-MM-DD");
        return schedules.filter((s) => s.date === dateStr);
    };

    const dateCellRender = (date) => {
        const listData = getSchedulesByDate(date);
        if (listData.length === 0) return null;

        return (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {listData.map((item) => (
                    <li key={item.id} style={{ marginBottom: 3 }}>
                        <Badge
                            status={
                                item.status === SCHEDULE_STATUS.CONFIRMED
                                    ? "success"
                                    : item.status === SCHEDULE_STATUS.COMPLETED
                                    ? "default"
                                    : "warning"
                            }
                            text={
                                <Tooltip title={`${item.shiftTime}`}>
                                    <span>{item.shiftName}</span>
                                </Tooltip>
                            }
                        />
                    </li>
                ))}
            </ul>
        );
    };

    const scheduleColumns = [
        {
            title: "Mã lịch",
            dataIndex: "schedule_code",
            key: "schedule_code",
            width: 100,
        },
        {
            title: "Ca làm việc",
            dataIndex: "shiftName",
            key: "shiftName",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span>{text}</span>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                        {record.shiftTime}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Ngày",
            dataIndex: "date",
            key: "date",
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            defaultSortOrder: "descend",
            render: (date) => <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            filters: [
                { text: "Chờ xác nhận", value: SCHEDULE_STATUS.PENDING },
                { text: "Đã xác nhận", value: SCHEDULE_STATUS.CONFIRMED },
                { text: "Đã hoàn thành", value: SCHEDULE_STATUS.COMPLETED },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={getStatusTagColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
    ];

    return (
        <Drawer
            title={
                <Space align="center">
                    <IdcardOutlined />
                    <span>Thông tin chi tiết nhân viên</span>
                </Space>
            }
            width={700}
            placement="right"
            onClose={onClose}
            open={open}
            closable={true}
            extra={
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                >
                    Chỉnh sửa
                </Button>
            }
        >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                    style={{
                        position: "relative",
                        display: "inline-block",
                        cursor: employee?.avatar ? "pointer" : "default",
                    }}
                    onClick={() => employee?.avatar && setPreviewVisible(true)}
                >
                    <Avatar
                        size={120}
                        src={employee?.avatar}
                        icon={<UserOutlined />}
                        style={{
                            marginBottom: 8,
                            border: "4px solid #f0f0f0",
                            backgroundColor: !employee?.avatar
                                ? "#1890ff"
                                : undefined,
                            fontSize: "48px",
                        }}
                    >
                        {!employee?.avatar && employee?.name
                            ? employee.name.charAt(0).toUpperCase()
                            : ""}
                    </Avatar>
                    {employee?.avatar && (
                        <div
                            style={{
                                position: "absolute",
                                right: -4,
                                bottom: 4,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CameraOutlined />
                        </div>
                    )}
                </div>

                <Title level={3} style={{ margin: "8px 0" }}>
                    {employee?.name}
                </Title>
                <Space>
                    <Tag color="blue">
                        {employee?.department?.name || "Chưa có phòng ban"}
                    </Tag>
                    <Tag color="purple">
                        {employee?.role?.name || "Chưa có chức vụ"}
                    </Tag>
                    <Tag color={EMPLOYEE_STATUS_COLORS[employee?.status]}>
                        {EMPLOYEE_STATUS_LABELS[employee?.status]}
                    </Tag>
                </Space>
            </div>

            <Divider />

            <Tabs defaultActiveKey="basic" onChange={handleTabChange}>
                <TabPane
                    tab={
                        <>
                            <UserOutlined /> Thông tin cơ bản
                        </>
                    }
                    key="basic"
                >
                    <Row gutter={[24, 24]}>
                        <Col span={12}>
                            <Descriptions column={1} size="small" bordered>
                                <Descriptions.Item
                                    label="Mã nhân viên"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text>{employee?.employee_code}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="Họ và tên"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text strong>{employee?.name}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="Email"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text>{employee?.email}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="Số điện thoại"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text>{employee?.phone}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span={12}>
                            <Descriptions column={1} size="small" bordered>
                                <Descriptions.Item
                                    label="Ngày sinh"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text>
                                        {employee?.birthday
                                            ? new Date(
                                                  employee.birthday
                                              ).toLocaleDateString("vi-VN")
                                            : "Chưa cập nhật"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="Ngày vào làm"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text>
                                        {employee?.join_date
                                            ? new Date(
                                                  employee.join_date
                                              ).toLocaleDateString("vi-VN")
                                            : "Chưa cập nhật"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="Phòng ban"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text>
                                        {employee?.department?.name ||
                                            "Chưa cập nhật"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="Chức vụ"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text>
                                        {employee?.role?.name ||
                                            "Chưa cập nhật"}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                        <Col span={24}>
                            <Descriptions column={1} size="small" bordered>
                                <Descriptions.Item
                                    label="Địa chỉ"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Text>
                                        {employee?.address || "Chưa cập nhật"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="Trạng thái"
                                    labelStyle={{ fontWeight: "bold" }}
                                >
                                    <Tag
                                        color={
                                            EMPLOYEE_STATUS_COLORS[
                                                employee?.status
                                            ]
                                        }
                                    >
                                        {
                                            EMPLOYEE_STATUS_LABELS[
                                                employee?.status
                                            ]
                                        }
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane
                    tab={
                        <>
                            <CalendarOutlined /> Lịch làm việc
                        </>
                    }
                    key="schedule"
                >
                    <Skeleton loading={loading} active>
                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="middle"
                        >
                            <Row>
                                <Col
                                    span={24}
                                    style={{
                                        marginBottom: 16,
                                        textAlign: "right",
                                    }}
                                >
                                    <RangePicker
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                        format="DD/MM/YYYY"
                                    />
                                </Col>
                            </Row>

                            {schedules.length > 0 ? (
                                <>
                                    <Card
                                        title="Lịch làm việc theo tháng"
                                        style={{ marginBottom: 16 }}
                                    >
                                        <Calendar
                                            fullscreen={false}
                                            dateCellRender={dateCellRender}
                                            value={dateRange[0]}
                                        />
                                    </Card>

                                    <Card title="Danh sách ca làm việc">
                                        <Table
                                            columns={scheduleColumns}
                                            dataSource={schedules}
                                            rowKey="id"
                                            size="small"
                                            pagination={{
                                                pageSize: 5,
                                                showSizeChanger: true,
                                                pageSizeOptions: [
                                                    "5",
                                                    "10",
                                                    "20",
                                                ],
                                                showTotal: (total) =>
                                                    `Tổng ${total} lịch làm việc`,
                                            }}
                                            summary={(pageData) => {
                                                if (pageData.length === 0)
                                                    return null;

                                                const statusCounts =
                                                    pageData.reduce(
                                                        (acc, item) => {
                                                            acc[item.status] =
                                                                (acc[
                                                                    item.status
                                                                ] || 0) + 1;
                                                            return acc;
                                                        },
                                                        {}
                                                    );

                                                return (
                                                    <Table.Summary fixed>
                                                        <Table.Summary.Row>
                                                            <Table.Summary.Cell
                                                                index={0}
                                                                colSpan={4}
                                                            >
                                                                <Space
                                                                    split={
                                                                        <Divider type="vertical" />
                                                                    }
                                                                >
                                                                    {Object.entries(
                                                                        statusCounts
                                                                    ).map(
                                                                        ([
                                                                            status,
                                                                            count,
                                                                        ]) => (
                                                                            <Space
                                                                                key={
                                                                                    status
                                                                                }
                                                                            >
                                                                                <Badge
                                                                                    status={getStatusTagColor(
                                                                                        status
                                                                                    )}
                                                                                />
                                                                                <Text type="secondary">
                                                                                    {getStatusText(
                                                                                        status
                                                                                    )}

                                                                                    :{" "}
                                                                                    {
                                                                                        count
                                                                                    }
                                                                                </Text>
                                                                            </Space>
                                                                        )
                                                                    )}
                                                                </Space>
                                                            </Table.Summary.Cell>
                                                        </Table.Summary.Row>
                                                    </Table.Summary>
                                                );
                                            }}
                                        />
                                    </Card>
                                </>
                            ) : (
                                <Empty
                                    description="Chưa có dữ liệu lịch làm việc"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )}
                        </Space>
                    </Skeleton>
                </TabPane>
            </Tabs>

            {/* Image preview */}
            {employee?.avatar && (
                <Image
                    width={0}
                    height={0}
                    style={{ display: "none" }}
                    src={employee.avatar}
                    preview={{
                        visible: previewVisible,
                        onVisibleChange: (visible) =>
                            setPreviewVisible(visible),
                        title: `${employee.name} - ${employee.employee_code}`,
                    }}
                />
            )}
        </Drawer>
    );
}
