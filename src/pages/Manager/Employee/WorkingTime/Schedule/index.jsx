import React, { useState } from "react";
import { Space, Table, Button, Typography, Tag, Row, Col, message, Calendar, Select, Card, Badge } from "antd";
import { PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ScheduleForm from "./ScheduleForm";

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
    const [schedules, setSchedules] = useState([
        {
            id: "LS001",
            employeeId: "NV001",
            employeeName: "Nguyễn Văn A",
            department: "front_desk",
            shiftId: "CA001",
            shiftName: "Ca Sáng",
            date: "2024-04-26",
            status: SCHEDULE_STATUS.CONFIRMED,
        },
        {
            id: "LS002",
            employeeId: "NV002",
            employeeName: "Trần Thị B",
            department: "restaurant",
            shiftId: "CA002",
            shiftName: "Ca Chiều",
            date: "2024-04-26",
            status: SCHEDULE_STATUS.CONFIRMED,
        },
    ]);

    const columns = [
        {
            title: "Nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span>{text}</span>
                    <small style={{ color: "#888" }}>{record.employeeId}</small>
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
                };
                const labels = {
                    front_desk: "Lễ tân",
                    restaurant: "Nhà hàng",
                    housekeeping: "Buồng phòng",
                };
                return <Tag color={colors[dept]}>{labels[dept]}</Tag>;
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
            render: (status) => {
                const configs = {
                    [SCHEDULE_STATUS.PENDING]: { color: "warning", text: "Chờ xác nhận" },
                    [SCHEDULE_STATUS.CONFIRMED]: { color: "success", text: "Đã xác nhận" },
                    [SCHEDULE_STATUS.COMPLETED]: { color: "default", text: "Đã hoàn thành" },
                };
                return <Badge status={configs[status].color} text={configs[status].text} />;
            },
        },
    ];

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleSubmit = (values) => {
        const newSchedule = {
            id: `LS${String(schedules.length + 1).padStart(3, "0")}`,
            ...values,
            status: SCHEDULE_STATUS.PENDING,
        };
        setSchedules([...schedules, newSchedule]);
        message.success("Phân công ca làm việc thành công");
        setIsModalVisible(false);
    };

    const dateCellRender = (date) => {
        const dateStr = date.format("YYYY-MM-DD");
        const listData = schedules.filter((s) => s.date === dateStr);
        return (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {listData.map((item) => (
                    <li key={item.id}>
                        <Badge
                            status={item.status === SCHEDULE_STATUS.CONFIRMED ? "success" : "warning"}
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
                        <Calendar fullscreen={false} onSelect={handleDateSelect} dateCellRender={dateCellRender} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Space direction="vertical" style={{ width: "100%" }} size="middle">
                            <Row justify="space-between" align="middle">
                                <Title level={5} style={{ margin: 0 }}>
                                    Danh sách ca làm việc
                                </Title>
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                                    Phân công
                                </Button>
                            </Row>
                            <Select value={selectedDepartment} onChange={setSelectedDepartment} style={{ width: "100%" }}>
                                <Select.Option value="all">Tất cả bộ phận</Select.Option>
                                <Select.Option value="front_desk">Lễ tân</Select.Option>
                                <Select.Option value="restaurant">Nhà hàng</Select.Option>
                                <Select.Option value="housekeeping">Buồng phòng</Select.Option>
                            </Select>
                            <Table
                                columns={columns}
                                dataSource={schedules.filter((s) => selectedDepartment === "all" || s.department === selectedDepartment)}
                                rowKey="id"
                                size="small"
                                pagination={false}
                                scroll={{ y: 400 }}
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
