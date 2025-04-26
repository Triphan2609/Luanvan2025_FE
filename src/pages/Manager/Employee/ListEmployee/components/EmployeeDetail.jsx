import React from "react";
import { Drawer, Descriptions, Tag, Space, Button, Row, Col, Card, Avatar, Typography, Table, Badge, Tabs } from "antd";
import { UserOutlined, PhoneOutlined, MailOutlined, CalendarOutlined, HomeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const EmployeeDetail = ({ open, onClose, employee, DEPARTMENT, EMPLOYEE_ROLE, EMPLOYEE_STATUS, onChangePassword }) => {
    if (!employee) return null;

    // Sample shift data
    const shifts = [
        {
            date: "2024-04-26",
            shift: "Sáng",
            timeIn: "07:55",
            timeOut: "14:05",
            status: "normal", // late, early, absent
        },
        {
            date: "2024-04-25",
            shift: "Chiều",
            timeIn: "14:10",
            timeOut: "22:00",
            status: "late",
        },
    ];

    const shiftColumns = [
        {
            title: "Ngày",
            dataIndex: "date",
            key: "date",
            render: (date) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Ca",
            dataIndex: "shift",
            key: "shift",
        },
        {
            title: "Giờ vào",
            dataIndex: "timeIn",
            key: "timeIn",
        },
        {
            title: "Giờ ra",
            dataIndex: "timeOut",
            key: "timeOut",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const configs = {
                    normal: { color: "success", text: "Bình thường" },
                    late: { color: "warning", text: "Đi muộn" },
                    early: { color: "error", text: "Về sớm" },
                    absent: { color: "default", text: "Vắng mặt" },
                };
                return <Badge status={configs[status].color} text={configs[status].text} />;
            },
        },
    ];

    return (
        <Drawer
            title="Thông tin nhân viên"
            placement="right"
            onClose={onClose}
            open={open}
            width={800}
            extra={
                <Space>
                    <Button onClick={() => onChangePassword(employee)}>Đổi mật khẩu</Button>
                    <Button onClick={onClose}>Đóng</Button>
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Thông tin cơ bản */}
                <Card>
                    <Row gutter={16}>
                        <Col span={8} style={{ textAlign: "center" }}>
                            <Space direction="vertical" align="center">
                                <Avatar size={120} src={employee.avatar} icon={<UserOutlined />} />
                                <Title level={4}>{employee.name}</Title>
                                <Tag
                                    color={
                                        employee.role === EMPLOYEE_ROLE.ADMIN
                                            ? "red"
                                            : employee.role === EMPLOYEE_ROLE.MANAGER
                                            ? "purple"
                                            : employee.role === EMPLOYEE_ROLE.RECEPTIONIST
                                            ? "blue"
                                            : "default"
                                    }
                                >
                                    {employee.role === EMPLOYEE_ROLE.ADMIN
                                        ? "Quản trị"
                                        : employee.role === EMPLOYEE_ROLE.MANAGER
                                        ? "Quản lý"
                                        : employee.role === EMPLOYEE_ROLE.RECEPTIONIST
                                        ? "Lễ tân"
                                        : "Nhân viên"}
                                </Tag>
                            </Space>
                        </Col>
                        <Col span={16}>
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="Mã nhân viên">{employee.id}</Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <PhoneOutlined /> Số điện thoại
                                        </Space>
                                    }
                                >
                                    {employee.phone}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <MailOutlined /> Email
                                        </Space>
                                    }
                                >
                                    {employee.email}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <HomeOutlined /> Địa chỉ
                                        </Space>
                                    }
                                >
                                    {employee.address || "Chưa cập nhật"}
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label={
                                        <Space>
                                            <CalendarOutlined /> Ngày vào làm
                                        </Space>
                                    }
                                >
                                    {dayjs(employee.joinDate).format("DD/MM/YYYY")}
                                </Descriptions.Item>
                            </Descriptions>
                        </Col>
                    </Row>
                </Card>

                {/* Ca làm việc */}
                <Card title="Lịch sử ca làm việc">
                    <Table
                        columns={shiftColumns}
                        dataSource={shifts}
                        rowKey={(record) => `${record.date}-${record.shift}`}
                        pagination={{ pageSize: 5 }}
                    />
                </Card>
            </Space>
        </Drawer>
    );
};

export default EmployeeDetail;
