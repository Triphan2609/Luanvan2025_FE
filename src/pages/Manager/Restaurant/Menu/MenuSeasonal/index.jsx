import React, { useState } from "react";
import { Card, Typography, Button, Table, Space, Input, Tag } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import MenuSeasonalModal from "./Modals/MenuSeasonalModal";
import MenuSeasonalDrawer from "./Drawer/MenuSeasonalDrawer";
import dayjs from "dayjs";
import { Popconfirm } from "antd";

const { Title } = Typography;

const initialMenus = [
    {
        id: 1,
        name: "Menu Tết 2025",
        description: "Áp dụng dịp Tết Nguyên Đán",
        startDate: "2025-01-15",
        endDate: "2025-02-15",
        status: true,
        foods: [1, 2],
    },
];

const initialFoods = [
    { id: 1, name: "Bánh chưng", price: 30000 },
    { id: 2, name: "Thịt kho tàu", price: 50000 },
    { id: 3, name: "Gỏi ngó sen", price: 35000 },
];

export default function SeasonalMenuManagement() {
    // State Management
    const [menus, setMenus] = useState(initialMenus);
    const [foods] = useState(initialFoods);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    // Event Handlers
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

    // Table Columns Configuration
    const columns = [
        {
            title: "Tên menu",
            dataIndex: "name",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
        },
        {
            title: "Thời gian áp dụng",
            dataIndex: "startDate",
            render: (_, record) => `${dayjs(record.startDate).format("DD/MM/YYYY")} - 
                                  ${dayjs(record.endDate).format("DD/MM/YYYY")}`,
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
                        title="Bạn có chắc muốn xoá thực đơn này?"
                        onConfirm={() => handleDelete(record.id)}
                        icon={<ExclamationCircleOutlined />}
                        okText="Xoá"
                        cancelText="Huỷ"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={<Title level={4}>Thực đơn theo mùa</Title>}
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm thực đơn mùa
                </Button>
            }
        >
            <Space style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm kiếm theo tên menu"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    style={{ width: 300 }}
                />
            </Space>

            <Table
                dataSource={filteredMenus}
                columns={columns}
                rowKey="id"
                pagination={{
                    pageSize: 5,
                }}
            />

            <MenuSeasonalModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingMenu}
                foodOptions={foods}
            />

            <MenuSeasonalDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                menu={selectedMenu}
                onEdit={handleEdit}
                allFoods={foods}
            />
        </Card>
    );
}
