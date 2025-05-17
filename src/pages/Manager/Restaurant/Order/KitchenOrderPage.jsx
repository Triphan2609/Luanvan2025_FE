import React, { useState, useEffect, useRef } from "react";
import {
    Layout,
    Card,
    Table,
    Typography,
    Tag,
    Space,
    Button,
    Badge,
    Tabs,
    Divider,
    List,
    Avatar,
    message,
    Modal,
    Input,
    Select,
    Row,
    Col,
    Statistic,
    Tooltip,
    Timeline,
    notification,
    Alert,
    Empty,
} from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
    FireOutlined,
    TableOutlined,
    BellOutlined,
    RocketOutlined,
    InfoCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { kitchenOrderApi } from "../../../../api/restaurantApi";
import { restaurantOrderApi } from "../../../../api/restaurantOrderApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";

// Load dayjs plugins
dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Order status colors
const statusColors = {
    new: { color: "#1890ff", text: "Mới" },
    preparing: { color: "#faad14", text: "Đang chế biến" },
    served: { color: "#13c2c2", text: "Đã lên món" },
    completed: { color: "#52c41a", text: "Hoàn thành" },
    cancelled: { color: "#f5222d", text: "Đã hủy" },
};

// Priority colors
const priorityColors = {
    normal: { color: "#1890ff", text: "Thường" },
    high: { color: "#fa8c16", text: "Ưu tiên" },
    urgent: { color: "#f5222d", text: "Khẩn cấp" },
};

export default function KitchenOrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("new");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [completeOrderModal, setCompleteOrderModal] = useState(false);
    const [completionNotes, setCompletionNotes] = useState("");
    const [orderSound] = useState(() => new Audio("/sounds/notification.mp3"));
    const orderSoundRef = useRef(orderSound);
    const pollingInterval = useRef(null);
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [loadingBranches, setLoadingBranches] = useState(false);

    useEffect(() => {
        const fetchBranches = async () => {
            setLoadingBranches(true);
            try {
                const restaurantBranches = await getRestaurantBranches();
                setBranches(restaurantBranches);
                if (restaurantBranches.length > 0) {
                    const savedBranchId = localStorage.getItem(
                        "selectedRestaurantBranchId"
                    );
                    const defaultBranchId =
                        savedBranchId || restaurantBranches[0].id;
                    setSelectedBranchId(parseInt(defaultBranchId, 10));
                }
            } catch (error) {
                console.error("Error fetching branches:", error);
                message.error("Không thể tải danh sách chi nhánh nhà hàng!");
            } finally {
                setLoadingBranches(false);
            }
        };
        fetchBranches();
    }, []);

    const filteredOrders = orders.filter((order) => {
        let statusMatch = false;
        if (activeTab === "all") statusMatch = true;
        else if (activeTab === "new") statusMatch = order.status === "new";
        else if (activeTab === "preparing") {
            // Chỉ hiển thị order có ít nhất 1 item đang chế biến
            statusMatch = order.items.some(
                (item) => item.status === "preparing"
            );
        } else if (activeTab === "served") {
            // Chỉ hiển thị order mà tất cả item đều có status là 'served'
            statusMatch =
                order.items.length > 0 &&
                order.items.every((item) => item.status === "served");
        } else if (activeTab === "completed")
            statusMatch = order.status === "completed";

        const branchMatch =
            !selectedBranchId || order.branchId === selectedBranchId;
        return statusMatch && branchMatch;
    });

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = selectedBranchId
                ? { branchId: selectedBranchId }
                : {};
            const response = await restaurantOrderApi.getAll(params);

            const formattedOrders = Array.isArray(response)
                ? response.map((order) => ({
                      id: order.id,
                      tableId: order.tableId,
                      tableNumber: order.tableNumber,
                      branchId: order.branchId,
                      orderTime:
                          order.orderTime ||
                          order.createdAt ||
                          new Date().toISOString(),
                      status: order.status || "new",
                      items: Array.isArray(order.items)
                          ? order.items.map((item) => ({
                                id: item.id || item.foodId,
                                foodId: item.foodId,
                                name: item.name,
                                quantity: item.quantity,
                                price: item.price,
                                note: item.note || "",
                                status: item.status || "new",
                                createdAt:
                                    item.createdAt ||
                                    item.created_at ||
                                    order.createdAt ||
                                    new Date().toISOString(),
                                isNewlyAdded:
                                    item.status === "new" &&
                                    order.status === "preparing",
                            }))
                          : [],
                      priority: order.priority || "normal",
                      note: order.note || "",
                  }))
                : [];

            // Check for new orders (entirely new)
            const newOrders = formattedOrders.filter(
                (o) =>
                    o.status === "new" &&
                    dayjs(o.orderTime).isAfter(dayjs().subtract(1, "minute"))
            );

            // Check for existing orders with newly added items
            const ordersWithNewItems = formattedOrders.filter(
                (o) =>
                    o.status === "preparing" &&
                    o.items.some(
                        (item) =>
                            item.status === "new" &&
                            dayjs(item.createdAt).isAfter(
                                dayjs().subtract(1, "minute")
                            )
                    )
            );

            // Play notification for new orders or newly added items
            if (
                (newOrders.length > 0 || ordersWithNewItems.length > 0) &&
                orders.length > 0
            ) {
                orderSoundRef.current
                    .play()
                    .catch((e) => console.log("Audio play failed: ", e));

                // Notification for new orders
                newOrders.forEach((order) => {
                    notification.open({
                        message: "Đơn hàng mới!",
                        description: `Bàn ${order.tableNumber} vừa đặt món.`,
                        icon: <BellOutlined style={{ color: "#1890ff" }} />,
                    });
                });

                // Notification for newly added items
                ordersWithNewItems.forEach((order) => {
                    const newItemsCount = order.items.filter(
                        (item) => item.status === "new"
                    ).length;
                    notification.open({
                        message: "Gọi thêm món!",
                        description: `Bàn ${order.tableNumber} vừa gọi thêm ${newItemsCount} món.`,
                        icon: <BellOutlined style={{ color: "#fa8c16" }} />,
                    });
                });
            }

            setOrders(formattedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            message.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedBranchId) {
            localStorage.setItem(
                "selectedRestaurantBranchId",
                selectedBranchId
            );
            fetchOrders();
        }
    }, [selectedBranchId]);

    useEffect(() => {
        fetchOrders();

        pollingInterval.current = setInterval(() => {
            fetchOrders();
        }, 30000);

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, []);

    const handleBranchChange = (value) => {
        setSelectedBranchId(value);
    };

    // Handle order status changes
    const handleOrderStatusChange = async (orderId, newStatus) => {
        try {
            await restaurantOrderApi.update(orderId, { status: newStatus });

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );
            message.success(
                `Đơn hàng #${orderId} đã chuyển trạng thái thành ${statusColors[newStatus].text}`
            );
        } catch (error) {
            console.error(`Error updating order ${orderId} status:`, error);
            message.error("Không thể cập nhật trạng thái đơn hàng");
        }
    };

    // Handle item status changes within an order
    const handleItemStatusChange = async (orderId, itemId, newStatus) => {
        try {
            await restaurantOrderApi.updateOrderItem(orderId, itemId, {
                status: newStatus,
            });

            // Sau khi cập nhật trạng thái, luôn fetch lại đơn hàng từ backend để đồng bộ
            await fetchOrders();
            // Lấy lại order mới nhất để cập nhật modal nếu đang mở
            const updatedOrder = await restaurantOrderApi.getById(orderId);
            if (updatedOrder) setSelectedOrder(updatedOrder);
        } catch (error) {
            console.error(
                `Error updating item ${itemId} status in order ${orderId}:`,
                error
            );
            message.error("Không thể cập nhật trạng thái món ăn");
        }
    };

    // Show order details and allow actions
    const showOrderDetails = (order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    // Calculate summary statistics
    const summaryStats = {
        // Đếm số order có ít nhất 1 item status === 'new'
        newOrders: orders.filter((o) =>
            o.items.some((item) => item.status === "new")
        ).length,
        // Đếm số order có ít nhất 1 item đang chế biến
        preparingOrders: orders.filter((o) =>
            o.items.some((item) => item.status === "preparing")
        ).length,
        // Đếm số order mà tất cả item đều đã served (và có ít nhất 1 item)
        servedOrders: orders.filter(
            (o) =>
                o.items.length > 0 &&
                o.items.every((item) => item.status === "served")
        ).length,
        // Đếm số order có status completed
        completedOrders: orders.filter((o) => o.status === "completed").length,
        totalItems: orders.reduce((sum, order) => sum + order.items.length, 0),
    };

    // Calculate estimated prep time based on item quantity and complexity
    const calculatePrepTime = (items) => {
        return items.reduce((total, item) => {
            // This would be more sophisticated in a real app based on item type
            return total + item.quantity * 5;
        }, 5); // Base time of 5 minutes
    };

    return (
        <Layout style={{ padding: "0 24px 24px", minHeight: "100vh" }}>
            <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
                <Row
                    justify="space-between"
                    align="middle"
                    style={{ marginBottom: 16 }}
                >
                    <Col>
                        <Title level={2}>
                            <FireOutlined /> Quản lý đơn hàng bếp
                        </Title>
                    </Col>
                    <Col>
                        <Select
                            placeholder="Chọn chi nhánh"
                            style={{ width: 220 }}
                            value={selectedBranchId}
                            onChange={handleBranchChange}
                            loading={loadingBranches}
                            disabled={loadingBranches}
                        >
                            {branches.map((branch) => (
                                <Select.Option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                </Row>

                {/* Summary statistics */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đơn hàng mới"
                                value={summaryStats.newOrders}
                                valueStyle={{ color: "#1890ff" }}
                                prefix={<BellOutlined />}
                                suffix={
                                    summaryStats.newOrders > 0 ? (
                                        <Badge status="processing" />
                                    ) : null
                                }
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đang chế biến"
                                value={summaryStats.preparingOrders}
                                valueStyle={{ color: "#faad14" }}
                                prefix={
                                    <SyncOutlined
                                        spin={summaryStats.preparingOrders > 0}
                                    />
                                }
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Hoàn thành hôm nay"
                                value={summaryStats.completedOrders}
                                valueStyle={{ color: "#52c41a" }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng món đã xử lý"
                                value={summaryStats.totalItems}
                                prefix={<RocketOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Main order tabs */}
                <Tabs
                    defaultActiveKey="new"
                    onChange={setActiveTab}
                    size="large"
                >
                    <TabPane
                        tab={
                            <Badge
                                count={summaryStats.newOrders}
                                offset={[15, 0]}
                            >
                                <span style={{ fontSize: 16 }}>Mới</span>
                            </Badge>
                        }
                        key="new"
                    >
                        <OrderList
                            orders={filteredOrders}
                            onViewDetails={showOrderDetails}
                            onStatusChange={handleOrderStatusChange}
                        />
                    </TabPane>
                    <TabPane
                        tab={
                            <Badge
                                count={summaryStats.preparingOrders}
                                offset={[15, 0]}
                            >
                                <span style={{ fontSize: 16 }}>
                                    Đang chế biến
                                </span>
                            </Badge>
                        }
                        key="preparing"
                    >
                        <OrderList
                            orders={filteredOrders}
                            onViewDetails={showOrderDetails}
                            onStatusChange={handleOrderStatusChange}
                        />
                    </TabPane>
                    <TabPane
                        tab={
                            <Badge
                                count={summaryStats.servedOrders}
                                offset={[15, 0]}
                            >
                                <span style={{ fontSize: 16 }}>Đã lên món</span>
                            </Badge>
                        }
                        key="served"
                    >
                        <OrderList
                            orders={filteredOrders}
                            onViewDetails={showOrderDetails}
                            onStatusChange={handleOrderStatusChange}
                        />
                    </TabPane>
                    <TabPane
                        tab={
                            <Badge
                                count={summaryStats.completedOrders}
                                offset={[15, 0]}
                            >
                                <span style={{ fontSize: 16 }}>
                                    Đã hoàn thành
                                </span>
                            </Badge>
                        }
                        key="completed"
                    >
                        <OrderList
                            orders={filteredOrders}
                            onViewDetails={showOrderDetails}
                            onStatusChange={handleOrderStatusChange}
                        />
                    </TabPane>
                    <TabPane
                        tab={<span style={{ fontSize: 16 }}>Tất cả</span>}
                        key="all"
                    >
                        <OrderList
                            orders={filteredOrders}
                            onViewDetails={showOrderDetails}
                            onStatusChange={handleOrderStatusChange}
                        />
                    </TabPane>
                </Tabs>

                {/* Order detail modal */}
                <OrderDetails
                    order={selectedOrder}
                    visible={detailModalVisible}
                    onClose={() => setDetailModalVisible(false)}
                    onStatusChange={handleItemStatusChange}
                />
            </Content>
        </Layout>
    );
}

// Order List Component
function OrderList({ orders, onViewDetails, onStatusChange }) {
    return (
        <div className="order-list">
            <Row gutter={[16, 16]}>
                {orders.length === 0 && (
                    <Col span={24}>
                        <Empty description="Không có đơn hàng nào" />
                    </Col>
                )}
                {orders.map((order) => (
                    <Col key={order.id} xs={24} sm={12} lg={8} xl={6}>
                        <Card
                            title={
                                <Space>
                                    <Badge
                                        status={
                                            order.status === "new"
                                                ? "processing"
                                                : order.status === "preparing"
                                                ? "warning"
                                                : order.status === "completed"
                                                ? "success"
                                                : "default"
                                        }
                                    />
                                    <span>Bàn {order.tableNumber}</span>
                                    {order.items.some(
                                        (item) => item.isNewlyAdded
                                    ) && <Tag color="orange">Mới gọi thêm</Tag>}
                                </Space>
                            }
                            extra={
                                <Tag
                                    color={
                                        order.priority === "normal"
                                            ? "blue"
                                            : order.priority === "high"
                                            ? "orange"
                                            : "red"
                                    }
                                >
                                    {priorityColors[order.priority]?.text ||
                                        "Thường"}
                                </Tag>
                            }
                            hoverable
                            style={{ marginBottom: 16 }}
                            onClick={() => onViewDetails(order)}
                        >
                            <Timeline>
                                {order.items.slice(0, 5).map((item) => (
                                    <Timeline.Item
                                        key={item.id}
                                        color={
                                            item.status === "new"
                                                ? "blue"
                                                : item.status === "preparing"
                                                ? "orange"
                                                : item.status === "completed"
                                                ? "green"
                                                : "gray"
                                        }
                                        dot={
                                            item.isNewlyAdded ? (
                                                <FireOutlined
                                                    style={{
                                                        fontSize: "16px",
                                                        color: "#fa8c16",
                                                    }}
                                                />
                                            ) : undefined
                                        }
                                    >
                                        <Space>
                                            <Text
                                                style={{
                                                    width: "60px",
                                                    display: "inline-block",
                                                }}
                                            >
                                                x{item.quantity}
                                            </Text>
                                            <Text strong={item.isNewlyAdded}>
                                                {item.name}
                                                {item.isNewlyAdded && (
                                                    <Text type="warning" strong>
                                                        {" "}
                                                        (Mới)
                                                    </Text>
                                                )}
                                            </Text>
                                        </Space>
                                    </Timeline.Item>
                                ))}
                                {order.items.length > 5 && (
                                    <Timeline.Item color="gray">
                                        <Text type="secondary">
                                            +{order.items.length - 5} món khác
                                        </Text>
                                    </Timeline.Item>
                                )}
                            </Timeline>

                            <Divider style={{ margin: "12px 0" }} />

                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Text type="secondary">
                                        <ClockCircleOutlined />{" "}
                                        {dayjs(order.orderTime).fromNow()}
                                    </Text>
                                </Col>
                                <Col>
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewDetails(order);
                                        }}
                                    >
                                        Chi tiết
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

function OrderDetails({ order, visible, onClose, onStatusChange }) {
    if (!order) return null;

    const { Title, Text } = Typography;
    const orderItems = order.items || [];

    // Group items by status (with newly added items in a separate group)
    const newItems = orderItems.filter((item) => item.isNewlyAdded);
    const inProgressItems = orderItems.filter(
        (item) => !item.isNewlyAdded && item.status === "preparing"
    );
    const completedItems = orderItems.filter(
        (item) => item.status === "completed"
    );
    const otherItems = orderItems.filter(
        (item) =>
            !item.isNewlyAdded &&
            item.status !== "preparing" &&
            item.status !== "completed"
    );

    // Calculate totals
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = orderItems.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
    );

    return (
        <Modal
            title={
                <Space>
                    <Badge
                        status={
                            order.status === "new"
                                ? "processing"
                                : order.status === "preparing"
                                ? "warning"
                                : order.status === "completed"
                                ? "success"
                                : "default"
                        }
                    />
                    <span>Chi tiết đơn hàng - Bàn {order.tableNumber}</span>
                    {newItems.length > 0 && (
                        <Tag color="orange" icon={<FireOutlined />}>
                            Có {newItems.length} món mới gọi thêm
                        </Tag>
                    )}
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
            ]}
        >
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Statistic
                        title="Thời gian đặt"
                        value={dayjs(order.orderTime).format(
                            "HH:mm:ss - DD/MM/YYYY"
                        )}
                    />
                </Col>
                <Col span={6}>
                    <Statistic title="Tổng món" value={totalItems} />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Tổng tiền"
                        value={totalPrice.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        })}
                    />
                </Col>
            </Row>

            <Divider />

            {order.note && (
                <>
                    <Alert
                        message="Ghi chú đơn hàng"
                        description={order.note}
                        type="info"
                        showIcon
                    />
                    <Divider />
                </>
            )}

            {/* Display newly added items first with a header */}
            {newItems.length > 0 && (
                <>
                    <Alert
                        message={
                            <div
                                style={{ fontWeight: "bold", color: "#fa8c16" }}
                            >
                                <FireOutlined /> Món gọi thêm
                            </div>
                        }
                        type="warning"
                        style={{ marginBottom: 16 }}
                    />
                    <List
                        dataSource={newItems}
                        renderItem={(item) => (
                            <List.Item
                                style={{
                                    background: "#fff7e6",
                                    padding: "8px 16px",
                                    borderLeft: "3px solid #fa8c16",
                                    marginBottom: 8,
                                    borderRadius: 4,
                                }}
                                actions={[
                                    <Space>
                                        {item.status === "preparing" && (
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() =>
                                                    onStatusChange(
                                                        order.id,
                                                        item.id,
                                                        "served"
                                                    )
                                                }
                                            >
                                                Lên món
                                            </Button>
                                        )}
                                    </Space>,
                                ]}
                            >
                                <Row style={{ width: "100%" }}>
                                    <Col span={12}>
                                        <Space direction="vertical" size={0}>
                                            <Text
                                                strong
                                                style={{ color: "#fa8c16" }}
                                            >
                                                {item.name}{" "}
                                                <Tag color="orange">Mới</Tag>
                                            </Text>
                                            {item.note && (
                                                <Text type="secondary" italic>
                                                    Ghi chú: {item.note}
                                                </Text>
                                            )}
                                        </Space>
                                    </Col>
                                    <Col
                                        span={3}
                                        style={{ textAlign: "center" }}
                                    >
                                        {item.quantity}
                                    </Col>
                                    <Col
                                        span={5}
                                        style={{ textAlign: "right" }}
                                    >
                                        {(item.price || 0).toLocaleString(
                                            "vi-VN",
                                            {
                                                style: "currency",
                                                currency: "VND",
                                            }
                                        )}
                                    </Col>
                                    <Col
                                        span={5}
                                        style={{ textAlign: "right" }}
                                    >
                                        {(
                                            (item.price || 0) * item.quantity
                                        ).toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </Col>
                                </Row>
                            </List.Item>
                        )}
                        style={{ marginBottom: 16 }}
                    />
                </>
            )}

            {/* Other items */}
            <List
                header={
                    <Row style={{ fontWeight: "bold" }}>
                        <Col span={10}>Tên món</Col>
                        <Col span={4} style={{ textAlign: "center" }}>
                            SL
                        </Col>
                        <Col span={5} style={{ textAlign: "right" }}>
                            Đơn giá
                        </Col>
                        <Col span={5} style={{ textAlign: "right" }}>
                            Thành tiền
                        </Col>
                    </Row>
                }
                dataSource={[
                    ...inProgressItems,
                    ...otherItems,
                    ...completedItems,
                ]}
                renderItem={(item) => (
                    <List.Item
                        style={{ padding: "8px 0" }}
                        actions={[
                            <Space>
                                {item.status === "preparing" && (
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={() =>
                                            onStatusChange(
                                                order.id,
                                                item.id,
                                                "served"
                                            )
                                        }
                                    >
                                        Lên món
                                    </Button>
                                )}
                            </Space>,
                        ]}
                    >
                        <Row style={{ width: "100%", alignItems: "center" }}>
                            <Col
                                span={10}
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <Space direction="vertical" size={0}>
                                    <Text strong>{item.name}</Text>
                                    {item.note && (
                                        <Text type="secondary" italic>
                                            Ghi chú: {item.note}
                                        </Text>
                                    )}
                                </Space>
                            </Col>
                            <Col span={4} style={{ textAlign: "center" }}>
                                {item.quantity}
                            </Col>
                            <Col span={5} style={{ textAlign: "right" }}>
                                {(item.price || 0).toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </Col>
                            <Col span={5} style={{ textAlign: "right" }}>
                                {(
                                    (item.price || 0) * item.quantity
                                ).toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                })}
                            </Col>
                        </Row>
                    </List.Item>
                )}
                style={{ marginBottom: 16 }}
            />

            <Space align="center">
                <Badge
                    status={
                        order.priority === "normal"
                            ? "processing"
                            : order.priority === "high"
                            ? "warning"
                            : "error"
                    }
                />
                <Text>
                    Mức độ ưu tiên:{" "}
                    <Text strong>
                        {priorityColors[order.priority]?.text || "Thường"}
                    </Text>
                </Text>
            </Space>
        </Modal>
    );
}
