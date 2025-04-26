import React, { useState } from "react";
import { Card, Table, Space, Tag, Typography, Input, Select, Row, Col, Tooltip, Button, Rate, Badge, Statistic, message } from "antd";
import { MessageOutlined, StarOutlined, FilterOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import FeedbackDetail from "./components/FeedbackDetail";
import ResponseForm from "./components/ResponseForm";

const { Title, Text } = Typography;
const { Search } = Input;

// Constants
const FEEDBACK_STATUS = {
    NEW: "new",
    PROCESSING: "processing",
    RESOLVED: "resolved",
    CLOSED: "closed",
};

const FEEDBACK_TYPE = {
    ROOM: "room",
    RESTAURANT: "restaurant",
    SERVICE: "service",
    OTHER: "other",
};

export default function CustomerFeedback() {
    // States
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortedInfo, setSortedInfo] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Thêm states mới
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [isResponseVisible, setIsResponseVisible] = useState(false);
    const [feedbacks, setFeedbacks] = useState([
        {
            id: "FB001",
            customerId: "KH001",
            customerName: "Nguyễn Văn A",
            type: FEEDBACK_TYPE.ROOM,
            subject: "Phòng 301 - Điều hòa không mát",
            content: "Điều hòa trong phòng không đủ mát...",
            rating: 3,
            status: FEEDBACK_STATUS.NEW,
            createdAt: "2024-04-20 14:30",
            responses: [], // Thêm mảng responses
        },
        // Thêm dữ liệu mẫu khác...
    ]);

    const columns = [
        {
            title: "Mã PH",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Khách hàng",
            dataIndex: "customerName",
            key: "customerName",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{text}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        {record.customerId}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type) => {
                const colors = {
                    [FEEDBACK_TYPE.ROOM]: "blue",
                    [FEEDBACK_TYPE.RESTAURANT]: "green",
                    [FEEDBACK_TYPE.SERVICE]: "purple",
                    [FEEDBACK_TYPE.OTHER]: "default",
                };
                const labels = {
                    [FEEDBACK_TYPE.ROOM]: "Phòng",
                    [FEEDBACK_TYPE.RESTAURANT]: "Nhà hàng",
                    [FEEDBACK_TYPE.SERVICE]: "Dịch vụ",
                    [FEEDBACK_TYPE.OTHER]: "Khác",
                };
                return <Tag color={colors[type]}>{labels[type]}</Tag>;
            },
        },
        {
            title: "Tiêu đề",
            dataIndex: "subject",
            key: "subject",
            ellipsis: true,
        },
        {
            title: "Đánh giá",
            dataIndex: "rating",
            key: "rating",
            render: (rating) => <Rate disabled defaultValue={rating} />,
            sorter: (a, b) => a.rating - b.rating,
            sortOrder: sortedInfo.columnKey === "rating" && sortedInfo.order,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const configs = {
                    [FEEDBACK_STATUS.NEW]: { color: "red", text: "Mới" },
                    [FEEDBACK_STATUS.PROCESSING]: { color: "processing", text: "Đang xử lý" },
                    [FEEDBACK_STATUS.RESOLVED]: { color: "success", text: "Đã xử lý" },
                    [FEEDBACK_STATUS.CLOSED]: { color: "default", text: "Đã đóng" },
                };
                return <Badge status={configs[status].color} text={configs[status].text} />;
            },
        },
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            key: "createdAt",
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} size="small" />
                    </Tooltip>
                    {record.status === FEEDBACK_STATUS.NEW && (
                        <Tooltip title="Tiếp nhận">
                            <Button type="primary" icon={<CheckOutlined />} onClick={() => handleProcess(record)} size="small" />
                        </Tooltip>
                    )}
                    {record.status === FEEDBACK_STATUS.PROCESSING && (
                        <Tooltip title="Đánh dấu đã xử lý">
                            <Button type="primary" icon={<CheckOutlined />} onClick={() => handleResolve(record)} size="small" />
                        </Tooltip>
                    )}
                    {record.status !== FEEDBACK_STATUS.CLOSED && (
                        <Tooltip title="Đóng phản hồi">
                            <Button danger icon={<CloseOutlined />} onClick={() => handleClose(record)} size="small" />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    const handleViewDetail = (record) => {
        setSelectedFeedback(record);
        setIsDetailVisible(true);
    };

    const handleProcess = (record) => {
        setFeedbacks(feedbacks.map((item) => (item.id === record.id ? { ...item, status: FEEDBACK_STATUS.PROCESSING } : item)));
        message.success("Đã tiếp nhận phản hồi");
    };

    const handleResolve = (record) => {
        setFeedbacks(feedbacks.map((item) => (item.id === record.id ? { ...item, status: FEEDBACK_STATUS.RESOLVED } : item)));
        message.success("Đã xử lý phản hồi");
    };

    const handleClose = (record) => {
        setFeedbacks(feedbacks.map((item) => (item.id === record.id ? { ...item, status: FEEDBACK_STATUS.CLOSED } : item)));
        message.success("Đã đóng phản hồi");
    };

    const handleRespond = (feedback) => {
        setSelectedFeedback(feedback);
        setIsResponseVisible(true);
    };

    const handleResponseSubmit = (values) => {
        const response = {
            ...values,
            createdAt: new Date().toISOString(),
        };

        setFeedbacks(
            feedbacks.map((item) => {
                if (item.id === values.feedbackId) {
                    return {
                        ...item,
                        status: values.status,
                        responses: [...(item.responses || []), response],
                    };
                }
                return item;
            })
        );

        setIsResponseVisible(false);
        message.success("Đã gửi phản hồi");
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Statistics */}
                    <Row gutter={16}>
                        <Col span={6}>
                            <Statistic title="Tổng phản hồi" value={feedbacks.length} prefix={<MessageOutlined />} />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Chưa xử lý"
                                value={feedbacks.filter((f) => f.status === FEEDBACK_STATUS.NEW).length}
                                valueStyle={{ color: "#ff4d4f" }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Đang xử lý"
                                value={feedbacks.filter((f) => f.status === FEEDBACK_STATUS.PROCESSING).length}
                                valueStyle={{ color: "#1890ff" }}
                            />
                        </Col>
                        <Col span={6}>
                            <Statistic
                                title="Đánh giá trung bình"
                                value={feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length}
                                prefix={<StarOutlined />}
                                precision={1}
                            />
                        </Col>
                    </Row>

                    {/* Filters */}
                    <Row gutter={[16, 16]} align="middle">
                        <Col flex="auto">
                            <Space>
                                <Search
                                    placeholder="Tìm theo mã, tên khách hàng hoặc nội dung"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: 300 }}
                                    allowClear
                                />
                                <Select value={filterType} onChange={setFilterType} style={{ width: 150 }} placeholder="Loại phản hồi">
                                    <Select.Option value="all">Tất cả loại</Select.Option>
                                    {Object.entries(FEEDBACK_TYPE).map(([key, value]) => (
                                        <Select.Option key={key} value={value}>
                                            {value === "room"
                                                ? "Phòng"
                                                : value === "restaurant"
                                                ? "Nhà hàng"
                                                : value === "service"
                                                ? "Dịch vụ"
                                                : "Khác"}
                                        </Select.Option>
                                    ))}
                                </Select>
                                <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 150 }} placeholder="Trạng thái">
                                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                                    {Object.entries(FEEDBACK_STATUS).map(([key, value]) => (
                                        <Select.Option key={key} value={value}>
                                            {value === "new"
                                                ? "Mới"
                                                : value === "processing"
                                                ? "Đang xử lý"
                                                : value === "resolved"
                                                ? "Đã xử lý"
                                                : "Đã đóng"}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Space>
                        </Col>
                        <Col>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setSearchText("");
                                    setFilterType("all");
                                    setFilterStatus("all");
                                }}
                            >
                                Đặt lại
                            </Button>
                        </Col>
                    </Row>

                    {/* Table */}
                    <Table
                        columns={columns}
                        dataSource={feedbacks}
                        rowKey="id"
                        pagination={pagination}
                        onChange={(pagination, filters, sorter) => {
                            setPagination(pagination);
                            setSortedInfo(sorter);
                        }}
                        bordered
                    />
                </Space>
            </Card>

            {/* Thêm vào cuối div, trước thẻ đóng */}
            <FeedbackDetail
                open={isDetailVisible}
                onClose={() => setIsDetailVisible(false)}
                feedback={selectedFeedback}
                onRespond={handleRespond}
                FEEDBACK_TYPE={FEEDBACK_TYPE}
                FEEDBACK_STATUS={FEEDBACK_STATUS}
            />

            <ResponseForm
                open={isResponseVisible}
                onCancel={() => setIsResponseVisible(false)}
                onSubmit={handleResponseSubmit}
                feedback={selectedFeedback}
                FEEDBACK_STATUS={FEEDBACK_STATUS}
            />
        </div>
    );
}
