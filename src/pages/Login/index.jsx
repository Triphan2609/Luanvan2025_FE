import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, setLoading } from "../../store/authSlice";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Form,
    Input,
    Layout,
    Typography,
    theme,
    message,
    Spin,
} from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../configs/apiClient";
import { selectLoading } from "../../store/authSlice";

const { Title } = Typography;
const { Content } = Layout;

export default function LoginPage() {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogin = async (values) => {
        try {
            dispatch(setLoading(true));
            const response = await apiClient.post("/auth/login", values);
            const { accessToken, account } = response.data;

            localStorage.setItem("accessToken", accessToken);
            dispatch(loginSuccess({ account, accessToken }));

            messageApi.success("Đăng nhập thành công!");

            // Redirect to desired page or dashboard
            const redirect = new URLSearchParams(location.search).get(
                "redirect"
            );
            navigate(redirect || "/");
        } catch (error) {
            // Xử lý lỗi từ backend
            if (error.response) {
                const { status, data } = error.response;

                // Hiển thị thông báo lỗi dựa trên mã lỗi
                if (status === 401) {
                    message.error("Tên đăng nhập hoặc mật khẩu không đúng!");
                } else if (status === 403) {
                    message.error("Tài khoản của bạn đã bị khóa!");
                } else if (status === 500) {
                    message.error("Lỗi máy chủ, vui lòng thử lại sau!");
                } else {
                    message.error(
                        data.message || "Đã xảy ra lỗi, vui lòng thử lại!"
                    );
                }
            } else {
                // Lỗi không xác định (ví dụ: mất kết nối mạng)
                message.error(
                    "Không thể kết nối đến máy chủ, vui lòng kiểm tra mạng!"
                );
            }
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", background: colorBgContainer }}>
            {contextHolder}
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
                            src="/logo.png"
                            alt="Logo"
                            style={{
                                height: "64px",
                                marginBottom: "16px",
                            }}
                        />
                        <Title level={3} style={{ marginBottom: 0 }}>
                            Đăng nhập hệ thống
                        </Title>
                        <Typography.Text type="secondary">
                            Quản lý nhà hàng & khách sạn
                        </Typography.Text>
                    </div>

                    <Form
                        name="normal_login"
                        onFinish={handleLogin}
                        size="large"
                    >
                        <Form.Item
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên đăng nhập!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Tên đăng nhập"
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mật khẩu!",
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                type="password"
                                placeholder="Mật khẩu"
                            />
                        </Form.Item>
                        <Form.Item>
                            <Link
                                to="/forgot-password"
                                style={{ float: "right" }}
                            >
                                Quên mật khẩu?
                            </Link>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
}
