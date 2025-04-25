import { Card, Statistic, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function StatsCard({ title, value, icon, color, growth }) {
    const isGrowthPositive = parseFloat(growth) > 0;

    return (
        <Card style={{ borderRadius: 8 }}>
            <Statistic title={title} value={value} prefix={icon} valueStyle={{ color }} />
            <Text type="secondary">
                {isGrowthPositive ? <ArrowUpOutlined style={{ color: "#52c41a" }} /> : <ArrowDownOutlined style={{ color: "#f5222d" }} />}{" "}
                {growth} so với tháng trước
            </Text>
        </Card>
    );
}
