import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    Popconfirm,
    message,
    Card,
    Typography,
    Tag,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import { areasRestaurantApi } from "../../../../api/areasRestaurantApi";
import {
    getRestaurantBranches,
    getBranches,
} from "../../../../api/branchesApi";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const RestaurantAreas = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentArea, setCurrentArea] = useState(null);
    const [form] = Form.useForm();
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        fetchAreas();
        fetchBranches();
    }, []);

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const areasData = await areasRestaurantApi.getAreas();
            setAreas(areasData);
        } catch (error) {
            console.error("Error fetching areas:", error);
            message.error("Không thể tải danh sách khu vực");
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const branchesData = await getRestaurantBranches();
            setBranches(branchesData || []);
        } catch (error) {
            console.error("Error fetching branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        }
    };

    const showModal = (record = null) => {
        setCurrentArea(record);
        setIsEditing(!!record);
        setIsModalVisible(true);

        if (record) {
            form.setFieldsValue({
                name: record.name,
                description: record.description,
                branchId: record.branchId,
                isActive: record.isActive,
            });
        } else {
            form.resetFields();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (isEditing) {
                await areasRestaurantApi.updateArea(currentArea.id, values);
                message.success("Khu vực đã được cập nhật!");
            } else {
                await areasRestaurantApi.createArea(values);
                message.success("Khu vực đã được tạo!");
            }

            setIsModalVisible(false);
            fetchAreas();
        } catch (error) {
            message.error(
                "Có lỗi xảy ra: " +
                    (error.response?.data?.message || error.message)
            );
            console.error("Error submitting area:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await areasRestaurantApi.deleteArea(id);
            message.success("Khu vực đã được xóa!");
            fetchAreas();
        } catch (error) {
            message.error("Không thể xóa khu vực!");
            console.error("Error deleting area:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, isActive) => {
        try {
            setLoading(true);
            if (isActive) {
                await areasRestaurantApi.deactivateArea(id);
            } else {
                await areasRestaurantApi.activateArea(id);
            }
            message.success("Trạng thái đã được cập nhật!");
            fetchAreas();
        } catch (error) {
            message.error("Không thể cập nhật trạng thái!");
            console.error("Error updating area status:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Tên khu vực",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Chi nhánh",
            dataIndex: "branchId",
            key: "branchId",
            render: (branchId) => {
                const branch = branches.find((b) => b.id === branchId);
                return branch?.name || `ID: ${branchId}`;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        size="small"
                    >
                        Sửa
                    </Button>
                    <Button
                        type={record.isActive ? "danger" : "success"}
                        icon={
                            record.isActive ? (
                                <CloseCircleOutlined />
                            ) : (
                                <CheckCircleOutlined />
                            )
                        }
                        onClick={() =>
                            handleStatusChange(record.id, record.isActive)
                        }
                        size="small"
                    >
                        {record.isActive ? "Vô hiệu" : "Kích hoạt"}
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa khu vực này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button danger icon={<DeleteOutlined />} size="small">
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const createDefaultAreas = async (branchId) => {
        try {
            setLoading(true);
            await areasRestaurantApi.createDefaultAreas(branchId);
            message.success("Đã tạo các khu vực mặc định!");
            fetchAreas();
        } catch (error) {
            message.error("Không thể tạo khu vực mặc định!");
            console.error("Error creating default areas:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <Title level={4}>Quản lý khu vực nhà hàng</Title>
                <Space>
                    <Select
                        placeholder="Tạo khu vực mặc định cho chi nhánh"
                        style={{ width: 250 }}
                        onChange={createDefaultAreas}
                    >
                        {branches.map((branch) => (
                            <Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Option>
                        ))}
                    </Select>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Thêm khu vực
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={areas}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={isEditing ? "Cập nhật khu vực" : "Thêm khu vực mới"}
                visible={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên khu vực"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên khu vực!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="branchId"
                        label="Chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chi nhánh!",
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
                        initialValue={true}
                    >
                        <Switch
                            checkedChildren="Hoạt động"
                            unCheckedChildren="Không hoạt động"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default RestaurantAreas;
