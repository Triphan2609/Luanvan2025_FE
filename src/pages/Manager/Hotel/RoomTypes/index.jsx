import React, { useState } from "react";
import { Card, Table, Button, Space, Typography, Input, message, Tooltip, Popconfirm, Tag } from "antd";
import {
    HomeOutlined, // Thay BedOutlined bằng HomeOutlined
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import AddEditRoomTypeModal from "./Modals/AddEditRoomTypeModal";

const { Title } = Typography;

// Dữ liệu mẫu đơn giản hóa
const initialRoomTypes = [
    {
        id: 1,
        name: "Phòng đơn",
        description: "1 giường đơn",
        bedCount: 1,
        bedType: "Single",
        basePrice: 500000,
    },
    {
        id: 2,
        name: "Phòng đôi",
        description: "1 giường đôi",
        bedCount: 1,
        bedType: "Double",
        basePrice: 700000,
    },
    {
        id: 3,
        name: "Phòng twin",
        description: "2 giường đơn",
        bedCount: 2,
        bedType: "Single",
        basePrice: 800000,
    },
];

export default function RoomTypeManagement() {
    const [roomTypes, setRoomTypes] = useState(initialRoomTypes);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);

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
                    {record.bedCount} giường {record.bedType === "Single" ? "đơn" : "đôi"}
                </Tag>
            ),
        },
        {
            title: "Giá cơ bản",
            dataIndex: "basePrice",
            key: "basePrice",
            render: (price) => `${price.toLocaleString()}đ/đêm`,
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

    const handleAdd = (values) => {
        const newType = {
            id: Date.now(),
            ...values,
        };
        setRoomTypes([...roomTypes, newType]);
        message.success("Thêm loại phòng mới thành công!");
    };

    const handleEdit = (values) => {
        setRoomTypes(roomTypes.map((type) => (type.id === editingType.id ? { ...type, ...values } : type)));
        message.success("Cập nhật loại phòng thành công!");
    };

    const handleDelete = (typeId) => {
        setRoomTypes(roomTypes.filter((type) => type.id !== typeId));
        message.success("Xóa loại phòng thành công!");
    };

    const filteredData = roomTypes.filter(
        (type) =>
            type.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            type.description.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <Card>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Space style={{ justifyContent: "space-between", width: "100%" }}>
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
