import React, { useState, useEffect, useCallback } from "react";
import {
    Card,
    Button,
    Table,
    Space,
    Tag,
    Typography,
    Input,
    Select,
    Row,
    Col,
    Tooltip,
    Popconfirm,
    message,
    Avatar,
    Statistic,
    Empty,
    Image,
} from "antd";
import {
    PlusOutlined,
    GiftOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FilterOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import { debounce } from "lodash";
import RewardForm from "./Modals/RewardForm";
import { REWARD_STATUS, STATUS_CONFIG } from "./constants";
import {
    getAllRewards,
    getRewardById,
    createReward,
    updateReward,
    deleteReward,
    updateRewardStatus,
} from "../../../../api/rewardsApi";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function RewardManagement() {
    // States
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedReward, setSelectedReward] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [statistics, setStatistics] = useState({
        totalRewards: 0,
        activeRewards: 0,
        inactiveRewards: 0,
        averagePoints: 0,
    });

    // Load data
    useEffect(() => {
        fetchRewards();
    }, []);

    // Fetch rewards
    const fetchRewards = async (params = {}) => {
        try {
            setLoading(true);
            message.loading({
                content: "Đang tải danh sách phần thưởng...",
                key: "rewardsLoading",
            });

            // Default params
            const queryParams = {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
                ...params,
            };

            // Add status filter if not 'all'
            if (filterStatus !== "all") {
                queryParams.status = filterStatus;
            }

            const response = await getAllRewards(queryParams);

            if (response && Array.isArray(response.data)) {
                setRewards(response.data);
                setPagination((prev) => ({
                    ...prev,
                    total: response.total || 0,
                }));

                // Calculate statistics
                const stats = {
                    totalRewards: response.total || 0,
                    activeRewards: response.data.filter(
                        (r) => r.status === REWARD_STATUS.ACTIVE
                    ).length,
                    inactiveRewards: response.data.filter(
                        (r) => r.status === REWARD_STATUS.INACTIVE
                    ).length,
                    averagePoints: response.data.length
                        ? Math.round(
                              response.data.reduce(
                                  (sum, r) => sum + r.points,
                                  0
                              ) / response.data.length
                          )
                        : 0,
                };
                setStatistics(stats);
            } else {
                setRewards([]);
                setPagination((prev) => ({
                    ...prev,
                    total: 0,
                }));
                message.info({
                    content: "Không có dữ liệu phần thưởng",
                    key: "rewardsLoading",
                });
            }
        } catch (error) {
            console.error("Error fetching rewards:", error);
            message.error({
                content:
                    "Không thể tải danh sách phần thưởng: " +
                    (error.message || "Lỗi không xác định"),
                key: "rewardsLoading",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle search
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchText(value);
            setPagination((prev) => ({ ...prev, current: 1 }));
            fetchRewards({ search: value, page: 1 });
        }, 500),
        []
    );

    const handleSearch = (value) => {
        debouncedSearch(value);
    };

    // Handle filter change
    const handleFilterChange = (value) => {
        setFilterStatus(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchRewards({ status: value !== "all" ? value : undefined, page: 1 });
    };

    // Handle table pagination
    const handleTableChange = (paginationData) => {
        setPagination(paginationData);
        fetchRewards({
            page: paginationData.current,
            limit: paginationData.pageSize,
        });
    };

    // Handle crud operations
    const handleNewReward = () => {
        setSelectedReward(null);
        setIsFormVisible(true);
    };

    const handleEditReward = async (id) => {
        try {
            setLoading(true);
            const reward = await getRewardById(id);
            setSelectedReward(reward);
            setIsFormVisible(true);
        } catch (error) {
            console.error("Error fetching reward details:", error);
            message.error("Không thể tải thông tin phần thưởng");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReward = async (id) => {
        try {
            setLoading(true);
            await deleteReward(id);
            message.success("Xóa phần thưởng thành công");
            fetchRewards({ page: 1 });
        } catch (error) {
            console.error("Error deleting reward:", error);
            message.error(
                "Không thể xóa phần thưởng: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            setLoading(true);

            const newStatus =
                currentStatus === REWARD_STATUS.ACTIVE
                    ? REWARD_STATUS.INACTIVE
                    : REWARD_STATUS.ACTIVE;

            await updateRewardStatus(id, newStatus);

            message.success(
                `Đã ${
                    newStatus === REWARD_STATUS.ACTIVE
                        ? "kích hoạt"
                        : "vô hiệu hóa"
                } phần thưởng`
            );

            // Update the rewards list
            setRewards(
                rewards.map((reward) =>
                    reward.id === id ? { ...reward, status: newStatus } : reward
                )
            );
        } catch (error) {
            console.error("Error toggling reward status:", error);
            message.error(
                "Không thể cập nhật trạng thái: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (values) => {
        try {
            setFormLoading(true);

            if (selectedReward) {
                // Update existing reward
                await updateReward(selectedReward.id, values);
                message.success("Cập nhật phần thưởng thành công");
            } else {
                // Create new reward
                await createReward(values);
                message.success("Tạo phần thưởng mới thành công");
            }

            setIsFormVisible(false);
            fetchRewards();
        } catch (error) {
            console.error("Error submitting reward form:", error);
            message.error(
                "Không thể lưu phần thưởng: " +
                    (error.message || "Lỗi không xác định")
            );
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormCancel = () => {
        setIsFormVisible(false);
        setSelectedReward(null);
    };

    // Format number with commas
    const formatNumber = (num) => {
        return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
    };

    // Render status tag
    const renderStatus = (status) => {
        const config =
            STATUS_CONFIG[status] || STATUS_CONFIG[REWARD_STATUS.INACTIVE];
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    // Table columns
    const columns = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            width: 60,
        },
        {
            title: "Hình ảnh",
            dataIndex: "image",
            key: "image",
            width: 90,
            render: (image) =>
                image ? (
                    <Avatar
                        shape="square"
                        size={64}
                        src={image}
                        alt="Hình ảnh"
                    />
                ) : (
                    <Avatar
                        shape="square"
                        size={64}
                        icon={<GiftOutlined />}
                        style={{ backgroundColor: "#f56a00" }}
                    />
                ),
        },
        {
            title: "Tên phần thưởng",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    {record.description && (
                        <Text
                            type="secondary"
                            ellipsis={{ tooltip: record.description }}
                        >
                            {record.description}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: "Điểm",
            dataIndex: "points",
            key: "points",
            width: 100,
            render: (points) => (
                <Text style={{ fontWeight: "bold", color: "#f5222d" }}>
                    {formatNumber(points)}
                </Text>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status) => renderStatus(status),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: (date) => (
                <Text>{new Date(date).toLocaleDateString("vi-VN")}</Text>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditReward(record.id)}
                        />
                    </Tooltip>

                    <Tooltip
                        title={
                            record.status === REWARD_STATUS.ACTIVE
                                ? "Vô hiệu hóa"
                                : "Kích hoạt"
                        }
                    >
                        <Button
                            type={
                                record.status === REWARD_STATUS.ACTIVE
                                    ? "default"
                                    : "primary"
                            }
                            icon={
                                record.status === REWARD_STATUS.ACTIVE ? (
                                    <CloseCircleOutlined />
                                ) : (
                                    <CheckCircleOutlined />
                                )
                            }
                            size="small"
                            onClick={() =>
                                handleToggleStatus(record.id, record.status)
                            }
                            danger={record.status === REWARD_STATUS.ACTIVE}
                        />
                    </Tooltip>

                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa phần thưởng này?"
                            onConfirm={() => handleDeleteReward(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card" hoverable>
                        <Statistic
                            title="Tổng số phần thưởng"
                            value={statistics.totalRewards}
                            prefix={<GiftOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card" hoverable>
                        <Statistic
                            title="Phần thưởng đang hoạt động"
                            value={statistics.activeRewards}
                            valueStyle={{ color: "#52c41a" }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card" hoverable>
                        <Statistic
                            title="Phần thưởng không hoạt động"
                            value={statistics.inactiveRewards}
                            valueStyle={{ color: "#ff4d4f" }}
                            prefix={<CloseCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="stats-card" hoverable>
                        <Statistic
                            title="Điểm trung bình"
                            value={statistics.averagePoints}
                            valueStyle={{ color: "#722ed1" }}
                            suffix="điểm"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Controls */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Search
                            placeholder="Tìm kiếm phần thưởng..."
                            onSearch={handleSearch}
                            allowClear
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Lọc theo trạng thái"
                            value={filterStatus}
                            onChange={handleFilterChange}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value={REWARD_STATUS.ACTIVE}>
                                <Space>
                                    {STATUS_CONFIG[REWARD_STATUS.ACTIVE].icon}
                                    {STATUS_CONFIG[REWARD_STATUS.ACTIVE].text}
                                </Space>
                            </Option>
                            <Option value={REWARD_STATUS.INACTIVE}>
                                <Space>
                                    {STATUS_CONFIG[REWARD_STATUS.INACTIVE].icon}
                                    {STATUS_CONFIG[REWARD_STATUS.INACTIVE].text}
                                </Space>
                            </Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={8} lg={14} style={{ textAlign: "right" }}>
                        <Space>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => fetchRewards()}
                            >
                                Làm mới
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleNewReward}
                            >
                                Thêm phần thưởng
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Data Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={rewards}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Không có dữ liệu phần thưởng"
                            />
                        ),
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>

            {/* Reward Form Modal */}
            <RewardForm
                open={isFormVisible}
                onCancel={handleFormCancel}
                onSubmit={handleFormSubmit}
                initialData={selectedReward}
                confirmLoading={formLoading}
            />

            {/* CSS Styles */}
            <style jsx="true">{`
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
                .ant-avatar-square {
                    border-radius: 6px;
                }
            `}</style>
        </div>
    );
}
