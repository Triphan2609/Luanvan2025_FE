import React from "react";
import { Drawer, Descriptions, Tag, Space, Button, Card, Row, Col, Progress, Statistic } from "antd";
import { CrownOutlined, GiftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const CardDetail = ({ open, onClose, cardData, TYPE_CONFIGS, onRedeemPoints }) => {
    if (!cardData) return null;

    const typeConfig = TYPE_CONFIGS[cardData.type];
    const progressPercent = Math.min(100, (cardData.totalSpent / typeConfig.minSpent) * 100);

    return (
        <Drawer
            title="Chi tiết thẻ thành viên"
            placement="right"
            onClose={onClose}
            open={open}
            width={600}
            extra={
                <Space>
                    <Button icon={<GiftOutlined />} onClick={() => onRedeemPoints(cardData)} disabled={cardData.points < 100}>
                        Đổi điểm
                    </Button>
                    <Button type="primary" onClick={onClose}>
                        Đóng
                    </Button>
                </Space>
            }
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Thông tin thẻ */}
                <Card>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Space align="center">
                                <CrownOutlined
                                    style={{
                                        fontSize: 24,
                                        color: typeConfig.color,
                                    }}
                                />
                                <Tag color={typeConfig.color}>Thẻ {typeConfig.name}</Tag>
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Statistic title="Điểm tích lũy" value={cardData.points} suffix="điểm" />
                        </Col>
                        <Col span={12}>
                            <Statistic
                                title="Tổng chi tiêu"
                                value={cardData.totalSpent}
                                formatter={(value) =>
                                    new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(value)
                                }
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Tiến trình nâng hạng */}
                <Card title="Tiến trình nâng hạng">
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Progress percent={progressPercent} status="active" strokeColor={typeConfig.color} />
                        <small>
                            Cần chi tiêu thêm{" "}
                            {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                            }).format(Math.max(0, typeConfig.minSpent - cardData.totalSpent))}
                            để duy trì hạng
                        </small>
                    </Space>
                </Card>

                {/* Chi tiết thông tin */}
                <Card title="Thông tin chi tiết">
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Mã thẻ">{cardData.id}</Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{cardData.customerName}</Descriptions.Item>
                        <Descriptions.Item label="Ngày cấp">{dayjs(cardData.issueDate).format("DD/MM/YYYY")}</Descriptions.Item>
                        <Descriptions.Item label="Ngày hết hạn">{dayjs(cardData.expireDate).format("DD/MM/YYYY")}</Descriptions.Item>
                        <Descriptions.Item label="Quyền lợi">
                            <ul>
                                {typeConfig.benefits.map((benefit, index) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Space>
        </Drawer>
    );
};

export default CardDetail;
