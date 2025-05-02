import React, { useState, useEffect } from "react";
import {
    Space,
    Table,
    Button,
    Typography,
    Tag,
    Row,
    Col,
    message,
    Calendar,
    Select,
    Card,
    Badge,
} from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ScheduleForm from "./ScheduleForm";
import {
    getEmployeeShifts,
    createEmployeeShift,
    updateEmployeeShiftStatus,
} from "../../../../../api/employeeShiftsApi";

const { Title } = Typography;

// Constants
const SCHEDULE_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
};

export default function Schedule() {
    // States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load schedules on component mount
    useEffect(() => {
        fetchSchedules();
    }, []);

    // Load schedules when department filter changes
    useEffect(() => {
        fetchSchedules();
    }, [selectedDepartment]);

    const fetchSchedules = async () => {
        try {
            setLoading(true);

            // Lấy ngày hiện tại và ngày cuối tháng
            const today = dayjs();
            const startOfMonth = today.startOf("month").format("YYYY-MM-DD");
            const endOfMonth = today.endOf("month").format("YYYY-MM-DD");

            // Xây dựng filter
            const filter = {
                startDate: startOfMonth,
                endDate: endOfMonth,
            };

            // Thêm filter theo phòng ban
            if (selectedDepartment !== "all") {
                // Giả sử các phòng ban có ID tương ứng, bạn cần thay đổi dựa trên dữ liệu thực tế
                const departmentMap = {
                    front_desk: 1,
                    restaurant: 2,
                    housekeeping: 3,
                };
                filter.department_id = departmentMap[selectedDepartment];
            }

            const data = await getEmployeeShifts(filter);

            // Chuyển đổi dữ liệu từ backend sang định dạng frontend
            const formattedSchedules = data.map((schedule) => ({
                id: schedule.id,
                schedule_code: schedule.schedule_code,
                employeeId: schedule.employee_id,
                employeeName: schedule.employee.fullname,
                department: schedule.employee.department?.code || "unknown",
                departmentId: schedule.employee.department_id,
                shiftId: schedule.shift_id,
                shiftName: schedule.shift.name,
                date: dayjs(schedule.date).format("YYYY-MM-DD"),
                status: schedule.status,
                attendance_status: schedule.attendance_status,
                check_in: schedule.check_in,
                check_out: schedule.check_out,
                note: schedule.note,
            }));

            setSchedules(formattedSchedules);
        } catch (error) {
            console.error("Lỗi khi tải lịch làm việc:", error);
            message.error("Không thể tải danh sách lịch làm việc");
        } finally {
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

    const columns = [
        {
            title: "Nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span>{text}</span>
                    <small style={{ color: "#888" }}>
                        {record.schedule_code}
                    </small>
                </Space>
            ),
        },
        {
            title: "Bộ phận",
            dataIndex: "department",
            key: "department",
            render: (dept) => {
                const colors = {
                    front_desk: "green",
                    restaurant: "purple",
                    housekeeping: "orange",
                    unknown: "gray",
                };
                const labels = {
                    front_desk: "Lễ tân",
                    restaurant: "Nhà hàng",
                    housekeeping: "Buồng phòng",
                    unknown: "Chưa phân loại",
                };
                return (
                    <Tag color={colors[dept] || "gray"}>
                        {labels[dept] || dept}
                    </Tag>
                );
            },
        },
        {
            title: "Ca làm việc",
            dataIndex: "shiftName",
            key: "shiftName",
        },
        {
            title: "Ngày",
            dataIndex: "date",
            key: "date",
            render: (date) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status, record) => {
                const configs = {
                    [SCHEDULE_STATUS.PENDING]: {
                        color: "warning",
                        text: "Chờ xác nhận",
                    },
                    [SCHEDULE_STATUS.CONFIRMED]: {
                        color: "success",
                        text: "Đã xác nhận",
                    },
                    [SCHEDULE_STATUS.COMPLETED]: {
                        color: "default",
                        text: "Đã hoàn thành",
                    },
                };
                return (
                    <Select
                        defaultValue={status}
                        size="small"
                        style={{ width: 120 }}
                        onChange={(value) =>
                            handleStatusChange(record.id, value)
                        }
                    >
                        <Select.Option value={SCHEDULE_STATUS.PENDING}>
                            <Badge status="warning" text="Chờ xác nhận" />
                        </Select.Option>
                        <Select.Option value={SCHEDULE_STATUS.CONFIRMED}>
                            <Badge status="success" text="Đã xác nhận" />
                        </Select.Option>
                        <Select.Option value={SCHEDULE_STATUS.COMPLETED}>
                            <Badge status="default" text="Đã hoàn thành" />
                        </Select.Option>
                    </Select>
                );
            },
        },
    ];

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleSubmit = async (values) => {
        try {
            // Chuyển đổi dữ liệu từ frontend sang định dạng backend
            const scheduleData = {
                employee_id: values.employeeId,
                shift_id: values.shiftId,
                date: values.date,
                status: SCHEDULE_STATUS.PENDING,
            };

            // Gọi API để tạo lịch làm việc mới
            const response = await createEmployeeShift(scheduleData);

            // Tải lại danh sách lịch làm việc sau khi tạo thành công
            fetchSchedules();

            message.success("Phân công ca làm việc thành công");
            setIsModalVisible(false);
        } catch (error) {
            console.error("Lỗi khi tạo lịch làm việc:", error);
            message.error("Không thể phân công ca làm việc");
        }
    };

    const dateCellRender = (date) => {
        const dateStr = date.format("YYYY-MM-DD");
        const listData = schedules.filter((s) => s.date === dateStr);
        return (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {listData.map((item) => (
                    <li key={item.id}>
                        <Badge
                            status={
                                item.status === SCHEDULE_STATUS.CONFIRMED
                                    ? "success"
                                    : item.status === SCHEDULE_STATUS.COMPLETED
                                    ? "default"
                                    : "warning"
                            }
                            text={`${item.shiftName} - ${item.employeeName}`}
                        />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Row gutter={16}>
                <Col span={16}>
                    <Card>
                        <Calendar
                            fullscreen={false}
                            onSelect={handleDateSelect}
                            dateCellRender={dateCellRender}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="middle"
                        >
                            <Row justify="space-between" align="middle">
                                <Title level={5} style={{ margin: 0 }}>
                                    Danh sách ca làm việc
                                </Title>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsModalVisible(true)}
                                >
                                    Phân công
                                </Button>
                            </Row>
                            <Select
                                value={selectedDepartment}
                                onChange={setSelectedDepartment}
                                style={{ width: "100%" }}
                            >
                                <Select.Option value="all">
                                    Tất cả bộ phận
                                </Select.Option>
                                <Select.Option value="front_desk">
                                    Lễ tân
                                </Select.Option>
                                <Select.Option value="restaurant">
                                    Nhà hàng
                                </Select.Option>
                                <Select.Option value="housekeeping">
                                    Buồng phòng
                                </Select.Option>
                            </Select>
                            <Table
                                columns={columns}
                                dataSource={schedules}
                                rowKey="id"
                                size="small"
                                pagination={false}
                                scroll={{ y: 400 }}
                                loading={loading}
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>

            <ScheduleForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                selectedDate={selectedDate}
            />
        </Space>
    );
}
