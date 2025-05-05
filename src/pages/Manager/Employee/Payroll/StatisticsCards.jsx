import React from "react";
import { Row, Col, Card, Statistic, Button } from "antd";
import {
    FileTextOutlined,
    UserOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

const StatisticsCards = ({
    statistics,
    statusFilters,
    resetFilters,
    onChangeTab,
}) => {
    // Format currency for display
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return "0";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    return (
        <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card" hoverable>
                    <Statistic
                        title="Tổng số bảng lương"
                        value={statistics.totalPayrolls || 0}
                        prefix={<FileTextOutlined />}
                        valueStyle={{ color: "#1677ff" }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card" hoverable>
                    <Statistic
                        title="Bảng lương đã thanh toán"
                        value={statistics.byStatus?.paid || 0}
                        valueStyle={{ color: "#13c2c2" }}
                        prefix={<CheckCircleOutlined />}
                        suffix={
                            <small style={{ fontSize: "14px" }}>
                                {statistics.totalPayrolls > 0
                                    ? ` (${Math.round(
                                          ((statistics.byStatus?.paid || 0) /
                                              statistics.totalPayrolls) *
                                              100
                                      )}%)`
                                    : ""}
                            </small>
                        }
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card" hoverable>
                    <Statistic
                        title="Tổng nhân viên"
                        value={statistics.totalEmployees || 0}
                        valueStyle={{ color: "#722ed1" }}
                        prefix={<UserOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="stat-card" hoverable>
                    <Statistic
                        title="Tổng chi phí lương"
                        value={formatCurrency(statistics.totalNetPay || 0)}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: "#cf1322" }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default StatisticsCards;
