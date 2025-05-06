import React, { useState, useEffect } from "react";
import {
    Card,
    Table,
    Button,
    Space,
    Popconfirm,
    Typography,
    message,
    Select,
    Tag,
    Row,
    Col,
    Modal,
    Form,
    Input,
    InputNumber,
    Badge,
    Empty,
    Alert,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    BranchesOutlined,
    HomeOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import {
    getFloors,
    getFloorsByBranch,
    createFloor,
    updateFloor,
    deleteFloor,
    getFloorDetails,
} from "../../../../api/floorsApi";
import { getHotelBranches } from "../../../../api/branchesApi";

const { Title, Text } = Typography;

const FloorManagement = () => {
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [floorForm] = Form.useForm();

    // Load branches on component mount
    useEffect(() => {
        fetchBranches();
    }, []);

    // Load floors when a branch is selected
    useEffect(() => {
        if (selectedBranch) {
            fetchFloorsByBranch(selectedBranch);
        } else {
            setFloors([]);
        }
    }, [selectedBranch]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await getHotelBranches();
            setBranches(response);

            // Auto-select the first branch if available
            if (response.length > 0 && !selectedBranch) {
                setSelectedBranch(response[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        } finally {
            setLoading(false);
        }
    };

    const fetchFloorsByBranch = async (branchId) => {
        try {
            setLoading(true);
            const data = await getFloorsByBranch(branchId);

            // If detailed data is needed, you can fetch additional info
            const floorDetails = await Promise.all(
                data.map(async (floor) => {
                    const details = await getFloorDetails(floor.id);
                    return details;
                })
            );

            setFloors(floorDetails);
        } catch (error) {
            console.error("Failed to fetch floors:", error);
            message.error("Không thể tải danh sách tầng");
        } finally {
            setLoading(false);
        }
    };

    const handleAddFloor = () => {
        floorForm.resetFields();
        floorForm.setFieldsValue({ branchId: selectedBranch });
        setIsEditing(false);
        setIsModalVisible(true);
    };

    const handleEditFloor = (floor) => {
        setSelectedFloor(floor);
        floorForm.setFieldsValue({
            floorNumber: floor.floorNumber,
            name: floor.name,
            description: floor.description,
            branchId: floor.branchId,
        });
        setIsEditing(true);
        setIsModalVisible(true);
    };

    const handleDeleteFloor = async (id) => {
        try {
            setLoading(true);
            await deleteFloor(id);
            fetchFloorsByBranch(selectedBranch);
        } catch (error) {
            console.error("Failed to delete floor:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (values) => {
        try {
            setLoading(true);
            if (isEditing && selectedFloor) {
                await updateFloor(selectedFloor.id, values);
            } else {
                await createFloor(values);
            }
            setIsModalVisible(false);
            fetchFloorsByBranch(selectedBranch);
        } catch (error) {
            console.error("Failed to save floor:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "id",
            key: "index",
            width: 70,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Số tầng",
            dataIndex: "floorNumber",
            key: "floorNumber",
            sorter: (a, b) => a.floorNumber - b.floorNumber,
        },
        {
            title: "Tên tầng",
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
            title: "Số phòng",
            dataIndex: "roomsCount",
            key: "roomsCount",
            render: (count) => (
                <Tag color={count > 0 ? "blue" : "default"}>{count || 0}</Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEditFloor(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa tầng này?"
                        description="Bạn có chắc chắn muốn xóa tầng này? Hành động này không thể hoàn tác."
                        onConfirm={() => handleDeleteFloor(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        disabled={record.roomsCount > 0}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            disabled={record.roomsCount > 0}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Find the current branch name
    const getCurrentBranchName = () => {
        if (!selectedBranch || !branches) return "Chưa chọn chi nhánh";
        const branch = branches.find((b) => b.id === selectedBranch);
        return branch ? branch.name : "Chưa chọn chi nhánh";
    };

    return (
        <Card>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Space
                        size="large"
                        style={{
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <Title level={4} style={{ margin: 0 }}>
                            <HomeOutlined /> Quản lý Tầng
                        </Title>
                    </Space>
                </Col>

                <Col span={24}>
                    <Alert
                        message="Thông tin"
                        description="Quản lý tầng riêng biệt cho từng chi nhánh khách sạn. Chọn chi nhánh để xem và quản lý tầng."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                </Col>

                <Col span={12}>
                    <Card size="small" title="Chọn chi nhánh">
                        <Select
                            placeholder="Chọn chi nhánh"
                            style={{ width: "100%" }}
                            value={selectedBranch}
                            onChange={setSelectedBranch}
                            loading={loading}
                        >
                            {branches.map((branch) => (
                                <Select.Option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        size="small"
                        title="Chi nhánh hiện tại"
                        style={{ height: "100%" }}
                    >
                        <Space>
                            <BranchesOutlined />
                            <Text strong>{getCurrentBranchName()}</Text>
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card
                        title="Danh sách tầng"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddFloor}
                                disabled={!selectedBranch}
                            >
                                Thêm tầng mới
                            </Button>
                        }
                    >
                        {selectedBranch ? (
                            <Table
                                columns={columns}
                                dataSource={floors}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 10 }}
                            />
                        ) : (
                            <Empty description="Vui lòng chọn chi nhánh để xem danh sách tầng" />
                        )}
                    </Card>
                </Col>
            </Row>

            <Modal
                title={isEditing ? "Sửa tầng" : "Thêm tầng mới"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={floorForm}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Form.Item name="branchId" hidden>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="floorNumber"
                        label="Số tầng"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập số tầng",
                            },
                            {
                                type: "number",
                                min: 1,
                                message: "Số tầng phải lớn hơn 0",
                            },
                        ]}
                        tooltip={{
                            title: "Mỗi chi nhánh có thể có các tầng riêng biệt",
                            icon: <InfoCircleOutlined />,
                        }}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Nhập số tầng"
                            disabled={isEditing}
                        />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Tên tầng"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên tầng",
                            },
                            {
                                max: 100,
                                message: "Tên tầng không được quá 100 ký tự",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên tầng (VD: Tầng 1)" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập mô tả về tầng (tùy chọn)"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                {isEditing ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default FloorManagement;
