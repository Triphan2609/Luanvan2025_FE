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
} from "@ant-design/icons";
import {
    EMPLOYEE_STATUS_LABELS,
    EMPLOYEE_STATUS_COLORS,
} from "../../../../../constants/employee";
import { getWorkHistory } from "../../../../../api/employeesApi";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function EmployeeDetail({ open, onClose, employee, onEdit }) {
    const [previewVisible, setPreviewVisible] = useState(false);
    const [workHistory, setWorkHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");

    useEffect(() => {
        if (employee && activeTab === "history") {
            fetchWorkHistory();
        }
    }, [employee, activeTab]);

    const fetchWorkHistory = async () => {
        if (!employee) return;

        setLoading(true);
        try {
            // If the API is implemented, use this:
            // const history = await getWorkHistory(employee.id);
            // setWorkHistory(history);

            // For demo purposes, let's use mock data:
            setTimeout(() => {
                const mockHistory = [
                    {
                        id: 1,
                        date: new Date(2023, 0, 15),
                        event: "Bắt đầu làm việc",
                        description: "Nhân viên bắt đầu làm việc tại công ty",
                        type: "join",
                    },
                    {
                        id: 2,
                        date: new Date(2023, 3, 10),
                        event: "Thay đổi chức vụ",
                        description: "Từ Nhân viên thành Trưởng nhóm",
                        type: "promotion",
                    },
                    {
                        id: 3,
                        date: new Date(2023, 6, 5),
                        event: "Chuyển phòng ban",
                        description: "Từ Phòng Kinh doanh sang Phòng Marketing",
                        type: "transfer",
                    },
                    {
                        id: 4,
                        date: new Date(2023, 11, 20),
                        event: "Thưởng thành tích",
                        description:
                            "Hoàn thành xuất sắc dự án khách hàng quan trọng",
                        type: "achievement",
                    },
                ];
                setWorkHistory(mockHistory);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error("Error fetching work history:", error);
            setLoading(false);
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

    const getTimelineItemColor = (type) => {
        const colors = {
            join: "green",
            promotion: "blue",
            transfer: "orange",
            achievement: "purple",
            leave: "red",
            default: "gray",
        };
        return colors[type] || colors.default;
    };

    const getTimelineItemIcon = (type) => {
        const icons = {
            join: <CarryOutOutlined />,
            promotion: <CheckCircleOutlined />,
            transfer: <TeamOutlined />,
            achievement: <ClockCircleOutlined />,
            leave: <UserOutlined />,
            default: <HistoryOutlined />,
        };
        return icons[type] || icons.default;
    };

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
                            <HistoryOutlined /> Lịch sử làm việc
                        </>
                    }
                    key="history"
                >
                    <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
                        {workHistory.length > 0 ? (
                            <Card>
                                <Timeline mode="left">
                                    {workHistory.map((item) => (
                                        <Timeline.Item
                                            key={item.id}
                                            color={getTimelineItemColor(
                                                item.type
                                            )}
                                            dot={getTimelineItemIcon(item.type)}
                                            label={new Date(
                                                item.date
                                            ).toLocaleDateString("vi-VN")}
                                        >
                                            <div>
                                                <Text strong>{item.event}</Text>
                                                <div>
                                                    <Text type="secondary">
                                                        {item.description}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </Card>
                        ) : (
                            <Empty
                                description="Chưa có dữ liệu lịch sử làm việc"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
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
