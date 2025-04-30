import React, { useState, useEffect } from "react";
import { Card, Table, Button, Space, Typography, Row, Col, Tree, Tag, Tooltip, message, Drawer, Popconfirm, Input, Spin } from "antd";
import { TeamOutlined, KeyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import RoleForm from "./components/RoleForm";
import apiClient from "../../../configs/apiClient"; // Đảm bảo bạn đã cấu hình axios

const { Title, Text } = Typography;

// Constants
const PERMISSIONS = {
    // Quản lý khách sạn
    HOTEL_VIEW: "hotel_view",
    HOTEL_CREATE: "hotel_create",
    HOTEL_EDIT: "hotel_edit",
    HOTEL_DELETE: "hotel_delete",

    // Quản lý nhà hàng
    RESTAURANT_VIEW: "restaurant_view",
    RESTAURANT_CREATE: "restaurant_create",
    RESTAURANT_EDIT: "restaurant_edit",
    RESTAURANT_DELETE: "restaurant_delete",

    // Quản lý nhân viên
    EMPLOYEE_VIEW: "employee_view",
    EMPLOYEE_CREATE: "employee_create",
    EMPLOYEE_EDIT: "employee_edit",
    EMPLOYEE_DELETE: "employee_delete",

    // Quản lý khách hàng
    CUSTOMER_VIEW: "customer_view",
    CUSTOMER_CREATE: "customer_create",
    CUSTOMER_EDIT: "customer_edit",
    CUSTOMER_DELETE: "customer_delete",

    // Báo cáo
    REPORT_VIEW: "report_view",

    // Hệ thống
    SYSTEM_VIEW: "system_view",
    SYSTEM_EDIT: "system_edit",
};

export default function PermissionManagement() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get("/roles");
                setRoles(response.data);
            } catch (error) {
                message.error("Lỗi khi tải danh sách vai trò!");
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const [selectedRole, setSelectedRole] = useState(null);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAddRole = async (values) => {
        setLoading(true); // Bắt đầu trạng thái loading
        try {
            const response = await apiClient.post("/roles", values);
            setRoles([...roles, response.data]);
            message.success("Thêm vai trò mới thành công!");
            setIsModalVisible(false);
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        } finally {
            setLoading(false); // Kết thúc trạng thái loading
        }
    };

    const permissionTree = [
        {
            title: "Quản lý Khách sạn",
            key: "hotel",
            children: [
                { title: "Xem", key: PERMISSIONS.HOTEL_VIEW },
                { title: "Thêm mới", key: PERMISSIONS.HOTEL_CREATE },
                { title: "Chỉnh sửa", key: PERMISSIONS.HOTEL_EDIT },
                { title: "Xóa", key: PERMISSIONS.HOTEL_DELETE },
            ],
        },
        {
            title: "Quản lý Nhà hàng",
            key: "restaurant",
            children: [
                { title: "Xem", key: PERMISSIONS.RESTAURANT_VIEW },
                { title: "Thêm mới", key: PERMISSIONS.RESTAURANT_CREATE },
                { title: "Chỉnh sửa", key: PERMISSIONS.RESTAURANT_EDIT },
                { title: "Xóa", key: PERMISSIONS.RESTAURANT_DELETE },
            ],
        },
        {
            title: "Quản lý Nhân viên",
            key: "employee",
            children: [
                { title: "Xem", key: PERMISSIONS.EMPLOYEE_VIEW },
                { title: "Thêm mới", key: PERMISSIONS.EMPLOYEE_CREATE },
                { title: "Chỉnh sửa", key: PERMISSIONS.EMPLOYEE_EDIT },
                { title: "Xóa", key: PERMISSIONS.EMPLOYEE_DELETE },
            ],
        },
        {
            title: "Quản lý Khách hàng",
            key: "customer",
            children: [
                { title: "Xem", key: PERMISSIONS.CUSTOMER_VIEW },
                { title: "Thêm mới", key: PERMISSIONS.CUSTOMER_CREATE },
                { title: "Chỉnh sửa", key: PERMISSIONS.CUSTOMER_EDIT },
                { title: "Xóa", key: PERMISSIONS.CUSTOMER_DELETE },
            ],
        },
        {
            title: "Báo cáo",
            key: "report",
            children: [{ title: "Xem báo cáo", key: PERMISSIONS.REPORT_VIEW }],
        },
        {
            title: "Hệ thống",
            key: "system",
            children: [
                { title: "Xem cấu hình", key: PERMISSIONS.SYSTEM_VIEW },
                { title: "Chỉnh sửa cấu hình", key: PERMISSIONS.SYSTEM_EDIT },
            ],
        },
    ];

    const columns = [
        {
            title: "Tên vai trò",
            dataIndex: "name",
            key: "name",
            render: (name, record) => (
                <Tag color={record.color} icon={<KeyOutlined />}>
                    {name}
                </Tag>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Số quyền",
            dataIndex: "permissions",
            key: "permissions",
            render: (permissions) => (
                <Tooltip title={permissions.map((perm) => perm.description).join(", ")}>
                    <Tag color="green">{permissions.length}</Tag>
                </Tooltip>
            ),
        },

        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa quyền">
                        <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditPermissions(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa vai trò">
                        <Popconfirm
                            title={`Bạn có chắc chắn muốn xóa vai trò ${record.name}?`}
                            onConfirm={() => handleDeleteRole(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleEditPermissions = (role) => {
        setSelectedRole(role);
        setIsDrawerVisible(true);
    };

    const handlePermissionChange = async (checkedKeys) => {
        setLoading(true); // Bắt đầu trạng thái loading
        try {
            const updatedRole = {
                ...selectedRole,
                permissions: checkedKeys,
            };
            const response = await apiClient.patch(`/roles/${selectedRole.id}`, updatedRole);
            setRoles(roles.map((role) => (role.id === selectedRole.id ? response.data : role)));
            message.success("Cập nhật quyền thành công!");
            setIsDrawerVisible(false);
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        } finally {
            setLoading(false); // Kết thúc trạng thái loading
        }
    };

    const handleDeleteRole = async (role) => {
        setLoading(true); // Bắt đầu trạng thái loading
        try {
            await apiClient.delete(`/roles/${role.id}`);
            setRoles(roles.filter((r) => r.id !== role.id));
            message.success(`Đã xóa vai trò ${role.name}`);
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
        } finally {
            setLoading(false); // Kết thúc trạng thái loading
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space align="center">
                                <KeyOutlined style={{ fontSize: 24 }} />
                                <Title level={3} style={{ margin: 0 }}>
                                    Quản lý Phân quyền
                                </Title>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Input.Search
                                    placeholder="Tìm kiếm vai trò"
                                    onSearch={(value) =>
                                        setRoles(roles.filter((role) => role.name.toLowerCase().includes(value.toLowerCase())))
                                    }
                                    allowClear
                                    style={{ width: 300 }}
                                />
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                                    Thêm vai trò
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={roles}
                        rowKey="id"
                        bordered
                        loading={loading} // Trạng thái loading được truyền vào đây
                        pagination={{ pageSize: 10 }}
                    />
                </Space>
            </Card>

            <Drawer
                title={`Phân quyền - ${selectedRole?.name}`}
                placement="right"
                width={650}
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                extra={
                    <Space wrap={true}>
                        <Button
                            onClick={() =>
                                setSelectedRole({
                                    ...selectedRole,
                                    permissions: permissionTree.flatMap((group) => group.children.map((child) => child.key)),
                                })
                            }
                        >
                            Chọn tất cả
                        </Button>
                        <Button onClick={() => setSelectedRole({ ...selectedRole, permissions: [] })}>Bỏ chọn tất cả</Button>
                        <Button type="primary" icon={<SaveOutlined />} onClick={() => handlePermissionChange(selectedRole.permissions)}>
                            Lưu thay đổi
                        </Button>
                    </Space>
                }
            >
                {selectedRole ? (
                    <Tree
                        checkable
                        defaultExpandAll
                        checkedKeys={selectedRole.permissions}
                        onCheck={(checkedKeys) => setSelectedRole({ ...selectedRole, permissions: checkedKeys })}
                        treeData={permissionTree}
                    />
                ) : (
                    <Spin tip="Đang tải dữ liệu..." />
                )}
            </Drawer>

            <RoleForm open={isModalVisible} onCancel={() => setIsModalVisible(false)} onSubmit={handleAddRole} />
        </div>
    );
}
