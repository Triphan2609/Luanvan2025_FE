import "./ProfilePage.scss";
import { Card, Descriptions, Avatar, Divider, Tag, Button, Space, Tabs, Row, Col } from "antd";
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, TeamOutlined, SafetyOutlined } from "@ant-design/icons";
import EditProfileModal from "./Modals/EditProfileModal";
import { useState } from "react";

const { TabPane } = Tabs;

const employeeData = {
    id: "NV001",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    fullName: "Nguyễn Văn A",
    position: "Quản lý nhà hàng",
    department: "Quản lý",
    email: "nguyenvana@example.com",
    phone: "0987654321",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    joinDate: "15/05/2018",
    status: "active",
    permissions: ["quản lý nhân sự", "quản lý đặt bàn", "xem báo cáo"],
    role: "admin",
};

const statusColors = {
    active: "green",
    inactive: "red",
    on_leave: "orange",
};

export default function ProfilePage() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const handleEditClick = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSave = (values) => {
        // Giả lập lưu dữ liệu
        console.log("Dữ liệu mới:", values);
        setEmployeeData((prev) => ({
            ...prev,
            ...values,
        }));
        setIsModalVisible(false);
    };

    return (
        <div className="profile-page">
            <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                    <Card className="profile-card">
                        <div className="profile-header">
                            <Avatar size={128} src={employeeData.avatar} icon={<UserOutlined />} className="profile-avatar" />
                            <h2 className="profile-name">{employeeData.fullName}</h2>
                            <Tag color={statusColors[employeeData.status]}>
                                {employeeData.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                            </Tag>
                        </div>

                        <Divider />

                        <Descriptions column={1} className="profile-info">
                            <Descriptions.Item label="Chức vụ">
                                <TeamOutlined /> {employeeData.position}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phòng ban">{employeeData.department}</Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <MailOutlined /> {employeeData.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <PhoneOutlined /> {employeeData.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày vào làm">
                                <IdcardOutlined /> {employeeData.joinDate}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Button type="primary" icon={<EditOutlined />} block onClick={handleEditClick}>
                            Chỉnh sửa thông tin
                        </Button>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <Card>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Thông tin chi tiết" key="1">
                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Mã nhân viên">{employeeData.id}</Descriptions.Item>
                                    <Descriptions.Item label="Địa chỉ">{employeeData.address}</Descriptions.Item>
                                    <Descriptions.Item label="Vai trò">
                                        <Tag color="blue">{employeeData.role}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Quyền hạn">
                                        <Space size={[0, 8]} wrap>
                                            {employeeData.permissions.map((permission, index) => (
                                                <Tag key={index} icon={<SafetyOutlined />} color="purple">
                                                    {permission}
                                                </Tag>
                                            ))}
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                            </TabPane>

                            <TabPane tab="Lịch làm việc" key="2">
                                <div className="work-schedule">
                                    <p>Nội dung lịch làm việc sẽ được hiển thị ở đây</p>
                                </div>
                            </TabPane>

                            <TabPane tab="Lịch sử hoạt động" key="3">
                                <div className="activity-history">
                                    <p>Nhật ký hoạt động của nhân viên</p>
                                </div>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>

            <EditProfileModal visible={isModalVisible} onCancel={handleCancel} onSave={handleSave} initialValues={employeeData} />
        </div>
    );
}
