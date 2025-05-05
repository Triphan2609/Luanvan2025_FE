import React, { useState } from "react";
import {
    Drawer,
    List,
    Typography,
    Space,
    Tag,
    Statistic,
    Card,
    Empty,
    Pagination,
    Spin,
    Row,
    Col,
    Select,
    DatePicker,
    Button,
} from "antd";
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    FilterOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { getPointHistory } from "../../../../../api/membershipCardsApi";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

export default function PointHistory({
    open,
    onClose,
    cardData,
    pointHistory,
}) {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState(pointHistory || []);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: pointHistory?.length || 0,
    });

    // Lấy thêm dữ liệu lịch sử điểm khi người dùng chọn trang
    const handlePageChange = async (page, pageSize) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pageSize,
            };

            const response = await getPointHistory(cardData.id, params);

            if (response && response.data) {
                setHistory(response.data);
                setPagination({
                    current: page,
                    pageSize,
                    total: response.total || 0,
                });
            }
        } catch (error) {
            console.error("Error fetching point history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Refresh dữ liệu lịch sử điểm
    const refreshHistory = async () => {
        try {
            setLoading(true);
            const response = await getPointHistory(cardData.id, {
                page: 1,
                limit: pagination.pageSize,
            });

            if (response && response.data) {
                setHistory(response.data);
                setPagination({
                    ...pagination,
                    current: 1,
                    total: response.total || 0,
                });
            }
        } catch (error) {
            console.error("Error refreshing point history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Format currency
    const formatCurrency = (value) => {
        if (!value && value !== 0) return "";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    // Get point type config
    const getPointTypeConfig = (type, points) => {
        const configs = {
            add: {
                color: "success",
                text: "Cộng điểm",
                icon: <ArrowUpOutlined />,
            },
            redeem: {
                color: "error",
                text: "Đổi điểm",
                icon: <ArrowDownOutlined />,
            },
            adjust: {
                color: "warning",
                text: "Điều chỉnh",
                icon: points >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
            },
        };

        return configs[type] || configs.adjust;
    };

    if (!cardData) return null;

    return (
        <Drawer
            title={
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>Lịch sử điểm thưởng - Thẻ #{cardData.id}</span>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={refreshHistory}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>
            }
            placement="right"
            width={640}
            onClose={onClose}
            open={open}
        >
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic
                            title="Tổng điểm hiện tại"
                            value={cardData.points}
                            suffix="điểm"
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="Tổng chi tiêu"
                            value={formatCurrency(cardData.totalSpent)}
                            precision={0}
                        />
                    </Col>
                </Row>
            </Card>

            <Spin spinning={loading}>
                {history.length > 0 ? (
                    <>
                        <List
                            itemLayout="horizontal"
                            dataSource={history}
                            renderItem={(item) => {
                                const typeConfig = getPointTypeConfig(
                                    item.type,
                                    item.points
                                );

                                return (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={
                                                <Space>
                                                    <Tag
                                                        color={typeConfig.color}
                                                        icon={typeConfig.icon}
                                                    >
                                                        {item.points > 0
                                                            ? "+"
                                                            : ""}
                                                        {item.points} điểm
                                                    </Tag>
                                                    <Text>
                                                        {formatDate(
                                                            item.createdAt
                                                        )}
                                                    </Text>
                                                </Space>
                                            }
                                            description={
                                                <div>
                                                    <div>
                                                        {item.description ||
                                                            typeConfig.text}
                                                    </div>
                                                    {item.amount && (
                                                        <Text type="secondary">
                                                            Giao dịch:{" "}
                                                            {formatCurrency(
                                                                item.amount
                                                            )}
                                                        </Text>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                        <div style={{ marginTop: 16, textAlign: "right" }}>
                            <Pagination
                                {...pagination}
                                onChange={handlePageChange}
                                showSizeChanger
                                showTotal={(total) => `Tổng ${total} bản ghi`}
                            />
                        </div>
                    </>
                ) : (
                    <Empty description="Chưa có lịch sử điểm" />
                )}
            </Spin>
        </Drawer>
    );
}
