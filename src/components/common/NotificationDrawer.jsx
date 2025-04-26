import React from "react";
import { Drawer, List, Typography, Badge, Space, Button, Empty, Tabs } from "antd";
import { BellOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";

const { Text } = Typography;

const NotificationDrawer = ({ open, onClose }) => {
    const notifications = {
        unread: [
            {
                id: 1,
                type: "info",
                title: "Đặt phòng mới",
                message: "Khách hàng Nguyễn Văn A đã đặt phòng Deluxe",
                time: "5 phút trước",
            },
            {
                id: 2,
                type: "warning",
                title: "Cảnh báo tồn kho",
                message: "Một số mặt hàng sắp hết hàng",
                time: "15 phút trước",
            },
        ],
        read: [
            {
                id: 3,
                type: "success",
                title: "Thanh toán thành công",
                message: "Hóa đơn #HD001 đã được thanh toán",
                time: "1 giờ trước",
            },
        ],
    };

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
            case "warning":
                return <WarningOutlined style={{ color: "#faad14" }} />;
            case "info":
                return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
            default:
                return <BellOutlined />;
        }
    };

    const NotificationList = ({ items }) => (
        <List
            itemLayout="horizontal"
            dataSource={items}
            locale={{
                emptyText: <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
            }}
            renderItem={(item) => (
                <List.Item
                    actions={[
                        <Button type="text" icon={<CheckOutlined />} size="small">
                            Đã đọc
                        </Button>,
                        <Button type="text" icon={<DeleteOutlined />} size="small" danger>
                            Xóa
                        </Button>,
                    ]}
                >
                    <List.Item.Meta
                        avatar={getIcon(item.type)}
                        title={item.title}
                        description={
                            <Space direction="vertical" size={0}>
                                <Text>{item.message}</Text>
                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                    {item.time}
                                </Text>
                            </Space>
                        }
                    />
                </List.Item>
            )}
        />
    );

    const items = [
        {
            key: "unread",
            label: (
                <span>
                    Chưa đọc
                    <Badge count={notifications.unread.length} style={{ marginLeft: 8 }} />
                </span>
            ),
            children: <NotificationList items={notifications.unread} />,
        },
        {
            key: "read",
            label: "Đã đọc",
            children: <NotificationList items={notifications.read} />,
        },
    ];

    return (
        <Drawer
            title={
                <Space>
                    <BellOutlined />
                    Thông báo
                </Space>
            }
            placement="right"
            onClose={onClose}
            open={open}
            width={400}
            extra={
                <Space>
                    <Button type="link" size="small">
                        Đánh dấu tất cả đã đọc
                    </Button>
                </Space>
            }
        >
            <Tabs items={items} />
        </Drawer>
    );
};

export default NotificationDrawer;
