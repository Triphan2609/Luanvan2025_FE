import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Input,
    message,
    Tooltip,
    Popconfirm,
    Tag,
} from "antd";
import {
    HomeOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import AddEditRoomTypeModal from "./Modals/AddEditRoomTypeModal";
import {
    getRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
} from "../../../../api/roomTypesApi";

const { Title } = Typography;

export default function RoomTypeManagement() {
    const [roomTypes, setRoomTypes] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch room types on component mount
    useEffect(() => {
        fetchRoomTypes();
    }, []);

    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const data = await getRoomTypes();
            setRoomTypes(data);
        } catch (error) {
            message.error("Không thể tải dữ liệu loại phòng!");
            console.error("Error fetching room types:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Tên loại phòng",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Giường",
            key: "beds",
            render: (_, record) => (
                <Tag icon={<HomeOutlined />} color="blue">
                    {record.bedCount} giường{" "}
                    {record.bedType === "Single" ? "đơn" : "đôi"}
                </Tag>
            ),
        },
        {
            title: "Giá cơ bản",
            dataIndex: "basePrice",
            key: "basePrice",
            render: (price) => `${Number(price).toLocaleString()}đ/đêm`,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingType(record);
                                setIsModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleAdd = async (values) => {
        try {
            await createRoomType(values);
            message.success("Thêm loại phòng mới thành công!");
            fetchRoomTypes();
        } catch (error) {
            message.error("Không thể thêm loại phòng!");
            console.error("Error adding room type:", error);
        }
    };

    const handleEdit = async (values) => {
        try {
            await updateRoomType(values.id, values);
            message.success("Cập nhật loại phòng thành công!");
            fetchRoomTypes();
        } catch (error) {
            message.error("Không thể cập nhật loại phòng!");
            console.error("Error updating room type:", error);
        }
    };

    const handleDelete = async (typeId) => {
        try {
            await deleteRoomType(typeId);
            message.success("Xóa loại phòng thành công!");
            fetchRoomTypes();
        } catch (error) {
            message.error("Không thể xóa loại phòng!");
            console.error("Error deleting room type:", error);
        }
    };

    // Use useMemo for filtered data to prevent unnecessary re-renders
    const filteredData = useMemo(() => {
        return roomTypes.filter(
            (type) =>
                type.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                type.description
                    .toLowerCase()
                    .includes(searchKeyword.toLowerCase())
        );
    }, [roomTypes, searchKeyword]);

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Space
                    style={{ justifyContent: "space-between", width: "100%" }}
                >
                    <Title level={4}>
                        <HomeOutlined /> Quản lý Loại Phòng
                    </Title>
                    <Space>
                        <Input
                            placeholder="Tìm kiếm..."
                            prefix={<SearchOutlined />}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            style={{ width: 200 }}
                            allowClear
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setEditingType(null);
                                setIsModalOpen(true);
                            }}
                        >
                            Thêm loại phòng
                        </Button>
                    </Space>
                </Space>

                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng số ${total} loại phòng`,
                    }}
                />
            </Space>

            <AddEditRoomTypeModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingType(null);
                }}
                onSubmit={editingType ? handleEdit : handleAdd}
                initialData={editingType}
            />
        </Card>
    );
}
