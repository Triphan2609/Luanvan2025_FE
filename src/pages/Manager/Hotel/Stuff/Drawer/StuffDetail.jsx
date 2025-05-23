import React from "react";
import {
    Drawer,
    Descriptions,
    Tag,
    Typography,
    Button,
    Image,
    Empty,
    Space,
    Divider,
    Badge,
    Progress,
} from "antd";
import {
    ShopOutlined,
    DollarOutlined,
    TagsOutlined,
    InfoCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const StuffDetail = ({ open, onClose, stuffData }) => {
    if (!stuffData) return null;

    // Determine status based on stock quantity
    const getStatusInfo = () => {
        if (!stuffData.stockQuantity || stuffData.stockQuantity <= 0) {
            return {
                color: "#ff4d4f",
                label: "Hết hàng",
                status: "error",
            };
        } else if (stuffData.stockQuantity < 20) {
            // Sample threshold, should be dynamic in real application
            return {
                color: "#faad14",
                label: "Sắp hết",
                status: "warning",
            };
        } else {
            return {
                color: "#52c41a",
                label: "Còn hàng",
                status: "success",
            };
        }
    };

    const status = getStatusInfo();

    // Xác định thông tin loại vật dụng
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

    const itemTypeInfo = getItemTypeInfo(stuffData.itemType || "long_term");

    return (
        <Drawer
            title={
                <Space>
                    {itemTypeInfo.icon} {stuffData.name}
                </Space>
            }
            placement="right"
            onClose={onClose}
            open={open}
            width={600}
            extra={
                <Button type="primary" onClick={onClose}>
                    Đóng
                </Button>
            }
        >
            <div style={{ marginBottom: 20, textAlign: "center" }}>
                {stuffData.image ? (
                    <Image
                        src={stuffData.image}
                        alt={stuffData.name}
                        style={{
                            maxWidth: "100%",
                            maxHeight: 200,
                            objectFit: "contain",
                        }}
                        fallback="error"
                    />
                ) : (
                    <Empty
                        description="Không có ảnh"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
            </div>

            <Descriptions column={1} bordered>
                <Descriptions.Item label="Tên vật dụng">
                    {stuffData.name}
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
                        {stuffData.category?.name || "Không xác định"}
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Mô tả">
                    {stuffData.description || "Không có"}
                </Descriptions.Item>

                <Descriptions.Item label="Đơn giá">
                    <Space>
                        <DollarOutlined />
                        {stuffData.unitPrice
                            ? `${stuffData.unitPrice.toLocaleString(
                                  "vi-VN"
                              )} VNĐ`
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
                            <Text strong>{stuffData.stockQuantity || 0}</Text>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>Đang sử dụng:</span>
                            <Text strong>{stuffData.inUseQuantity || 0}</Text>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>Tổng cộng:</span>
                            <Text strong>
                                {(stuffData.stockQuantity || 0) +
                                    (stuffData.inUseQuantity || 0)}
                            </Text>
                        </div>

                        <Progress
                            percent={
                                ((stuffData.inUseQuantity || 0) /
                                    ((stuffData.stockQuantity || 0) +
                                        (stuffData.inUseQuantity || 0))) *
                                    100 || 0
                            }
                            showInfo={false}
                            status="active"
                            strokeColor={
                                stuffData.stockQuantity === 0
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

                {stuffData.itemType === "multiple_use" && (
                    <Descriptions.Item label="Số lần sử dụng">
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span>Đã sử dụng:</span>
                                <Text strong>{stuffData.currentUses || 0}</Text>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <span>Tối đa:</span>
                                <Text strong>
                                    {stuffData.maxUses || "Không giới hạn"}
                                </Text>
                            </div>
                            {stuffData.maxUses > 0 && (
                                <>
                                    <Progress
                                        percent={
                                            ((stuffData.currentUses || 0) /
                                                (stuffData.maxUses || 1)) *
                                            100
                                        }
                                        format={(percent) =>
                                            `${stuffData.currentUses || 0}/${
                                                stuffData.maxUses || 0
                                            }`
                                        }
                                        status={
                                            (stuffData.currentUses || 0) >=
                                            (stuffData.maxUses || 0)
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
                    <Badge status={status.status} text={status.label} />
                </Descriptions.Item>

                <Descriptions.Item label="Chi nhánh">
                    <Space>
                        <ShopOutlined />
                        {stuffData.branch?.name || "Không xác định"}
                    </Space>
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            {stuffData.itemType === "single_use" && (
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

            {stuffData.itemType === "multiple_use" && (
                <div style={{ marginTop: 16 }}>
                    <Title level={5}>
                        <SyncOutlined /> Thông tin vật dụng dùng nhiều lần
                    </Title>
                    <Text>
                        Vật dụng này có thể sử dụng{" "}
                        {stuffData.maxUses || "không giới hạn"} lần trước khi
                        cần thay mới. Hiện tại đã sử dụng{" "}
                        {stuffData.currentUses || 0} lần.
                        {stuffData.maxUses > 0 &&
                            stuffData.currentUses >= stuffData.maxUses && (
                                <Text strong type="danger">
                                    {" "}
                                    Đã đạt giới hạn sử dụng và cần được thay
                                    thế.
                                </Text>
                            )}
                    </Text>
                </div>
            )}

            {stuffData.itemType === "long_term" && (
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
};

export default StuffDetail;
