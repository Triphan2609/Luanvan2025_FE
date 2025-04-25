import React, { useState } from "react";
import { Card, Table, Button, Space, Tag, message, Popconfirm, Select, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AreaModal from "./Modals/AreaModal.jsx";

const initialAreas = [
    { id: 1, name: "Phòng đơn", type: "hotel", status: "active" },
    { id: 2, name: "Phòng đôi", type: "hotel", status: "active" },
    { id: 3, name: "Phòng VIP", type: "hotel", status: "inactive" },
    { id: 4, name: "Phòng ăn", type: "restaurant", status: "active" },
    { id: 5, name: "Phòng riêng", type: "restaurant", status: "inactive" },
];

const statusColor = {
    active: "green",
    inactive: "red",
};

export default function AreaManagement() {
    const [areas, setAreas] = useState(initialAreas);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState("");

    const handleAdd = () => {
        setEditingArea(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingArea(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setAreas((prev) => prev.filter((a) => a.id !== id));
        message.success("Xóa khu vực thành công");
    };

    const handleSave = (data) => {
        if (data.id) {
            setAreas((prev) => prev.map((a) => (a.id === data.id ? data : a)));
            message.success("Cập nhật khu vực thành công");
        } else {
            const newArea = { ...data, id: Date.now() };
            setAreas((prev) => [...prev, newArea]);
            message.success("Thêm khu vực mới thành công");
        }
        setIsModalOpen(false);
    };

    const filteredAreas = areas
        .filter((area) => area.name.toLowerCase().includes(searchText.toLowerCase()))
        .filter((area) => (filterType ? area.type === filterType : true));

    const columns = [
        {
            title: "Tên khu vực",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type) => (type === "hotel" ? "Khách sạn" : "Nhà hàng"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => <Tag color={statusColor[status]}>{status === "active" ? "Hoạt động" : "Ngừng"}</Tag>,
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa khu vực này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Quản lý Khu vực"
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm khu vực
                </Button>
            }
        >
            <Space style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm theo tên khu vực"
                    allowClear
                    onSearch={(value) => setSearchText(value)}
                    style={{ width: 200 }}
                />
                <Select placeholder="Lọc theo loại" allowClear onChange={(value) => setFilterType(value)} style={{ width: 150 }}>
                    <Select.Option value="hotel">Khách sạn</Select.Option>
                    <Select.Option value="restaurant">Nhà hàng</Select.Option>
                </Select>
            </Space>
            <Table dataSource={filteredAreas} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
            <AreaModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingArea} />
        </Card>
    );
}
