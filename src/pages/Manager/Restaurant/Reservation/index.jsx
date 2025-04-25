import React, { useState } from "react";
import { Card, Table, Button, Tag, Space, Input, DatePicker, Select, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ReservationModal from "./Modals/ReservationModal";
import ReservationDrawer from "./Drawer/ReservationDrawer";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const statusColors = {
    pending: "orange",
    confirmed: "green",
    cancelled: "red",
    completed: "blue",
};

const initialReservations = [
    {
        id: 1,
        customerName: "Nguyen Van A",
        phone: "0909123456",
        date: "2025-04-25",
        time: "18:30",
        people: 4,
        table: "Bàn 3",
        area: "Phòng ăn chung",
        note: "Yêu cầu gần cửa sổ",
        status: "pending",
    },
];

export default function ReservationManagement() {
    const [reservations, setReservations] = useState(initialReservations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleAdd = () => {
        setEditingReservation(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingReservation(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setReservations((prev) => prev.filter((res) => res.id !== id));
    };

    const handleSave = (data) => {
        if (data.id) {
            setReservations((prev) => prev.map((r) => (r.id === data.id ? data : r)));
        } else {
            const newData = { ...data, id: Date.now() };
            setReservations((prev) => [...prev, newData]);
        }
        setIsModalOpen(false);
    };

    const handleView = (record) => {
        setSelectedReservation(record);
        setIsDrawerOpen(true);
    };

    const filteredData = reservations.filter((item) => {
        const matchSearch = item.customerName.toLowerCase().includes(searchText.toLowerCase()) || item.phone.includes(searchText);

        const matchStatus = statusFilter ? item.status === statusFilter : true;

        const matchDate = dateRange
            ? dayjs(item.date).isAfter(dayjs(dateRange[0]).subtract(1, "day")) &&
              dayjs(item.date).isBefore(dayjs(dateRange[1]).add(1, "day"))
            : true;

        return matchSearch && matchStatus && matchDate;
    });

    const columns = [
        {
            title: "Khách hàng",
            dataIndex: "customerName",
        },
        {
            title: "SĐT",
            dataIndex: "phone",
        },
        {
            title: "Ngày",
            dataIndex: "date",
        },
        {
            title: "Giờ",
            dataIndex: "time",
        },
        {
            title: "Số người",
            dataIndex: "people",
        },
        {
            title: "Bàn",
            dataIndex: "table",
        },
        {
            title: "Khu vực",
            dataIndex: "area",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
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
            title={<Title level={4}>Quản lý Đặt bàn</Title>}
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm đặt bàn
                </Button>
            }
        >
            <Space style={{ marginBottom: 16 }} wrap>
                <Input
                    placeholder="Tìm theo tên hoặc SĐT"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 200 }}
                />
                <Select
                    allowClear
                    placeholder="Trạng thái"
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                    options={[
                        { value: "pending", label: "Chờ xác nhận" },
                        { value: "confirmed", label: "Đã xác nhận" },
                        { value: "cancelled", label: "Đã huỷ" },
                        { value: "completed", label: "Hoàn tất" },
                    ]}
                    style={{ width: 150 }}
                />
                <RangePicker onChange={setDateRange} format="YYYY-MM-DD" />
            </Space>

            <Table columns={columns} dataSource={filteredData} rowKey="id" pagination={{ pageSize: 6 }} />

            <ReservationModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingReservation}
            />

            <ReservationDrawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                reservation={selectedReservation}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </Card>
    );
}
