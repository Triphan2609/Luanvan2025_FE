import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Select,
    Row,
    Col,
    Tag,
    Button,
    Space,
    Typography,
    Empty,
    Input,
    Divider,
    Badge,
    message,
    Alert,
    Statistic,
    Tabs,
} from "antd";
import {
    HomeOutlined,
    SearchOutlined,
    ToolOutlined,
    PlusOutlined,
    BranchesOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    BankOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import AddEditRoomModal from "./Modals/AddEditRoomModal";
import RoomDetailDrawer from "./Drawer/RoomDetailDrawer";
import MaintenanceModal from "./Modals/MaintenanceModal";
import CleaningModal from "./Modals/CleaningModal";
import {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    getRoomStats,
    getFloors,
    updateAllRoomsBranch,
    updateRoomItems,
    checkItemsEndpointAvailability,
} from "../../../../api/roomsApi";
import { getRoomTypes } from "../../../../api/roomTypesApi";
import { getHotelBranches } from "../../../../api/branchesApi";
import { getFloorsByBranch } from "../../../../api/floorsApi";

const { Title, Text } = Typography;

const roomStatuses = {
    Available: { color: "#52c41a", text: "Còn trống" },
    Booked: { color: "#f5222d", text: "Đã đặt" },
    Cleaning: { color: "#faad14", text: "Đang dọn" },
    Maintenance: { color: "#1890ff", text: "Bảo trì" },
};

export default function RoomManagement() {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [floors, setFloors] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(0);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [loading, setLoading] = useState(false);
    const [needsMigration, setNeedsMigration] = useState(false);
    const [isMigratingData, setIsMigratingData] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        booked: 0,
        cleaning: 0,
        maintenance: 0,
    });
    const [maintenanceTimers, setMaintenanceTimers] = useState({});
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [selectedRoomForMaintenance, setSelectedRoomForMaintenance] =
        useState(null);
    const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
    const [selectedRoomForCleaning, setSelectedRoomForCleaning] =
        useState(null);

    // Fetch data on component mount
    useEffect(() => {
        fetchBranches();
    }, []);

    // Fetch floors and room types when branch is selected
    useEffect(() => {
        if (selectedBranch) {
            fetchFloorsByBranch(selectedBranch);
            fetchRoomTypes();
        }
    }, [selectedBranch]);

    // Fetch rooms when filters change
    useEffect(() => {
        if (selectedBranch) {
            fetchRooms();
        }
    }, [selectedFloor, selectedType, selectedStatus, selectedBranch]);

    // Initialize maintenance timers for existing maintenance rooms
    useEffect(() => {
        // Find all maintenance rooms with an end date
        const maintenanceRooms = rooms.filter(
            (room) => room.status === "Maintenance" && room.maintenanceEndDate
        );

        // Set up timers for each
        maintenanceRooms.forEach((room) => {
            const endDate = new Date(room.maintenanceEndDate);
            const now = new Date();

            // Only set up timer if end date is in the future
            if (endDate > now) {
                scheduleStatusChange(room.id, endDate);
            }
            // If end date is in the past, update the status to Available
            else if (endDate <= now) {
                handleStatusChange(room.id, "Available");
            }
        });
    }, [rooms]);

    // Clean up timers when component unmounts
    useEffect(() => {
        return () => {
            // Clear all maintenance timers
            Object.values(maintenanceTimers).forEach((timer) =>
                clearTimeout(timer)
            );
        };
    }, [maintenanceTimers]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            console.log("Fetching hotel branches...");
            const response = await getHotelBranches();
            console.log("Hotel branches response:", response);

            // Lấy chi nhánh loại khách sạn hoặc cả hai
            const hotelBranches = Array.isArray(response) ? response : [];
            console.log("Filtered hotel branches:", hotelBranches);

            setBranches(hotelBranches);

            // Auto-select the first branch if no branch is selected
            if (hotelBranches.length > 0 && !selectedBranch) {
                console.log(
                    "Auto-selecting first hotel branch:",
                    hotelBranches[0]
                );
                setSelectedBranch(hotelBranches[0].id);
            }

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch hotel branches:", error);
            message.error("Không thể tải danh sách chi nhánh khách sạn");
            setLoading(false);
        }
    };

    const fetchFloorsByBranch = async (branchId) => {
        try {
            setLoading(true);
            const data = await getFloorsByBranch(branchId);
            const formattedFloors = [
                { id: 0, name: "Tất cả tầng" },
                ...data.map((floor) => ({
                    id: floor.id,
                    floorNumber: floor.floorNumber,
                    name: floor.name,
                    description: floor.description,
                    branchId: floor.branchId,
                })),
            ];
            setFloors(formattedFloors);
            setSelectedFloor(0); // Reset to "All floors" when branch changes
        } catch (error) {
            console.error("Failed to fetch floors for branch:", error);
            message.error("Không thể tải danh sách tầng cho chi nhánh này");
            setFloors([{ id: 0, name: "Tất cả tầng" }]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const params = {};

            if (selectedFloor > 0) {
                params.floorId = selectedFloor;
            }

            if (selectedType) {
                params.roomTypeId = selectedType;
            }

            if (selectedStatus) {
                params.status = selectedStatus;
            }

            if (selectedBranch) {
                params.branchId = selectedBranch;
            }

            const data = await getRooms(params);
            setRooms(data);

            // Kiểm tra xem có phòng nào không có branchId không
            const roomsWithoutBranch = data.filter((room) => !room.branchId);
            if (roomsWithoutBranch.length > 0 && !needsMigration) {
                setNeedsMigration(true);
            }

            // Fetch room stats with the same filters
            const statsData = await getRoomStats(params);
            setStats(statsData);
        } catch (error) {
            message.error("Không thể tải dữ liệu phòng!");
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoomTypes = async () => {
        try {
            const data = await getRoomTypes();
            const formattedTypes = [
                { id: null, name: "Tất cả loại phòng" },
                ...data.map((type) => ({
                    id: type.id,
                    name: type.name,
                })),
            ];
            setRoomTypes(formattedTypes);
        } catch (error) {
            message.error("Không thể tải dữ liệu loại phòng!");
            console.error("Error fetching room types:", error);
        }
    };

    const handleAddRoom = async (values) => {
        try {
            // Extract items from values
            const { itemIds, ...roomData } = values;

            console.log("Creating room with data:", roomData);
            console.log("Items to be added:", itemIds);

            // First create the room
            const newRoom = await createRoom(roomData);
            console.log("Room created successfully:", newRoom);

            // Then associate items if there are any
            if (itemIds && itemIds.length > 0 && newRoom.id) {
                console.log(
                    `Trying to add ${itemIds.length} items to room id ${newRoom.id}`
                );
                try {
                    const result = await updateRoomItems(newRoom.id, itemIds);
                    console.log("Items association result:", result);
                } catch (itemError) {
                    console.error("Failed to add items to room:", itemError);
                    // Thử lại sau 1 giây nếu API chưa sẵn sàng
                    message.info("Đang thử lại việc thêm vật dụng...");
                    setTimeout(async () => {
                        try {
                            const retryResult = await updateRoomItems(
                                newRoom.id,
                                itemIds
                            );
                            console.log(
                                "Items association retry result:",
                                retryResult
                            );
                            message.success(
                                "Thêm vật dụng thành công sau khi thử lại!"
                            );
                        } catch (retryError) {
                            console.error(
                                "Failed to add items on retry:",
                                retryError
                            );
                            message.warning(
                                "Không thể thêm vật dụng tự động, vui lòng thử lại sau"
                            );
                        }
                    }, 1000);
                }
            } else {
                console.log("No items to add or missing room ID");
            }

            message.success("Thêm phòng mới thành công!");
            setIsAddEditModalOpen(false);
            fetchRooms();
        } catch (error) {
            message.error("Không thể thêm phòng mới!");
            console.error("Error adding room:", error);
            console.error("Error details:", error.response?.data);
        }
    };

    const handleEditRoom = async (values) => {
        try {
            // Extract items from values
            const { itemIds, ...roomData } = values;

            console.log("Updating room with data:", roomData);
            console.log("Items to update:", itemIds);

            // Update the room data
            await updateRoom(editingRoom.id, roomData);
            console.log("Room data updated successfully");

            // Then update items association
            if (itemIds && editingRoom.id) {
                try {
                    console.log(
                        `Trying to update ${itemIds.length} items for room ${editingRoom.id}`
                    );
                    const result = await updateRoomItems(
                        editingRoom.id,
                        itemIds
                    );
                    console.log("Items association result:", result);
                } catch (itemError) {
                    console.error(
                        "Failed to update items for room:",
                        itemError
                    );
                    // Thử lại sau 1 giây nếu API chưa sẵn sàng
                    message.info("Đang thử lại việc cập nhật vật dụng...");
                    setTimeout(async () => {
                        try {
                            const retryResult = await updateRoomItems(
                                editingRoom.id,
                                itemIds
                            );
                            console.log(
                                "Items association retry result:",
                                retryResult
                            );
                            message.success(
                                "Cập nhật vật dụng thành công sau khi thử lại!"
                            );
                        } catch (retryError) {
                            console.error(
                                "Failed to update items on retry:",
                                retryError
                            );
                            message.warning(
                                "Không thể cập nhật vật dụng tự động, vui lòng thử lại sau"
                            );
                        }
                    }, 1000);
                }
            }

            message.success("Cập nhật phòng thành công!");
            setIsAddEditModalOpen(false);
            fetchRooms();
        } catch (error) {
            message.error("Không thể cập nhật phòng!");
            console.error("Error updating room:", error);
            console.error("Error details:", error.response?.data);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteRoom(roomId);
            message.success("Xóa phòng thành công!");
            fetchRooms();
        } catch (error) {
            message.error("Không thể xóa phòng!");
            console.error("Error deleting room:", error);
        }
    };

    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        setIsDetailDrawerOpen(true);
    };

    // Hàm cập nhật branchId cho tất cả rooms
    const handleMigrateData = async () => {
        try {
            if (!selectedBranch) {
                message.error(
                    "Vui lòng chọn chi nhánh trước khi cập nhật dữ liệu"
                );
                return;
            }

            setIsMigratingData(true);

            // Cập nhật tất cả phòng chưa có chi nhánh
            const result = await updateAllRoomsBranch(selectedBranch);

            if (result.updated > 0) {
                message.success(
                    `Đã cập nhật ${result.updated} phòng vào chi nhánh`
                );
                setNeedsMigration(false);
            } else {
                message.info("Không có phòng nào cần cập nhật");
            }

            // Tải lại dữ liệu
            fetchRooms();
        } catch (error) {
            console.error("Failed to migrate data:", error);
            message.error("Không thể cập nhật dữ liệu chi nhánh");
        } finally {
            setIsMigratingData(false);
        }
    };

    // Find the current branch name
    const getCurrentBranchName = () => {
        if (!selectedBranch || !branches) return "Tất cả chi nhánh";

        const branch = branches.find((b) => b.id === selectedBranch);
        return branch ? branch.name : "Tất cả chi nhánh";
    };

    // Render the migration alert if needed
    const renderMigrationAlert = () => {
        if (!needsMigration || !selectedBranch) return null;

        return (
            <Alert
                message="Dữ liệu cần cập nhật"
                description={
                    <div>
                        <p>
                            Có phòng chưa được gán chi nhánh. Cập nhật ngay để
                            quản lý tốt hơn.
                        </p>
                        <Button
                            type="primary"
                            onClick={handleMigrateData}
                            loading={isMigratingData}
                        >
                            Cập nhật tất cả vào chi nhánh hiện tại
                        </Button>
                    </div>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
            />
        );
    };

    // Filter rooms based on search keyword using useMemo
    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            const searchMatch = room.roomCode
                .toLowerCase()
                .includes(searchKeyword.toLowerCase());
            return searchMatch;
        });
    }, [rooms, searchKeyword]);

    // Function to schedule room status change
    const scheduleStatusChange = (roomId, endDate) => {
        // Clear any existing timer for this room
        if (maintenanceTimers[roomId]) {
            clearTimeout(maintenanceTimers[roomId]);
        }

        // Calculate time difference between now and end date
        const now = new Date();
        const end = new Date(endDate);
        const timeToWait = end.getTime() - now.getTime();

        if (timeToWait <= 0) {
            // If end date is in the past, change status immediately
            handleStatusChange(roomId, "Available");
            return;
        }

        // Set a timeout to change the status at the end date
        const timerId = setTimeout(async () => {
            try {
                await handleStatusChange(roomId, "Available");
                message.success(
                    `Phòng #${roomId} đã tự động chuyển từ trạng thái bảo trì sang còn trống`
                );

                // Remove the timer from the state
                setMaintenanceTimers((prev) => {
                    const newTimers = { ...prev };
                    delete newTimers[roomId];
                    return newTimers;
                });
            } catch (error) {
                console.error("Error in auto-changing room status:", error);
                message.error("Không thể tự động cập nhật trạng thái phòng!");
            }
        }, timeToWait);

        // Store the timer ID
        setMaintenanceTimers((prev) => ({
            ...prev,
            [roomId]: timerId,
        }));

        // Log the scheduled time
        console.log(
            `Scheduled status change for room ${roomId} at ${end.toLocaleString()}`
        );
    };

    const handleStatusChange = async (roomId, newStatus, endDate = null) => {
        try {
            // Store end date based on the status type
            const updateData = {};

            if (endDate) {
                if (newStatus === "Maintenance") {
                    updateData.maintenanceEndDate = endDate.toISOString();
                } else if (newStatus === "Cleaning") {
                    updateData.cleaningEndDate = endDate.toISOString();
                }
            }

            // Get the updated room data from API
            const updatedRoom = await updateRoomStatus(
                roomId,
                newStatus,
                updateData
            );

            // Update the UI with new room data
            setRooms((prevRooms) =>
                prevRooms.map((room) =>
                    room.id === roomId
                        ? {
                              ...room,
                              status: newStatus,
                              ...(newStatus === "Maintenance" && endDate
                                  ? {
                                        maintenanceEndDate:
                                            endDate.toISOString(),
                                    }
                                  : {}),
                              ...(newStatus === "Cleaning" && endDate
                                  ? { cleaningEndDate: endDate.toISOString() }
                                  : {}),
                          }
                        : room
                )
            );

            // Update selected room if its open in drawer
            if (selectedRoom && selectedRoom.id === roomId) {
                setSelectedRoom((prevRoom) => ({
                    ...prevRoom,
                    status: newStatus,
                    ...(newStatus === "Maintenance" && endDate
                        ? { maintenanceEndDate: endDate.toISOString() }
                        : {}),
                    ...(newStatus === "Cleaning" && endDate
                        ? { cleaningEndDate: endDate.toISOString() }
                        : {}),
                }));
            }

            // If it's a status with end date, schedule status change
            if (endDate) {
                if (newStatus === "Maintenance" || newStatus === "Cleaning") {
                    scheduleStatusChange(roomId, endDate);
                }
            }

            message.success(
                `Trạng thái phòng đã được cập nhật thành ${
                    roomStatuses[newStatus]?.text || newStatus
                }!`
            );

            // Refresh stats
            fetchRoomStats();

            return updatedRoom;
        } catch (error) {
            throw error;
        }
    };

    const handleResetFilters = () => {
        setSelectedFloor(0);
        setSelectedType(null);
        setSelectedStatus(null);
        setSearchKeyword("");
    };

    // Group rooms by floor
    const roomsByFloor = useMemo(() => {
        const grouped = {};

        filteredRooms.forEach((room) => {
            const floorKey = room.floorDetails?.id || room.floor || "N/A";
            const floorNumber =
                room.floorDetails?.floorNumber || room.floor || "N/A";
            const floorName =
                room.floorDetails?.name ||
                `Tầng ${room.floor}` ||
                "Không có tầng";

            if (!grouped[floorKey]) {
                grouped[floorKey] = {
                    id: floorKey,
                    floorNumber: floorNumber,
                    name: floorName,
                    rooms: [],
                };
            }
            grouped[floorKey].rooms.push(room);
        });

        // Sort by floor number
        return Object.values(grouped).sort((a, b) => {
            if (
                typeof a.floorNumber === "number" &&
                typeof b.floorNumber === "number"
            ) {
                return a.floorNumber - b.floorNumber;
            }
            return String(a.floorNumber).localeCompare(String(b.floorNumber));
        });
    }, [filteredRooms]);

    const handleMaintenanceClick = (room) => {
        setSelectedRoomForMaintenance(room);
        setIsMaintenanceModalOpen(true);
    };

    const handleMaintenanceSubmit = async (values) => {
        try {
            const { roomId, maintenanceEndDate } = values;
            await handleStatusChange(roomId, "Maintenance", maintenanceEndDate);
            message.success("Đã đặt trạng thái bảo trì thành công!");
        } catch (error) {
            console.error("Error setting maintenance status:", error);
            message.error("Không thể đặt trạng thái bảo trì!");
        }
    };

    const handleCleaningClick = (room) => {
        setSelectedRoomForCleaning(room);
        setIsCleaningModalOpen(true);
    };

    const handleCleaningSubmit = async (values) => {
        try {
            const { roomId, cleaningEndDate } = values;
            await handleStatusChange(roomId, "Cleaning", cleaningEndDate);
            message.success("Đã đặt trạng thái dọn dẹp thành công!");
        } catch (error) {
            console.error("Error setting cleaning status:", error);
            message.error("Không thể đặt trạng thái dọn dẹp!");
        }
    };

    const renderRoomsByFloor = () => {
        if (!selectedBranch) {
            return (
                <Empty
                    description="Vui lòng chọn chi nhánh để xem danh sách phòng"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            );
        }

        if (filteredRooms.length === 0) {
            return (
                <Empty description="Không tìm thấy phòng nào phù hợp với bộ lọc" />
            );
        }

        return roomsByFloor.map((floorGroup) => (
            <div key={floorGroup.id} style={{ marginBottom: 24 }}>
                <Card
                    title={
                        <Space>
                            <BankOutlined
                                style={{ color: "#1890ff", fontSize: 18 }}
                            />
                            <span style={{ fontWeight: 600, fontSize: 16 }}>
                                {floorGroup.name}
                            </span>
                            <Tag color="blue">
                                {floorGroup.rooms.length} phòng
                            </Tag>
                        </Space>
                    }
                    style={{
                        marginBottom: 16,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                        borderRadius: "8px",
                    }}
                    headStyle={{
                        background: "#f5f8ff",
                        borderBottom: "1px solid #e6f0ff",
                        borderRadius: "8px 8px 0 0",
                    }}
                    styles={{ padding: "16px" }}
                >
                    <div className="room-grid">
                        {floorGroup.rooms.map((room) => (
                            <div
                                key={room.id}
                                className={`room-card ${room.status.toLowerCase()}`}
                                style={{ minHeight: 200 }}
                            >
                                <div className="room-code">{room.roomCode}</div>
                                <div className="room-type">
                                    <TeamOutlined style={{ marginRight: 4 }} />
                                    {room.roomType?.name || "Unknown"}
                                </div>
                                <div className="room-status">
                                    <Tag
                                        color={roomStatuses[room.status]?.color}
                                    >
                                        {roomStatuses[room.status]?.text}
                                    </Tag>
                                    {room.status === "Maintenance" &&
                                        room.maintenanceEndDate && (
                                            <div
                                                style={{
                                                    fontSize: "11px",
                                                    marginTop: 4,
                                                }}
                                            >
                                                <ClockCircleOutlined /> Tự động
                                                hết hạn:{" "}
                                                {new Date(
                                                    room.maintenanceEndDate
                                                ).toLocaleString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        )}
                                    {room.status === "Cleaning" &&
                                        room.cleaningEndDate && (
                                            <div
                                                style={{
                                                    fontSize: "11px",
                                                    marginTop: 4,
                                                }}
                                            >
                                                <ClockCircleOutlined /> Tự động
                                                hết hạn:{" "}
                                                {new Date(
                                                    room.cleaningEndDate
                                                ).toLocaleString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        )}
                                </div>
                                <div className="room-info">
                                    <div className="price">
                                        {room.price?.toLocaleString("vi-VN")}
                                    </div>
                                    <Tag color="blue">
                                        <TeamOutlined /> {room.capacity || 1}
                                    </Tag>
                                </div>
                                <div className="room-actions">
                                    <Button
                                        type="text"
                                        icon={<InfoCircleOutlined />}
                                        onClick={() => handleRoomClick(room)}
                                        title="Xem chi tiết"
                                    />
                                    <Button
                                        type="text"
                                        icon={<ToolOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMaintenanceClick(room);
                                        }}
                                        title="Báo bảo trì"
                                    />
                                    <Button
                                        type="text"
                                        icon={<SyncOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCleaningClick(room);
                                        }}
                                        title="Yêu cầu dọn dẹp"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        ));
    };

    const tabItems = [
        {
            key: "byFloor",
            label: (
                <span>
                    <BankOutlined /> Xem theo tầng
                </span>
            ),
            children: renderRoomsByFloor(),
        },
        {
            key: "allRooms",
            label: (
                <span>
                    <AppstoreOutlined /> Tất cả phòng
                </span>
            ),
            children: (
                <>
                    {!selectedBranch ? (
                        <Empty
                            description="Vui lòng chọn chi nhánh để xem danh sách phòng"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : filteredRooms.length > 0 ? (
                        <div className="room-grid">
                            {filteredRooms.map((room) => (
                                <div
                                    key={room.id}
                                    className={`room-card ${room.status.toLowerCase()}`}
                                    onClick={() => handleRoomClick(room)}
                                    style={{ minHeight: 200 }}
                                >
                                    <div className="room-code">
                                        {room.roomCode}
                                    </div>
                                    <div className="room-type">
                                        <TeamOutlined
                                            style={{ marginRight: 4 }}
                                        />
                                        {room.roomType?.name || "Unknown"}
                                    </div>
                                    <div className="room-status">
                                        <Tag
                                            color={
                                                roomStatuses[room.status]?.color
                                            }
                                        >
                                            {roomStatuses[room.status]?.text}
                                        </Tag>
                                        {room.status === "Maintenance" &&
                                            room.maintenanceEndDate && (
                                                <div
                                                    style={{
                                                        fontSize: "11px",
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    <ClockCircleOutlined /> Tự
                                                    động hết hạn:{" "}
                                                    {new Date(
                                                        room.maintenanceEndDate
                                                    ).toLocaleString("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            )}
                                        {room.status === "Cleaning" &&
                                            room.cleaningEndDate && (
                                                <div
                                                    style={{
                                                        fontSize: "11px",
                                                        marginTop: 4,
                                                    }}
                                                >
                                                    <ClockCircleOutlined /> Tự
                                                    động hết hạn:{" "}
                                                    {new Date(
                                                        room.cleaningEndDate
                                                    ).toLocaleString("vi-VN", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            )}
                                    </div>
                                    <div className="room-info">
                                        <div className="price">
                                            {room.price?.toLocaleString(
                                                "vi-VN"
                                            )}
                                        </div>
                                        <Tag color="blue">
                                            <TeamOutlined />{" "}
                                            {room.capacity || 1}
                                        </Tag>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="Không tìm thấy phòng nào phù hợp với bộ lọc" />
                    )}
                </>
            ),
        },
    ];

    return (
        <>
            <Card style={{ boxShadow: "0 1px 10px rgba(0, 0, 0, 0.05)" }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Space
                            size="large"
                            style={{
                                width: "100%",
                                justifyContent: "space-between",
                            }}
                        >
                            <Title level={4} style={{ margin: 0 }}>
                                <HomeOutlined /> Quản lý Phòng
                            </Title>

                            <Space>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        setEditingRoom(null);
                                        setIsAddEditModalOpen(true);
                                    }}
                                    disabled={!selectedBranch}
                                >
                                    Thêm phòng mới
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleResetFilters}
                                >
                                    Làm mới bộ lọc
                                </Button>
                            </Space>
                        </Space>
                    </Col>

                    {/* Branch info banner */}
                    {selectedBranch && (
                        <Col span={24}>
                            <Card
                                style={{
                                    background: "#f0f7ff",
                                    marginBottom: 16,
                                }}
                            >
                                <Space>
                                    <BranchesOutlined
                                        style={{ fontSize: 18 }}
                                    />
                                    <Text strong>Chi nhánh hiện tại:</Text>
                                    <Text>{getCurrentBranchName()}</Text>
                                </Space>
                            </Card>
                        </Col>
                    )}

                    {/* Migration alert */}
                    {renderMigrationAlert()}

                    {/* Filters */}
                    <Col span={24}>
                        <Space style={{ marginBottom: 16 }}>
                            <Select
                                placeholder="Chọn chi nhánh"
                                style={{ width: 200 }}
                                value={selectedBranch}
                                onChange={(value) => {
                                    setSelectedBranch(value);
                                    setSelectedFloor(0); // Reset floor when branch changes
                                }}
                                optionFilterProp="children"
                                showSearch
                                allowClear
                                loading={loading}
                                notFoundContent={
                                    loading
                                        ? "Đang tải..."
                                        : "Không có chi nhánh"
                                }
                            >
                                {branches && branches.length > 0 ? (
                                    branches.map((branch) => (
                                        <Select.Option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </Select.Option>
                                    ))
                                ) : (
                                    <Select.Option disabled>
                                        Không có chi nhánh
                                    </Select.Option>
                                )}
                            </Select>

                            <Select
                                value={selectedFloor}
                                onChange={setSelectedFloor}
                                options={floors.map((f) => ({
                                    value: f.id,
                                    label: f.name,
                                }))}
                                style={{ width: 150 }}
                                disabled={!selectedBranch}
                                loading={loading}
                                notFoundContent="Không có tầng nào"
                                placeholder="Chọn tầng"
                            />
                            <Select
                                value={selectedType}
                                onChange={setSelectedType}
                                options={roomTypes.map((t) => ({
                                    value: t.id,
                                    label: t.name,
                                }))}
                                style={{ width: 180 }}
                                disabled={!selectedBranch}
                                placeholder="Chọn loại phòng"
                            />
                            <Select
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                options={[
                                    {
                                        value: null,
                                        label: "Tất cả trạng thái",
                                    },
                                    ...Object.entries(roomStatuses).map(
                                        ([key, value]) => ({
                                            value: key,
                                            label: value.text,
                                        })
                                    ),
                                ]}
                                style={{ width: 180 }}
                                disabled={!selectedBranch}
                                placeholder="Chọn trạng thái"
                            />
                            <Input
                                placeholder="Tìm kiếm phòng..."
                                prefix={<SearchOutlined />}
                                value={searchKeyword}
                                onChange={(e) =>
                                    setSearchKeyword(e.target.value)
                                }
                                style={{ width: 200 }}
                                allowClear
                                disabled={!selectedBranch}
                            />
                        </Space>
                    </Col>

                    {/* Stats cards */}
                    <Col span={24}>
                        <Row gutter={[16, 16]}>
                            <Col span={4}>
                                <Card
                                    hoverable
                                    style={{
                                        boxShadow:
                                            "0 2px 8px rgba(24, 144, 255, 0.15)",
                                        borderTop: "3px solid #1890ff",
                                    }}
                                >
                                    <Statistic
                                        title={
                                            <Text strong>Tổng số phòng</Text>
                                        }
                                        value={stats.total}
                                        valueStyle={{
                                            color: "#1890ff",
                                            fontSize: 24,
                                        }}
                                        prefix={<HomeOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={5}>
                                <Card
                                    hoverable
                                    style={{
                                        boxShadow:
                                            "0 2px 8px rgba(82, 196, 26, 0.15)",
                                        borderTop: "3px solid #52c41a",
                                    }}
                                >
                                    <Statistic
                                        title={<Text strong>Còn trống</Text>}
                                        value={stats.available}
                                        valueStyle={{
                                            color: "#52c41a",
                                            fontSize: 24,
                                        }}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={5}>
                                <Card
                                    hoverable
                                    style={{
                                        boxShadow:
                                            "0 2px 8px rgba(245, 34, 45, 0.15)",
                                        borderTop: "3px solid #f5222d",
                                    }}
                                >
                                    <Statistic
                                        title={<Text strong>Đã đặt</Text>}
                                        value={stats.booked}
                                        valueStyle={{
                                            color: "#f5222d",
                                            fontSize: 24,
                                        }}
                                        prefix={<CloseCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={5}>
                                <Card
                                    hoverable
                                    style={{
                                        boxShadow:
                                            "0 2px 8px rgba(250, 173, 20, 0.15)",
                                        borderTop: "3px solid #faad14",
                                    }}
                                >
                                    <Statistic
                                        title={<Text strong>Đang dọn</Text>}
                                        value={stats.cleaning}
                                        valueStyle={{
                                            color: "#faad14",
                                            fontSize: 24,
                                        }}
                                        prefix={<SyncOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={5}>
                                <Card
                                    hoverable
                                    style={{
                                        boxShadow:
                                            "0 2px 8px rgba(24, 144, 255, 0.15)",
                                        borderTop: "3px solid #1890ff",
                                    }}
                                >
                                    <Statistic
                                        title={<Text strong>Bảo trì</Text>}
                                        value={stats.maintenance}
                                        valueStyle={{
                                            color: "#1890ff",
                                            fontSize: 24,
                                        }}
                                        prefix={<ToolOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* Room list */}
                    <Col span={24}>
                        <Tabs
                            defaultActiveKey="byFloor"
                            items={tabItems}
                            style={{
                                marginTop: 8,
                            }}
                            tabBarStyle={{
                                marginBottom: 16,
                                fontWeight: 500,
                            }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Modals & Drawers */}
            <AddEditRoomModal
                open={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSubmit={editingRoom ? handleEditRoom : handleAddRoom}
                initialData={editingRoom}
                selectedBranch={selectedBranch}
                floors={floors.filter((floor) => floor.id !== 0)} // Exclude "All floors" option
            />

            <RoomDetailDrawer
                open={isDetailDrawerOpen}
                onClose={() => setIsDetailDrawerOpen(false)}
                room={selectedRoom}
                onEdit={() => {
                    setEditingRoom(selectedRoom);
                    setIsDetailDrawerOpen(false);
                    setIsAddEditModalOpen(true);
                }}
                onDelete={() => {
                    handleDeleteRoom(selectedRoom.id);
                    setIsDetailDrawerOpen(false);
                }}
                onStatusChange={handleStatusChange}
            />

            <MaintenanceModal
                open={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                room={selectedRoomForMaintenance}
                onSubmit={handleMaintenanceSubmit}
            />

            <CleaningModal
                open={isCleaningModalOpen}
                onClose={() => setIsCleaningModalOpen(false)}
                room={selectedRoomForCleaning}
                onSubmit={handleCleaningSubmit}
            />

            <style jsx global>{`
                .room-grid {
                    display: grid;
                    grid-template-columns: repeat(
                        auto-fill,
                        minmax(200px, 1fr)
                    );
                    gap: 16px;
                }

                .room-card {
                    position: relative;
                    border-radius: 8px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
                    transition: all 0.3s;
                    cursor: pointer;
                }

                .room-card.available {
                    background: #f6ffed;
                    border: 1px solid #b7eb8f;
                }

                .room-card.booked {
                    background: #fff1f0;
                    border: 1px solid #ffa39e;
                }

                .room-card.cleaning {
                    background: #fff7e6;
                    border: 1px solid #ffd591;
                }

                .room-card.maintenance {
                    background: #e6f7ff;
                    border: 1px solid #91d5ff;
                }

                .room-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .room-code {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .room-type {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 8px;
                }

                .room-status {
                    margin-bottom: 12px;
                }

                .room-info {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .price {
                    font-weight: 500;
                }

                .price::after {
                    content: "đ";
                    margin-left: 2px;
                }

                .room-actions {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .room-card:hover .room-actions {
                    opacity: 1;
                }

                .room-actions .ant-btn {
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.8);
                }

                .room-actions .ant-btn:hover {
                    background: white;
                    transform: scale(1.1);
                }
            `}</style>
        </>
    );
}
