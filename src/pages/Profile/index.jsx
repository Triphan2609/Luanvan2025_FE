import { Card, Descriptions, Avatar, Tag, Button, Tabs, Row, Col, List } from "antd";
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { useState } from "react";
import EditProfileModal from "./Modals/EditProfileModal";

const { TabPane } = Tabs;

// Simplified employee data
const employeeData = {
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    fullName: "Nguyễn Văn A",
    position: "Quản lý nhà hàng",
    email: "nguyenvana@example.com",
    phone: "0987654321",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    joinDate: "15/05/2018",
    status: "active",
    permissions: ["Quản lý nhân viên", "Quản lý đặt bàn", "Quản lý menu", "Xem báo cáo doanh thu"],
};

export default function ProfilePage() {
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <div style={{ padding: "24px" }}>
            <Row gutter={[16, 16]}>
                {/* Profile Card */}
                <Col xs={24} md={8}>
                    <Card>
                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <Avatar size={100} src={employeeData.avatar} icon={<UserOutlined />} />
                            <h2 style={{ margin: "16px 0 8px" }}>{employeeData.fullName}</h2>
                            <Tag color={employeeData.status === "active" ? "green" : "red"}>
                                {employeeData.status === "active" ? "Đang làm việc" : "Đã nghỉ"}
                            </Tag>
                        </div>

                        <Descriptions column={1}>
                            <Descriptions.Item label="Chức vụ">{employeeData.position}</Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <MailOutlined /> {employeeData.email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                <PhoneOutlined /> {employeeData.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">{employeeData.address}</Descriptions.Item>
                        </Descriptions>

                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            block
                            onClick={() => setIsModalVisible(true)}
                            style={{ marginTop: "16px" }}
                        >
                            Cập nhật thông tin
                        </Button>
                    </Card>
                </Col>

                {/* Information Card */}
                <Col xs={24} md={16}>
                    <Card>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Thông tin cá nhân" key="1">
                                <Descriptions bordered>
                                    <Descriptions.Item label="Họ tên" span={3}>
                                        {employeeData.fullName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email" span={3}>
                                        {employeeData.email}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại" span={3}>
                                        {employeeData.phone}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Địa chỉ" span={3}>
                                        {employeeData.address}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày vào làm" span={3}>
                                        {employeeData.joinDate}
                                    </Descriptions.Item>
                                </Descriptions>
                            </TabPane>
                            <TabPane tab="Quyền hạn" key="2" icon={<LockOutlined />}>
                                <List
                                    bordered
                                    dataSource={employeeData.permissions}
                                    renderItem={(item) => (
                                        <List.Item>
                                            <List.Item.Meta avatar={<LockOutlined />} title={item} />
                                        </List.Item>
                                    )}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>

            <EditProfileModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSave={(values) => {
                    console.log("Saved:", values);
                    setIsModalVisible(false);
                }}
                initialValues={employeeData}
            />
        </div>
    );
}
