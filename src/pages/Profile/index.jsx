import React from "react";
import { useSelector } from "react-redux";
import { Card, Avatar, Descriptions, Tag, Row, Col, Typography, Divider, Button, Space } from "antd";
import { EditOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ProfilePage() {
    // Lấy thông tin người dùng từ Redux
    const user = useSelector((state) => state.auth.account);

    if (!user) {
        return (
            <Row justify="center" align="middle" style={{ height: "100vh" }}>
                <Text type="danger">Không có thông tin người dùng!</Text>
            </Row>
        );
    }

    return (
        <Row justify="center" style={{ padding: "24px" }}>
            <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                <Card
                    bordered={false}
                    style={{
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        borderRadius: "12px",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                        <Avatar
                            size={120}
                            src={user.avatar || "/default-avatar.png"}
                            style={{
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                        />
                        <Title level={3} style={{ marginTop: "16px" }}>
                            {user.fullName || "Chưa cập nhật"}
                        </Title>
                        <Tag>{user.role}</Tag>
                    </div>
                    <Divider />
                    <Descriptions column={1} labelStyle={{ fontWeight: "bold", width: "120px" }} contentStyle={{ color: "#555" }}>
                        <Descriptions.Item label="Email">{user.email || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Tên đăng nhập">{user.username || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Vai trò">{user.role}</Descriptions.Item>
                    </Descriptions>
                    <Divider />
                    <Space style={{ display: "flex", justifyContent: "center" }}>
                        <Button type="primary" icon={<EditOutlined />}>
                            Chỉnh sửa thông tin
                        </Button>
                    </Space>
                </Card>
            </Col>
        </Row>
    );
}
