import React, { useState } from "react";
import { Button, Card, Table, Tag, Typography, Space, Input } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PromotionModal from "./Modals/PromotionModal";
import PromotionDrawer from "./Drawer/PromotionDrawer";

const { Title } = Typography;

const promotionTypes = {
    discount_percent: "Giảm theo %",
    discount_amount: "Giảm tiền mặt",
    free_item: "Tặng món",
};

const statusColors = {
    active: "green",
    upcoming: "blue",
    expired: "red",
};

const initialData = [
    {
        id: 1,
        name: "Combo Gia Đình",
        type: "discount_percent",
        value: 20,
        note: "Áp dụng vào cuối tuần",
        startDate: "2025-04-01",
        endDate: "2025-05-01",
        status: "active",
    },
];

export default function Promotions() {
    const [promotions, setPromotions] = useState(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [drawerPromotion, setDrawerPromotion] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState("");

    const handleAdd = () => {
        setEditingPromotion(null);
        setIsModalOpen(true);
    };

    const handleEdit = (promo) => {
        setEditingPromotion(promo);
        setIsModalOpen(true);
    };

    const handleSave = (data) => {
        if (data.id) {
            setPromotions((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        } else {
            const newPromo = { ...data, id: Date.now() };
            setPromotions((prev) => [...prev, newPromo]);
        }
        setIsModalOpen(false);
    };

    const handleView = (promo) => {
        setDrawerPromotion(promo);
        setIsDrawerOpen(true);
    };

    const handleDelete = (id) => {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
    };

    const filteredData = promotions.filter(
        (p) =>
            p.name.toLowerCase().includes(searchText.toLowerCase()) || (p.note && p.note.toLowerCase().includes(searchText.toLowerCase()))
    );

    const columns = [
        {
            title: "Tên chương trình",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Loại",
            dataIndex: "type",
            filters: Object.entries(promotionTypes).map(([key, label]) => ({
                text: label,
                value: key,
            })),
            onFilter: (value, record) => record.type === value,
            render: (type) => promotionTypes[type],
        },
        {
            title: "Giá trị",
            dataIndex: "value",
            sorter: (a, b) => a.value - b.value,
            render: (val, record) => {
                if (record.type === "discount_percent") return `${val}%`;
                if (record.type === "discount_amount") return `${val.toLocaleString()} đ`;
                return val;
            },
        },
        {
            title: "Thời gian",
            dataIndex: "startDate",
            sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
            render: (_, record) => `${dayjs(record.startDate).format("DD/MM/YYYY")} - ${dayjs(record.endDate).format("DD/MM/YYYY")}`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            filters: Object.entries(statusColors).map(([key]) => ({
                text: key.charAt(0).toUpperCase() + key.slice(1),
                value: key,
            })),
            onFilter: (value, record) => record.status === value,
            render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleView(record)} />
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={<Title level={4}>Chương trình khuyến mãi</Title>}
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm khuyến mãi
                </Button>
            }
        >
            <Space style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm kiếm tên chương trình hoặc ghi chú"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    style={{ width: 300 }}
                />
            </Space>

            <Table columns={columns} dataSource={filteredData} rowKey="id" pagination={{ pageSize: 5 }} />

            <PromotionModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingPromotion} />

            <PromotionDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                promotion={drawerPromotion}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Card>
    );
}
