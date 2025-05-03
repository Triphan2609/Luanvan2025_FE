import { Layout, Menu, theme } from "antd";
import {
    DashboardOutlined,
    HomeOutlined,
    UserOutlined,
    TeamOutlined,
    PieChartOutlined,
    SettingOutlined,
    AppstoreOutlined,
    OrderedListOutlined,
    DollarOutlined,
    FileTextOutlined,
    ScheduleOutlined,
    StarOutlined,
    IdcardOutlined,
    BarChartOutlined,
    LineChartOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import { TbGps } from "react-icons/tb";
import { IoRestaurantOutline } from "react-icons/io5";
import { MdOutlineTableRestaurant } from "react-icons/md";
import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import AppHeader from "./AppHeader";

const { Sider, Content } = Layout;

const items = [
    {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: <Link to="/">Dashboard</Link>,
    },
    {
        key: "hotel-restaurant-info",
        icon: <HomeOutlined />,
        label: "Thông tin NH & KS",
        children: [
            {
                key: "branches",
                icon: <HomeOutlined />,
                label: <Link to="/info/branches">Quản lý chi nhánh</Link>,
            },
            {
                key: "services",
                icon: <OrderedListOutlined />,
                label: (
                    <Link to="/info/services"> Quản lý dịch vụ tiện ích</Link>
                ),
            },
            {
                key: "areas",
                icon: <TbGps />,
                label: <Link to="/info/areas"> Quản lý khu vực</Link>,
            },
        ],
    },
    {
        key: "restaurant-management",
        icon: <IoRestaurantOutline />,
        label: "Quản lý Nhà hàng",
        children: [
            {
                key: "tables",
                icon: <MdOutlineTableRestaurant />,
                label: <Link to="/restaurant/tables">Quản lý bàn</Link>,
            },
            {
                key: "reservations",
                icon: <ScheduleOutlined />,
                label: (
                    <Link to="/restaurant/reservations">Quản lý đặt bàn</Link>
                ),
            },
            {
                key: "menu",
                icon: <OrderedListOutlined />,
                label: "Quản lý Thực đơn",
                children: [
                    {
                        type: "group",
                        label: "Món ăn & Dịch vụ",
                        children: [
                            {
                                key: "foods",
                                icon: <IoRestaurantOutline />,
                                label: (
                                    <Link to="/restaurant/foods">
                                        Danh sách món ăn
                                    </Link>
                                ),
                            },
                            {
                                key: "foods-services",
                                icon: <MdOutlineTableRestaurant />,
                                label: (
                                    <Link to="/restaurant/table-services">
                                        Dịch vụ bàn
                                    </Link>
                                ),
                            },
                        ],
                    },
                    {
                        type: "group",
                        label: "Thực đơn",
                        children: [
                            {
                                key: "menu-main",
                                icon: <AppstoreOutlined />,
                                label: (
                                    <Link to="/restaurant/menus-main">
                                        Thực đơn chính
                                    </Link>
                                ),
                            },
                            {
                                key: "menu-seasonal",
                                icon: <StarOutlined />,
                                label: (
                                    <Link to="/restaurant/menus-seasonal">
                                        Thực đơn theo mùa
                                    </Link>
                                ),
                            },
                        ],
                    },
                ],
            },

            {
                key: "promotions",
                icon: <StarOutlined />,
                label: (
                    <Link to="/restaurant/promotions">Quản lý khuyến mãi</Link>
                ),
            },
        ],
    },
    {
        key: "hotel-management",
        icon: <HomeOutlined />,
        label: "Quản lý Khách sạn",
        children: [
            {
                key: "rooms",
                icon: <HomeOutlined />,
                label: <Link to="/hotel/rooms">Quản lý phòng</Link>,
            },
            {
                key: "room-types",
                icon: <AppstoreOutlined />,
                label: <Link to="/hotel/room-types">Quản lý loại phòng</Link>,
            },
            {
                key: "bookings",
                icon: <ScheduleOutlined />,
                label: <Link to="/hotel/bookings">Quản lý đặt phòng</Link>,
            }, //
            {
                key: "stuff",
                icon: <OrderedListOutlined />,
                label: <Link to="/hotel/room-stuffs">Quản lý vật dụng</Link>,
            },
        ],
    },
    {
        key: "customer-management",
        icon: <UserOutlined />,
        label: "Quản lý Khách hàng",
        children: [
            {
                key: "customers",
                icon: <UserOutlined />,
                label: (
                    <Link to="/customer/list-customer">
                        Danh sách khách hàng
                    </Link>
                ),
            },
            {
                key: "memberships",
                icon: <IdcardOutlined />,
                label: (
                    <Link to="/customer/list-membership-card">
                        Thẻ thành viên
                    </Link>
                ),
            },
            {
                key: "feedback",
                icon: <FileTextOutlined />,
                label: (
                    <Link to="/customer/feedback">Phản hồi từ khách hàng</Link>
                ),
            },
        ],
    },
    {
        key: "staff-management",
        icon: <TeamOutlined />,
        label: "Quản lý Nhân viên",
        children: [
            {
                key: "staff",
                icon: <TeamOutlined />,
                label: <Link to="/employees/list">Danh sách nhân viên</Link>,
            },
            {
                key: "positions",
                icon: <IdcardOutlined />,
                label: (
                    <Link to="/employees/positions">Chức vụ & phòng ban</Link>
                ),
            },
            {
                key: "shifts",
                icon: <ScheduleOutlined />,
                label: <Link to="/employees/working-time">Quản lý ca làm</Link>,
            },
            {
                key: "salary-config",
                icon: <SettingOutlined />,
                label: (
                    <Link to="/employees/salary-config">Cấu hình lương</Link>
                ),
            },
            {
                key: "payroll",
                icon: <DollarOutlined />,
                label: <Link to="/employees/payroll">Quản lý bảng lương</Link>,
            },
            {
                key: "payroll-dashboard",
                icon: <BarChartOutlined />,
                label: (
                    <Link to="/employees/payroll-dashboard">Báo cáo lương</Link>
                ),
            },
            {
                key: "payroll-attendance",
                icon: <CalendarOutlined />,
                label: (
                    <Link to="/employees/payroll-attendance">
                        Tích hợp chấm công
                    </Link>
                ),
            },
        ],
    },
    {
        key: "reports",
        icon: <PieChartOutlined />,
        label: "Báo cáo & Doanh thu",
        children: [
            {
                key: "revenue",
                icon: <DollarOutlined />,
                label: <Link to="/reports/revenue">Doanh thu</Link>,
            },
            {
                key: "service-usage",
                icon: <BarChartOutlined />,
                label: <Link to="/reports/service-usage">Sử dụng dịch vụ</Link>,
            },
            {
                key: "financial",
                icon: <LineChartOutlined />,
                label: <Link to="/reports/financial">Tài chính</Link>,
            },
        ],
    },
    {
        key: "systems",
        icon: <SettingOutlined />,
        label: "Hệ thống",
        children: [
            {
                key: "accounts",
                icon: <UserOutlined />,
                label: <Link to="/systems/accounts">Tài khoản</Link>,
            },
            {
                key: "permissions",
                icon: <IdcardOutlined />,
                label: <Link to="/systems/permissions">Phân quyền</Link>,
            },
        ],
    },
];

export default function AppLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                breakpoint="lg"
                collapsedWidth="100" // Tăng từ 80 lên 100
                width={280} // Tăng từ 250 lên 280
                style={{
                    overflow: "auto",
                    height: "100vh",
                    position: "fixed",
                    left: 0,
                    background: "#ffffff",
                    borderRight: "1px solid #f0f0f0",
                }}
            >
                <div
                    className="demo-logo-vertical"
                    style={{
                        height: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#1890ff",
                        fontSize: collapsed ? "16px" : "20px",
                        fontWeight: "bold",
                        background: "#fff",
                        margin: "16px 0",
                        borderRadius: 6,
                    }}
                >
                    {collapsed ? "HRM" : "Manager System"}
                </div>
                <Menu
                    theme="light"
                    defaultSelectedKeys={["dashboard"]}
                    mode="inline"
                    items={items}
                    inlineCollapsed={collapsed}
                    style={{
                        borderRight: 0,
                        padding: "0 8px",
                    }}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 100 : 280 }}>
                <AppHeader />
                <Content style={{ margin: "16px" }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: "#fff",
                            borderRadius: 8,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
