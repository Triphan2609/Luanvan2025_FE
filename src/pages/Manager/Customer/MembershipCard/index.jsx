import React, { useState } from "react";
import { Card, Table, Button, Space, Tag, Typography, Row, Col, Input, Select, Statistic, Progress, Tooltip, message } from "antd";
import { CrownOutlined, SearchOutlined, GiftOutlined, InfoCircleOutlined, HistoryOutlined } from "@ant-design/icons";
import { CARD_TYPE, CARD_STATUS, TYPE_CONFIGS } from "./constants";
import CardForm from "./Modals/CardForm";
import CardDetail from "./Drawer/CardDetail";
import PointHistory from "./Components/PointHistory";
import RedeemPoints from "./Modals/RedeemPoints";

const { Title } = Typography;
const { Search } = Input;

export default function MembershipCard() {
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Dữ liệu mẫu
    const [cards, setCards] = useState([
        {
            id: "MC001",
            customerId: "KH001",
            customerName: "Nguyễn Văn A",
            type: CARD_TYPE.GOLD,
            points: 150,
            totalSpent: 16500000,
            status: CARD_STATUS.ACTIVE,
            issueDate: "2024-01-01",
            expireDate: "2025-01-01",
        },
        // Thêm dữ liệu mẫu...
    ]);

    const columns = [
        {
            title: "Mã thẻ",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Khách hàng",
            dataIndex: "customerName",
            key: "customerName",
            render: (text, record) => (
                <Space>
                    <span>{text}</span>
                    <Tag>{record.customerId}</Tag>
                </Space>
            ),
        },
        {
            title: "Hạng thẻ",
            dataIndex: "type",
            key: "type",
            render: (type) => <Tag color={TYPE_CONFIGS[type].color}>{TYPE_CONFIGS[type].name}</Tag>,
        },
        {
            title: "Điểm tích lũy",
            dataIndex: "points",
            key: "points",
            align: "center",
            render: (points) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: "bold" }}>{points}</span>
                    <small>điểm</small>
                </Space>
            ),
        },
        {
            title: "Tổng chi tiêu",
            dataIndex: "totalSpent",
            key: "totalSpent",
            align: "right",
            render: (value, record) => (
                <Space direction="vertical" size={0}>
                    <span>
                        {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(value)}
                    </span>
                    <Progress
                        percent={Math.min(100, (value / TYPE_CONFIGS[record.type].minSpent) * 100)}
                        size="small"
                        showInfo={false}
                        status="active"
                    />
                </Space>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const configs = {
                    [CARD_STATUS.ACTIVE]: { color: "success", text: "Hoạt động" },
                    [CARD_STATUS.EXPIRED]: { color: "error", text: "Hết hạn" },
                    [CARD_STATUS.BLOCKED]: { color: "default", text: "Đã khóa" },
                };
                return <Tag color={configs[status].color}>{configs[status].text}</Tag>;
            },
        },
        {
            title: "Hiệu lực",
            key: "validity",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <small>Từ: {record.issueDate}</small>
                    <small>Đến: {record.expireDate}</small>
                </Space>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chi tiết thẻ">
                        <Button icon={<InfoCircleOutlined />} onClick={() => handleViewDetails(record)} size="small" />
                    </Tooltip>
                    <Tooltip title="Lịch sử điểm">
                        <Button icon={<HistoryOutlined />} onClick={() => handleViewHistory(record)} size="small" />
                    </Tooltip>
                    <Tooltip title="Đổi điểm">
                        <Button
                            icon={<GiftOutlined />}
                            onClick={() => handleRedeemPoints(record)}
                            size="small"
                            disabled={record.points < 100}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Handlers sẽ được thêm sau...

    // Thêm states mới
    const [isCardFormVisible, setIsCardFormVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isRedeemVisible, setIsRedeemVisible] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [pointHistory, setPointHistory] = useState([
        {
            id: 1,
            date: "2024-04-20",
            type: "earn",
            points: 50,
            description: "Chi tiêu 500,000đ tại nhà hàng",
            balance: 150,
        },
        // Thêm dữ liệu mẫu...
    ]);

    // Thêm handlers
    const handleNewCard = () => {
        setSelectedCard(null);
        setIsCardFormVisible(true);
    };

    const handleViewDetails = (record) => {
        setSelectedCard(record);
        setIsDetailVisible(true);
    };

    const handleViewHistory = (record) => {
        setSelectedCard(record);
        setIsHistoryVisible(true);
    };

    const handleRedeemPoints = (record) => {
        setSelectedCard(record);
        setIsRedeemVisible(true);
    };

    const handleCardSubmit = (values) => {
        if (values.id) {
            // Cập nhật thẻ
            setCards(cards.map((card) => (card.id === values.id ? { ...card, ...values } : card)));
            message.success("Cập nhật thẻ thành công");
        } else {
            // Tạo thẻ mới
            const newCard = {
                ...values,
                id: `MC${Math.floor(Math.random() * 10000)}`,
                status: CARD_STATUS.ACTIVE,
                points: 0,
                totalSpent: 0,
            };
            setCards([...cards, newCard]);
            message.success("Cấp thẻ mới thành công");
        }
        setIsCardFormVisible(false);
    };

    const handleRedeemSubmit = (values) => {
        // Cập nhật điểm sau khi đổi
        setCards(
            cards.map((card) => {
                if (card.id === selectedCard.id) {
                    return {
                        ...card,
                        points: card.points - values.points,
                    };
                }
                return card;
            })
        );

        // Thêm lịch sử đổi điểm
        setPointHistory([
            {
                id: Date.now(),
                date: new Date().toISOString(),
                type: "redeem",
                points: values.points,
                description: `Đổi ${values.points} điểm: ${values.rewardId}`,
                balance: selectedCard.points - values.points,
            },
            ...pointHistory,
        ]);

        message.success("Đổi điểm thành công");
        setIsRedeemVisible(false);
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Thống kê */}
                    <Row gutter={16}>
                        {Object.entries(CARD_TYPE).map(([key, value]) => (
                            <Col span={8} key={key}>
                                <Card>
                                    <Statistic
                                        title={`Thành viên ${TYPE_CONFIGS[value].name}`}
                                        value={cards.filter((c) => c.type === value).length}
                                        prefix={<CrownOutlined style={{ color: TYPE_CONFIGS[value].color }} />}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Thanh công cụ */}
                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto">
                            <Space>
                                <Search
                                    placeholder="Tìm theo mã thẻ hoặc tên khách hàng"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: 300 }}
                                    allowClear
                                />
                                <Select value={filterType} onChange={setFilterType} style={{ width: 150 }}>
                                    <Select.Option value="all">Tất cả hạng</Select.Option>
                                    {Object.entries(TYPE_CONFIGS).map(([value, config]) => (
                                        <Select.Option key={value} value={value}>
                                            {config.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }}>
                                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                                    <Select.Option value={CARD_STATUS.ACTIVE}>Hoạt động</Select.Option>
                                    <Select.Option value={CARD_STATUS.EXPIRED}>Hết hạn</Select.Option>
                                    <Select.Option value={CARD_STATUS.BLOCKED}>Đã khóa</Select.Option>
                                </Select>
                            </Space>
                        </Col>
                        <Col>
                            <Button type="primary" icon={<CrownOutlined />} onClick={handleNewCard}>
                                Cấp thẻ mới
                            </Button>
                        </Col>
                    </Row>

                    {/* Bảng dữ liệu */}
                    <Table
                        columns={columns}
                        dataSource={cards}
                        rowKey="id"
                        pagination={pagination}
                        onChange={(pagination, filters, sorter) => {
                            setPagination(pagination);
                        }}
                        bordered
                    />
                </Space>
            </Card>

            {/* Add Modal và Drawer components */}
            <CardForm
                open={isCardFormVisible}
                onCancel={() => setIsCardFormVisible(false)}
                onSubmit={handleCardSubmit}
                editingCard={selectedCard}
                TYPE_CONFIGS={TYPE_CONFIGS}
                customerList={[
                    // Thêm danh sách khách hàng chưa có thẻ
                    { id: "KH002", name: "Trần Thị B", phone: "0912345678" },
                    { id: "KH003", name: "Lê Văn C", phone: "0923456789" },
                ]}
            />

            <CardDetail
                open={isDetailVisible}
                onClose={() => setIsDetailVisible(false)}
                cardData={selectedCard}
                TYPE_CONFIGS={TYPE_CONFIGS}
                onRedeemPoints={handleRedeemPoints}
            />

            <PointHistory
                open={isHistoryVisible}
                onClose={() => setIsHistoryVisible(false)}
                cardData={selectedCard}
                historyData={pointHistory}
            />

            <RedeemPoints
                open={isRedeemVisible}
                onClose={() => setIsRedeemVisible(false)}
                cardData={selectedCard}
                onRedeem={handleRedeemSubmit}
            />
        </div>
    );
}
