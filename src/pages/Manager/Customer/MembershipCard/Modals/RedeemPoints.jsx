import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Card,
    Typography,
    Row,
    Col,
    Space,
    Badge,
    List,
    Statistic,
    Empty,
    Alert,
} from "antd";
import { GiftOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function RedeemPoints({
    open,
    onCancel,
    onSubmit,
    cardData,
    rewards,
}) {
    const [form] = Form.useForm();
    const [selectedReward, setSelectedReward] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && form) {
            form.resetFields();
        }
    }, [open, form]);

    const handleRewardSelect = (rewardId) => {
        // Tìm reward đã chọn từ danh sách
        const reward = rewards.find((r) => r.id === rewardId);
        setSelectedReward(reward);

        if (reward) {
            // Cập nhật số điểm và tên phần thưởng vào form
            form.setFieldsValue({
                points: reward.points,
                rewardName: reward.name,
            });
        }
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            setLoading(true);

            // Gọi function submit được truyền từ component cha
            onSubmit(values)
                .catch((error) => {
                    console.error("Error redeeming points:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        });
    };

    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    if (!cardData) return null;

    return (
        <Modal
            title="Đổi điểm thưởng"
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            okText="Xác nhận đổi điểm"
            cancelText="Hủy"
            confirmLoading={loading}
            width={700}
        >
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic
                            title="Điểm hiện tại"
                            value={cardData.points}
                            suffix="điểm"
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="Điểm sẽ còn lại"
                            value={
                                cardData.points -
                                (selectedReward ? selectedReward.points : 0)
                            }
                            suffix="điểm"
                            valueStyle={{
                                color:
                                    selectedReward &&
                                    cardData.points < selectedReward.points
                                        ? "#ff4d4f"
                                        : undefined,
                            }}
                        />
                    </Col>
                </Row>
            </Card>

            {cardData.points < 100 && (
                <Alert
                    message="Không đủ điểm để đổi"
                    description="Khách hàng cần tích lũy ít nhất 100 điểm để đổi phần thưởng."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            <Form
                form={form}
                layout="vertical"
                disabled={cardData.points < 100}
            >
                <Form.Item
                    name="rewardId"
                    label="Chọn phần thưởng"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn phần thưởng",
                        },
                    ]}
                >
                    <Select
                        placeholder="Chọn phần thưởng để đổi"
                        onChange={handleRewardSelect}
                    >
                        {rewards.length > 0 ? (
                            rewards.map((reward) => (
                                <Option key={reward.id} value={reward.id}>
                                    <Space>
                                        <Text strong>{reward.name}</Text>
                                        <Badge
                                            count={reward.points + " điểm"}
                                            style={{
                                                backgroundColor: "#1890ff",
                                            }}
                                        />
                                        {cardData.points < reward.points && (
                                            <Text type="danger">
                                                (Không đủ điểm)
                                            </Text>
                                        )}
                                    </Space>
                                </Option>
                            ))
                        ) : (
                            <Option disabled>
                                Không có phần thưởng khả dụng
                            </Option>
                        )}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="points"
                    label="Số điểm cần đổi"
                    rules={[
                        { required: true, message: "Vui lòng nhập số điểm" },
                        {
                            validator: (_, value) => {
                                if (value > cardData.points) {
                                    return Promise.reject(
                                        "Không đủ điểm để đổi"
                                    );
                                }
                                return Promise.resolve();
                            },
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={1}
                        max={cardData.points}
                        readOnly
                    />
                </Form.Item>

                <Form.Item name="rewardName" hidden>
                    <Input />
                </Form.Item>

                <Form.Item name="description" label="Ghi chú">
                    <TextArea rows={3} placeholder="Nhập ghi chú nếu cần" />
                </Form.Item>
            </Form>

            {selectedReward && (
                <Card title="Thông tin phần thưởng" size="small">
                    <List.Item>
                        <List.Item.Meta
                            title={selectedReward.name}
                            description={
                                <Space direction="vertical">
                                    <Text>{selectedReward.description}</Text>
                                    <Badge
                                        count={selectedReward.points + " điểm"}
                                        style={{ backgroundColor: "#1890ff" }}
                                    />
                                </Space>
                            }
                        />
                    </List.Item>
                </Card>
            )}
        </Modal>
    );
}
