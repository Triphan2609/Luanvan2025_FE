import React, { useState } from "react";
import { Card, Typography, Button, Table, Space, Input, Tag, Popconfirm } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MenuModal from "./Modals/MenuModal";
import MenuDrawer from "./Drawer/MenuDrawer";

const { Title } = Typography;

const initialFoods = [
    { id: 1, name: "Gỏi cuốn tôm thịt", price: 25000 },
    { id: 2, name: "Phở bò đặc biệt", price: 45000 },
    { id: 3, name: "Cơm gà Hải Nam", price: 40000 },
];

const initialMenus = [
    {
        id: 1,
        name: "Menu trưa",
        description: "Thực đơn dành cho buổi trưa",
        status: true,
        foods: [1, 3],
    },
];

export default function MenuManagement() {
    const [menus, setMenus] = useState(initialMenus);
    const [foods] = useState(initialFoods);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    const handleAdd = () => {
        setEditingMenu(null);
        setIsModalOpen(true);
    };

    const handleEdit = (menu) => {
        setEditingMenu(menu);
        setIsModalOpen(true);
    };

    const handleView = (menu) => {
        setSelectedMenu(menu);
        setIsDrawerOpen(true);
    };

    const handleDelete = (id) => {
        setMenus((prev) => prev.filter((m) => m.id !== id));
    };

    const handleSave = (data) => {
        if (data.id) {
            setMenus((prev) => prev.map((m) => (m.id === data.id ? data : m)));
        } else {
            const newMenu = { ...data, id: Date.now() };
            setMenus((prev) => [...prev, newMenu]);
        }
        setIsModalOpen(false);
    };

    const filteredMenus = menus.filter((menu) => menu.name.toLowerCase().includes(searchText.toLowerCase()));

    const columns = [
        {
            title: "Tên menu",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            sorter: (a, b) => a.description.localeCompare(b.description),
        },
        {
            title: "Số lượng món",
            dataIndex: "foods",
            render: (foods) => foods?.length || 0,
            sorter: (a, b) => (a.foods?.length || 0) - (b.foods?.length || 0),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) => <Tag color={status ? "green" : "red"}>{status ? "Hiển thị" : "Ẩn"}</Tag>,
            filters: [
                { text: "Hiển thị", value: true },
                { text: "Ẩn", value: false },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Xác nhận xóa thực đơn này?"
                        description="Hành động này không thể hoàn tác."
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={<Title level={4}>Quản lý thực đơn chính</Title>}
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm thực đơn
                </Button>
            }
        >
            <Space style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm kiếm tên menu"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </Space>

            <Table
                dataSource={filteredMenus}
                columns={columns}
                rowKey="id"
                pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
                }}
            />

            <MenuModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingMenu}
                foodOptions={foods}
            />

            <MenuDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                menu={selectedMenu}
                onEdit={handleEdit}
                allFoods={foods}
            />
        </Card>
    );
}
