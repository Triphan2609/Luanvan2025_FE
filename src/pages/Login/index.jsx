import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, Layout, Typography, theme } from "antd";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png"; // Thay bằng logo của bạn
import "./login.scss";

const { Title } = Typography;
const { Content } = Layout;

export default function LoginPage() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const onFinish = (values) => {
        console.log("Received values of form: ", values);
        // Xử lý đăng nhập ở đây
    };

    return (
        <Layout style={{ minHeight: "100vh", background: colorBgContainer }}>
            <Content
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "24px",
                    background: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`,
                }}
            >
                <Card
                    style={{
                        width: "100%",
                        maxWidth: "450px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                        <img
                            src={logo}
                            alt="Logo"
                            style={{
                                height: "64px",
                                marginBottom: "16px",
                            }}
                        />
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Đăng nhập hệ thống
                        </Title>
                        <Typography.Text type="secondary">Quản lý nhà hàng & khách sạn</Typography.Text>
                    </div>

                    <Form name="normal_login" initialValues={{ remember: true }} onFinish={onFinish} size="large">
                        <Form.Item name="username" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}>
                            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                        </Form.Item>
                        <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
                            <Input.Password prefix={<LockOutlined />} type="password" placeholder="Mật khẩu" />
                        </Form.Item>
                        <Form.Item>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                            </Form.Item>
                            <Link to="/forgot-password" style={{ float: "right" }}>
                                Quên mật khẩu?
                            </Link>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large">
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
}
