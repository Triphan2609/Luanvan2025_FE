import React, { useState, useEffect } from "react";
import {
    Drawer,
    Button,
    Table,
    Space,
    Popconfirm,
    Form,
    Input,
    message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getBranchTypes } from "../../../../../api/branchTypesApi";

export default function BranchTypeDrawer({
    open,
    onClose,
    branchTypes: initialBranchTypes,
    onSaveBranchType,
    onDeleteBranchType,
}) {
    const [branchTypes, setBranchTypes] = useState(initialBranchTypes);
    const [editingBranchType, setEditingBranchType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchBranchTypes = async () => {
                setLoading(true);
                try {
                    const data = await getBranchTypes();
                    setBranchTypes(data);
                } catch (error) {
                    message.error("Không thể tải danh sách loại chi nhánh!");
                } finally {
                    setLoading(false);
                }
            };
            fetchBranchTypes();
        }
    }, [open]);

    const handleSave = async (values) => {
        setSaving(true);
        try {
            if (editingBranchType?.id) {
                // Cập nhật loại chi nhánh
                await onSaveBranchType(editingBranchType.id, values);
                message.success("Cập nhật loại chi nhánh thành công!");
            } else {
                // Thêm mới loại chi nhánh
                await onSaveBranchType(null, values);
                message.success("Thêm loại chi nhánh thành công!");
            }
            setEditingBranchType(null);
            const data = await getBranchTypes();
            setBranchTypes(data);
        } catch (error) {
            message.error("Không thể lưu loại chi nhánh!");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            await onDeleteBranchType(id);
            message.success("Xóa loại chi nhánh thành công!");
            const data = await getBranchTypes();
            setBranchTypes(data);
        } catch (error) {
            message.error("Không thể xóa loại chi nhánh!");
        } finally {
            setDeleting(false);
        }
    };

    const refreshBranchTypes = async () => {
        setLoading(true);
        try {
            const data = await getBranchTypes();
            setBranchTypes(data);
        } catch (error) {
            message.error("Không thể làm mới danh sách loại chi nhánh!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            title="Quản lý loại chi nhánh"
            placement="right"
            width={600}
            onClose={onClose}
            open={open}
        >
            <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ marginBottom: 16 }}
                onClick={() =>
                    setEditingBranchType({ id: null, name: "", key_name: "" })
                } // Đặt key_name là chuỗi rỗng
            >
                Thêm loại chi nhánh
            </Button>
            <Table
                dataSource={branchTypes}
                columns={[
                    {
                        title: "Tên loại",
                        dataIndex: "name",
                        key: "name",
                    },
                    {
                        title: "Mã loại",
                        dataIndex: "key",
                        key: "key",
                    },
                    {
                        title: "Hành động",
                        key: "actions",
                        render: (_, record) => (
                            <Space>
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => setEditingBranchType(record)}
                                >
                                    Sửa
                                </Button>
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa loại chi nhánh này?"
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    onConfirm={() => handleDelete(record.id)}
                                >
                                    <Button
                                        icon={<DeleteOutlined />}
                                        danger
                                        loading={deleting}
                                    >
                                        Xóa
                                    </Button>
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ]}
                rowKey="id"
                pagination={false}
                loading={loading}
            />
            {editingBranchType && (
                <Form
                    layout="vertical"
                    style={{
                        marginTop: 16,
                        padding: "16px",
                        background: "#f9f9f9",
                        borderRadius: "8px",
                    }}
                    initialValues={editingBranchType}
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="name"
                        label="Tên loại chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên loại chi nhánh!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên loại chi nhánh" />
                    </Form.Item>
                    <Form.Item
                        name="key_name"
                        label="Mã loại chi nhánh"
                        rules={[
                            {
                                required: !editingBranchType?.id,
                                message: "Vui lòng nhập mã loại chi nhánh!",
                            },
                        ]}
                    >
                        <Input
                            placeholder="Nhập mã loại chi nhánh"
                            disabled={!!editingBranchType?.id} // Khóa trường nếu đang chỉnh sửa
                        />
                    </Form.Item>
                    <Space>
                        <Button onClick={() => setEditingBranchType(null)}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={saving}
                        >
                            {editingBranchType.id ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form>
            )}
        </Drawer>
    );
}
