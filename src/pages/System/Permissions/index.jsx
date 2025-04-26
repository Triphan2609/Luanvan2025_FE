import React, { useState } from "react";
import { Card, Table, Button, Space, Typography, Row, Col, Tree, Tag, Tooltip, message, Drawer, Popconfirm } from "antd";
import { TeamOutlined, KeyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import RoleForm from "./components/RoleForm";

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
    const [selectedRole, setSelectedRole] = useState(null);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [roles, setRoles] = useState([
        {
            id: 1,
            name: "Quản trị viên",
            code: "ADMIN",
            description: "Toàn quyền hệ thống",
            permissions: Object.values(PERMISSIONS),
            color: "#f50",
        },
        {
            id: 2,
            name: "Quản lý",
            code: "MANAGER",
            description: "Quản lý các hoạt động",
            permissions: [
                PERMISSIONS.HOTEL_VIEW,
                PERMISSIONS.HOTEL_EDIT,
                PERMISSIONS.RESTAURANT_VIEW,
                PERMISSIONS.RESTAURANT_EDIT,
                PERMISSIONS.EMPLOYEE_VIEW,
                PERMISSIONS.REPORT_VIEW,
            ],
            color: "#108ee9",
        },
    ]);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAddRole = (values) => {
        const newRole = {
            id: roles.length + 1,
            ...values,
            permissions: [],
        };
        setRoles([...roles, newRole]);
        message.success("Thêm vai trò mới thành công");
        setIsModalVisible(false);
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
            title: "Vai trò",
            key: "name",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <Tag color={record.color}>{record.code}</Tag>
                        <Text strong>{record.name}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        {record.description}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Số quyền",
            dataIndex: "permissions",
            key: "permissions",
            width: 120,
            align: "center",
            render: (permissions) => permissions.length,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa quyền">
                        <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditPermissions(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa vai trò">
                        <Popconfirm
                            title="Xóa vai trò"
                            description={`Bạn có chắc chắn muốn xóa vai trò ${record.name}?`}
                            onConfirm={() => handleDeleteRole(record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            disabled={record.code === "ADMIN"}
                        >
                            <Button danger icon={<DeleteOutlined />} disabled={record.code === "ADMIN"} />
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

    const handlePermissionChange = (checkedKeys) => {
        if (selectedRole) {
            setRoles(roles.map((role) => (role.id === selectedRole.id ? { ...role, permissions: checkedKeys } : role)));
            message.success("Cập nhật quyền thành công");
        }
    };

    const handleDeleteRole = (role) => {
        setRoles(roles.filter((r) => r.id !== role.id));
        message.success(`Đã xóa vai trò ${role.name}`);
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
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                                Thêm vai trò
                            </Button>
                        </Col>
                    </Row>

                    <Table columns={columns} dataSource={roles} rowKey="id" bordered />
                </Space>
            </Card>

            <Drawer
                title={`Phân quyền - ${selectedRole?.name}`}
                placement="right"
                width={500}
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                extra={
                    <Button type="primary" icon={<SaveOutlined />} onClick={() => setIsDrawerVisible(false)}>
                        Lưu thay đổi
                    </Button>
                }
            >
                {selectedRole && (
                    <Tree
                        checkable
                        defaultExpandAll
                        checkedKeys={selectedRole.permissions}
                        onCheck={handlePermissionChange}
                        treeData={permissionTree}
                    />
                )}
            </Drawer>

            <RoleForm open={isModalVisible} onCancel={() => setIsModalVisible(false)} onSubmit={handleAddRole} />
        </div>
    );
}
