import React, { useEffect, useState } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Tag,
    Row,
    Col,
    Input,
    Select,
    Tooltip,
    Badge,
    message,
    Popconfirm,
    Drawer,
    Checkbox,
    Modal,
    Form,
} from "antd";
import apiClient from "../../../configs/apiClient";
import {
    PlusOutlined,
    EditOutlined,
    LockOutlined,
    UnlockOutlined,
    KeyOutlined,
    SearchOutlined,
    UserOutlined,
    DeleteOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import AccountForm from "./components/AccountForm";
import ChangePasswordForm from "./components/ChangePasswordForm";
import dayjs from "dayjs";

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
    const [isChangePasswordVisible, setIsChangePasswordVisible] =
        useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [roles, setRoles] = useState([]); // Thêm state cho roles
    const [loading, setLoading] = useState(false);
    const [isRoleDrawerVisible, setIsRoleDrawerVisible] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get("/accounts");
                const accountsWithRoles = response.data.map((account) => ({
                    ...account,
                    roles: account.roles || [], // Đảm bảo roles luôn là mảng
                }));
                setAccounts(accountsWithRoles);
            } catch (error) {
                message.error("Lỗi khi tải danh sách tài khoản!");
            } finally {
                setLoading(false);
            }
        };

        const fetchRoles = async () => {
            try {
                const response = await apiClient.get("/roles"); // API endpoint để lấy danh sách vai trò
                setRoles(response.data || []); // Đảm bảo roles luôn là mảng
            } catch (error) {
                message.error("Lỗi khi tải danh sách vai trò!");
                setRoles([]); // Đặt roles là mảng rỗng nếu xảy ra lỗi
            }
        };

        fetchAccounts();
        fetchRoles(); // Gọi API để lấy danh sách vai trò
    }, []);

    const columns = [
        {
            title: "Tên đăng nhập",
            dataIndex: "username",
            key: "username",
            sorter: true,
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            sorter: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            sorter: true,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                if (!role) return <Tag color="default">Không xác định</Tag>;
                return <Tag color={role.color || "default"}>{role.name}</Tag>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const statusColors = {
                    active: "green",
                    locked: "red",
                };
                const statusLabels = {
                    active: "Đang hoạt động",
                    locked: "Đã khóa",
                };
                return (
                    <Tag color={statusColors[status]}>
                        {statusLabels[status]}
                    </Tag>
                );
            },
        },
        {
            title: "Đăng nhập cuối",
            dataIndex: "lastLogin",
            key: "lastLogin",
            sorter: true,
            render: (lastLogin) => {
                if (!lastLogin) {
                    return <Text type="secondary">Chưa đăng nhập</Text>;
                }
                const formattedDate = new Date(lastLogin).toLocaleString(
                    "vi-VN",
                    {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    }
                );
                return (
                    <Tooltip title={`Đăng nhập lúc: ${formattedDate}`}>
                        <Text>{formattedDate}</Text>
                    </Tooltip>
                );
            },
        },
        {
            title: "Thao tác",
            key: "action",
            width: 250,
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
                        <Button
                            icon={<KeyOutlined />}
                            size="small"
                            onClick={() => handleChangePassword(record)}
                        />
                    </Tooltip>
                    <Tooltip
                        title={
                            record.status === ACCOUNT_STATUS.ACTIVE
                                ? "Khóa"
                                : "Mở khóa"
                        }
                    >
                        <Popconfirm
                            title={`Bạn có chắc chắn muốn ${
                                record.status === ACCOUNT_STATUS.ACTIVE
                                    ? "khóa"
                                    : "mở khóa"
                            } tài khoản này?`}
                            onConfirm={() => handleToggleStatus(record)}
                            okText="Đồng ý"
                            cancelText="Hủy"
                        >
                            <Button
                                danger={record.status === ACCOUNT_STATUS.ACTIVE}
                                icon={
                                    record.status === ACCOUNT_STATUS.ACTIVE ? (
                                        <LockOutlined />
                                    ) : (
                                        <UnlockOutlined />
                                    )
                                }
                                size="small"
                            />
                        </Popconfirm>
                    </Tooltip>
                    {record.status === ACCOUNT_STATUS.LOCKED && (
                        <Tooltip title="Xóa">
                            <Popconfirm
                                title={`Bạn có chắc chắn muốn xóa tài khoản "${record.username}"?`}
                                onConfirm={() => handleDeleteAccount(record)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
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
            const response = await apiClient.patch(
                `/accounts/${record.id}/status`
            );
            setAccounts(
                accounts.map((acc) =>
                    acc.id === record.id
                        ? { ...acc, status: response.data.status }
                        : acc
                )
            );
            message.success(
                `Tài khoản đã được ${
                    response.data.status === ACCOUNT_STATUS.ACTIVE
                        ? "mở khóa"
                        : "khóa"
                }`
            );
        } catch (error) {
            message.error(
                error.response?.data?.message ||
                    "Đã xảy ra lỗi khi thay đổi trạng thái!"
            );
        }
    };

    const handleDeleteAccount = async (record) => {
        try {
            await apiClient.delete(`/accounts/${record.id}`);
            setAccounts(accounts.filter((acc) => acc.id !== record.id));
            message.success("Xóa tài khoản thành công");
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        }
    };

    const filteredAccounts = accounts.filter((acc) => {
        const normalizedSearchText = searchText.trim().toLowerCase();

        const matchSearch = normalizedSearchText
            ? acc.username.toLowerCase().includes(normalizedSearchText) ||
              acc.fullName.toLowerCase().includes(normalizedSearchText) ||
              acc.email.toLowerCase().includes(normalizedSearchText) ||
              acc.role?.name.toLowerCase().includes(normalizedSearchText)
            : true;

        const matchStatus =
            statusFilter === "all" || acc.status === statusFilter;
        const matchRole = roleFilter === "all" || acc.role?.id === roleFilter;

        return matchSearch && matchStatus && matchRole;
    });

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                roleId: values.role, // Gửi roleId thay vì role
            };
            delete payload.role; // Xóa trường role để tránh nhầm lẫn

            if (selectedAccount) {
                // Gửi yêu cầu cập nhật tài khoản
                const response = await apiClient.put(
                    `/accounts/${selectedAccount.id}`,
                    payload
                );
                setAccounts(
                    accounts.map((acc) =>
                        acc.id === selectedAccount.id
                            ? { ...acc, ...response.data }
                            : acc
                    )
                );
                message.success("Cập nhật tài khoản thành công");
            } else {
                // Gửi yêu cầu thêm tài khoản mới
                const response = await apiClient.post("/accounts", payload);
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

    const handleEditRoles = (account) => {
        setSelectedAccount(account);
        setIsRoleDrawerVisible(true);
    };

    const handleSaveRoles = async () => {
        Modal.confirm({
            title: "Xác nhận",
            content: `Bạn có chắc chắn muốn thay đổi vai trò của tài khoản ${selectedAccount?.username}?`,
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: async () => {
                setLoading(true);
                try {
                    await apiClient.patch(
                        `/accounts/${selectedAccount.id}/role`,
                        {
                            roleId: selectedAccount.role?.id,
                        }
                    );
                    setAccounts(
                        accounts.map((account) =>
                            account.id === selectedAccount.id
                                ? {
                                      ...account,
                                      role: roles.find(
                                          (role) =>
                                              role.id ===
                                              selectedAccount.role?.id
                                      ),
                                  }
                                : account
                        )
                    );
                    message.success("Cập nhật vai trò thành công!");
                    setIsRoleDrawerVisible(false);
                } catch (error) {
                    message.error(
                        error.response?.data?.message || "Đã xảy ra lỗi!"
                    );
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                >
                    {/* Header */}
                    <Row
                        gutter={[16, 16]}
                        justify="space-between"
                        align="middle"
                    >
                        <Col>
                            <Space align="center" size={16}>
                                <UserOutlined style={{ fontSize: 24 }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    Quản lý Tài khoản
                                </Title>
                            </Space>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                            >
                                Thêm tài khoản
                            </Button>
                        </Col>
                    </Row>

                    {/* Filters */}
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Search
                                placeholder="Tìm kiếm theo tên, email, vai trò..."
                                allowClear
                                style={{ width: "100%" }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>
                        <Col span={8}>
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: "100%" }}
                            >
                                <Select.Option value="all">
                                    Tất cả trạng thái
                                </Select.Option>
                                <Select.Option value={ACCOUNT_STATUS.ACTIVE}>
                                    Đang hoạt động
                                </Select.Option>
                                <Select.Option value={ACCOUNT_STATUS.LOCKED}>
                                    Đã khóa
                                </Select.Option>
                            </Select>
                        </Col>
                        <Col span={8}>
                            <Select
                                value={roleFilter}
                                onChange={setRoleFilter}
                                style={{ width: "100%" }}
                            >
                                <Select.Option value="all">
                                    Tất cả vai trò
                                </Select.Option>
                                {roles.map((role) => (
                                    <Select.Option
                                        key={role.id}
                                        value={role.id}
                                    >
                                        {role.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>

                    {/* Table */}
                    <Table
                        dataSource={filteredAccounts}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        onChange={(pagination, filters, sorter) => {
                            if (sorter.order) {
                                const sortedAccounts = [
                                    ...filteredAccounts,
                                ].sort((a, b) => {
                                    const fieldA = a[sorter.field] || "";
                                    const fieldB = b[sorter.field] || "";
                                    return sorter.order === "ascend"
                                        ? fieldA.localeCompare(fieldB)
                                        : fieldB.localeCompare(fieldA);
                                });
                                setAccounts(sortedAccounts);
                            }
                        }}
                    />
                </Space>
            </Card>

            {/* Add Form Components */}
            <AccountForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                editingAccount={selectedAccount}
                ACCOUNT_ROLE={roles}
            />

            <ChangePasswordForm
                open={isChangePasswordVisible}
                onCancel={() => setIsChangePasswordVisible(false)}
                onSubmit={handleChangePasswordSubmit}
                account={selectedAccount}
            />

            <Drawer
                title={`Chỉnh sửa vai trò - ${selectedAccount?.username}`}
                placement="right"
                width={500}
                onClose={() => setIsRoleDrawerVisible(false)}
                open={isRoleDrawerVisible}
                extra={
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveRoles}
                    >
                        Lưu thay đổi
                    </Button>
                }
            >
                <Form.Item
                    name="roleId"
                    label="Vai trò"
                    rules={[
                        { required: true, message: "Vui lòng chọn vai trò!" },
                    ]}
                >
                    <Select
                        placeholder="Chọn vai trò"
                        value={selectedAccount?.role?.id} // Hiển thị vai trò hiện tại
                        onChange={(value) => {
                            setSelectedAccount({
                                ...selectedAccount,
                                role: roles.find((role) => role.id === value), // Cập nhật vai trò được chọn
                            });
                        }}
                    >
                        {roles.map((role) => (
                            <Select.Option key={role.id} value={role.id}>
                                {role.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Drawer>
        </div>
    );
}
