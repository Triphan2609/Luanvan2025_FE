import React from "react";
import { Drawer, Descriptions, Tag, Typography, Button } from "antd";

const { Text } = Typography;

const StuffDetail = ({
    open,
    onClose,
    stuffData,
    STATUS_LABELS, // Nhận constants từ props
    TYPE_LABELS,
    STATUS_COLORS,
}) => {
    if (!stuffData) return null;

    return (
        <Drawer
            title="Chi tiết vật dụng"
            placement="right"
            onClose={onClose}
            open={open}
            width={400}
            extra={
                <Button type="primary" onClick={onClose}>
                    Đóng
                </Button>
            }
        >
            <Descriptions column={1} bordered>
                <Descriptions.Item label="Tên vật dụng">{stuffData.name}</Descriptions.Item>
                <Descriptions.Item label="Loại">{TYPE_LABELS[stuffData.type]}</Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                    <Text strong>{stuffData.quantity}</Text> {stuffData.unit}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng tối thiểu">
                    {stuffData.minQuantity} {stuffData.unit}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={STATUS_COLORS[stuffData.status]}>{STATUS_LABELS[stuffData.status]}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">{stuffData.note || "Không có"}</Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
};

export default StuffDetail;
