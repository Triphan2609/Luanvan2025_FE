// FoodManagement.jsx
import React, { useState } from "react";
import { Card, Table, Button, Space, Input, Select, Popconfirm, Tag, Image, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import FoodModal from "./Modals/FoodModal";
import FoodDetailDrawer from "./Drawer/FoodDetailDrawer";

const { Search } = Input;

const initialFoods = [
    {
        id: 1,
        name: "Cơm chiên Dương Châu",
        category: "Món chính",
        price: 45000,
        image: "https://source.unsplash.com/400x300/?fried-rice",
        status: "available",
        ingredients: ["Cơm", "Trứng", "Lạp xưởng", "Rau củ"],
    },
    {
        id: 2,
        name: "Canh chua cá",
        category: "Món canh",
        price: 60000,
        image: "https://source.unsplash.com/400x300/?soup",
        status: "unavailable",
        ingredients: ["Cá", "Cà chua", "Thơm", "Rau ngò"],
    },
];

const categories = ["Tất cả món ăn", "Món chính", "Món phụ", "Món canh", "Đồ uống"];
const statusColors = {
    available: "green",
    unavailable: "red",
};

export default function FoodManagement() {
    const [foods, setFoods] = useState(initialFoods);
    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Tất cả món ăn");
    const [editingFood, setEditingFood] = useState(null);
    const [selectedFood, setSelectedFood] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleDelete = (id) => {
        setFoods((prev) => prev.filter((item) => item.id !== id));
        message.success("Xoá món ăn thành công");
    };

    const handleSave = (data) => {
        if (data.id) {
            setFoods((prev) => prev.map((f) => (f.id === data.id ? data : f)));
            message.success("Cập nhật món ăn thành công");
        } else {
            const newFood = { ...data, id: Date.now() };
            setFoods((prev) => [...prev, newFood]);
            message.success("Thêm món ăn thành công");
        }
        setIsModalOpen(false);
    };

    const handleSearch = (val) => setSearchText(val);
    const handleCategoryChange = (val) => setCategoryFilter(val);

    const filteredFoods = foods.filter(
        (f) =>
            f.name.toLowerCase().includes(searchText.toLowerCase()) && (categoryFilter === "Tất cả món ăn" || f.category === categoryFilter)
    );

    const columns = [
        {
            title: "Hình ảnh",
            dataIndex: "image",
            key: "image",
            render: (src) => <Image src={src} alt="food" width={80} height={60} style={{ objectFit: "cover", borderRadius: 8 }} />,
        },
        {
            title: "Tên món",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Loại",
            dataIndex: "category",
            key: "category",
            filters: categories.slice(1).map((c) => ({ text: c, value: c })),
            onFilter: (val, record) => record.category === val,
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            sorter: (a, b) => a.price - b.price,
            render: (price) => `${price.toLocaleString()}₫`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => <Tag color={statusColors[status]}>{status === "available" ? "Sẵn sàng" : "Tạm hết"}</Tag>,
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedFood(record);
                            setIsDrawerOpen(true);
                        }}
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingFood(record);
                            setIsModalOpen(true);
                        }}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xoá món này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xoá"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Quản lý Món ăn"
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingFood(null);
                        setIsModalOpen(true);
                    }}
                >
                    Thêm món
                </Button>
            }
        >
            <Space style={{ marginBottom: 16 }} wrap>
                <Search placeholder="Tìm kiếm tên món..." onSearch={handleSearch} allowClear />
                <Select
                    defaultValue="Tất cả món ăn"
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    options={categories.map((cat) => ({ value: cat, label: cat }))}
                />
            </Space>
            <Table dataSource={filteredFoods} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
            <FoodModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingFood} />
            <FoodDetailDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} food={selectedFood} />
        </Card>
    );
}
