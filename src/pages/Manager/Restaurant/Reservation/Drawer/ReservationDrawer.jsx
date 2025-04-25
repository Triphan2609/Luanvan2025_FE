import React from "react";
import { Drawer, Descriptions, Space, Button, Tag, Typography, Modal } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined,
    TableOutlined,
    FileTextOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { confirm } = Modal;

export default function ReservationDetailDrawer({ open, onClose, reservation, onEdit, onDelete }) {
    if (!reservation) return null;

    const showDeleteConfirm = () => {
        confirm({
            title: "Bạn có chắc chắn muốn hủy đặt bàn này?",
            icon: <ExclamationCircleOutlined />,
            content: "Hành động này không thể hoàn tác.",
            okText: "Hủy đặt",
            okType: "danger",
            cancelText: "Quay lại",
            onOk() {
                onDelete(reservation.id);
            },
        });
    };

    return (
        <Drawer
            title={`Chi tiết đặt bàn - ${reservation.customerName}`}
            placement="right"
            onClose={onClose}
            open={open}
            width={420}
            footer={
                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                    <Button icon={<EditOutlined />} onClick={() => onEdit(reservation)}>
                        Sửa
                    </Button>
                    <Button icon={<DeleteOutlined />} danger onClick={showDeleteConfirm}>
                        Hủy đặt
                    </Button>
                </Space>
            }
        >
            <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Khách hàng">
                    <UserOutlined /> {reservation.customerName}
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">{reservation.phone}</Descriptions.Item>

                <Descriptions.Item label="Số người">
                    <Tag color="blue">{reservation.numberOfPeople} người</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Khu vực">{reservation.areaName || "Không rõ"}</Descriptions.Item>

                <Descriptions.Item label="Bàn">
                    <TableOutlined /> {reservation.tableName}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày giờ">
                    <CalendarOutlined /> {reservation.date} &nbsp;
                    <ClockCircleOutlined /> {reservation.time}
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú">
                    <FileTextOutlined /> {reservation.note ? reservation.note : <Text type="secondary">Không có</Text>}
                </Descriptions.Item>
            </Descriptions>
        </Drawer>
    );
}
