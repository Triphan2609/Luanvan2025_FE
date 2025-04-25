import { Row, Col, Card, Typography } from "antd";
import StatsCard from "./components/StatsCard";
import RevenueChart from "./components/RevenueChart";
import OccupancyChart from "./components/OccupancyChart";
import RoomTypePie from "./components/RoomTypePie";
import RecentBookings from "./components/RecentBookings";
import { DollarOutlined, UserOutlined, HomeOutlined, CalendarOutlined } from "@ant-design/icons";
import "./dashboard.scss";
const { Title } = Typography;

export default function Dashboard() {
    return (
        <div className="dashboard-container">
            <Title level={4} style={{ marginBottom: 24 }}>
                Tổng quan
            </Title>

            {/* Statistic Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <StatsCard title="Doanh thu tháng" value="125,400,000 VND" icon={<DollarOutlined />} color="#52c41a" growth="12%" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatsCard title="Lượt đặt phòng" value="342" icon={<CalendarOutlined />} color="#1890ff" growth="8%" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatsCard title="Tỷ lệ lấp đầy" value="78%" icon={<HomeOutlined />} color="#faad14" growth="5%" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatsCard title="Khách hàng mới" value="56" icon={<UserOutlined />} color="#f5222d" growth="15%" />
                </Col>
            </Row>

            {/* Main Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} md={16}>
                    <Card title="Doanh thu theo tháng (2023)" bordered={false}>
                        <RevenueChart />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Tỷ lệ loại phòng" bordered={false}>
                        <RoomTypePie />
                    </Card>
                </Col>
            </Row>

            {/* Secondary Charts */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card title="Tỷ lệ lấp đầy theo tháng" bordered={false}>
                        <OccupancyChart />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Đặt phòng gần đây" bordered={false}>
                        <RecentBookings />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
