import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Switch,
    message,
    Popconfirm,
    Card,
    Input as AntInput,
    Select,
    Tooltip,
    Tag,
    Typography,
    Row,
    Col,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { areasRestaurantApi } from "../../../../api/areasRestaurantApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";

const { Option } = Select;
const { Text } = Typography;

const Areas = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [form] = Form.useForm();
    const [branches, setBranches] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} khu vực`,
        },
        sorter: {
            field: "name",
            order: "ascend",
        },
    });

    // Fetch branches
    const fetchBranches = useCallback(async () => {
        try {
            const response = await getRestaurantBranches();
            setBranches(response || []);
        } catch (error) {
            message.error("Không thể tải danh sách chi nhánh");
            setBranches([]);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    // Fetch areas
    const fetchAreas = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                branchId: selectedBranch,
                includeInactive: showInactive,
            };
            const response = await areasRestaurantApi.getAreas(params);
            console.log("API Response:", response); // Debug log
            setAreas(response || []);
        } catch (error) {
            console.error("Error fetching areas:", error); // Debug log
            message.error("Không thể tải danh sách khu vực");
            setAreas([]);
        } finally {
            setLoading(false);
        }
    }, [selectedBranch, showInactive]);

    useEffect(() => {
        fetchAreas();
    }, [fetchAreas]);

    // Filtered areas
    const filteredAreas = useMemo(() => {
        if (!Array.isArray(areas)) return [];

        return areas.filter((area) => {
            if (!area) return false;

            const matchesSearch =
                (area.name?.toLowerCase() || "").includes(
                    searchText.toLowerCase()
                ) ||
                (area.description?.toLowerCase() || "").includes(
                    searchText.toLowerCase()
                );
            return matchesSearch;
        });
    }, [areas, searchText]);

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            if (editingArea) {
                await areasRestaurantApi.updateArea(editingArea.id, values);
                message.success("Cập nhật khu vực thành công");
            } else {
                await areasRestaurantApi.createArea(values);
                message.success("Tạo khu vực mới thành công");
            }
            setModalVisible(false);
            form.resetFields();
            fetchAreas();
        } catch (error) {
            message.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        try {
            await areasRestaurantApi.deleteArea(id);
            message.success("Xóa khu vực thành công");
            fetchAreas();
        } catch (error) {
            message.error(
                error.response?.data?.message || "Không thể xóa khu vực"
            );
        }
    };

    // Handle status change
    const handleStatusChange = async (id, isActive) => {
        try {
            if (isActive) {
                await areasRestaurantApi.activateArea(id);
            } else {
                await areasRestaurantApi.deactivateArea(id);
            }
            message.success("Cập nhật trạng thái thành công");
            fetchAreas();
        } catch (error) {
            message.error(
                error.response?.data?.message || "Không thể cập nhật trạng thái"
            );
        }
    };

    // Handle table change
    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            sorter: {
                field: sorter.field,
                order: sorter.order,
            },
        });
    };

    // Table columns
    const columns = [
        {
            title: "Tên khu vực",
            dataIndex: "name",
            key: "name",
            sorter: true,
            render: (text, record) => (
                <Space>
                    <Text strong>{text || "Chưa có tên"}</Text>
                    {record?.description && (
                        <Tooltip title={record.description}>
                            <InfoCircleOutlined style={{ color: "#1890ff" }} />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
        {
            title: "Chi nhánh",
            dataIndex: "branchId",
            key: "branchId",
            render: (branchId) => {
                const branch = branches.find((b) => b?.id === branchId);
                return branch ? (
                    <Tag color="blue">{branch.name}</Tag>
                ) : (
                    <Text type="secondary">Không xác định</Text>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive, record) => (
                <Space>
                    <Switch
                        checked={isActive}
                        onChange={(checked) =>
                            handleStatusChange(record.id, checked)
                        }
                    />
                    <Tag color={isActive ? "success" : "error"}>
                        {isActive ? "Đang hoạt động" : "Không hoạt động"}
                    </Tag>
                </Space>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Sửa khu vực">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingArea(record);
                                form.setFieldsValue(record);
                                setModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa khu vực">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa khu vực này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    console.log("Filtered Areas:", filteredAreas); // Debug log

    return (
        <Card
            title={
                <Space>
                    <Text strong>Quản lý khu vực nhà hàng</Text>
                    <Tooltip title="Làm mới dữ liệu">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchAreas}
                            loading={loading}
                        />
                    </Tooltip>
                </Space>
            }
        >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingArea(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                    >
                        Thêm khu vực
                    </Button>
                </Col>
                <Col>
                    <AntInput
                        placeholder="Tìm kiếm khu vực..."
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                        allowClear
                    />
                </Col>
                <Col>
                    <Select
                        placeholder="Chọn chi nhánh"
                        style={{ width: 250 }}
                        onChange={(value) => setSelectedBranch(value)}
                        allowClear
                    >
                        {branches.map((branch) => (
                            <Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col>
                    <Switch
                        checkedChildren="Hiện tất cả"
                        unCheckedChildren="Đang hoạt động"
                        checked={showInactive}
                        onChange={setShowInactive}
                    />
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredAreas}
                rowKey="id"
                loading={loading}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                scroll={{ x: "max-content" }}
                locale={{
                    emptyText: "Không có dữ liệu",
                }}
            />

            <Modal
                title={editingArea ? "Sửa khu vực" : "Thêm khu vực mới"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ isActive: true }}
                >
                    <Form.Item
                        name="name"
                        label="Tên khu vực"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên khu vực",
                            },
                            {
                                max: 100,
                                message:
                                    "Tên khu vực không được vượt quá 100 ký tự",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên khu vực" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            {
                                max: 500,
                                message: "Mô tả không được vượt quá 500 ký tự",
                            },
                        ]}
                    >
                        <Input.TextArea
                            placeholder="Nhập mô tả khu vực"
                            rows={4}
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>
                    <Form.Item
                        name="branchId"
                        label="Chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chi nhánh",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn chi nhánh">
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label="Trạng thái"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Hoạt động"
                            unCheckedChildren="Không hoạt động"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingArea ? "Cập nhật" : "Thêm mới"}
                            </Button>
                            <Button
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                }}
                            >
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default Areas;
