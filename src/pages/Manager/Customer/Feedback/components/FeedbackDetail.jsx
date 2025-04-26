import React from "react";
import { Drawer, Descriptions, Tag, Space, Button, Timeline, Rate, Typography, Divider } from "antd";
import { MessageOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const FeedbackDetail = ({ open, onClose, feedback, onRespond, FEEDBACK_TYPE, FEEDBACK_STATUS }) => {
    if (!feedback) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case FEEDBACK_STATUS.NEW:
                return <ClockCircleOutlined style={{ color: "#ff4d4f" }} />;
            case FEEDBACK_STATUS.PROCESSING:
                return <ClockCircleOutlined style={{ color: "#1890ff" }} />;
            case FEEDBACK_STATUS.RESOLVED:
                return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
            case FEEDBACK_STATUS.CLOSED:
                return <CloseCircleOutlined style={{ color: "#d9d9d9" }} />;
            default:
                return null;
        }
    };

    return (
        <Drawer
            title="Chi tiết phản hồi"
            placement="right"
            width={700}
            onClose={onClose}
            open={open}
            extra={
                <Space>
                    {feedback.status !== FEEDBACK_STATUS.CLOSED && (
                        <Button type="primary" icon={<MessageOutlined />} onClick={() => onRespond(feedback)}>
                            Trả lời
                        </Button>
                    )}
                    <Button onClick={onClose}>Đóng</Button>
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Thông tin cơ bản */}
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Mã phản hồi" span={2}>
                        {feedback.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Khách hàng" span={2}>
                        {feedback.customerName}
                        <Tag style={{ marginLeft: 8 }}>{feedback.customerId}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại phản hồi">
                        <Tag
                            color={
                                feedback.type === "room"
                                    ? "blue"
                                    : feedback.type === "restaurant"
                                    ? "green"
                                    : feedback.type === "service"
                                    ? "purple"
                                    : "default"
                            }
                        >
                            {feedback.type === "room"
                                ? "Phòng"
                                : feedback.type === "restaurant"
                                ? "Nhà hàng"
                                : feedback.type === "service"
                                ? "Dịch vụ"
                                : "Khác"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đánh giá">
                        <Rate disabled defaultValue={feedback.rating} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian" span={2}>
                        {feedback.createdAt}
                    </Descriptions.Item>
                </Descriptions>

                {/* Nội dung phản hồi */}
                <div>
                    <Title level={5}>Tiêu đề</Title>
                    <Paragraph>{feedback.subject}</Paragraph>
                    <Title level={5}>Nội dung</Title>
                    <Paragraph>{feedback.content}</Paragraph>
                </div>

                <Divider />

                {/* Lịch sử xử lý */}
                <div>
                    <Title level={5}>Lịch sử xử lý</Title>
                    <Timeline
                        items={[
                            {
                                dot: getStatusIcon(FEEDBACK_STATUS.NEW),
                                children: (
                                    <Space direction="vertical">
                                        <Text>Tiếp nhận phản hồi</Text>
                                        <Text type="secondary">{feedback.createdAt}</Text>
                                    </Space>
                                ),
                            },
                            ...(feedback.responses || []).map((response, index) => ({
                                dot: getStatusIcon(response.status),
                                children: (
                                    <Space direction="vertical" key={index}>
                                        <Text>{response.content}</Text>
                                        <Text type="secondary">{response.createdAt}</Text>
                                        <Text type="secondary">Người xử lý: {response.staff}</Text>
                                    </Space>
                                ),
                            })),
                        ]}
                    />
                </div>
            </Space>
        </Drawer>
    );
};

export default FeedbackDetail;
