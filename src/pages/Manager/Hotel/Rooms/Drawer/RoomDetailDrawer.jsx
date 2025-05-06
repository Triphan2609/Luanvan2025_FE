import React, { useState, useEffect } from "react";
import {
    Drawer,
    Descriptions,
    Button,
    Space,
    Tag,
    Divider,
    Statistic,
    Row,
    Col,
    Badge,
    Popconfirm,
    Select,
    Typography,
    List,
    Avatar,
    Spin,
    Empty,
    Collapse,
    Card,
    Tooltip,
    Alert,
    message,
    DatePicker,
} from "antd";
import {
    HomeOutlined,
    TeamOutlined,
    DollarOutlined,
    EditOutlined,
    DeleteOutlined,
    ToolOutlined,
    SyncOutlined,
    InboxOutlined,
    BankOutlined,
    PhoneOutlined,
    MailOutlined,
    ClockCircleOutlined,
    FilterOutlined,
    TagsOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    CalendarOutlined,
    ShopOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { getRoomItems } from "../../../../../api/roomsApi";
import { getItemCategories } from "../../../../../api/stuffApi";
import { getBranchById } from "../../../../../api/branchesApi";

const { Text, Title } = Typography;
const { Panel } = Collapse;

export default function RoomDetailDrawer({
    open,
    onClose,
    room,
    onEdit,
    onDelete,
    onStatusChange,
}) {
    const [roomItems, setRoomItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingError, setLoadingError] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showBranchDetails, setShowBranchDetails] = useState(false);
    const [branchDetails, setBranchDetails] = useState(null);
    const [loadingBranch, setLoadingBranch] = useState(false);
    const [apiErrors, setApiErrors] = useState({
        items: false,
        categories: false,
        branch: false,
    });
    const [currentRoom, setCurrentRoom] = useState(room || {});
    const [statusLoading, setStatusLoading] = useState(false);
    const [showMaintenanceEndDate, setShowMaintenanceEndDate] = useState(false);
    const [maintenanceEndDate, setMaintenanceEndDate] = useState(null);

    useEffect(() => {
        if (open && room?.id) {
            setCurrentRoom(room);
            console.log("RoomDetailDrawer opened with room:", room);
            // Mọi khi open drawer, luôn gọi API để lấy danh sách vật dụng mới nhất
            fetchRoomItems();

            // Thêm một setTimeout để đảm bảo API được gọi lại sau khi component đã render
            const timer = setTimeout(() => {
                console.log("Delayed API call for room items:", room.id);
                forceRefreshRoomItems();
            }, 300);

            fetchCategories();

            // Nếu có branch ID nhưng không có đầy đủ thông tin branch
            if (room.branchId && (!room.branch || !room.branch.address)) {
                fetchBranchDetails(room.branchId);
            }

            // Cleanup function để tránh memory leak
            return () => clearTimeout(timer);
        }
        // Reset state when drawer is closed
        if (!open) {
            setLoadingError(false);
            setApiErrors({ items: false, categories: false, branch: false });
            setBranchDetails(null);
            setShowBranchDetails(false);
            setSelectedCategory(null);
            // Không reset currentRoom và roomItems khi đóng drawer để tránh hiệu ứng nhấp nháy
            // setCurrentRoom({});
            // setRoomItems([]);
        }
    }, [open, room]);

    // Thêm useEffect riêng để xử lý cập nhật khi room thay đổi (kể cả khi đã mở drawer)
    useEffect(() => {
        if (room && open) {
            setCurrentRoom(room);
        }
    }, [room]);

    const fetchBranchDetails = async (branchId) => {
        try {
            setLoadingBranch(true);
            const data = await getBranchById(branchId);
            if (data && data.id) {
                setBranchDetails(data);
                setApiErrors((prev) => ({ ...prev, branch: false }));
            } else {
                console.error("Invalid branch data:", data);
                setApiErrors((prev) => ({ ...prev, branch: true }));
            }
            setLoadingBranch(false);
        } catch (error) {
            console.error(
                `Error fetching branch details for ID ${branchId}:`,
                error
            );
            setApiErrors((prev) => ({ ...prev, branch: true }));
            setLoadingBranch(false);
        }
    };

    const fetchRoomItems = async () => {
        try {
            if (!currentRoom || !currentRoom.id) {
                console.warn("Cannot fetch room items: Room ID is missing");
                return;
            }

            setLoading(true);
            setLoadingError(false);
            console.log(`Fetching items for room ID: ${currentRoom.id}`);
            const items = await getRoomItems(currentRoom.id);

            if (!items || !Array.isArray(items)) {
                console.error("Invalid room items response:", items);
                setApiErrors((prev) => ({ ...prev, items: true }));
                setRoomItems([]);
            } else {
                console.log("Raw room items received:", items);
                // Process items to ensure valid category structure and default values
                const processedItems = items.map((item) => ({
                    ...item,
                    itemType: item.itemType || "long_term",
                    inUseQuantity: item.inUseQuantity || 0,
                    maxUses: item.maxUses || 0,
                    currentUses: item.currentUses || 0,
                    category: item.category || {
                        id: 0,
                        name: "Không phân loại",
                    },
                }));

                console.log("Processed room items:", processedItems);
                setRoomItems(processedItems);
                setApiErrors((prev) => ({ ...prev, items: false }));
            }
        } catch (error) {
            console.error("Error fetching room items:", error);
            setLoadingError(true);
            setRoomItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getItemCategories();

            if (!data || !Array.isArray(data)) {
                console.error("Invalid categories response:", data);
                setApiErrors((prev) => ({ ...prev, categories: true }));
                setCategories([]);
            } else {
                setCategories(data);
                setApiErrors((prev) => ({ ...prev, categories: false }));
            }
        } catch (error) {
            console.error("Error fetching item categories:", error);
            setApiErrors((prev) => ({ ...prev, categories: true }));
            setCategories([]);
        }
    };

    if (!open) return null;

    const roomStatus = {
        Available: { color: "success", text: "Còn trống" },
        Booked: { color: "error", text: "Đã đặt" },
        Cleaning: { color: "warning", text: "Đang dọn" },
        Maintenance: { color: "processing", text: "Bảo trì" },
    };

    const handleStatusChange = async (newStatus) => {
        if (newStatus === currentRoom.status) return;

        try {
            setStatusLoading(true);

            // Update UI immediately
            setCurrentRoom((prev) => ({
                ...prev,
                status: newStatus,
            }));

            // If setting to maintenance, show the maintenance end date selector
            if (newStatus === "Maintenance") {
                setShowMaintenanceEndDate(true);
                setStatusLoading(false);
                return; // Don't complete the status change yet
            } else {
                setShowMaintenanceEndDate(false);
            }

            // Call the parent handler to update the API
            await onStatusChange(currentRoom.id, newStatus);

            // Show success message
            message.success(
                `Đã thay đổi trạng thái thành ${
                    roomStatus[newStatus]?.text || newStatus
                }`
            );

            setStatusLoading(false);
        } catch (error) {
            // Revert to the original status if there was an error
            setCurrentRoom((prev) => ({
                ...prev,
                status: room.status,
            }));
            setStatusLoading(false);
            console.error("Error updating room status:", error);
        }
    };

    const handleMaintenanceConfirm = async () => {
        try {
            if (!currentRoom || !currentRoom.id) {
                message.error("Không thể cập nhật: Thiếu thông tin phòng");
                return;
            }

            setStatusLoading(true);

            // Call the parent handler with maintenance end date
            await onStatusChange(
                currentRoom.id,
                "Maintenance",
                maintenanceEndDate
            );

            // Show success message
            message.success(
                `Đã đặt trạng thái bảo trì${
                    maintenanceEndDate
                        ? " đến " +
                          maintenanceEndDate.format("DD/MM/YYYY HH:mm")
                        : ""
                }`
            );

            setShowMaintenanceEndDate(false);
            setMaintenanceEndDate(null);
            setStatusLoading(false);
        } catch (error) {
            // Revert to the original status if there was an error
            if (room && room.status) {
                setCurrentRoom((prev) => ({
                    ...prev,
                    status: room.status,
                }));
            } else {
                setCurrentRoom((prev) => ({
                    ...prev,
                    status: "Available",
                }));
            }
            setStatusLoading(false);
            console.error("Error setting maintenance status:", error);
        }
    };

    const handleMaintenanceCancel = () => {
        // Revert back to original status if room is available
        if (room && room.status) {
            setCurrentRoom((prev) => ({
                ...prev,
                status: room.status,
            }));
        } else {
            // Default to Available if room is null
            setCurrentRoom((prev) => ({
                ...prev,
                status: "Available",
            }));
        }
        setShowMaintenanceEndDate(false);
        setMaintenanceEndDate(null);
    };

    const handleRetryFetch = () => {
        fetchRoomItems();
        fetchCategories();
        if (currentRoom && currentRoom.branchId) {
            fetchBranchDetails(currentRoom.branchId);
        }
    };

    // Hàm lấy trực tiếp từ API room items bằng roomId
    const forceRefreshRoomItems = () => {
        if (!currentRoom || !currentRoom.id) {
            console.warn("Cannot force refresh: Room ID is missing");
            return;
        }
        console.log(`Force refreshing items for room ID: ${currentRoom.id}`);
        setLoading(true);
        getRoomItems(currentRoom.id)
            .then((items) => {
                if (!items || !Array.isArray(items)) {
                    console.error(
                        "Invalid room items response in force refresh:",
                        items
                    );
                    setApiErrors((prev) => ({ ...prev, items: true }));
                    setRoomItems([]);
                } else {
                    console.log("Force refreshed room items:", items);
                    // Process items
                    const processedItems = items.map((item) => ({
                        ...item,
                        itemType: item.itemType || "long_term",
                        inUseQuantity: item.inUseQuantity || 0,
                        maxUses: item.maxUses || 0,
                        currentUses: item.currentUses || 0,
                        category: item.category || {
                            id: 0,
                            name: "Không phân loại",
                        },
                    }));
                    setRoomItems(processedItems);
                    setApiErrors((prev) => ({ ...prev, items: false }));
                }
            })
            .catch((error) => {
                console.error("Error in force refresh room items:", error);
                setApiErrors((prev) => ({ ...prev, items: true }));
                setRoomItems([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Kết hợp thông tin chi nhánh từ room.branch và branchDetails nếu có
    const branchInfo = branchDetails || room.branch || {};

    // Logic phân loại vật dụng theo danh mục - CẢI THIỆN
    // Lấy danh sách các danh mục duy nhất từ vật dụng trong phòng
    const categoriesFromItems = roomItems.reduce((uniqueCategories, item) => {
        if (item.category && item.category.id !== undefined) {
            const existingCategory = uniqueCategories.find(
                (c) => c.id === item.category.id
            );
            if (!existingCategory) {
                uniqueCategories.push({
                    id: item.category.id,
                    name: item.category.name || `Danh mục ${item.category.id}`,
                });
            }
        }
        return uniqueCategories;
    }, []);

    // Danh sách danh mục để hiển thị trong bộ lọc
    const displayCategories =
        categories.length > 0 ? categories : categoriesFromItems;

    // Log để debug
    console.log("Available categories:", displayCategories);
    console.log("Selected category:", selectedCategory);
    console.log(
        "Room items:",
        roomItems.map(
            (i) =>
                `${i.name} - Category: ${i.category?.name || "N/A"} (${
                    i.category?.id || "N/A"
                })`
        )
    );

    // Lọc vật dụng theo danh mục đã chọn
    const filteredItems = selectedCategory
        ? roomItems.filter(
              (item) =>
                  item.category &&
                  item.category.id === parseInt(selectedCategory, 10)
          )
        : roomItems;

    // Phân nhóm vật dụng theo danh mục
    const itemsByCategory = {};
    filteredItems.forEach((item) => {
        const categoryName = item.category?.name || "Không phân loại";
        const categoryId = item.category?.id || 0;
        const categoryKey = `${categoryId}:${categoryName}`;

        if (!itemsByCategory[categoryKey]) {
            itemsByCategory[categoryKey] = {
                name: categoryName,
                id: categoryId,
                items: [],
            };
        }
        itemsByCategory[categoryKey].items.push(item);
    });

    console.log("Items grouped by category:", itemsByCategory);

    return (
        <Drawer
            title={
                <Space>
                    <HomeOutlined />
                    {currentRoom?.roomCode || "N/A"}
                    <Badge
                        status={
                            roomStatus[currentRoom?.status]?.color || "default"
                        }
                        text={
                            roomStatus[currentRoom?.status]?.text ||
                            currentRoom?.status ||
                            "N/A"
                        }
                    />
                </Space>
            }
            width={800}
            open={open}
            onClose={onClose}
            extra={
                <Space>
                    <Button icon={<EditOutlined />} onClick={onEdit}>
                        Chỉnh sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa phòng này?"
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
            {!currentRoom ? (
                <Empty description="Không có dữ liệu phòng" />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Statistic
                                title="Giá phòng"
                                value={currentRoom.price || 0}
                                prefix={<DollarOutlined />}
                                suffix="đ/đêm"
                                formatter={(value) =>
                                    `${Number(value).toLocaleString()}`
                                }
                            />
                        </Col>
                        <Col span={12}>
                            <Statistic
                                title="Sức chứa"
                                value={currentRoom.capacity || 0}
                                prefix={<TeamOutlined />}
                                suffix="người"
                            />
                        </Col>
                    </Row>

                    <Divider />

                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Loại phòng">
                            {currentRoom.roomType?.name || "Không xác định"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tầng">
                            Tầng {currentRoom.floor || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Badge
                                status={
                                    roomStatus[currentRoom.status]?.color ||
                                    "default"
                                }
                                text={
                                    roomStatus[currentRoom.status]?.text ||
                                    currentRoom.status ||
                                    "N/A"
                                }
                            />
                            {currentRoom.status === "Maintenance" &&
                                currentRoom.maintenanceEndDate && (
                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary">
                                            <ClockCircleOutlined /> Tự động
                                            chuyển về trạng thái còn trống vào:{" "}
                                            {new Date(
                                                currentRoom.maintenanceEndDate
                                            ).toLocaleString("vi-VN")}
                                        </Text>
                                    </div>
                                )}
                            {currentRoom.status === "Cleaning" &&
                                currentRoom.cleaningEndDate && (
                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary">
                                            <ClockCircleOutlined /> Tự động
                                            chuyển về trạng thái còn trống vào:{" "}
                                            {new Date(
                                                currentRoom.cleaningEndDate
                                            ).toLocaleString("vi-VN")}
                                        </Text>
                                    </div>
                                )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tiện nghi">
                            {currentRoom.amenities?.length > 0 ? (
                                <Space wrap>
                                    {currentRoom.amenities.map((item) => (
                                        <Tag key={item}>{item}</Tag>
                                    ))}
                                </Space>
                            ) : (
                                <Text type="secondary">Không có tiện nghi</Text>
                            )}
                        </Descriptions.Item>
                        {currentRoom.description && (
                            <Descriptions.Item label="Mô tả">
                                {currentRoom.description}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Chi nhánh">
                            {loadingBranch ? (
                                <Spin size="small" />
                            ) : apiErrors.branch ? (
                                <Space>
                                    <Text type="danger">
                                        Không thể tải thông tin
                                    </Text>
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<ReloadOutlined />}
                                        onClick={() =>
                                            currentRoom.branchId &&
                                            fetchBranchDetails(
                                                currentRoom.branchId
                                            )
                                        }
                                    />
                                </Space>
                            ) : (
                                <Space>
                                    <ShopOutlined />
                                    {branchInfo.name ||
                                        currentRoom.branchId ||
                                        "Không xác định"}
                                    {(branchInfo.id ||
                                        currentRoom.branchId) && (
                                        <Tooltip title="Xem chi tiết chi nhánh">
                                            <Button
                                                type="link"
                                                icon={<InfoCircleOutlined />}
                                                onClick={() =>
                                                    setShowBranchDetails(
                                                        !showBranchDetails
                                                    )
                                                }
                                                size="small"
                                            />
                                        </Tooltip>
                                    )}
                                </Space>
                            )}
                        </Descriptions.Item>
                    </Descriptions>

                    {(branchInfo.id || branchInfo.branch_code) &&
                        showBranchDetails && (
                            <Card
                                size="small"
                                title={
                                    <Space>
                                        <BankOutlined />
                                        Thông tin chi nhánh{" "}
                                        {branchInfo.branch_code
                                            ? `(${branchInfo.branch_code})`
                                            : ""}
                                    </Space>
                                }
                                style={{ marginTop: 16 }}
                                loading={loadingBranch}
                            >
                                <Row gutter={[16, 8]}>
                                    <Col span={24}>
                                        <Space>
                                            <TagsOutlined />
                                            <Text strong>Loại chi nhánh:</Text>
                                            <Text>
                                                {branchInfo.branchType?.name ||
                                                    "Không xác định"}
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space align="start">
                                            <HomeOutlined
                                                style={{ marginTop: 4 }}
                                            />
                                            <Text strong>Địa chỉ:</Text>
                                            <Text
                                                style={{
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {branchInfo.address ||
                                                    "Không có thông tin"}
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col span={12}>
                                        <Space>
                                            <PhoneOutlined />
                                            <Text strong>SĐT:</Text>
                                            <Text>
                                                {branchInfo.phone ||
                                                    "Không có thông tin"}
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col span={12}>
                                        <Space>
                                            <MailOutlined />
                                            <Text strong>Email:</Text>
                                            <Text>
                                                {branchInfo.email ||
                                                    "Không có thông tin"}
                                            </Text>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Space>
                                            <ClockCircleOutlined />
                                            <Text strong>Giờ làm việc:</Text>
                                            <Text>
                                                {branchInfo.open_time &&
                                                branchInfo.close_time
                                                    ? `${branchInfo.open_time} - ${branchInfo.close_time}`
                                                    : "Không có thông tin"}
                                            </Text>
                                        </Space>
                                    </Col>
                                    {branchInfo.working_days && (
                                        <Col span={24}>
                                            <Space>
                                                <CalendarOutlined />
                                                <Text strong>
                                                    Ngày làm việc:
                                                </Text>
                                                <Text>
                                                    {branchInfo.working_days}
                                                </Text>
                                            </Space>
                                        </Col>
                                    )}
                                    {branchInfo.status && (
                                        <Col span={24}>
                                            <Space>
                                                <Badge
                                                    status={
                                                        branchInfo.status ===
                                                        "active"
                                                            ? "success"
                                                            : "error"
                                                    }
                                                />
                                                <Text strong>Trạng thái:</Text>
                                                <Text>
                                                    {branchInfo.status ===
                                                    "active"
                                                        ? "Đang hoạt động"
                                                        : "Ngừng hoạt động"}
                                                </Text>
                                            </Space>
                                        </Col>
                                    )}
                                    {branchInfo.staff_count > 0 && (
                                        <Col span={24}>
                                            <Space>
                                                <TeamOutlined />
                                                <Text strong>
                                                    Số nhân viên:
                                                </Text>
                                                <Text>
                                                    {branchInfo.staff_count}
                                                </Text>
                                            </Space>
                                        </Col>
                                    )}
                                    {branchInfo.manager_name && (
                                        <Col span={24}>
                                            <Space>
                                                <UserOutlined />
                                                <Text strong>Quản lý:</Text>
                                                <Text>
                                                    {branchInfo.manager_name}{" "}
                                                    {branchInfo.manager_phone
                                                        ? `(${branchInfo.manager_phone})`
                                                        : ""}
                                                </Text>
                                            </Space>
                                        </Col>
                                    )}
                                </Row>
                            </Card>
                        )}

                    <Divider />

                    <div>
                        <Text strong>Thay đổi trạng thái phòng:</Text>
                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            <Col span={24}>
                                <Select
                                    style={{ width: "100%" }}
                                    value={currentRoom.status || "Available"}
                                    onChange={handleStatusChange}
                                    loading={statusLoading}
                                    options={[
                                        {
                                            value: "Available",
                                            label: (
                                                <Space>
                                                    <Badge status="success" />
                                                    Còn trống
                                                </Space>
                                            ),
                                        },
                                        {
                                            value: "Booked",
                                            label: (
                                                <Space>
                                                    <Badge status="error" />
                                                    Đã đặt
                                                </Space>
                                            ),
                                        },
                                        {
                                            value: "Cleaning",
                                            label: (
                                                <Space>
                                                    <SyncOutlined spin />
                                                    Đang dọn
                                                </Space>
                                            ),
                                        },
                                        {
                                            value: "Maintenance",
                                            label: (
                                                <Space>
                                                    <ToolOutlined />
                                                    Bảo trì
                                                </Space>
                                            ),
                                        },
                                    ]}
                                />
                            </Col>

                            {showMaintenanceEndDate && (
                                <>
                                    <Col span={24}>
                                        <Alert
                                            message="Đặt thời gian kết thúc bảo trì"
                                            description="Phòng sẽ tự động chuyển về trạng thái còn trống sau thời gian này"
                                            type="info"
                                            showIcon
                                            style={{ marginBottom: 16 }}
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <DatePicker
                                            showTime
                                            format="DD/MM/YYYY HH:mm"
                                            placeholder="Chọn thời gian kết thúc bảo trì"
                                            onChange={setMaintenanceEndDate}
                                            value={maintenanceEndDate}
                                            style={{ width: "100%" }}
                                            disabledDate={(current) =>
                                                current &&
                                                current <
                                                    new Date().setHours(
                                                        0,
                                                        0,
                                                        0,
                                                        0
                                                    )
                                            }
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Button
                                            type="primary"
                                            onClick={handleMaintenanceConfirm}
                                            loading={statusLoading}
                                            block
                                        >
                                            Xác nhận
                                        </Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button
                                            onClick={handleMaintenanceCancel}
                                            block
                                        >
                                            Hủy
                                        </Button>
                                    </Col>
                                </>
                            )}
                        </Row>
                    </div>

                    <Divider orientation="left">
                        <Space>
                            <InboxOutlined />
                            Vật dụng trong phòng ({roomItems.length})
                            <Button
                                type="link"
                                icon={<ReloadOutlined />}
                                onClick={forceRefreshRoomItems}
                                loading={loading}
                                title="Cập nhật danh sách vật dụng"
                            />
                        </Space>
                    </Divider>

                    {/* Error alert for API issues */}
                    {(loadingError || apiErrors.items) && (
                        <Alert
                            message="Lỗi kết nối"
                            description="Không thể tải dữ liệu vật dụng. Vui lòng thử lại sau."
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                            action={
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<ReloadOutlined />}
                                    onClick={handleRetryFetch}
                                >
                                    Thử lại
                                </Button>
                            }
                        />
                    )}

                    {/* Hiển thị tóm tắt số lượng vật dụng theo loại */}
                    {!loadingError &&
                        !apiErrors.items &&
                        roomItems.length > 0 && (
                            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                                <Col xs={24} sm={8}>
                                    <Statistic
                                        title="Vật dụng dài hạn"
                                        value={
                                            roomItems.filter(
                                                (item) =>
                                                    item.itemType ===
                                                    "long_term"
                                            ).length
                                        }
                                        prefix={
                                            <ClockCircleOutlined
                                                style={{ color: "#1890ff" }}
                                            />
                                        }
                                        valueStyle={{ color: "#1890ff" }}
                                    />
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Statistic
                                        title="Vật dụng dùng 1 lần"
                                        value={
                                            roomItems.filter(
                                                (item) =>
                                                    item.itemType ===
                                                    "single_use"
                                            ).length
                                        }
                                        prefix={
                                            <InfoCircleOutlined
                                                style={{ color: "#fa8c16" }}
                                            />
                                        }
                                        valueStyle={{ color: "#fa8c16" }}
                                    />
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Statistic
                                        title="Vật dụng dùng nhiều lần"
                                        value={
                                            roomItems.filter(
                                                (item) =>
                                                    item.itemType ===
                                                    "multiple_use"
                                            ).length
                                        }
                                        prefix={
                                            <SyncOutlined
                                                style={{ color: "#722ed1" }}
                                            />
                                        }
                                        valueStyle={{ color: "#722ed1" }}
                                    />
                                </Col>
                            </Row>
                        )}

                    {/* Category filter */}
                    {!loadingError &&
                        !apiErrors.items &&
                        roomItems.length > 0 && (
                            <Row style={{ marginBottom: 16 }}>
                                <Col span={24}>
                                    <Space>
                                        <FilterOutlined />
                                        <Text strong>Lọc theo danh mục:</Text>
                                        <Select
                                            style={{ width: 200 }}
                                            placeholder="Tất cả danh mục"
                                            allowClear
                                            value={selectedCategory}
                                            onChange={(value) =>
                                                setSelectedCategory(value)
                                            }
                                            options={[
                                                {
                                                    value: null,
                                                    label: "Tất cả danh mục",
                                                },
                                                ...displayCategories.map(
                                                    (category) => ({
                                                        value: category.id,
                                                        label:
                                                            category.name ||
                                                            "Không xác định",
                                                    })
                                                ),
                                            ]}
                                            optionFilterProp="label"
                                            showSearch
                                            status={
                                                apiErrors.categories
                                                    ? "error"
                                                    : ""
                                            }
                                            disabled={
                                                apiErrors.categories ||
                                                displayCategories.length === 0
                                            }
                                            loading={loading}
                                            notFoundContent={
                                                displayCategories.length === 0
                                                    ? "Không có danh mục nào"
                                                    : undefined
                                            }
                                        />
                                        {apiErrors.categories && (
                                            <Tooltip title="Không thể tải danh mục đầy đủ. Hiển thị danh mục từ vật dụng trong phòng.">
                                                <ExclamationCircleOutlined
                                                    style={{ color: "#ff4d4f" }}
                                                />
                                            </Tooltip>
                                        )}
                                    </Space>
                                </Col>
                            </Row>
                        )}

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 8 }}>
                                Đang tải vật dụng...
                            </div>
                        </div>
                    ) : roomItems.length > 0 ? (
                        <Collapse
                            defaultActiveKey={Object.keys(itemsByCategory)}
                            ghost
                        >
                            {Object.keys(itemsByCategory).map((categoryKey) => {
                                const category = itemsByCategory[categoryKey];
                                return (
                                    <Panel
                                        header={
                                            <Space>
                                                <TagsOutlined />
                                                <Text strong>
                                                    {category.name}
                                                </Text>
                                                <Tag color="blue">
                                                    {category.items.length}
                                                </Tag>
                                            </Space>
                                        }
                                        key={categoryKey}
                                    >
                                        <List
                                            itemLayout="horizontal"
                                            dataSource={category.items}
                                            renderItem={(item) => (
                                                <List.Item>
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar
                                                                icon={
                                                                    <InboxOutlined />
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        item.stockQuantity >
                                                                        0
                                                                            ? "#52c41a"
                                                                            : "#ff4d4f",
                                                                }}
                                                            />
                                                        }
                                                        title={
                                                            <Space>
                                                                <Text strong>
                                                                    {item.name}
                                                                </Text>
                                                                {item.unitPrice >
                                                                    0 && (
                                                                    <Tag color="green">
                                                                        {Number(
                                                                            item.unitPrice
                                                                        ).toLocaleString()}
                                                                        đ
                                                                    </Tag>
                                                                )}
                                                                {item.itemType && (
                                                                    <Tag
                                                                        color={
                                                                            item.itemType ===
                                                                            "long_term"
                                                                                ? "blue"
                                                                                : item.itemType ===
                                                                                  "single_use"
                                                                                ? "orange"
                                                                                : "purple"
                                                                        }
                                                                    >
                                                                        {item.itemType ===
                                                                        "long_term"
                                                                            ? "Dài hạn"
                                                                            : item.itemType ===
                                                                              "single_use"
                                                                            ? "Dùng 1 lần"
                                                                            : "Dùng nhiều lần"}
                                                                    </Tag>
                                                                )}
                                                            </Space>
                                                        }
                                                        description={
                                                            <Space
                                                                direction="vertical"
                                                                size={0}
                                                            >
                                                                {item.description && (
                                                                    <Text type="secondary">
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </Text>
                                                                )}
                                                                <Space>
                                                                    <Text type="secondary">
                                                                        {item.stockQuantity >
                                                                        0
                                                                            ? `Trong kho: ${item.stockQuantity}`
                                                                            : "Hết hàng"}
                                                                    </Text>
                                                                    {item.inUseQuantity >
                                                                        0 && (
                                                                        <Text type="secondary">
                                                                            |
                                                                            Đang
                                                                            sử
                                                                            dụng:{" "}
                                                                            {
                                                                                item.inUseQuantity
                                                                            }
                                                                        </Text>
                                                                    )}
                                                                </Space>

                                                                {item.itemType ===
                                                                    "multiple_use" &&
                                                                    item.maxUses >
                                                                        0 && (
                                                                        <Text type="secondary">
                                                                            Lần
                                                                            sử
                                                                            dụng:{" "}
                                                                            {item.currentUses ||
                                                                                0}
                                                                            /
                                                                            {
                                                                                item.maxUses
                                                                            }
                                                                            {item.currentUses >=
                                                                                item.maxUses && (
                                                                                <Tag
                                                                                    color="red"
                                                                                    style={{
                                                                                        marginLeft: 8,
                                                                                    }}
                                                                                >
                                                                                    Đã
                                                                                    đạt
                                                                                    giới
                                                                                    hạn
                                                                                </Tag>
                                                                            )}
                                                                        </Text>
                                                                    )}

                                                                {item.branch &&
                                                                    item.branch
                                                                        .name && (
                                                                        <Text type="secondary">
                                                                            <ShopOutlined />{" "}
                                                                            {
                                                                                item
                                                                                    .branch
                                                                                    .name
                                                                            }
                                                                        </Text>
                                                                    )}
                                                            </Space>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Panel>
                                );
                            })}
                        </Collapse>
                    ) : (
                        <Empty
                            description={
                                loadingError || apiErrors.items ? (
                                    "Không thể tải thông tin vật dụng"
                                ) : (
                                    <div>
                                        <p>Phòng này chưa có vật dụng nào</p>
                                        <p
                                            style={{
                                                fontSize: "12px",
                                                color: "#888",
                                            }}
                                        >
                                            Bạn có thể thêm vật dụng vào phòng
                                            bằng cách nhấn nút "Chỉnh sửa" và
                                            chọn vật dụng từ danh sách.
                                        </p>
                                        <Button
                                            onClick={forceRefreshRoomItems}
                                            type="primary"
                                            icon={<ReloadOutlined />}
                                            loading={loading}
                                            style={{ marginTop: 8 }}
                                        >
                                            Tải lại dữ liệu
                                        </Button>
                                    </div>
                                )
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    )}
                </>
            )}
        </Drawer>
    );
}
