import React, { useState } from "react";
import { Drawer, Descriptions, Button, Space, Tag, Divider, Timeline, Statistic, Row, Col, Badge, Card } from "antd";
import { HomeOutlined, TeamOutlined, DollarOutlined, HistoryOutlined, EditOutlined, CalendarOutlined } from "@ant-design/icons";

export default function RoomDetailDrawer({ open, onClose, room, onEdit, onBook }) {
    if (!room) return null;

    return (
        <Drawer
            title={
                <Space>
                    <HomeOutlined />
                    {room.roomCode}
                    <Badge
                        status={room.status === "Available" ? "success" : "error"}
                        text={room.status === "Available" ? "Còn trống" : "Đã đặt"}
                    />
                </Space>
            }
            width={600}
            open={open}
            onClose={onClose}
            extra={
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => onEdit(room)}>
                        Chỉnh sửa
                    </Button>
                    {room.status === "Available" && (
                        <Button type="primary" icon={<CalendarOutlined />} onClick={() => onBook(room)}>
                            Đặt phòng
                        </Button>
                    )}
                </Space>
            }
        >
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Statistic
                        title="Giá phòng"
                        value={room.price}
                        prefix={<DollarOutlined />}
                        suffix="đ/đêm"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    />
                </Col>
                <Col span={12}>
                    <Statistic title="Sức chứa" value={room.capacity} prefix={<TeamOutlined />} suffix="người" />
                </Col>
            </Row>

            <Divider />

            <Descriptions bordered column={1}>
                <Descriptions.Item label="Loại phòng">{room.roomType}</Descriptions.Item>
                <Descriptions.Item label="Tầng">{room.floor}</Descriptions.Item>
                <Descriptions.Item label="Tiện nghi">
                    <Space wrap>
                        {room.amenities.map((item) => (
                            <Tag key={item}>{item}</Tag>
                        ))}
                    </Space>
                </Descriptions.Item>
                {room.description && <Descriptions.Item label="Mô tả">{room.description}</Descriptions.Item>}
            </Descriptions>

            <Divider orientation="left">
                <Space>
                    <HistoryOutlined />
                    Lịch sử đặt phòng gần đây
                </Space>
            </Divider>

            <Timeline
                items={[
                    {
                        color: "green",
                        children: "Nguyễn Văn A - Check-out 20/04/2025",
                    },
                    {
                        color: "green",
                        children: "Trần Thị B - Check-out 15/04/2025",
                    },
                ]}
            />
        </Drawer>
    );
}
