import React from "react";
import {
    Drawer,
    Descriptions,
    Button,
    Tag,
    Space,
    Image,
    Typography,
    Divider,
    Badge,
    Popconfirm,
    Progress,
} from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    InboxOutlined,
    ShopOutlined,
    DollarOutlined,
    TagsOutlined,
    InfoCircleOutlined,
    ToolOutlined,
    SyncOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const getItemTypeInfo = (type) => {
    switch (type) {
        case "long_term":
            return {
                label: "Dài hạn",
                color: "#108ee9",
                icon: <ClockCircleOutlined />,
                description: "Vật dụng sử dụng lâu dài, có thể tái sử dụng",
            };
        case "single_use":
            return {
                label: "Dùng 1 lần",
                color: "#f50",
                icon: <InfoCircleOutlined />,
                description:
                    "Vật dụng dùng 1 lần và không thu hồi sau khi sử dụng",
            };
        case "multiple_use":
            return {
                label: "Dùng nhiều lần",
                color: "#87d068",
                icon: <SyncOutlined />,
                description:
                    "Vật dụng có thể sử dụng giới hạn số lần trước khi thay mới",
            };
        default:
            return {
                label: "Dài hạn",
                color: "#108ee9",
                icon: <ClockCircleOutlined />,
                description: "Vật dụng sử dụng lâu dài, có thể tái sử dụng",
            };
    }
};

export default function StuffDetailDrawer({
    open,
    onClose,
    stuff,
    onEdit,
    onDelete,
}) {
    if (!open || !stuff) return null;

    const itemTypeInfo = getItemTypeInfo(stuff.itemType);

    return (
        <Drawer
            title={
                <Space>
                    <InboxOutlined />
                    {stuff.name}
                </Space>
            }
            width={600}
            open={open}
            onClose={onClose}
            extra={
                <Space>
                    <Button icon={<EditOutlined />} onClick={onEdit}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa vật dụng này?"
                        onConfirm={onDelete}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            }
        >
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                {stuff.image ? (
                    <Image
                        src={stuff.image}
                        alt={stuff.name}
                        height={200}
                        style={{ objectFit: "contain" }}
                        fallback="error"
                    />
                ) : (
                    <InboxOutlined
                        style={{
                            fontSize: 100,
                            color: "#d9d9d9",
                            display: "block",
                            margin: "20px auto",
                        }}
                    />
                )}
            </div>

            <Descriptions bordered column={1}>
                <Descriptions.Item label="Tên vật dụng">
                    {stuff.name}
                </Descriptions.Item>

                <Descriptions.Item label="Loại sử dụng">
                    <Space direction="vertical">
                        <Space>
                            {itemTypeInfo.icon}{" "}
                            <Tag color={itemTypeInfo.color}>
                                {itemTypeInfo.label}
                            </Tag>
                        </Space>
                        <Text type="secondary">{itemTypeInfo.description}</Text>
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Danh mục">
                    <Space>
                        <TagsOutlined />
                        {stuff.category?.name || "Không xác định"}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả">
                    {stuff.description || "Không có mô tả"}
                </Descriptions.Item>

                <Descriptions.Item label="Đơn giá">
                    <Space>
                        <DollarOutlined />
                        {stuff.unitPrice
                            ? `${stuff.unitPrice.toLocaleString("vi-VN")} VNĐ`
                            : "Không có"}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Số lượng">
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>Trong kho:</span>
                            <Text strong>{stuff.stockQuantity || 0}</Text>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>Đang sử dụng:</span>
                            <Text strong>{stuff.inUseQuantity || 0}</Text>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>Tổng cộng:</span>
                            <Text strong>
                                {(stuff.stockQuantity || 0) +
                                    (stuff.inUseQuantity || 0)}
                            </Text>
                        </div>

                        <Progress
                            percent={
                                ((stuff.inUseQuantity || 0) /
                                    ((stuff.stockQuantity || 0) +
                                        (stuff.inUseQuantity || 0))) *
                                100
                            }
                            showInfo={false}
                            status="active"
                            strokeColor={
                                stuff.stockQuantity === 0
                                    ? "#ff4d4f"
                                    : "#1890ff"
                            }
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Text type="secondary">Trong kho</Text>
                            <Text type="secondary">Đang sử dụng</Text>
                        </div>
                    </Space>
                </Descriptions.Item>

                {stuff.itemType === "multiple_use" && (
                    <Descriptions.Item label="Số lần sử dụng">
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span>Đã sử dụng:</span>
                                <Text strong>{stuff.currentUses || 0}</Text>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span>Tối đa:</span>
                                <Text strong>
                                    {stuff.maxUses || "Không giới hạn"}
                                </Text>
                            </div>
                            {stuff.maxUses > 0 && (
                                <>
                                    <Progress
                                        percent={
                                            ((stuff.currentUses || 0) /
                                                (stuff.maxUses || 1)) *
                                            100
                                        }
                                        format={(percent) =>
                                            `${stuff.currentUses || 0}/${
                                                stuff.maxUses || 0
                                            }`
                                        }
                                        status={
                                            (stuff.currentUses || 0) >=
                                            (stuff.maxUses || 0)
                                                ? "exception"
                                                : "active"
                                        }
                                    />
                                </>
                            )}
                        </Space>
                    </Descriptions.Item>
                )}

                <Descriptions.Item label="Trạng thái">
                    {stuff.stockQuantity > 0 ? (
                        <Badge status="success" text="Còn hàng" />
                    ) : stuff.stockQuantity === 0 && stuff.inUseQuantity > 0 ? (
                        <Badge
                            status="warning"
                            text="Hết hàng (có đang sử dụng)"
                        />
                    ) : (
                        <Badge status="error" text="Hết hàng" />
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="Chi nhánh">
                    <Space>
                        <ShopOutlined />
                        {stuff.branch?.name || "Không xác định"}
                    </Space>
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            {stuff.itemType === "single_use" && (
                <div style={{ marginTop: 16 }}>
                    <Title level={5}>
                        <InfoCircleOutlined /> Lưu ý về vật dụng dùng 1 lần
                    </Title>
                    <Text>
                        Vật dụng này chỉ được dùng một lần và sẽ bị trừ khỏi kho
                        khi được sử dụng. Sau khi phòng trả, vật dụng này sẽ
                        không được hoàn trả vào kho.
                    </Text>
                </div>
            )}

            {stuff.itemType === "multiple_use" && (
                <div style={{ marginTop: 16 }}>
                    <Title level={5}>
                        <SyncOutlined /> Thông tin vật dụng dùng nhiều lần
                    </Title>
                    <Text>
                        Vật dụng này có thể sử dụng{" "}
                        {stuff.maxUses || "không giới hạn"} lần trước khi cần
                        thay mới. Hiện tại đã sử dụng {stuff.currentUses || 0}{" "}
                        lần.
                        {stuff.maxUses > 0 &&
                            stuff.currentUses >= stuff.maxUses && (
                                <Text strong type="danger">
                                    {" "}
                                    Đã đạt giới hạn sử dụng và cần được thay
                                    thế.
                                </Text>
                            )}
                    </Text>
                </div>
            )}

            {stuff.itemType === "long_term" && (
                <div style={{ marginTop: 16 }}>
                    <Title level={5}>
                        <ClockCircleOutlined /> Thông tin vật dụng dài hạn
                    </Title>
                    <Text>
                        Vật dụng này được sử dụng lâu dài và được hoàn trả về
                        kho sau khi phòng trả. Đây là loại vật dụng cố định và
                        có thể tái sử dụng nhiều lần.
                    </Text>
                </div>
            )}
        </Drawer>
    );
}
