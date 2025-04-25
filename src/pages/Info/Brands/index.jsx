import React, { useState, useMemo } from "react";
import { Card, Table, Button, Space, Tag, message, Popconfirm, Input, Select, Row, Col } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import BranchModal from "./Modals/BranchModal";

const { Option } = Select;

const initialBranches = [
    {
        id: 1,
        name: "Chi nhánh Quận 1",
        address: "123 Lê Lợi, Quận 1, TP.HCM",
        phone: "0901234567",
        email: "quan1@nhks.vn",
        status: "active",
    },
    {
        id: 2,
        name: "Chi nhánh Quận 2",
        address: "456 Nguyễn Duy Trinh, Quận 2, TP.HCM",
        phone: "0902345678",
        email: "quan2@nhks.vn",
        status: "inactive",
    },
];

const statusColor = {
    active: "green",
    inactive: "red",
};

export default function BranchManagement() {
    const [branches, setBranches] = useState(initialBranches);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    const [searchKeyword, setSearchKeyword] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const handleAdd = () => {
        setEditingBranch(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingBranch(record);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setBranches(branches.filter((b) => b.id !== id));
        message.success("Xóa chi nhánh thành công");
    };

    const handleSave = (data) => {
        if (data.id) {
            setBranches((prev) => prev.map((b) => (b.id === data.id ? data : b)));
            message.success("Cập nhật chi nhánh thành công");
        } else {
            const newBranch = { ...data, id: Date.now() };
            setBranches((prev) => [...prev, newBranch]);
            message.success("Thêm chi nhánh mới thành công");
        }
        setIsModalOpen(false);
    };

    const filteredBranches = useMemo(() => {
        return branches
            .filter((b) => `${b.name} ${b.address}`.toLowerCase().includes(searchKeyword.toLowerCase()))
            .filter((b) => (filterStatus ? b.status === filterStatus : true));
    }, [branches, searchKeyword, filterStatus]);

    const columns = [
        {
            title: "Tên chi nhánh",
            dataIndex: "name",
            key: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            sorter: (a, b) => a.address.localeCompare(b.address),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
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
                        title="Bạn có chắc chắn muốn xóa chi nhánh này?"
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
            title="Quản lý Chi nhánh"
            extra={
                <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd}>
                    Thêm chi nhánh
                </Button>
            }
        >
            {/* 🔎 Thanh tìm kiếm & lọc */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Input
                        placeholder="Tìm theo tên hoặc địa chỉ"
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

            <Table dataSource={filteredBranches} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
            <BranchModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingBranch} />
        </Card>
    );
}
