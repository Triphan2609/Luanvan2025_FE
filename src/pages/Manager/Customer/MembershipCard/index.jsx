import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Typography,
    Row,
    Col,
    Input,
    Select,
    Statistic,
    Progress,
    Tooltip,
    message,
    Alert,
    Popconfirm,
    Avatar,
    Badge,
    Dropdown,
    Menu,
    Empty,
    Divider,
} from "antd";
import {
    CrownOutlined,
    SearchOutlined,
    GiftOutlined,
    InfoCircleOutlined,
    HistoryOutlined,
    PlusOutlined,
    ReloadOutlined,
    DeleteOutlined,
    UserOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    MoreOutlined,
    DollarOutlined,
    StarOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { CARD_TYPE, CARD_STATUS, TYPE_CONFIGS } from "./constants";
import CardForm from "./Modals/CardForm";
import CardDetail from "./Drawer/CardDetail";
import PointHistory from "./Components/PointHistory";
import RedeemPoints from "./Modals/RedeemPoints";
import {
    getMembershipCards,
    getMembershipCardStats,
    getMembershipCardById,
    createMembershipCard,
    updateMembershipCard,
    updateCardStatus,
    getPointHistory,
    addPoints,
    redeemPoints,
    getRewards,
    deleteMembershipCard,
} from "../../../../api/membershipCardsApi";
import { getCustomers } from "../../../../api/customersApi";
import { debounce } from "lodash";

const { Title, Text } = Typography;
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

    // States
    const [isCardFormVisible, setIsCardFormVisible] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isRedeemVisible, setIsRedeemVisible] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cards, setCards] = useState([]);
    const [statistics, setStatistics] = useState({
        totalCards: 0,
        silverCards: 0,
        goldCards: 0,
        platinumCards: 0,
        averagePoints: 0,
    });
    const [pointHistory, setPointHistory] = useState([]);
    const [availableCustomers, setAvailableCustomers] = useState([]);
    const [rewards, setRewards] = useState([]);

    // Fetch data on component mount
    useEffect(() => {
        fetchCards();
        fetchStatistics();
        fetchAvailableCustomers();
        fetchRewards();
    }, []);

    // Fetch cards using server-side filtering
    const fetchCards = async (serverFilters = {}) => {
        try {
            setLoading(true);

            // Prepare query params for server-side filtering
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                ...serverFilters,
            };

            // Add type and status filters if they're not set to 'all'
            if (filterType !== "all") params.type = filterType;
            if (filterStatus !== "all") params.status = filterStatus;

            const response = await getMembershipCards(params);

            if (response && response.data) {
                setCards(response.data);
                setPagination((prev) => ({
                    ...prev,
                    total: response.total || 0,
                }));
            } else {
                setCards([]);
                setPagination((prev) => ({
                    ...prev,
                    total: 0,
                }));
                message.info({
                    content: "Không có dữ liệu thẻ thành viên",
                    key: "cardsLoading",
                });
            }
        } catch (error) {
            console.error("Error fetching membership cards:", error);
            message.error({
                content:
                    "Không thể tải danh sách thẻ thành viên: " +
                    (error.message || "Lỗi không xác định"),
                key: "cardsLoading",
            });
            setCards([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchText(value);
            setPagination((prev) => ({ ...prev, current: 1 }));
            fetchCards({ search: value, page: 1 });
        }, 500),
        []
    );

    // Fetch statistics
    const fetchStatistics = async () => {
        try {
            const stats = await getMembershipCardStats();
            setStatistics(stats);
        } catch (error) {
            console.error("Error fetching card statistics:", error);
            message.error("Không thể tải thống kê thẻ thành viên");
        }
    };

    // Fetch available customers (not having a membership card)
    const fetchAvailableCustomers = async () => {
        try {
            const response = await getCustomers({
                hasNoCard: true,
                limit: 1000,
            });

            if (response && response.data) {
                setAvailableCustomers(response.data);
            } else {
                setAvailableCustomers([]);
                message.info("Không có khách hàng khả dụng để cấp thẻ");
            }
        } catch (error) {
            console.error("Error fetching available customers:", error);
            message.error("Không thể tải danh sách khách hàng");
            setAvailableCustomers([]);
        }
    };

    // Fetch rewards for redeeming points
    const fetchRewards = async () => {
        try {
            const rewardsData = await getRewards();
            setRewards(rewardsData || []);
        } catch (error) {
            console.error("Error fetching rewards:", error);
            message.error("Không thể tải danh sách phần thưởng");
            setRewards([]);
        }
    };

    // Handler for searching
    const handleSearch = (value) => {
        debouncedSearch(value);
    };

    // Handler for filter changes
    const handleFilterChange = (key, value) => {
        if (key === "type") {
            setFilterType(value);
        } else if (key === "status") {
            setFilterStatus(value);
        }
        setPagination((prev) => ({ ...prev, current: 1 }));

        // Update filters and fetch data with new filters
        fetchCards({
            type:
                key === "type"
                    ? value
                    : filterType !== "all"
                    ? filterType
                    : undefined,
            status:
                key === "status"
                    ? value
                    : filterStatus !== "all"
                    ? filterStatus
                    : undefined,
            page: 1,
        });
    };

    // Handler for table pagination
    const handleTableChange = (paginationData) => {
        setPagination(paginationData);
        fetchCards({
            page: paginationData.current,
            limit: paginationData.pageSize,
        });
    };

    // Handlers for card operations
    const handleNewCard = () => {
        setSelectedCard(null);

        // Debug giá trị customerList

        if (availableCustomers.length === 0) {
            message.warning("Không có khách hàng nào có thể cấp thẻ");
            return;
        }

        setIsCardFormVisible(true);
    };

    const handleViewDetails = async (record) => {
        try {
            setLoading(true);
            // Get fresh data for the card
            const cardData = await getMembershipCardById(record.id);
            setSelectedCard(cardData);
            setIsDetailVisible(true);
        } catch (error) {
            console.error("Error fetching card details:", error);
            message.error("Không thể tải thông tin chi tiết thẻ");
        } finally {
            setLoading(false);
        }
    };

    const handleViewHistory = async (record) => {
        try {
            setLoading(true);
            setSelectedCard(record);

            // Fetch point history for the card
            const historyData = await getPointHistory(record.id);
            setPointHistory(historyData?.data || []);

            setIsHistoryVisible(true);
        } catch (error) {
            console.error("Error fetching point history:", error);
            message.error("Không thể tải lịch sử điểm");
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemPoints = (record) => {
        setSelectedCard(record);
        setIsRedeemVisible(true);
    };

    const handleResetFilters = () => {
        setSearchText("");
        setFilterType("all");
        setFilterStatus("all");
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchCards(); // Fetch without filters
    };

    const handleCardSubmit = async (values) => {
        try {
            setLoading(true);

            // Debug giá trị được gửi lên

            console.log(
                "customerId:",
                values.customerId,
                "type:",
                typeof values.customerId
            );

            // Kiểm tra customerId tồn tại nhưng không quan tâm kiểu dữ liệu
            if (!values.customerId && !selectedCard?.id) {
                message.error("Thiếu thông tin khách hàng");
                setLoading(false);
                return;
            }

            if (selectedCard?.id) {
                // Update card
                await updateMembershipCard(selectedCard.id, values);
                message.success("Cập nhật thẻ thành viên thành công");

                // Refresh data instead of updating local state
                fetchCards();
            } else {
                // Create new card
                await createMembershipCard(values);
                message.success("Cấp thẻ thành viên mới thành công");

                // Refresh data
                fetchCards();
                fetchAvailableCustomers();
            }

            // Update statistics
            fetchStatistics();
            setIsCardFormVisible(false);
        } catch (error) {
            console.error("Error creating/updating card:", error);
            message.error(
                selectedCard?.id
                    ? "Không thể cập nhật thẻ thành viên: " +
                          (error.message || "Lỗi không xác định")
                    : "Không thể cấp thẻ thành viên mới: " +
                          (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async (cardId, newStatus) => {
        try {
            setLoading(true);
            await updateCardStatus(cardId, newStatus);

            // Refresh data
            fetchCards();
            message.success("Cập nhật trạng thái thẻ thành công");

            // Update statistics
            fetchStatistics();
        } catch (error) {
            console.error("Error updating card status:", error);
            message.error(
                "Không thể cập nhật trạng thái thẻ: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRedeemSubmit = async (values) => {
        try {
            setLoading(true);

            // Submit redemption request
            await redeemPoints(selectedCard.id, {
                points: values.points,
                rewardId: values.rewardId,
                description:
                    values.description ||
                    `Đổi ${values.points} điểm: ${values.rewardName}`,
            });

            message.success("Đổi điểm thành công");
            setIsRedeemVisible(false);

            // Refresh card data
            fetchCards();

            // If card detail is visible, refresh that specific card
            if (isDetailVisible) {
                const updatedCard = await getMembershipCardById(
                    selectedCard.id
                );
                setSelectedCard(updatedCard);
            }

            // Update statistics
            fetchStatistics();
        } catch (error) {
            console.error("Error redeeming points:", error);
            message.error(
                "Không thể đổi điểm: " + (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        try {
            setLoading(true);
            await deleteMembershipCard(cardId);
            message.success("Xóa thẻ thành viên thành công");
            fetchCards();
        } catch (error) {
            console.error("Error deleting card:", error);
            message.error("Không thể xóa thẻ thành viên");
        } finally {
            setLoading(false);
        }
    };

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
            render: (text, record) => {
                return (
                    <Space>
                        <Avatar
                            icon={<UserOutlined />}
                            size="small"
                            style={{
                                backgroundColor: "#1890ff",
                            }}
                        />
                        <Text>{text}</Text>
                        <Badge
                            count={record.customer?.customer_code || "N/A"}
                            style={{
                                backgroundColor: "#52c41a",
                            }}
                        />
                    </Space>
                );
            },
        },
        {
            title: "Hạng thẻ",
            dataIndex: "type",
            key: "type",
            render: (type) => (
                <Tag color={TYPE_CONFIGS[type].color}>
                    {TYPE_CONFIGS[type].name}
                </Tag>
            ),
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
                        percent={Math.min(
                            100,
                            (value / TYPE_CONFIGS[record.type].minSpent) * 100
                        )}
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
                    [CARD_STATUS.ACTIVE]: {
                        color: "success",
                        text: "Hoạt động",
                    },
                    [CARD_STATUS.EXPIRED]: { color: "error", text: "Hết hạn" },
                    [CARD_STATUS.BLOCKED]: {
                        color: "default",
                        text: "Đã khóa",
                    },
                };
                return (
                    <Tag color={configs[status].color}>
                        {configs[status].text}
                    </Tag>
                );
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
                        <Button
                            type="primary"
                            size="small"
                            icon={<InfoCircleOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Lịch sử điểm">
                        <Button
                            icon={<HistoryOutlined />}
                            onClick={() => handleViewHistory(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Đổi điểm">
                        <Button
                            icon={<GiftOutlined />}
                            onClick={() => handleRedeemPoints(record)}
                            size="small"
                            disabled={
                                record.points < 100 ||
                                record.status !== CARD_STATUS.ACTIVE
                            }
                        />
                    </Tooltip>
                    <Tooltip title="Xóa thẻ">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa thẻ thành viên này?"
                            onConfirm={() => handleDeleteCard(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <style jsx="true">{`
                .membership-dashboard {
                    min-height: 100%;
                }
                .stats-card {
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    height: 100%;
                    transition: all 0.3s;
                }
                .stats-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                .card-status-card {
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    height: 100%;
                    transition: all 0.3s;
                }
                .card-status-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                .card-type-icon {
                    font-size: 24px;
                    margin-right: 8px;
                }
                .filter-section {
                    margin-bottom: 20px;
                    border-radius: 12px;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
                }
                .filter-badge {
                    font-weight: bold;
                    margin: 0 4px;
                }
                .filter-status {
                    margin-bottom: 20px;
                    padding: 12px 16px;
                    background-color: #f7f7f7;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }
                .filter-status-text {
                    font-size: 14px;
                }
                .membership-card-table .ant-table {
                    border-radius: 12px;
                    overflow: hidden;
                }
                .membership-card-table .ant-table-thead > tr > th {
                    background-color: #f5f7fa;
                    color: #333;
                    font-weight: 600;
                }
                .membership-card-table
                    .ant-table-tbody
                    > tr.ant-table-row:hover
                    > td {
                    background-color: #f0f7ff;
                }
                .action-btn-group button {
                    margin: 0 4px;
                }
                .action-btn-group button:first-child {
                    margin-left: 0;
                }
                .custom-statistic .ant-statistic-content {
                    font-family: "Montserrat", sans-serif;
                }
                .custom-statistic .ant-statistic-title {
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.65);
                }
                .stats-area {
                    margin-bottom: 24px;
                }
                .page-title {
                    margin-bottom: 24px;
                    font-weight: 600;
                    color: #1a3353;
                }
                .card-type-tag {
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .card-wrapper {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }
            `}</style>
            <div className="membership-dashboard">
                <Title level={2} className="page-title">
                    Quản lý thẻ thành viên
                </Title>

                {/* Thẻ thống kê */}
                <div className="stats-area">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Card className="stats-card" bordered={false}>
                                <Statistic
                                    title={
                                        <div>
                                            <Badge color="#C0C0C0" />
                                            <span style={{ marginLeft: 8 }}>
                                                Thành viên Bạc
                                            </span>
                                        </div>
                                    }
                                    value={statistics.silverCards || 0}
                                    valueStyle={{ color: "#595959" }}
                                    prefix={
                                        <CrownOutlined
                                            style={{ color: "#C0C0C0" }}
                                        />
                                    }
                                    suffix={<small>thẻ</small>}
                                    className="custom-statistic"
                                />
                                <div style={{ marginTop: 10 }}>
                                    <Progress
                                        percent={
                                            statistics.totalCards
                                                ? Math.round(
                                                      (statistics.silverCards /
                                                          statistics.totalCards) *
                                                          100
                                                  )
                                                : 0
                                        }
                                        size="small"
                                        strokeColor="#C0C0C0"
                                    />
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Card className="stats-card" bordered={false}>
                                <Statistic
                                    title={
                                        <div>
                                            <Badge color="#FFD700" />
                                            <span style={{ marginLeft: 8 }}>
                                                Thành viên Vàng
                                            </span>
                                        </div>
                                    }
                                    value={statistics.goldCards || 0}
                                    valueStyle={{ color: "#D48806" }}
                                    prefix={
                                        <CrownOutlined
                                            style={{ color: "#FFD700" }}
                                        />
                                    }
                                    suffix={<small>thẻ</small>}
                                    className="custom-statistic"
                                />
                                <div style={{ marginTop: 10 }}>
                                    <Progress
                                        percent={
                                            statistics.totalCards
                                                ? Math.round(
                                                      (statistics.goldCards /
                                                          statistics.totalCards) *
                                                          100
                                                  )
                                                : 0
                                        }
                                        size="small"
                                        strokeColor="#FFD700"
                                    />
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Card className="stats-card" bordered={false}>
                                <Statistic
                                    title={
                                        <div>
                                            <Badge color="#E5E4E2" />
                                            <span style={{ marginLeft: 8 }}>
                                                Thành viên Bạch Kim
                                            </span>
                                        </div>
                                    }
                                    value={statistics.platinumCards || 0}
                                    valueStyle={{ color: "#434343" }}
                                    prefix={
                                        <CrownOutlined
                                            style={{ color: "#E5E4E2" }}
                                        />
                                    }
                                    suffix={<small>thẻ</small>}
                                    className="custom-statistic"
                                />
                                <div style={{ marginTop: 10 }}>
                                    <Progress
                                        percent={
                                            statistics.totalCards
                                                ? Math.round(
                                                      (statistics.platinumCards /
                                                          statistics.totalCards) *
                                                          100
                                                  )
                                                : 0
                                        }
                                        size="small"
                                        strokeColor="#E5E4E2"
                                    />
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Card className="stats-card" bordered={false}>
                                <Statistic
                                    title={
                                        <div>
                                            <Badge color="#1890ff" />
                                            <span style={{ marginLeft: 8 }}>
                                                Điểm trung bình
                                            </span>
                                        </div>
                                    }
                                    value={statistics.averagePoints || 0}
                                    valueStyle={{ color: "#1890ff" }}
                                    prefix={
                                        <StarOutlined
                                            style={{ color: "#1890ff" }}
                                        />
                                    }
                                    suffix={<small>điểm</small>}
                                    className="custom-statistic"
                                />
                                <div style={{ marginTop: 10 }}>
                                    <Progress
                                        percent={Math.min(
                                            100,
                                            (statistics.averagePoints / 1000) *
                                                100
                                        )}
                                        size="small"
                                        strokeColor="#1890ff"
                                    />
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Bộ lọc nâng cao */}
                <Card className="filter-section" bordered={false}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={12} lg={10}>
                            <Search
                                placeholder="Tìm theo mã thẻ, tên khách hàng"
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="middle"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={handleSearch}
                                style={{ width: "100%" }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Select
                                placeholder="Hạng thẻ"
                                style={{ width: "100%" }}
                                value={filterType}
                                onChange={(value) =>
                                    handleFilterChange("type", value)
                                }
                                suffixIcon={<FilterOutlined />}
                            >
                                <Select.Option value="all">
                                    Tất cả hạng
                                </Select.Option>
                                {Object.entries(CARD_TYPE).map(
                                    ([key, value]) => (
                                        <Select.Option key={key} value={value}>
                                            <Space>
                                                <CrownOutlined
                                                    style={{
                                                        color: TYPE_CONFIGS[
                                                            value
                                                        ].color,
                                                    }}
                                                />
                                                {TYPE_CONFIGS[value].name}
                                            </Space>
                                        </Select.Option>
                                    )
                                )}
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: "100%" }}
                                value={filterStatus}
                                onChange={(value) =>
                                    handleFilterChange("status", value)
                                }
                                suffixIcon={<FilterOutlined />}
                            >
                                <Select.Option value="all">
                                    Tất cả trạng thái
                                </Select.Option>
                                <Select.Option value={CARD_STATUS.ACTIVE}>
                                    <Space>
                                        <Badge status="success" />
                                        Đang hoạt động
                                    </Space>
                                </Select.Option>
                                <Select.Option value={CARD_STATUS.EXPIRED}>
                                    <Space>
                                        <Badge status="error" />
                                        Hết hạn
                                    </Space>
                                </Select.Option>
                                <Select.Option value={CARD_STATUS.BLOCKED}>
                                    <Space>
                                        <Badge status="default" />
                                        Đã khóa
                                    </Space>
                                </Select.Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={6}>
                            <Space>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleResetFilters}
                                    style={{ borderRadius: "6px" }}
                                >
                                    Đặt lại
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleNewCard}
                                    disabled={availableCustomers.length === 0}
                                    style={{ borderRadius: "6px" }}
                                >
                                    Cấp thẻ mới
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Filter Status Bar */}
                {(searchText ||
                    filterType !== "all" ||
                    filterStatus !== "all") && (
                    <Alert
                        message={
                            <div className="filter-status">
                                <div className="filter-status-text">
                                    <Space>
                                        <span>
                                            Tìm thấy{" "}
                                            <span className="filter-badge">
                                                {pagination.total}
                                            </span>{" "}
                                            thẻ thành viên
                                        </span>
                                        {searchText && (
                                            <Tag color="blue">
                                                Tìm kiếm: {searchText}
                                            </Tag>
                                        )}
                                        {filterType !== "all" && (
                                            <Tag
                                                color={
                                                    TYPE_CONFIGS[filterType]
                                                        .color
                                                }
                                            >
                                                Hạng:{" "}
                                                {TYPE_CONFIGS[filterType].name}
                                            </Tag>
                                        )}
                                        {filterStatus !== "all" && (
                                            <Tag
                                                color={
                                                    filterStatus ===
                                                    CARD_STATUS.ACTIVE
                                                        ? "success"
                                                        : filterStatus ===
                                                          CARD_STATUS.EXPIRED
                                                        ? "error"
                                                        : "default"
                                                }
                                            >
                                                Trạng thái:{" "}
                                                {filterStatus ===
                                                CARD_STATUS.ACTIVE
                                                    ? "Đang hoạt động"
                                                    : filterStatus ===
                                                      CARD_STATUS.EXPIRED
                                                    ? "Hết hạn"
                                                    : "Đã khóa"}
                                            </Tag>
                                        )}
                                    </Space>
                                </div>
                                <Space>
                                    <Button
                                        size="small"
                                        icon={<ReloadOutlined />}
                                        onClick={handleResetFilters}
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                </Space>
                            </div>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: "20px", borderRadius: "8px" }}
                    />
                )}

                {/* Bảng dữ liệu */}
                <Card className="card-wrapper">
                    <Table
                        columns={[
                            {
                                title: "Mã thẻ",
                                dataIndex: "id",
                                key: "id",
                                width: 80,
                                render: (id) => <Text strong>{id}</Text>,
                            },
                            {
                                title: "Khách hàng",
                                dataIndex: "customerName",
                                key: "customerName",
                                render: (text, record) => (
                                    <Space>
                                        <Avatar
                                            icon={<UserOutlined />}
                                            size="small"
                                            style={{
                                                backgroundColor: "#1890ff",
                                            }}
                                        />
                                        <Text>{text}</Text>
                                        <Badge
                                            count={
                                                record.customer
                                                    ?.customer_code || "N/A"
                                            }
                                            style={{
                                                backgroundColor: "#52c41a",
                                            }}
                                        />
                                    </Space>
                                ),
                            },
                            {
                                title: "Hạng thẻ",
                                dataIndex: "type",
                                key: "type",
                                render: (type) => (
                                    <Tag
                                        className="card-type-tag"
                                        color={TYPE_CONFIGS[type].color}
                                        icon={<CrownOutlined />}
                                    >
                                        {TYPE_CONFIGS[type].name}
                                    </Tag>
                                ),
                            },
                            {
                                title: "Điểm tích lũy",
                                dataIndex: "points",
                                key: "points",
                                align: "center",
                                render: (points) => (
                                    <Space
                                        direction="vertical"
                                        size={0}
                                        align="center"
                                    >
                                        <Text
                                            strong
                                            style={{ fontSize: "16px" }}
                                        >
                                            {points}
                                        </Text>
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: "12px" }}
                                        >
                                            điểm
                                        </Text>
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
                                        <Text
                                            strong
                                            style={{ fontSize: "14px" }}
                                        >
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(value)}
                                        </Text>
                                        <Progress
                                            percent={Math.min(
                                                100,
                                                (value /
                                                    TYPE_CONFIGS[record.type]
                                                        .minSpent) *
                                                    100
                                            )}
                                            size="small"
                                            showInfo={false}
                                            status="active"
                                            strokeColor={
                                                TYPE_CONFIGS[record.type].color
                                            }
                                        />
                                        {record.type !== CARD_TYPE.PLATINUM && (
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: "12px" }}
                                            >
                                                {record.type ===
                                                CARD_TYPE.SILVER
                                                    ? `Còn ${new Intl.NumberFormat(
                                                          "vi-VN",
                                                          {
                                                              style: "currency",
                                                              currency: "VND",
                                                          }
                                                      ).format(
                                                          TYPE_CONFIGS.gold
                                                              .minSpent - value
                                                      )} để lên Vàng`
                                                    : `Còn ${new Intl.NumberFormat(
                                                          "vi-VN",
                                                          {
                                                              style: "currency",
                                                              currency: "VND",
                                                          }
                                                      ).format(
                                                          TYPE_CONFIGS.platinum
                                                              .minSpent - value
                                                      )} để lên Bạch Kim`}
                                            </Text>
                                        )}
                                    </Space>
                                ),
                            },
                            {
                                title: "Trạng thái",
                                dataIndex: "status",
                                key: "status",
                                render: (status) => {
                                    const configs = {
                                        [CARD_STATUS.ACTIVE]: {
                                            color: "success",
                                            text: "Hoạt động",
                                            icon: <CheckCircleOutlined />,
                                        },
                                        [CARD_STATUS.EXPIRED]: {
                                            color: "error",
                                            text: "Hết hạn",
                                            icon: <ClockCircleOutlined />,
                                        },
                                        [CARD_STATUS.BLOCKED]: {
                                            color: "default",
                                            text: "Đã khóa",
                                            icon: <StopOutlined />,
                                        },
                                    };
                                    return (
                                        <Tag
                                            color={configs[status].color}
                                            icon={configs[status].icon}
                                        >
                                            {configs[status].text}
                                        </Tag>
                                    );
                                },
                            },
                            {
                                title: "Hiệu lực",
                                key: "validity",
                                render: (_, record) => (
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary">
                                            Từ:{" "}
                                            <Text strong>
                                                {record.issueDate}
                                            </Text>
                                        </Text>
                                        <Text type="secondary">
                                            Đến:{" "}
                                            <Text strong>
                                                {record.expireDate}
                                            </Text>
                                        </Text>
                                    </Space>
                                ),
                            },
                            {
                                title: "Thao tác",
                                key: "action",
                                width: 160,
                                render: (_, record) => (
                                    <Space className="action-btn-group">
                                        <Tooltip title="Chi tiết thẻ">
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<InfoCircleOutlined />}
                                                onClick={() =>
                                                    handleViewDetails(record)
                                                }
                                                shape="circle"
                                            />
                                        </Tooltip>
                                        <Tooltip title="Lịch sử điểm">
                                            <Button
                                                size="small"
                                                icon={<HistoryOutlined />}
                                                onClick={() =>
                                                    handleViewHistory(record)
                                                }
                                                shape="circle"
                                                style={{
                                                    background: "#faad14",
                                                    color: "white",
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Đổi điểm">
                                            <Button
                                                size="small"
                                                icon={<GiftOutlined />}
                                                onClick={() =>
                                                    handleRedeemPoints(record)
                                                }
                                                disabled={
                                                    record.points < 100 ||
                                                    record.status !==
                                                        CARD_STATUS.ACTIVE
                                                }
                                                shape="circle"
                                                style={{
                                                    background:
                                                        record.points >= 100 &&
                                                        record.status ===
                                                            CARD_STATUS.ACTIVE
                                                            ? "#52c41a"
                                                            : undefined,
                                                    color:
                                                        record.points >= 100 &&
                                                        record.status ===
                                                            CARD_STATUS.ACTIVE
                                                            ? "white"
                                                            : undefined,
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Xóa thẻ">
                                            <Popconfirm
                                                title="Bạn có chắc chắn muốn xóa thẻ thành viên này?"
                                                onConfirm={() =>
                                                    handleDeleteCard(record.id)
                                                }
                                                okText="Xóa"
                                                cancelText="Hủy"
                                                placement="topRight"
                                            >
                                                <Button
                                                    icon={<DeleteOutlined />}
                                                    size="small"
                                                    danger
                                                    shape="circle"
                                                />
                                            </Popconfirm>
                                        </Tooltip>
                                    </Space>
                                ),
                            },
                        ]}
                        dataSource={cards}
                        rowKey="id"
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) =>
                                `Tổng ${total} thẻ thành viên`,
                            pageSizeOptions: ["10", "20", "50", "100"],
                            position: ["bottomRight"],
                        }}
                        onChange={handleTableChange}
                        loading={loading}
                        className="membership-card-table"
                        rowClassName={(record) =>
                            record.status === CARD_STATUS.EXPIRED
                                ? "expired-row"
                                : record.status === CARD_STATUS.BLOCKED
                                ? "blocked-row"
                                : ""
                        }
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <Text type="secondary">
                                            {searchText ||
                                            filterType !== "all" ||
                                            filterStatus !== "all"
                                                ? "Không tìm thấy thẻ thành viên phù hợp với bộ lọc"
                                                : "Chưa có thẻ thành viên nào"}
                                        </Text>
                                    }
                                >
                                    {searchText ||
                                    filterType !== "all" ||
                                    filterStatus !== "all" ? (
                                        <Button
                                            type="primary"
                                            onClick={handleResetFilters}
                                        >
                                            Xóa bộ lọc
                                        </Button>
                                    ) : (
                                        <Button
                                            type="primary"
                                            onClick={handleNewCard}
                                            disabled={
                                                availableCustomers.length === 0
                                            }
                                        >
                                            Tạo thẻ mới
                                        </Button>
                                    )}
                                </Empty>
                            ),
                        }}
                    />
                </Card>
            </div>

            {/* Modals và Drawers */}
            <CardForm
                open={isCardFormVisible}
                onCancel={() => setIsCardFormVisible(false)}
                onSubmit={handleCardSubmit}
                editingCard={selectedCard}
                TYPE_CONFIGS={TYPE_CONFIGS}
                customerList={availableCustomers}
            />

            <CardDetail
                open={isDetailVisible}
                onClose={() => setIsDetailVisible(false)}
                cardData={selectedCard}
                TYPE_CONFIGS={TYPE_CONFIGS}
                onRedeemPoints={handleRedeemPoints}
                onChangeStatus={handleChangeStatus}
                onDelete={handleDeleteCard}
            />

            <PointHistory
                open={isHistoryVisible}
                onClose={() => setIsHistoryVisible(false)}
                cardData={selectedCard}
                pointHistory={pointHistory}
            />

            <RedeemPoints
                open={isRedeemVisible}
                onCancel={() => setIsRedeemVisible(false)}
                onSubmit={handleRedeemSubmit}
                cardData={selectedCard}
                rewards={rewards}
            />
        </div>
    );
}
