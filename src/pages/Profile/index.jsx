import React from "react";
import { useSelector } from "react-redux";
import { Card, Avatar, Descriptions, Tag, Row, Col, Typography, Divider } from "antd";

const { Title, Text } = Typography;

export default function ProfilePage() {
    // Lấy thông tin người dùng từ Redux
    const user = useSelector((state) => state.auth.account); // Sửa từ state.auth.user thành state.auth.account

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
                            {user.fullName}
                        </Title>
                        <Tag
                            color={user.role === "admin" ? "red" : "blue"}
                            style={{
                                fontSize: "14px",
                                padding: "4px 12px",
                                borderRadius: "16px",
                            }}
                        >
                            {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                        </Tag>
                    </div>
                    <Divider />
                    <Descriptions column={1} labelStyle={{ fontWeight: "bold", width: "120px" }} contentStyle={{ color: "#555" }}>
                        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                        <Descriptions.Item label="Tên đăng nhập">{user.username}</Descriptions.Item>
                        <Descriptions.Item label="Vai trò">{user.role === "admin" ? "Quản trị viên" : "Người dùng"}</Descriptions.Item>
                    </Descriptions>
                </Card>
            </Col>
        </Row>
    );
}
