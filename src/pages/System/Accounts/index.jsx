import React, { useEffect, useState } from "react";
import { Card, Table, Button, Space, Typography, Tag, Row, Col, Input, Select, Tooltip, Badge, message, Popconfirm } from "antd";
import apiClient from "../../../configs/apiClient";
import { PlusOutlined, EditOutlined, LockOutlined, UnlockOutlined, KeyOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import AccountForm from "./components/AccountForm";
import ChangePasswordForm from "./components/ChangePasswordForm";

const { Search } = Input;
const { Title, Text } = Typography;

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
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await apiClient.get("/accounts");
                setAccounts(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tài khoản:", error);
            }
        };

        fetchAccounts();
    }, []);

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

    const handleToggleStatus = async (record) => {
        try {
            const response = await apiClient.patch(`/accounts/${record.id}/status`);
            setAccounts(accounts.map((acc) => (acc.id === record.id ? { ...acc, status: response.data.status } : acc)));
            message.success(`Tài khoản đã được ${response.data.status === "active" ? "mở khóa" : "khóa"}`);
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        }
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

    const handleSubmit = async (values) => {
        try {
            if (selectedAccount) {
                // Gửi yêu cầu cập nhật tài khoản
                const response = await apiClient.put(`/accounts/${selectedAccount.id}`, values);
                setAccounts(accounts.map((acc) => (acc.id === selectedAccount.id ? { ...acc, ...response.data } : acc)));
                message.success("Cập nhật tài khoản thành công");
            } else {
                // Gửi yêu cầu thêm tài khoản mới
                const response = await apiClient.post("/accounts", values);
                setAccounts([...accounts, response.data]);
                message.success("Thêm tài khoản mới thành công");
            }
            setIsModalVisible(false);
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        }
    };

    const handleChangePasswordSubmit = async (values) => {
        try {
            await apiClient.patch(`/accounts/${selectedAccount.id}/password`, {
                newPassword: values.newPassword,
            });
            message.success("Đổi mật khẩu thành công");
            setIsChangePasswordVisible(false);
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        }
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
                    <Table
                        dataSource={filteredAccounts}
                        columns={[
                            {
                                title: "Tên đăng nhập",
                                dataIndex: "username",
                                key: "username",
                            },
                            {
                                title: "Họ và tên",
                                dataIndex: "fullName",
                                key: "fullName",
                            },
                            {
                                title: "Email",
                                dataIndex: "email",
                                key: "email",
                            },
                            {
                                title: "Vai trò",
                                dataIndex: "role",
                                key: "role",
                                render: (role) =>
                                    role === "admin" ? <Tag color="red">Quản trị viên</Tag> : <Tag color="blue">Người dùng</Tag>,
                            },
                            {
                                title: "Trạng thái",
                                dataIndex: "status",
                                key: "status",
                                render: (status) =>
                                    status === "active" ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="volcano">Đã khóa</Tag>,
                            },
                            {
                                title: "Hành động",
                                key: "actions",
                                render: (_, record) => (
                                    <Space>
                                        <Tooltip title="Chỉnh sửa">
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                size="small"
                                                onClick={() => handleEdit(record)}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Đổi mật khẩu">
                                            <Button icon={<KeyOutlined />} size="small" onClick={() => handleChangePassword(record)} />
                                        </Tooltip>
                                        <Tooltip title={record.status === ACCOUNT_STATUS.ACTIVE ? "Khóa" : "Mở khóa"}>
                                            <Popconfirm
                                                title={`Bạn có chắc chắn muốn ${
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
                        ]}
                        rowKey="id"
                    />
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
