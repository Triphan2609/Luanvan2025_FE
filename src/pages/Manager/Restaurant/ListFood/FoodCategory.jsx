import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Switch,
    Popconfirm,
    message,
    Upload,
    Select,
    Card,
    Typography,
    Spin,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import { foodCategoryApi } from "../../../../api/restaurantApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";
import { staticUrl } from "../../../../configs/apiClient";

const { Title } = Typography;
const { Option } = Select;

const FoodCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [form] = Form.useForm();
    const [branches, setBranches] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        fetchCategories();
        fetchBranches();
    }, [pagination.current, pagination.pageSize]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
            };
            const response = await foodCategoryApi.getAllCategories(params);
            setCategories(response.data);
            setPagination({
                ...pagination,
                total: response.total,
            });
        } catch (error) {
            message.error("Không thể tải danh mục món ăn!");
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const branchesData = await getRestaurantBranches();
            setBranches(branchesData);
        } catch (error) {
            console.error("Error fetching branches:", error);
            message.error("Không thể tải danh sách chi nhánh");
        }
    };

    const showModal = (record = null) => {
        setCurrentCategory(record);
        setIsEditing(!!record);
        setIsModalVisible(true);

        if (record) {
            form.setFieldsValue({
                name: record.name,
                description: record.description,
                isActive: record.isActive,
                branchId: record.branchId,
            });

            if (record.imageUrl) {
                setImageUrl(record.imageUrl);
                setFileList([
                    {
                        uid: "-1",
                        name: "category-image.png",
                        status: "done",
                        url: record.imageUrl,
                    },
                ]);
            } else {
                setImageUrl("");
                setFileList([]);
            }
        } else {
            form.resetFields();
            setImageUrl("");
            setFileList([]);
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

            console.log("Form values:", values);
            console.log("Current fileList:", fileList);

            // Prepare the data object
            const categoryData = {
                ...values,
            };

            let response;
            if (isEditing) {
                response = await foodCategoryApi.updateCategory(
                    currentCategory.id,
                    categoryData
                );
                message.success("Danh mục đã được cập nhật!");
            } else {
                response = await foodCategoryApi.createCategory(categoryData);
                message.success("Danh mục đã được tạo!");
            }

            // Check if there's a file to upload
            const hasFileToUpload = fileList.length > 0;
            console.log("Has file to upload:", hasFileToUpload);

            if (hasFileToUpload) {
                if (!fileList[0].originFileObj) {
                    console.warn("Missing originFileObj in file:", fileList[0]);
                }

                const fileToUpload = fileList[0].originFileObj || fileList[0];
                const categoryId = isEditing ? currentCategory.id : response.id;

                console.log(
                    "Preparing to upload image for category ID:",
                    categoryId
                );
                console.log("File to upload:", fileToUpload);

                try {
                    const uploadResponse =
                        await foodCategoryApi.uploadCategoryImage(
                            categoryId,
                            fileToUpload
                        );
                    console.log(
                        "Image upload complete, response:",
                        uploadResponse
                    );

                    // Cập nhật trực tiếp danh mục mới với dữ liệu trả về từ upload
                    if (uploadResponse) {
                        if (isEditing) {
                            // Cập nhật trực tiếp danh mục trong state
                            setCategories((prevCategories) =>
                                prevCategories.map((cat) =>
                                    cat.id === uploadResponse.id
                                        ? uploadResponse
                                        : cat
                                )
                            );
                        } else {
                            // Thêm danh mục mới vào đầu danh sách
                            setCategories((prevCategories) => [
                                uploadResponse,
                                ...prevCategories,
                            ]);
                        }
                        message.success("Hình ảnh đã được tải lên!");
                    }
                } catch (uploadError) {
                    console.error("Error uploading image:", uploadError);
                    message.error(
                        "Không thể tải lên hình ảnh: " + uploadError.message
                    );
                }
            } else {
                console.log("No file to upload");
            }

            setIsModalVisible(false);
            // Always fetch to ensure data is up to date
            fetchCategories();
        } catch (error) {
            message.error("Có lỗi xảy ra!");
            console.error("Error submitting category:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await foodCategoryApi.deleteCategory(id);
            message.success("Danh mục đã được xóa!");
            fetchCategories();
        } catch (error) {
            message.error("Không thể xóa danh mục!");
            console.error("Error deleting category:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    const columns = [
        {
            title: "Tên danh mục",
            dataIndex: "name",
            key: "name",
            width: "20%",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            width: "30%",
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            width: "15%",
            render: (isActive) => (
                <span style={{ color: isActive ? "green" : "red" }}>
                    {isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
            ),
        },
        {
            title: "Chi nhánh",
            dataIndex: "branchId",
            key: "branchId",
            width: "15%",
            render: (branchId) => {
                const branch = branches.find((b) => b.id === branchId);
                return branch ? branch.name : "Không xác định";
            },
        },
        {
            title: "Hình ảnh",
            dataIndex: "imageUrl",
            key: "imageUrl",
            width: "10%",
            render: (imageUrl) =>
                imageUrl ? (
                    <img
                        src={staticUrl(imageUrl)}
                        alt="Category"
                        style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <span>Không có</span>
                ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: "15%",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        size="small"
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa danh mục này?"
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

    const uploadProps = {
        onRemove: () => {
            console.log("File removed from list");
            setFileList([]);
            setImageUrl("");
        },
        beforeUpload: (file) => {
            console.log("beforeUpload called with file:", file);
            const isJpgOrPng =
                file.type === "image/jpeg" || file.type === "image/png";
            if (!isJpgOrPng) {
                message.error("Chỉ có thể tải lên file JPG/PNG!");
                return Upload.LIST_IGNORE;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error("Hình ảnh phải nhỏ hơn 2MB!");
                return Upload.LIST_IGNORE;
            }

            // Preview file
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                console.log("File loaded for preview:", file.name);
                setImageUrl(reader.result);
            };

            // Save file to state
            console.log("Adding file to fileList:", file);
            setFileList([file]);
            return false; // Prevent auto upload
        },
        onChange: (info) => {
            console.log("Upload onChange:", info.file.status, info.file);
            // Update file list if status changes
            if (info.file.status === "removed") {
                setFileList([]);
            }
        },
        fileList,
    };

    return (
        <Card>
            <Title level={4}>Quản lý danh mục món ăn</Title>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                style={{ marginBottom: 16 }}
            >
                Thêm danh mục mới
            </Button>

            <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
            />

            <Modal
                title={isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                visible={isModalVisible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={loading}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        isActive: true,
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên danh mục!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea
                            rows={4}
                            placeholder="Mô tả về danh mục"
                        />
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
                    >
                        <Switch
                            checkedChildren="Hoạt động"
                            unCheckedChildren="Không hoạt động"
                        />
                    </Form.Item>

                    <Form.Item label="Hình ảnh đại diện">
                        <Upload
                            {...uploadProps}
                            listType="picture-card"
                            maxCount={1}
                        >
                            {fileList.length === 0 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                        {imageUrl && (
                            <img
                                src={
                                    imageUrl.startsWith("http")
                                        ? imageUrl
                                        : staticUrl(imageUrl)
                                }
                                alt="Preview"
                                style={{ width: "100%", marginTop: 8 }}
                            />
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default FoodCategory;
