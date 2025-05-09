import React, { useState, useEffect } from "react";
import {
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Switch,
    Popconfirm,
    message,
    Upload,
    Card,
    Typography,
    Row,
    Col,
    Tag,
    Drawer,
    Descriptions,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    EyeOutlined,
    InfoCircleOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { foodApi, foodCategoryApi } from "../../../../api/restaurantApi";
import { getRestaurantBranches } from "../../../../api/branchesApi";
import { staticUrl } from "../../../../configs/apiClient";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const FoodStatus = {
    AVAILABLE: "available",
    SOLD_OUT: "sold_out",
    INACTIVE: "inactive",
};

const FoodList = () => {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFood, setCurrentFood] = useState(null);
    const [selectedFood, setSelectedFood] = useState(null);
    const [form] = Form.useForm();
    const [branches, setBranches] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [fileList, setFileList] = useState([]);
    const [filters, setFilters] = useState({
        name: "",
        categoryId: "",
        status: "",
    });

    useEffect(() => {
        fetchFoods();
        fetchCategories();
        fetchBranches();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
            };

            // Ensure categoryId and branchId have the correct types
            if (params.categoryId) {
                params.categoryId = params.categoryId; // Keep as string (UUID)
            }

            if (params.branchId) {
                params.branchId = Number(params.branchId); // Convert to number
            }

            console.log("Fetching foods with params:", params);
            const response = await foodApi.getAllFoods(params);

            setFoods(response.data);
            setPagination({
                ...pagination,
                total: response.total,
            });
        } catch (error) {
            message.error("Không thể tải danh sách món ăn!");
            console.error("Error fetching foods:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await foodCategoryApi.getAllCategories({
                limit: 100,
            });
            setCategories(response.data);
        } catch (error) {
            message.error("Không thể tải danh mục món ăn!");
            console.error("Error fetching categories:", error);
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
        setCurrentFood(record);
        setIsEditing(!!record);
        setIsModalVisible(true);

        if (record) {
            // Use categoryId directly as a string (UUID)
            form.setFieldsValue({
                name: record.name,
                description: record.description,
                price: record.price,
                status: record.status,
                ingredients: record.ingredients,
                categoryId: record.categoryId, // Keep as string UUID
                branchId: record.branchId, // Keep as number
                isVegetarian: record.isVegetarian,
                isVegan: record.isVegan,
                isGlutenFree: record.isGlutenFree,
                spicyLevel: record.spicyLevel,
                preparationTime: record.preparationTime,
            });

            if (record.imageUrl) {
                const fullImageUrl = staticUrl(record.imageUrl);
                setImageUrl(fullImageUrl);
                setFileList([
                    {
                        uid: "-1",
                        name: "food-image.png",
                        status: "done",
                        url: fullImageUrl,
                    },
                ]);
            } else {
                setImageUrl("");
                setFileList([]);
            }
        } else {
            form.resetFields();
            form.setFieldsValue({
                status: FoodStatus.AVAILABLE,
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: false,
            });
            setImageUrl("");
            setFileList([]);
        }
    };

    const showDrawer = (record) => {
        setSelectedFood(record);
        setIsDrawerVisible(true);
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

            // Prepare the data object with properly typed values
            const foodData = {
                ...values,
                categoryId: values.categoryId, // Keep categoryId as string (UUID)
                branchId: Number(values.branchId), // Convert branchId to number
            };

            console.log("Submitting food data:", {
                name: foodData.name,
                categoryId: {
                    value: foodData.categoryId,
                    type: typeof foodData.categoryId,
                },
                categoryName:
                    categories.find((c) => c.id === foodData.categoryId)
                        ?.name || "Unknown",
                branchId: {
                    value: foodData.branchId,
                    type: typeof foodData.branchId,
                },
            });

            let response;
            if (isEditing) {
                response = await foodApi.updateFood(currentFood.id, foodData);
                message.success("Món ăn đã được cập nhật!");
            } else {
                response = await foodApi.createFood(foodData);
                message.success("Món ăn đã được tạo!");
            }

            // Upload image if there's a new one
            if (fileList.length > 0 && fileList[0].originFileObj) {
                const foodId = isEditing ? currentFood.id : response.id;
                console.log("Preparing to upload image for food ID:", foodId);
                console.log("Image file details:", {
                    name: fileList[0].originFileObj.name,
                    type: fileList[0].originFileObj.type,
                    size: `${(fileList[0].originFileObj.size / 1024).toFixed(
                        2
                    )} KB`,
                });

                try {
                    const uploadResponse = await foodApi.uploadFoodImage(
                        foodId,
                        fileList[0].originFileObj
                    );
                    console.log(
                        "Image upload complete, response:",
                        uploadResponse
                    );

                    if (uploadResponse) {
                        // Refresh food list to show updated data
                        fetchFoods();
                        message.success("Hình ảnh đã được tải lên thành công!");
                    }
                } catch (uploadError) {
                    console.error("Error during image upload:", uploadError);
                    message.error(
                        "Không thể tải lên hình ảnh. Vui lòng thử lại sau!"
                    );
                }
            } else {
                console.log("No new image to upload");
                // Still refresh to show updated data
                fetchFoods();
            }

            setIsModalVisible(false);
        } catch (error) {
            message.error("Có lỗi xảy ra!");
            console.error("Error submitting food:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await foodApi.deleteFood(id);
            message.success("Món ăn đã được xóa!");
            fetchFoods();
        } catch (error) {
            message.error("Không thể xóa món ăn!");
            console.error("Error deleting food:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
    };

    const handleFilterChange = (key, value) => {
        // Both categoryId and branchId are now string UUIDs, no need to convert
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
    };

    const getStatusColor = (status) => {
        switch (status) {
            case FoodStatus.AVAILABLE:
                return "green";
            case FoodStatus.SOLD_OUT:
                return "orange";
            case FoodStatus.INACTIVE:
                return "red";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case FoodStatus.AVAILABLE:
                return "Có sẵn";
            case FoodStatus.SOLD_OUT:
                return "Hết hàng";
            case FoodStatus.INACTIVE:
                return "Không hoạt động";
            default:
                return "Không xác định";
        }
    };

    const columns = [
        {
            title: "Hình ảnh",
            dataIndex: "imageUrl",
            key: "imageUrl",
            render: (imageUrl) =>
                imageUrl ? (
                    <img
                        src={staticUrl(imageUrl)}
                        alt="Food"
                        style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "4px",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "60px",
                            height: "60px",
                            background: "#f0f0f0",
                            borderRadius: "4px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        Không có
                    </div>
                ),
        },
        {
            title: "Tên món",
            dataIndex: "name",
            key: "name",
            sorter: true,
        },
        {
            title: "Danh mục",
            dataIndex: "category",
            key: "category",
            render: (_, record) => {
                // Find category by exact UUID match
                const category = categories.find(
                    (c) => c.id === record.categoryId
                );

                return (
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span>
                            {category ? category.name : "Không xác định"}
                        </span>
                    </div>
                );
            },
        },
        {
            title: "Chi nhánh",
            dataIndex: "branchId",
            key: "branchId",
            render: (branchId) => {
                const branch = branches.find((b) => b.id === Number(branchId));
                return branch ? branch.name : "Không xác định";
            },
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            sorter: true,
            render: (price) => `${Number(price).toLocaleString("vi-VN")}đ`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => showDrawer(record)}
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
                    <Popconfirm
                        title="Bạn có chắc muốn xóa món ăn này?"
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
            setFileList([]);
            setImageUrl("");
        },
        beforeUpload: (file) => {
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
                setImageUrl(reader.result);
            };

            setFileList([
                {
                    uid: "-1",
                    name: file.name,
                    originFileObj: file,
                    status: "done",
                },
            ]);
            return false;
        },
        fileList,
    };

    // Function to display image preview
    const renderImagePreview = () => {
        if (!imageUrl) return null;

        return (
            <div style={{ marginTop: 16, textAlign: "center" }}>
                <img
                    src={imageUrl}
                    alt="Food preview"
                    style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                        borderRadius: "4px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                />
                <div style={{ marginTop: 8, color: "#666" }}>
                    <InfoCircleOutlined style={{ marginRight: 4 }} />
                    Xem trước hình ảnh
                </div>
            </div>
        );
    };

    return (
        <Card>
            <Title level={4}>Danh sách món ăn</Title>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Input.Search
                        placeholder="Tìm theo tên món ăn"
                        allowClear
                        onSearch={(value) => handleFilterChange("name", value)}
                        style={{ width: "100%" }}
                    />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Select
                        placeholder="Chọn danh mục"
                        allowClear
                        style={{ width: "100%" }}
                        onChange={(value) =>
                            handleFilterChange("categoryId", value)
                        }
                        optionLabelProp="label"
                    >
                        {categories.map((category) => (
                            <Option
                                key={category.id}
                                value={category.id}
                                label={category.name}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {category.imageUrl && (
                                        <img
                                            src={staticUrl(category.imageUrl)}
                                            alt={category.name}
                                            style={{
                                                width: 20,
                                                height: 20,
                                                marginRight: 8,
                                                objectFit: "cover",
                                            }}
                                        />
                                    )}
                                    <span>{category.name}</span>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        style={{ width: "100%" }}
                        onChange={(value) =>
                            handleFilterChange("status", value)
                        }
                    >
                        <Option value={FoodStatus.AVAILABLE}>Có sẵn</Option>
                        <Option value={FoodStatus.SOLD_OUT}>Hết hàng</Option>
                        <Option value={FoodStatus.INACTIVE}>
                            Không hoạt động
                        </Option>
                    </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Thêm món ăn mới
                    </Button>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={foods}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
            />

            <Modal
                title={isEditing ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={loading}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: FoodStatus.AVAILABLE,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên món ăn"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên món ăn!",
                                    },
                                ]}
                            >
                                <Input placeholder="Nhập tên món ăn" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập giá!",
                                    },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={0}
                                    step={1000}
                                    formatter={(value) =>
                                        `${value}`.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ","
                                        )
                                    }
                                    parser={(value) =>
                                        value.replace(/\$\s?|(,*)/g, "")
                                    }
                                    placeholder="Nhập giá"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="categoryId"
                                label="Danh mục"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn danh mục!",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn danh mục"
                                    optionLabelProp="label"
                                >
                                    {categories.map((category) => (
                                        <Option
                                            key={category.id}
                                            value={category.id}
                                            label={category.name}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {category.imageUrl && (
                                                    <img
                                                        src={staticUrl(
                                                            category.imageUrl
                                                        )}
                                                        alt={category.name}
                                                        style={{
                                                            width: 20,
                                                            height: 20,
                                                            marginRight: 8,
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                )}
                                                <span>{category.name}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn trạng thái!",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value={FoodStatus.AVAILABLE}>
                                        Có sẵn
                                    </Option>
                                    <Option value={FoodStatus.SOLD_OUT}>
                                        Hết hàng
                                    </Option>
                                    <Option value={FoodStatus.INACTIVE}>
                                        Không hoạt động
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={3} placeholder="Mô tả về món ăn" />
                    </Form.Item>

                    <Form.Item name="ingredients" label="Thành phần">
                        <TextArea
                            rows={2}
                            placeholder="Các thành phần của món ăn"
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
                                <Option
                                    key={branch.id}
                                    value={Number(branch.id)}
                                >
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label={
                            <span>
                                <PictureOutlined style={{ marginRight: 8 }} />
                                Hình ảnh món ăn
                            </span>
                        }
                        extra="Hỗ trợ định dạng JPG, PNG (tối đa 2MB)"
                    >
                        <Upload
                            {...uploadProps}
                            listType="picture-card"
                            maxCount={1}
                            className="food-image-uploader"
                        >
                            {fileList.length === 0 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên</div>
                                </div>
                            )}
                        </Upload>
                        {renderImagePreview()}
                    </Form.Item>
                </Form>
            </Modal>

            <Drawer
                title="Chi tiết món ăn"
                placement="right"
                width={500}
                onClose={closeDrawer}
                open={isDrawerVisible}
            >
                {selectedFood && (
                    <>
                        {selectedFood.imageUrl && (
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <img
                                    src={staticUrl(selectedFood.imageUrl)}
                                    alt={selectedFood.name}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "300px",
                                        objectFit: "contain",
                                    }}
                                />
                            </div>
                        )}

                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tên món ăn">
                                {selectedFood.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá">
                                {Number(selectedFood.price).toLocaleString(
                                    "vi-VN"
                                )}
                                đ
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={getStatusColor(selectedFood.status)}
                                >
                                    {getStatusText(selectedFood.status)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Danh mục">
                                {(() => {
                                    const category = categories.find((c) => {
                                        const recordCategoryId =
                                            selectedFood.categoryId;
                                        const categoryId = c.id;

                                        return (
                                            categoryId === recordCategoryId ||
                                            parseInt(categoryId, 10) ===
                                                recordCategoryId ||
                                            categoryId ===
                                                parseInt(recordCategoryId, 10)
                                        );
                                    });

                                    return (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            {category?.imageUrl && (
                                                <img
                                                    src={staticUrl(
                                                        category.imageUrl
                                                    )}
                                                    alt={category.name}
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        marginRight: 8,
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            )}
                                            <span>
                                                {category
                                                    ? category.name
                                                    : "Không xác định"}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chi nhánh">
                                {branches.find(
                                    (b) =>
                                        b.id === Number(selectedFood.branchId)
                                )?.name || "Không xác định"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả">
                                {selectedFood.description || "Không có mô tả"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thành phần">
                                {selectedFood.ingredients ||
                                    "Không có thông tin"}
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}
            </Drawer>
        </Card>
    );
};

export default FoodList;
