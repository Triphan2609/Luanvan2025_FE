import React, { useState } from "react";
import { Card, Select, Row, Col, Tag, Button, Space, Typography, Empty, Input, Divider, Badge, message } from "antd";
import {
    HomeOutlined,
    UserAddOutlined,
    CreditCardOutlined,
    ClearOutlined,
    SearchOutlined,
    ToolOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import AddEditRoomModal from "./Modals/AddEditRoomModal";
import RoomDetailDrawer from "./Drawer/RoomDetailDrawer";
import BookingModal from "./Modals/BookingModal";
import CleaningModal from "./Modals/CleaningModal";
import MaintenanceModal from "./Modals/MaintenanceModal";

const { Title, Text } = Typography;

const floors = [
    { id: 0, name: "Tất cả tầng" },
    { id: 1, name: "Tầng 1" },
    { id: 2, name: "Tầng 2" },
    { id: 3, name: "Tầng 3" },
];

const roomTypes = [
    { id: "all", name: "Tất cả loại phòng" },
    { id: "Standard", name: "Standard" },
    { id: "Deluxe", name: "Deluxe" },
    { id: "Suite", name: "Suite" },
];

const roomStatuses = {
    Available: { color: "#52c41a", text: "Còn trống" },
    Booked: { color: "#f5222d", text: "Đã đặt" },
    Cleaning: { color: "#faad14", text: "Đang dọn" },
    Maintenance: { color: "#1890ff", text: "Bảo trì" },
};

const initialRooms = [
    {
        id: 1,
        roomCode: "P101",
        roomType: "Standard",
        floor: 1,
        price: 1000000,
        status: "Available",
        capacity: 2,
        amenities: ["TV", "AC", "WiFi"],
    },
    {
        id: 2,
        roomCode: "P201",
        roomType: "Deluxe",
        floor: 2,
        price: 1500000,
        status: "Booked",
        capacity: 3,
        amenities: ["TV", "AC", "WiFi", "Minibar"],
    },
    // Thêm các phòng khác...
];

export default function RoomManagement() {
    const [rooms, setRooms] = useState(initialRooms);
    const [selectedFloor, setSelectedFloor] = useState(0);
    const [selectedType, setSelectedType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    const handleAddRoom = (values) => {
        const newRoom = {
            id: Date.now(),
            ...values,
            status: "Available",
        };
        setRooms([...rooms, newRoom]);
    };

    const handleEditRoom = (values) => {
        setRooms(rooms.map((room) => (room.id === editingRoom.id ? { ...room, ...values } : room)));
    };

    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        setIsDetailDrawerOpen(true);
    };

    // Lọc phòng theo các tiêu chí
    const filteredRooms = rooms.filter((room) => {
        const floorMatch = selectedFloor === 0 || room.floor === selectedFloor;
        const typeMatch = selectedType === "all" || room.roomType === selectedType;
        const statusMatch = selectedStatus === "all" || room.status === selectedStatus;
        const searchMatch = room.roomCode.toLowerCase().includes(searchKeyword.toLowerCase());
        return floorMatch && typeMatch && statusMatch && searchMatch;
    });

    // Thống kê trạng thái phòng
    const stats = {
        total: filteredRooms.length,
        available: filteredRooms.filter((r) => r.status === "Available").length,
        booked: filteredRooms.filter((r) => r.status === "Booked").length,
        cleaning: filteredRooms.filter((r) => r.status === "Cleaning").length,
        maintenance: filteredRooms.filter((r) => r.status === "Maintenance").length,
    };

    const handleStatusChange = (roomId, newStatus) => {
        setRooms(rooms.map((room) => (room.id === roomId ? { ...room, status: newStatus } : room)));
    };

    const handleBookRoom = (bookingData) => {
        // Cập nhật trạng thái phòng
        setRooms(rooms.map((room) => (room.id === bookingData.roomId ? { ...room, status: "Booked" } : room)));
        message.success("Đặt phòng thành công!");
    };

    const handleCleaning = (cleaningData) => {
        handleStatusChange(cleaningData.roomId, "Cleaning");
        message.success("Đã gửi yêu cầu dọn phòng!");
    };

    const handleMaintenance = (maintenanceData) => {
        handleStatusChange(maintenanceData.roomId, "Maintenance");
        message.success("Đã gửi yêu cầu bảo trì!");
    };

    return (
        <>
            <Card>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Space size="large" style={{ width: "100%", justifyContent: "space-between" }}>
                            <Space>
                                <Title level={4} style={{ margin: 0 }}>
                                    <HomeOutlined /> Quản lý Phòng
                                </Title>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        setEditingRoom(null);
                                        setIsAddEditModalOpen(true);
                                    }}
                                >
                                    Thêm phòng mới
                                </Button>
                            </Space>
                            <Space>
                                <Select
                                    value={selectedFloor}
                                    onChange={setSelectedFloor}
                                    options={floors.map((f) => ({
                                        value: f.id,
                                        label: f.name,
                                    }))}
                                    style={{ width: 150 }}
                                />
                                <Select
                                    value={selectedType}
                                    onChange={setSelectedType}
                                    options={roomTypes.map((t) => ({
                                        value: t.id,
                                        label: t.name,
                                    }))}
                                    style={{ width: 180 }}
                                />
                                <Select
                                    value={selectedStatus}
                                    onChange={setSelectedStatus}
                                    options={[
                                        { value: "all", label: "Tất cả trạng thái" },
                                        ...Object.entries(roomStatuses).map(([key, value]) => ({
                                            value: key,
                                            label: value.text,
                                        })),
                                    ]}
                                    style={{ width: 180 }}
                                />
                                <Input
                                    placeholder="Tìm kiếm phòng..."
                                    prefix={<SearchOutlined />}
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    style={{ width: 200 }}
                                    allowClear
                                />
                            </Space>
                        </Space>
                    </Col>
                </Row>

                <Divider />

                <Space style={{ marginBottom: 16 }}>
                    <Tag color="blue">Tổng số: {stats.total}</Tag>
                    <Tag color="green">Còn trống: {stats.available}</Tag>
                    <Tag color="red">Đã đặt: {stats.booked}</Tag>
                    <Tag color="orange">Đang dọn: {stats.cleaning}</Tag>
                    <Tag color="blue">Bảo trì: {stats.maintenance}</Tag>
                </Space>

                <Row gutter={[16, 16]}>
                    {filteredRooms.length > 0 ? (
                        filteredRooms.map((room) => (
                            <Col key={room.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable
                                    onClick={() => handleRoomClick(room)}
                                    style={{
                                        borderColor: roomStatuses[room.status].color,
                                    }}
                                >
                                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                                        <Space style={{ justifyContent: "space-between", width: "100%" }}>
                                            <Title level={5} style={{ margin: 0 }}>
                                                {room.roomCode}
                                            </Title>
                                            <Badge color={roomStatuses[room.status].color} text={roomStatuses[room.status].text} />
                                        </Space>

                                        <Space style={{ justifyContent: "space-between", width: "100%" }}>
                                            <Text type="secondary">{room.roomType}</Text>
                                            <Text strong>{room.price.toLocaleString()}đ/đêm</Text>
                                        </Space>

                                        <Text type="secondary">Sức chứa: {room.capacity} người</Text>

                                        <Space wrap>
                                            {room.amenities.map((item) => (
                                                <Tag key={item}>{item}</Tag>
                                            ))}
                                        </Space>

                                        <Divider style={{ margin: "8px 0" }} />

                                        <Space direction="vertical" style={{ width: "100%" }}>
                                            {room.status === "Available" && (
                                                <Button
                                                    icon={<UserAddOutlined />}
                                                    type="primary"
                                                    block
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedRoom(room);
                                                        setIsBookingModalOpen(true);
                                                    }}
                                                >
                                                    Đặt phòng
                                                </Button>
                                            )}
                                            {room.status === "Booked" && (
                                                <Button icon={<CreditCardOutlined />} type="default" block>
                                                    Thanh toán
                                                </Button>
                                            )}
                                            <Button
                                                icon={<ClearOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRoom(room);
                                                    setIsCleaningModalOpen(true);
                                                }}
                                                block
                                            >
                                                Dọn phòng
                                            </Button>
                                            <Button
                                                icon={<ToolOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRoom(room);
                                                    setIsMaintenanceModalOpen(true);
                                                }}
                                                danger
                                                block
                                            >
                                                Báo bảo trì
                                            </Button>
                                        </Space>
                                    </Space>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <Col span={24}>
                            <Empty description="Không tìm thấy phòng phù hợp" />
                        </Col>
                    )}
                </Row>
            </Card>

            <RoomDetailDrawer
                open={isDetailDrawerOpen}
                onClose={() => {
                    setIsDetailDrawerOpen(false);
                    setSelectedRoom(null);
                }}
                room={selectedRoom}
                onEdit={(room) => {
                    setEditingRoom(room);
                    setIsAddEditModalOpen(true);
                    setIsDetailDrawerOpen(false);
                }}
                onBook={(room) => {
                    // Handle booking
                    message.info("Chức năng đặt phòng đang được phát triển");
                }}
            />

            <AddEditRoomModal
                open={isAddEditModalOpen}
                onClose={() => {
                    setIsAddEditModalOpen(false);
                    setEditingRoom(null);
                }}
                onSubmit={editingRoom ? handleEditRoom : handleAddRoom}
                initialData={editingRoom}
                floors={floors}
                roomTypes={roomTypes}
            />

            <BookingModal
                open={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                room={selectedRoom}
                onSubmit={handleBookRoom}
            />

            <CleaningModal
                open={isCleaningModalOpen}
                onClose={() => setIsCleaningModalOpen(false)}
                room={selectedRoom}
                onSubmit={handleCleaning}
            />

            <MaintenanceModal
                open={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                room={selectedRoom}
                onSubmit={handleMaintenance}
            />
        </>
    );
}
