import { Layout, Dropdown, Avatar, Badge, Breadcrumb } from "antd";
import { BellOutlined, UserOutlined, HomeOutlined, KeyOutlined, LogoutOutlined } from "@ant-design/icons";
import { theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const { Header } = Layout;
const { useToken } = theme;

// Route segment → Label & Icon
const BREADCRUMB_MAP = {
    "": { label: "Trang chủ", icon: <HomeOutlined /> },
    info: { label: "Thông tin NH & KS" },
    basic: { label: "Thông tin cơ bản" },
    branches: { label: "Chi nhánh" },
    services: { label: "Dịch vụ và tiện ích" },
    area: { label: "Khu vực" },
    restaurant: { label: "Quản lý nhà hàng" },
    tables: { label: "Quản lý bàn" },
    menu: { label: "Thực đơn" },
    foods: { label: "Danh sách món ăn" },
    reservations: { label: "Quản lý đặt bàn" },
    promotions: { label: "Khuyến mãi" },
    payment: { label: "Thanh toán" },
    "menus-main": { label: "Thực đơn chính" },
    hotel: { label: "Khách sạn" },
    rooms: { label: "Phòng" },
    "room-types": { label: "Loại phòng" },
    bookings: { label: "Đặt phòng" },
    customers: { label: "Khách hàng" },
    memberships: { label: "Thành viên" },
    feedback: { label: "Phản hồi" },
    staff: { label: "Nhân viên" },
    positions: { label: "Chức vụ" },
    shifts: { label: "Ca làm" },
    reports: { label: "Báo cáo & Doanh thu" },
    revenue: { label: "Doanh thu" },
    occupancy: { label: "Tỷ lệ lấp đầy" },
    "customer-stats": { label: "Thống kê KH" },
    financial: { label: "Tài chính" },
    settings: { label: "Cài đặt" },
    "system-settings": { label: "Hệ thống" },
    "user-settings": { label: "Người dùng" },
    permissions: { label: "Phân quyền" },
    profile: { label: "Thông tin tài khoản" },
};

// Các segment breadcrumb không được click
const NON_CLICKABLE_SEGMENTS = ["info", "restaurant", "hotel", "customers", "staff", "reports", "settings"];

export default function AppHeader() {
    const { token } = useToken();
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = (e) => {
        if (e.key === "1") navigate("/profile");
        else if (e.key === "3") {
            localStorage.removeItem("token");
            navigate("/login");
        }
    };

    const menuItems = [
        {
            key: "1",
            icon: <UserOutlined />,
            label: "Thông tin tài khoản",
        },
        {
            key: "2",
            icon: <KeyOutlined />,
            label: "Đổi mật khẩu",
        },
        {
            type: "divider",
        },
        {
            key: "3",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
        },
    ];

    // Breadcrumb logic
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = [
        <Breadcrumb.Item key="home" onClick={() => navigate("/")}>
            {BREADCRUMB_MAP[""].icon}
            <span style={{ marginLeft: 4 }}>{BREADCRUMB_MAP[""].label}</span>
        </Breadcrumb.Item>,
    ];

    pathSnippets.forEach((segment, idx) => {
        const url = `/${pathSnippets.slice(0, idx + 1).join("/")}`;
        const map = BREADCRUMB_MAP[segment] || { label: segment, icon: null };
        const isNonClickable = NON_CLICKABLE_SEGMENTS.includes(segment);

        breadcrumbItems.push(
            <Breadcrumb.Item key={url}>
                {map.icon}
                <span
                    style={{
                        marginLeft: map.icon ? 4 : 0,
                        color: isNonClickable ? "#888" : "#4096ff",
                        cursor: isNonClickable ? "default" : "pointer",
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        verticalAlign: "middle",
                    }}
                    title={map.label}
                    onClick={isNonClickable ? undefined : () => navigate(url)}
                >
                    {map.label}
                </span>
            </Breadcrumb.Item>
        );
    });

    return (
        <Header
            style={{
                padding: "0 24px",
                background: token.colorBgContainer,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 1px 4px 0 rgba(0,21,41,0.12)",
            }}
        >
            <Breadcrumb style={{ fontSize: 14 }}>{breadcrumbItems}</Breadcrumb>

            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <Badge count={5}>
                    <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} />
                </Badge>
                <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <span>Admin</span>
                        <Avatar icon={<UserOutlined />} />
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
}
