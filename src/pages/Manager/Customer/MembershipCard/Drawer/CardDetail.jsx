import React, { useEffect } from "react";
import {
    Drawer,
    Descriptions,
    Tag,
    Card,
    Statistic,
    Progress,
    Button,
    Space,
    List,
    Timeline,
    Typography,
    Divider,
    Row,
    Col,
    Dropdown,
    Menu,
    Modal,
    Popconfirm,
} from "antd";
import {
    CrownOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
    MoreOutlined,
    GiftOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { CARD_STATUS } from "../constants";

const { Text, Title } = Typography;

export default function CardDetail({
    open,
    onClose,
    cardData,
    TYPE_CONFIGS,
    onRedeemPoints,
    onChangeStatus,
    onDelete,
}) {
    // Debug data
    useEffect(() => {
        if (open && cardData) {
            console.log("Card detail data:", cardData);
        }
    }, [open, cardData]);

    if (!cardData) return null;

    // Hàm xử lý khi người dùng muốn thay đổi trạng thái thẻ
    const handleStatusChange = (newStatus) => {
        Modal.confirm({
            title: "Xác nhận thay đổi trạng thái",
            content: `Bạn có chắc muốn thay đổi trạng thái thẻ thành "${
                newStatus === CARD_STATUS.ACTIVE
                    ? "Hoạt động"
                    : newStatus === CARD_STATUS.EXPIRED
                    ? "Hết hạn"
                    : "Đã khóa"
            }"?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            onOk: () => {
                // Gọi hàm onChangeStatus được truyền từ component cha
                onChangeStatus(cardData.id, newStatus);
            },
        });
    };

    // Định dạng tiền VND
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    // Menu dropdown cho trạng thái thẻ
    const statusDropdownItems = [
        {
            key: CARD_STATUS.ACTIVE,
            label: "Đặt trạng thái Hoạt động",
            icon: <CheckCircleOutlined style={{ color: "green" }} />,
            disabled: cardData.status === CARD_STATUS.ACTIVE,
            onClick: () => handleStatusChange(CARD_STATUS.ACTIVE),
        },
        {
            key: CARD_STATUS.EXPIRED,
            label: "Đặt trạng thái Hết hạn",
            icon: <ClockCircleOutlined style={{ color: "orange" }} />,
            disabled: cardData.status === CARD_STATUS.EXPIRED,
            onClick: () => handleStatusChange(CARD_STATUS.EXPIRED),
        },
        {
            key: CARD_STATUS.BLOCKED,
            label: "Đặt trạng thái Đã khóa",
            icon: <StopOutlined style={{ color: "red" }} />,
            disabled: cardData.status === CARD_STATUS.BLOCKED,
            onClick: () => handleStatusChange(CARD_STATUS.BLOCKED),
        },
    ];

    // Xác định màu và nhãn trạng thái
    const statusConfig = {
        [CARD_STATUS.ACTIVE]: {
            color: "green",
            text: "Hoạt động",
        },
        [CARD_STATUS.EXPIRED]: {
            color: "red",
            text: "Hết hạn",
        },
        [CARD_STATUS.BLOCKED]: {
            color: "default",
            text: "Đã khóa",
        },
    };

    return (
        <Drawer
            title={
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>Chi tiết thẻ thành viên #{cardData.id}</span>
                    <Space>
                        <Button
                            type="primary"
                            icon={<GiftOutlined />}
                            onClick={() => onRedeemPoints(cardData)}
                            disabled={
                                cardData.points < 100 ||
                                cardData.status !== CARD_STATUS.ACTIVE
                            }
                        >
                            Đổi điểm
                        </Button>
                        <Popconfirm
                            title="Xóa thẻ thành viên"
                            description="Bạn có chắc chắn muốn xóa thẻ thành viên này? Hành động này không thể hoàn tác!"
                            onConfirm={() => {
                                onDelete(cardData.id);
                                onClose();
                            }}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            icon={<DeleteOutlined style={{ color: "red" }} />}
                        >
                            <Button danger icon={<DeleteOutlined />}>
                                Xóa thẻ
                            </Button>
                        </Popconfirm>
                        <Dropdown
                            menu={{ items: statusDropdownItems }}
                            trigger={["click"]}
                            disabled={!onChangeStatus}
                        >
                            <Button icon={<MoreOutlined />}>Thao tác</Button>
                        </Dropdown>
                    </Space>
                </div>
            }
            placement="right"
            width={640}
            onClose={onClose}
            open={open}
        >
            <div className="card-detail">
                <Card>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Statistic
                                title="Hạng thẻ"
                                value={TYPE_CONFIGS[cardData.type].name}
                                prefix={
                                    <CrownOutlined
                                        style={{
                                            color: TYPE_CONFIGS[cardData.type]
                                                .color,
                                        }}
                                    />
                                }
                            />
                        </Col>
                        <Col span={12}>
                            <Statistic
                                title="Điểm tích lũy"
                                value={cardData.points}
                                suffix="điểm"
                            />
                        </Col>
                    </Row>
                </Card>

                <Divider />

                <Descriptions
                    title="Thông tin thẻ"
                    bordered
                    column={1}
                    layout="vertical"
                >
                    <Descriptions.Item label="ID Thẻ">
                        {cardData.id}
                    </Descriptions.Item>
                    <Descriptions.Item label="Khách hàng">
                        <Space direction="vertical">
                            <Text strong>{cardData.customerName}</Text>
                            <Text type="secondary">
                                Mã KH:{" "}
                                {cardData.customer?.customer_code || "N/A"}
                            </Text>
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={statusConfig[cardData.status].color}>
                            {statusConfig[cardData.status].text}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Hiệu lực">
                        <Text>Từ: {cardData.issueDate}</Text>
                        <br />
                        <Text>Đến: {cardData.expireDate}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng chi tiêu">
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Text>{formatCurrency(cardData.totalSpent)}</Text>
                            <Progress
                                percent={Math.min(
                                    100,
                                    (cardData.totalSpent /
                                        TYPE_CONFIGS[cardData.type].minSpent) *
                                        100
                                )}
                                size="small"
                            />
                            {cardData.type !== "platinum" && (
                                <Text type="secondary">
                                    Còn{" "}
                                    {formatCurrency(
                                        cardData.type === "silver"
                                            ? TYPE_CONFIGS.gold.minSpent -
                                                  cardData.totalSpent
                                            : TYPE_CONFIGS.platinum.minSpent -
                                                  cardData.totalSpent
                                    )}{" "}
                                    để lên hạng{" "}
                                    {cardData.type === "silver"
                                        ? TYPE_CONFIGS.gold.name
                                        : TYPE_CONFIGS.platinum.name}
                                </Text>
                            )}
                        </Space>
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                {cardData.recentPointHistory &&
                    cardData.recentPointHistory.length > 0 && (
                        <>
                            <Title level={5}>Lịch sử điểm gần đây</Title>
                            <List
                                size="small"
                                dataSource={cardData.recentPointHistory}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={
                                                <Space>
                                                    <Text
                                                        type={
                                                            item.points > 0
                                                                ? "success"
                                                                : "danger"
                                                        }
                                                    >
                                                        {item.points > 0
                                                            ? "+"
                                                            : ""}
                                                        {item.points} điểm
                                                    </Text>
                                                    <Text type="secondary">
                                                        {new Date(
                                                            item.createdAt
                                                        ).toLocaleString()}
                                                    </Text>
                                                </Space>
                                            }
                                            description={
                                                item.description ||
                                                (item.type === "add"
                                                    ? "Cộng điểm"
                                                    : item.type === "redeem"
                                                    ? "Đổi điểm"
                                                    : "Điều chỉnh điểm")
                                            }
                                        />
                                        {item.amount && (
                                            <div>
                                                {formatCurrency(item.amount)}
                                            </div>
                                        )}
                                    </List.Item>
                                )}
                            />
                        </>
                    )}
            </div>
        </Drawer>
    );
}
