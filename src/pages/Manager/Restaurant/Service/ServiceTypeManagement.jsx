import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Input,
    Modal,
    Form,
    message,
    Popconfirm,
    Select,
    Switch,
    Row,
    Col,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    getServiceTypes,
    createServiceType,
    updateServiceType,
    deleteServiceType,
} from "../../../../api/servicesApi";
import { getBranches } from "../../../../api/branchesApi";

export default function ServiceTypeManagement() {
    const [types, setTypes] = useState([]);
    const [branches, setBranches] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [typesData, branchesData] = await Promise.all([
                getServiceTypes(),
                getBranches(),
            ]);
            // Lọc chỉ lấy chi nhánh nhà hàng
            const restaurantBranches = branchesData.filter(
                (branch) =>
                    branch.branchType &&
                    (branch.branchType.key_name === "restaurant" ||
                        branch.branchType.key_name === "both")
            );
            setTypes(
                typesData.filter((t) =>
                    restaurantBranches.some((b) => b.id === t.branchId)
                )
            );
            setBranches(restaurantBranches);
        } catch (error) {
            message.error("Không thể tải dữ liệu loại dịch vụ!");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingType(null);
        setIsModalOpen(true);
        setTimeout(() => form.resetFields(), 0);
    };
    const handleEdit = (record) => {
        setEditingType(record);
        setIsModalOpen(true);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            branchId: record.branchId || record.branch?.id,
            isActive: record.isActive !== undefined ? record.isActive : true,
        });
    };
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await deleteServiceType(id);
            message.success("Đã xóa loại dịch vụ!");
            fetchData();
        } catch (error) {
            message.error("Không thể xóa loại dịch vụ!");
        } finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            values.branchId = Number(values.branchId);
            if (editingType) {
                await updateServiceType(editingType.id, values);
                message.success("Cập nhật thành công!");
            } else {
                await createServiceType(values);
                message.success("Thêm mới thành công!");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error("Không thể lưu loại dịch vụ!");
        }
    };

    // Lọc và tìm kiếm
    const filteredTypes = useMemo(() => {
        return types.filter((t) =>
            t.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [types, search]);

    const columns = [
        {
            title: "Tên loại dịch vụ",
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
            title: "Chi nhánh",
            dataIndex: ["branch", "name"],
            key: "branch",
            render: (_, record) => {
                const branch =
                    record.branch ||
                    branches.find((b) => b.id === record.branchId);
                return branch?.name || "-";
            },
        },
        {
            title: "Loại chi nhánh",
            dataIndex: ["branch", "branchType", "name"],
            key: "branchType",
            render: (_, record) => {
                const branch =
                    record.branch ||
                    branches.find((b) => b.id === record.branchId);
                return (
                    branch?.branchType?.name ||
                    branch?.branchType?.key_name ||
                    "-"
                );
            },
        },
        {
            title: "Kích hoạt",
            dataIndex: "isActive",
            key: "isActive",
            render: (active) => <Switch checked={active} disabled />,
            sorter: (a, b) => Number(b.isActive) - Number(a.isActive),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa loại này?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="Quản lý Loại Dịch vụ & Tiện ích"
            extra={
                <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={handleAdd}
                >
                    Thêm loại
                </Button>
            }
        >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={10}>
                    <Input
                        placeholder="Tìm kiếm tên loại dịch vụ"
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        allowClear
                    />
                </Col>
            </Row>
            <Table
                dataSource={filteredTypes}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 8 }}
            />
            <Modal
                title={
                    editingType ? "Cập nhật loại dịch vụ" : "Thêm loại dịch vụ"
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSave}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên loại dịch vụ"
                        rules={[{ required: true, message: "Nhập tên loại!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: "Nhập mô tả!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="branchId"
                        label="Chi nhánh"
                        rules={[{ required: true, message: "Chọn chi nhánh!" }]}
                    >
                        <Select>
                            {branches.map((b) => (
                                <Select.Option key={b.id} value={b.id}>
                                    {b.name} (
                                    {b.branchType?.name ||
                                        b.branchType?.key_name}
                                    )
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label="Kích hoạt"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
}
