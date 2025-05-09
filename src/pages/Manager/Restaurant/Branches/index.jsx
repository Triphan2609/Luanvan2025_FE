import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    TimePicker,
    Popconfirm,
    message,
    Card,
    Typography,
    Tag,
    Descriptions,
    Drawer,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import {
    getRestaurantBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
    updateBranchStatus,
} from "../../../../api/branchesApi";
import { getBranchTypes } from "../../../../api/branchTypesApi";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const RestaurantBranches = () => {
    const [branches, setBranches] = useState([]);
    const [branchTypes, setBranchTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchBranches();
        fetchBranchTypes();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const branchesData = await getRestaurantBranches();
            setBranches(branchesData);
        } catch (error) {
            console.error("Error fetching branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        } finally {
            setLoading(false);
        }
    };

    const fetchBranchTypes = async () => {
        try {
            const types = await getBranchTypes();
            // Filter only restaurant-related branch types
            const restaurantBranchTypes = types.filter(
                (type) =>
                    type.key_name === "restaurant" || type.key_name === "both"
            );
            setBranchTypes(restaurantBranchTypes);
        } catch (error) {
            console.error("Error fetching branch types:", error);
            message.error("Không thể tải danh sách loại chi nhánh");
        }
    };

    const showModal = (record = null) => {
        setCurrentBranch(record);
        setIsEditing(!!record);
        setIsModalVisible(true);

        if (record) {
            form.setFieldsValue({
                name: record.name,
                branch_code: record.branch_code,
                address: record.address,
                phone: record.phone,
                email: record.email,
                website: record.website,
                branch_type_id: record.branchType?.id,
                working_days: record.working_days,
                open_time: record.open_time
                    ? moment(record.open_time, "HH:mm:ss")
                    : null,
                close_time: record.close_time
                    ? moment(record.close_time, "HH:mm:ss")
                    : null,
                manager_name: record.manager_name,
                manager_phone: record.manager_phone,
                staff_count: record.staff_count,
                description: record.description,
            });
        } else {
            form.resetFields();
        }
    };

    const showDrawer = async (id) => {
        try {
            setLoading(true);
            const branchData = await getBranchById(id);
            setSelectedBranch(branchData);
            setIsDrawerVisible(true);
        } catch (error) {
            console.error("Error fetching branch details:", error);
            message.error("Không thể tải thông tin chi nhánh");
        } finally {
            setLoading(false);
        }
    };

    const closeDrawer = () => {
        setIsDrawerVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Format time fields
            const formattedValues = {
                ...values,
                open_time: values.open_time?.format("HH:mm:ss"),
                close_time: values.close_time?.format("HH:mm:ss"),
            };

            if (isEditing) {
                await updateBranch(currentBranch.id, formattedValues);
                message.success("Chi nhánh đã được cập nhật!");
            } else {
                await createBranch(formattedValues);
                message.success("Chi nhánh đã được tạo!");
            }

            setIsModalVisible(false);
            fetchBranches();
        } catch (error) {
            message.error(
                "Có lỗi xảy ra: " +
                    (error.response?.data?.message || error.message)
            );
            console.error("Error submitting branch:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await deleteBranch(id);
            message.success("Chi nhánh đã được xóa!");
            fetchBranches();
        } catch (error) {
            message.error("Không thể xóa chi nhánh!");
            console.error("Error deleting branch:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            setLoading(true);
            await updateBranchStatus(
                id,
                status === "active" ? "inactive" : "active"
            );
            message.success("Trạng thái đã được cập nhật!");
            fetchBranches();
        } catch (error) {
            message.error("Không thể cập nhật trạng thái!");
            console.error("Error updating branch status:", error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Mã chi nhánh",
            dataIndex: "branch_code",
            key: "branch_code",
        },
        {
            title: "Tên chi nhánh",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
        },
        {
            title: "Loại chi nhánh",
            dataIndex: "branchType",
            key: "branchType",
            render: (branchType) => branchType?.name || "Không xác định",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => showDrawer(record.id)}
                        size="small"
                    />
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        size="small"
                    >
                        Sửa
                    </Button>
                    <Button
                        type={
                            record.status === "active" ? "default" : "primary"
                        }
                        icon={
                            record.status === "active" ? (
                                <CloseCircleOutlined />
                            ) : (
                                <CheckCircleOutlined />
                            )
                        }
                        onClick={() =>
                            handleStatusChange(record.id, record.status)
                        }
                        size="small"
                        style={
                            record.status !== "active"
                                ? {
                                      backgroundColor: "#52c41a",
                                      borderColor: "#52c41a",
                                  }
                                : {}
                        }
                    >
                        {record.status === "active" ? "Ngừng" : "Kích hoạt"}
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa chi nhánh này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>Quản lý Chi nhánh Nhà hàng</Title>

            <Card>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                    style={{ marginBottom: 16 }}
                >
                    Thêm chi nhánh mới
                </Button>

                <Table
                    columns={columns}
                    dataSource={branches}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={isEditing ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
                visible={isModalVisible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={loading}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="branch_code"
                        label="Mã chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mã chi nhánh!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập mã chi nhánh" />
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Tên chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên chi nhánh!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên chi nhánh" />
                    </Form.Item>

                    <Form.Item
                        name="branch_type_id"
                        label="Loại chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn loại chi nhánh!",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn loại chi nhánh">
                            {branchTypes.map((type) => (
                                <Option key={type.id} value={type.id}>
                                    {type.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập địa chỉ!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập địa chỉ chi nhánh" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập số điện thoại!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập email!",
                                type: "email",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập địa chỉ email" />
                    </Form.Item>

                    <Form.Item name="website" label="Website">
                        <Input placeholder="Nhập địa chỉ website" />
                    </Form.Item>

                    <Form.Item
                        name="working_days"
                        label="Ngày làm việc"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập ngày làm việc!",
                            },
                        ]}
                    >
                        <Input placeholder="Ví dụ: Thứ 2 - Chủ nhật" />
                    </Form.Item>

                    <Form.Item
                        name="open_time"
                        label="Giờ mở cửa"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn giờ mở cửa!",
                            },
                        ]}
                    >
                        <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="close_time"
                        label="Giờ đóng cửa"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn giờ đóng cửa!",
                            },
                        ]}
                    >
                        <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="manager_name"
                        label="Tên quản lý"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên quản lý!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên quản lý" />
                    </Form.Item>

                    <Form.Item
                        name="manager_phone"
                        label="Số điện thoại quản lý"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập số điện thoại quản lý!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập số điện thoại quản lý" />
                    </Form.Item>

                    <Form.Item name="staff_count" label="Số lượng nhân viên">
                        <Input
                            type="number"
                            min={0}
                            placeholder="Nhập số lượng nhân viên"
                        />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea
                            rows={3}
                            placeholder="Mô tả về chi nhánh này"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Drawer
                title="Chi tiết Chi nhánh"
                placement="right"
                onClose={closeDrawer}
                visible={isDrawerVisible}
                width={600}
            >
                {selectedBranch && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Mã chi nhánh">
                            {selectedBranch.branch_code}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên chi nhánh">
                            {selectedBranch.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại chi nhánh">
                            {selectedBranch.branchType?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                            {selectedBranch.address}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                            {selectedBranch.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {selectedBranch.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Website">
                            {selectedBranch.website || "Không có"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày làm việc">
                            {selectedBranch.working_days}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giờ làm việc">
                            {selectedBranch.open_time} -{" "}
                            {selectedBranch.close_time}
                        </Descriptions.Item>
                        <Descriptions.Item label="Quản lý">
                            {selectedBranch.manager_name} -{" "}
                            {selectedBranch.manager_phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượng nhân viên">
                            {selectedBranch.staff_count}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag
                                color={
                                    selectedBranch.status === "active"
                                        ? "green"
                                        : "red"
                                }
                            >
                                {selectedBranch.status === "active"
                                    ? "Hoạt động"
                                    : "Không hoạt động"}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả">
                            {selectedBranch.description || "Không có mô tả"}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default RestaurantBranches;
