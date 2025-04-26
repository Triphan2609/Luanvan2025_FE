import React, { useState } from "react";
import { Card, Table, Button, Space, Typography, Tag, Row, Col, Input, Select, Tooltip, Badge, message, Popconfirm } from "antd";

// Add this destructuring for Search
const { Search } = Input;

import { PlusOutlined, EditOutlined, LockOutlined, UnlockOutlined, KeyOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import AccountForm from "./components/AccountForm";
import ChangePasswordForm from "./components/ChangePasswordForm";

const { Title, Text } = Typography; // Add Text import from Typography

// Constants
const ACCOUNT_STATUS = {
    ACTIVE: "active",
    LOCKED: "locked",
};

const ACCOUNT_ROLE = {
    ADMIN: "admin",
    MANAGER: "manager",
    STAFF: "staff",
};

export default function AccountManagement() {
    // States
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // Sample data
    const [accounts, setAccounts] = useState([
        {
            id: "TK001",
            username: "admin",
            fullName: "Administrator",
            email: "admin@example.com",
            role: ACCOUNT_ROLE.ADMIN,
            status: ACCOUNT_STATUS.ACTIVE,
            lastLogin: "2024-04-26 08:30:00",
            createdAt: "2024-01-01",
        },
        {
            id: "TK002",
            username: "manager1",
            fullName: "Nguyễn Văn A",
            email: "manager1@example.com",
            role: ACCOUNT_ROLE.MANAGER,
            status: ACCOUNT_STATUS.ACTIVE,
            lastLogin: "2024-04-25 17:45:00",
            createdAt: "2024-01-15",
        },
    ]);

    const columns = [
        {
            title: "Mã TK",
            dataIndex: "id",
            key: "id",
            width: 100,
        },
        {
            title: "Thông tin tài khoản",
            key: "account",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{record.username}</Text>
                    <Text>{record.fullName}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        {record.email}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                const colors = {
                    [ACCOUNT_ROLE.ADMIN]: "red",
                    [ACCOUNT_ROLE.MANAGER]: "blue",
                    [ACCOUNT_ROLE.STAFF]: "default",
                };
                const labels = {
                    [ACCOUNT_ROLE.ADMIN]: "Quản trị viên",
                    [ACCOUNT_ROLE.MANAGER]: "Quản lý",
                    [ACCOUNT_ROLE.STAFF]: "Nhân viên",
                };
                return <Tag color={colors[role]}>{labels[role]}</Tag>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Badge
                    status={status === ACCOUNT_STATUS.ACTIVE ? "success" : "error"}
                    text={status === ACCOUNT_STATUS.ACTIVE ? "Đang hoạt động" : "Đã khóa"}
                />
            ),
        },
        {
            title: "Đăng nhập cuối",
            dataIndex: "lastLogin",
            key: "lastLogin",
            render: (lastLogin) => new Date(lastLogin).toLocaleString("vi-VN"),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Đổi mật khẩu">
                        <Button icon={<KeyOutlined />} size="small" onClick={() => handleChangePassword(record)} />
                    </Tooltip>
                    <Tooltip title={record.status === ACCOUNT_STATUS.ACTIVE ? "Khóa" : "Mở khóa"}>
                        <Popconfirm
                            title={`${record.status === ACCOUNT_STATUS.ACTIVE ? "Khóa" : "Mở khóa"} tài khoản`}
                            description={`Bạn có chắc chắn muốn ${
                                record.status === ACCOUNT_STATUS.ACTIVE ? "khóa" : "mở khóa"
                            } tài khoản này?`}
                            onConfirm={() => handleToggleStatus(record)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button
                                danger={record.status === ACCOUNT_STATUS.ACTIVE}
                                icon={record.status === ACCOUNT_STATUS.ACTIVE ? <LockOutlined /> : <UnlockOutlined />}
                                size="small"
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Handlers
    const handleAdd = () => {
        setSelectedAccount(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedAccount(record);
        setIsModalVisible(true);
    };

    const handleChangePassword = (record) => {
        setSelectedAccount(record);
        setIsChangePasswordVisible(true);
    };

    const handleToggleStatus = (record) => {
        const newStatus = record.status === ACCOUNT_STATUS.ACTIVE ? ACCOUNT_STATUS.LOCKED : ACCOUNT_STATUS.ACTIVE;

        setAccounts(accounts.map((acc) => (acc.id === record.id ? { ...acc, status: newStatus } : acc)));

        message.success(`Đã ${newStatus === ACCOUNT_STATUS.ACTIVE ? "mở khóa" : "khóa"} tài khoản ${record.username}`);
    };

    const filteredAccounts = accounts.filter((acc) => {
        const matchSearch = searchText
            ? acc.username.toLowerCase().includes(searchText.toLowerCase()) ||
              acc.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
              acc.email.toLowerCase().includes(searchText.toLowerCase())
            : true;

        const matchStatus = statusFilter === "all" || acc.status === statusFilter;
        const matchRole = roleFilter === "all" || acc.role === roleFilter;

        return matchSearch && matchStatus && matchRole;
    });

    const handleSubmit = (values) => {
        if (selectedAccount) {
            // Cập nhật tài khoản
            setAccounts(accounts.map((acc) => (acc.id === selectedAccount.id ? { ...acc, ...values } : acc)));
            message.success("Cập nhật tài khoản thành công");
        } else {
            // Thêm tài khoản mới
            const newAccount = {
                ...values,
                id: `TK${String(accounts.length + 1).padStart(3, "0")}`,
                status: ACCOUNT_STATUS.ACTIVE,
                createdAt: new Date().toISOString(),
                lastLogin: null,
            };
            setAccounts([...accounts, newAccount]);
            message.success("Thêm tài khoản mới thành công");
        }
        setIsModalVisible(false);
    };

    const handleChangePasswordSubmit = (values) => {
        message.success("Đổi mật khẩu thành công");
        setIsChangePasswordVisible(false);
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                    {/* Header */}
                    <Row gutter={[16, 16]} justify="space-between" align="middle">
                        <Col>
                            <Space align="center" size={16}>
                                <UserOutlined style={{ fontSize: 24 }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    Quản lý Tài khoản
                                </Title>
                            </Space>
                        </Col>
                    </Row>

                    {/* Filters */}
                    <Row gutter={16}>
                        <Col flex="auto">
                            <Space>
                                <Search
                                    placeholder="Tìm kiếm theo tên, email..."
                                    allowClear
                                    style={{ width: 300 }}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 180 }}>
                                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                                    <Select.Option value={ACCOUNT_STATUS.ACTIVE}>Đang hoạt động</Select.Option>
                                    <Select.Option value={ACCOUNT_STATUS.LOCKED}>Đã khóa</Select.Option>
                                </Select>
                                <Select value={roleFilter} onChange={setRoleFilter} style={{ width: 180 }}>
                                    <Select.Option value="all">Tất cả vai trò</Select.Option>
                                    <Select.Option value={ACCOUNT_ROLE.ADMIN}>Quản trị viên</Select.Option>
                                    <Select.Option value={ACCOUNT_ROLE.MANAGER}>Quản lý</Select.Option>
                                    <Select.Option value={ACCOUNT_ROLE.STAFF}>Nhân viên</Select.Option>
                                </Select>
                            </Space>
                        </Col>
                        <Col>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                Thêm tài khoản
                            </Button>
                        </Col>
                    </Row>

                    {/* Table */}
                    <Table columns={columns} dataSource={filteredAccounts} rowKey="id" bordered />
                </Space>
            </Card>

            {/* Add Form Components */}
            <AccountForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingAccount={selectedAccount}
                ACCOUNT_ROLE={ACCOUNT_ROLE}
            />

            <ChangePasswordForm
                open={isChangePasswordVisible}
                onCancel={() => setIsChangePasswordVisible(false)}
                onSubmit={handleChangePasswordSubmit}
                account={selectedAccount}
            />
        </div>
    );
}
