import { Layout, Dropdown, Avatar, Badge, Breadcrumb } from "antd";
import { BellOutlined, UserOutlined, HomeOutlined, KeyOutlined, LogoutOutlined } from "@ant-design/icons";
import { theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import NotificationDrawer from "../common/NotificationDrawer";
import { useDispatch, useSelector } from "react-redux";
import { selectAccount } from "../../store/authSlice";
import { logout } from "../../store/authSlice";
import { message } from "antd";
import { persistor } from "../../store/store";

const { Header } = Layout;
const { useToken } = theme;

// Route segment → Label & Icon
const BREADCRUMB_MAP = {
    "": { label: "Trang chủ", icon: <HomeOutlined /> },
    info: { label: "Thông tin NH & KS" },
    basic: { label: "Thông tin cơ bản" },
    branches: { label: "Quản lý chi nhánh" },
    services: { label: "Dịch vụ và tiện ích" },
    areas: { label: "Quản lý khu vực" },
    restaurant: { label: "Quản lý nhà hàng" },
    tables: { label: "Quản lý bàn" },
    menu: { label: "Thực đơn" },
    foods: { label: "Danh sách món ăn" },
    reservations: { label: "Quản lý đặt bàn" },
    promotions: { label: "Quản lý khuyến mãi" },
    payment: { label: "Thanh toán" },
    invoice: { label: "Hóa đơn" },
    "menus-main": { label: "Thực đơn chính" },
    hotel: { label: "Quản lý khách sạn" },
    rooms: { label: "Quản lý phòng" },
    "room-types": { label: "Quản lý loại phòng" },
    "room-stuffs": { label: "Quản lý vật dụng" },
    bookings: { label: "Đặt phòng" },
    customer: { label: "Quản lý khách hàng" },
    "list-customer": { label: "Danh sách khách hàng" },
    memberships: { label: "Thành viên" },
    feedback: { label: "Quản lý phản hồi" },
    employees: { label: "Quản lý nhân viên" },
    positions: { label: "Quản lý chức vụ" },
    shifts: { label: "Ca làm" },
    reports: { label: "Báo cáo & Doanh thu" },
    revenue: { label: "Doanh thu" },
    financial: { label: "Tài chính" },
    accounts: { label: "Tài khoản" },
    systems: { label: "Hệ thống" },
    permissions: { label: "Phân quyền" },
    profile: { label: "Thông tin tài khoản" },
};

// Các segment breadcrumb không được click
const NON_CLICKABLE_SEGMENTS = ["info", "restaurant", "hotel", "customers", "staff", "reports", "systems"];

export default function AppHeader() {
    const { token } = useToken();
    const user = useSelector(selectAccount);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    const handleLogout = async () => {
        await persistor.purge();
        dispatch(logout());
        message.success("Đăng xuất thành công!");
        navigate("/login");
    };

    const menuItems = [
        {
            key: "1",
            icon: <UserOutlined />,
            label: "Thông tin tài khoản",
            onClick: () => {
                navigate("/profile");
            },
        },
        {
            key: "2",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: handleLogout,
        },
    ];

    // Breadcrumb logic
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbItems = [
        <Breadcrumb.Item key="home" onClick={() => navigate("/")}>
            {BREADCRUMB_MAP[""].icon}
            <span style={{ marginLeft: 4, cursor: "pointer" }}>{BREADCRUMB_MAP[""].label}</span>
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
                    <BellOutlined style={{ fontSize: 18, cursor: "pointer" }} onClick={() => setIsNotificationOpen(true)} />
                </Badge>
                <Dropdown menu={{ items: menuItems }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <span>{user?.fullName || "Người dùng"}</span>
                        <Avatar icon={<UserOutlined />} />
                    </div>
                </Dropdown>
            </div>
            <NotificationDrawer open={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
        </Header>
    );
}
