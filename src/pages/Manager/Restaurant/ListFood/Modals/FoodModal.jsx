import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Upload, message } from "antd";
import {
    UploadOutlined,
    PlusOutlined,
    InfoCircleOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { foodCategoryApi } from "../../../../../api/restaurantApi";
import { getRestaurantBranches } from "../../../../../api/branchesApi";
import { staticUrl } from "../../../../../configs/apiClient";

const { TextArea } = Input;
const { Option } = Select;

const FoodModal = ({ open, onCancel, onSave, initialData }) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        fetchCategories();
        fetchBranches();
    }, []);

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                // Ensure proper types
                branchId: Number(initialData.branchId),
                categoryId: initialData.categoryId, // Keep as string UUID
            });

            if (initialData.imageUrl) {
                const fullImageUrl = staticUrl(initialData.imageUrl);
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
            setImageUrl("");
            setFileList([]);
        }
    }, [initialData, form]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await foodCategoryApi.getAllCategories({
                limit: 100,
            });
            setCategories(response.data);
        } catch (error) {
            message.error("Không thể tải danh mục món ăn!");
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                console.log("Category data:", {
                    selectedCategoryId: values.categoryId,
                    type: typeof values.categoryId,
                    availableCategories: categories.map((c) => ({
                        id: c.id,
                        name: c.name,
                    })),
                });

                const foodData = {
                    ...initialData,
                    ...values,
                    // Convert branchId to number
                    branchId: Number(values.branchId),
                    // Keep categoryId as string (UUID)
                    categoryId: values.categoryId,
                };

                // Add the image file if it exists and is a new file
                if (fileList.length > 0 && fileList[0].originFileObj) {
                    foodData.image = fileList[0].originFileObj;
                }

                onSave(foodData);
                form.resetFields();
            })
            .catch((info) => {
                message.error("Vui lòng nhập đầy đủ thông tin món ăn");
                console.error("Form validation error:", info);
            });
    };

    return (
        <Modal
            open={open}
            title={initialData ? "Cập nhật món ăn" : "Thêm món ăn mới"}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Lưu"
            cancelText="Hủy"
            width={700}
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    name="name"
                    label="Tên món"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên món ăn!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên món" />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Giá (VND)"
                    rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        min={1000}
                        step={1000}
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                </Form.Item>

                <Form.Item name="ingredients" label="Nguyên liệu">
                    <TextArea
                        rows={3}
                        placeholder="Liệt kê nguyên liệu chính"
                    />
                </Form.Item>

                <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[
                        { required: true, message: "Vui lòng chọn danh mục!" },
                    ]}
                >
                    <Select
                        placeholder="Chọn danh mục"
                        optionLabelProp="label"
                        loading={loading}
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
                </Form.Item>

                <Form.Item
                    name="branchId"
                    label="Chi nhánh"
                    rules={[
                        { required: true, message: "Vui lòng chọn chi nhánh!" },
                    ]}
                >
                    <Select placeholder="Chọn chi nhánh" loading={loading}>
                        {branches.map((branch) => (
                            <Option key={branch.id} value={Number(branch.id)}>
                                {branch.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="status" label="Trạng thái">
                    <Select>
                        <Option value="available">Có sẵn</Option>
                        <Option value="sold_out">Hết hàng</Option>
                        <Option value="inactive">Không hoạt động</Option>
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
    );
};

export default FoodModal;
