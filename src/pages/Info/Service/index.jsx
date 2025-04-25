import React, { useState, useMemo } from "react";
import { Card, Table, Button, Space, Tag, message, Popconfirm, Input, Select, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import ServiceModal from "./Modals/ServiceModal";

const { Option } = Select;

const initialServices = [
    {
        id: 1,
        name: "Phòng ngủ",
        description: "Phòng ngủ tiêu chuẩn 3 sao",
        status: "active",
    },
    {
        id: 2,
        name: "Phòng hội nghị",
        description: "Phòng hội nghị sức chứa 100 người",
        status: "inactive",
    },
];

const statusColor = {
    active: "green",
    inactive: "red",
};

export default function ServiceManagement() {
    const [services, setServices] = useState(initialServices);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const handleAdd = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingService(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setServices(services.filter((s) => s.id !== id));
        message.success("Xóa dịch vụ thành công");
    };

    const handleSave = (data) => {
        if (data.id) {
            setServices((prev) => prev.map((s) => (s.id === data.id ? data : s)));
            message.success("Cập nhật dịch vụ thành công");
        } else {
            const newService = { ...data, id: Date.now() };
            setServices((prev) => [...prev, newService]);
            message.success("Thêm dịch vụ thành công");
        }
        setIsModalOpen(false);
    };

    // ✅ Dữ liệu hiển thị sau khi lọc và tìm kiếm
    const filteredServices = useMemo(() => {
        return services
            .filter((s) => s.name.toLowerCase().includes(searchKeyword.toLowerCase()))
            .filter((s) => (filterStatus ? s.status === filterStatus : true));
    }, [services, searchKeyword, filterStatus]);

    const columns = [
        {
            title: "Tên dịch vụ",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => <Tag color={statusColor[status]}>{status === "active" ? "Hoạt động" : "Ngừng"}</Tag>,
            sorter: (a, b) => a.status.localeCompare(b.status),
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
                        title="Bạn có chắc chắn muốn xóa dịch vụ này?"
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
            title="Quản lý Dịch vụ & Tiện ích"
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm dịch vụ
                </Button>
            }
        >
            {/* 🔎 Thanh lọc và tìm kiếm */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Input
                        placeholder="Tìm theo tên dịch vụ"
                        prefix={<SearchOutlined />}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Select
                        allowClear
                        placeholder="Lọc theo trạng thái"
                        style={{ width: "100%" }}
                        value={filterStatus || undefined}
                        onChange={(value) => setFilterStatus(value)}
                    >
                        <Option value="active">Hoạt động</Option>
                        <Option value="inactive">Ngừng</Option>
                    </Select>
                </Col>
            </Row>

            <Table dataSource={filteredServices} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
            <ServiceModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingService} />
        </Card>
    );
}
