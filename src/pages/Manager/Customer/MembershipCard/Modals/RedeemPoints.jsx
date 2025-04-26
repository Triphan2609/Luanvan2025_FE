import React, { useState, useEffect } from "react";
import { Modal, Form, InputNumber, Select, Card, Space, Input, Typography, Button, Alert, Divider } from "antd";

const { Text, Title } = Typography;
const { Option } = Select;

// Sample rewards data - should be moved to a separate file or API
const REWARDS = [
    {
        id: "R001",
        name: "Giảm 100,000đ",
        points: 100,
        type: "voucher",
        description: "Voucher giảm giá 100,000đ cho đặt phòng hoặc nhà hàng",
    },
    {
        id: "R002",
        name: "Nâng cấp phòng",
        points: 200,
        type: "upgrade",
        description: "Nâng cấp miễn phí lên hạng phòng cao hơn",
    },
    {
        id: "R003",
        name: "Buffet sáng miễn phí",
        points: 150,
        type: "dining",
        description: "Phiếu ăn sáng buffet miễn phí cho 2 người",
    },
];

const RedeemPoints = ({ open, onClose, cardData, onRedeem }) => {
    const [form] = Form.useForm();
    const [selectedReward, setSelectedReward] = useState(null);

    useEffect(() => {
        form.resetFields();
        setSelectedReward(null);
    }, [open, form]);

    const handleRewardSelect = (rewardId) => {
        const reward = REWARDS.find((r) => r.id === rewardId);
        setSelectedReward(reward);
        form.setFieldsValue({ points: reward.points });
    };

    const handleSubmit = async (values) => {
        await onRedeem({
            cardId: cardData.id,
            rewardId: values.rewardId,
            points: values.points,
            note: values.note,
        });
        onClose();
    };

    return (
        <Modal title="Đổi điểm thưởng" open={open} onCancel={onClose} footer={null} width={600}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Current Points Display */}
                <Card>
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Title level={5}>Số điểm hiện có</Title>
                        <Text style={{ fontSize: 24 }}>
                            {cardData?.points || 0} <Text type="secondary">điểm</Text>
                        </Text>
                    </Space>
                </Card>

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    {/* Reward Selection */}
                    <Form.Item name="rewardId" label="Chọn phần thưởng" rules={[{ required: true, message: "Vui lòng chọn phần thưởng!" }]}>
                        <Select placeholder="Chọn phần thưởng để đổi" onChange={handleRewardSelect}>
                            {REWARDS.map((reward) => (
                                <Option key={reward.id} value={reward.id} disabled={cardData?.points < reward.points}>
                                    {reward.name} ({reward.points} điểm)
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {/* Selected Reward Details */}
                    {selectedReward && (
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Space direction="vertical" style={{ width: "100%" }}>
                                <Text strong>{selectedReward.name}</Text>
                                <Text type="secondary">{selectedReward.description}</Text>
                                <Divider style={{ margin: "8px 0" }} />
                                <Text>
                                    Điểm cần đổi: <Text strong>{selectedReward.points}</Text>
                                </Text>
                                <Text type="secondary">Điểm còn lại sau khi đổi: {cardData?.points - selectedReward.points}</Text>
                            </Space>
                        </Card>
                    )}

                    {/* Points Input - Auto-filled but can be modified */}
                    <Form.Item
                        name="points"
                        label="Số điểm"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điểm!" },
                            {
                                validator: (_, value) =>
                                    value <= cardData?.points ? Promise.resolve() : Promise.reject("Số điểm không đủ!"),
                            },
                        ]}
                    >
                        <InputNumber style={{ width: "100%" }} min={1} max={cardData?.points} />
                    </Form.Item>

                    {/* Note Input */}
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    {/* Warning Message */}
                    <Alert
                        message="Lưu ý"
                        description="Điểm thưởng sau khi đổi không thể hoàn lại. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    {/* Submit Buttons */}
                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button onClick={onClose}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                Xác nhận đổi điểm
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Space>
        </Modal>
    );
};

export default RedeemPoints;
