import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    message,
    Button,
} from "antd";
import {
    UploadOutlined,
    PlusOutlined,
    InfoCircleOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import {
    foodCategoryApi,
    getIngredients,
    getFoodIngredients,
    setIngredientsForFood,
} from "../../../../../api/restaurantApi";
import { getRestaurantBranches } from "../../../../../api/branchesApi";
import { staticUrl } from "../../../../../configs/apiClient";

const { TextArea } = Input;
const { Option } = Select;

const FoodStatus = {
    AVAILABLE: "available",
    SOLD_OUT: "sold_out",
    INACTIVE: "inactive",
};

const FoodModal = ({ open, onCancel, onSave, initialData }) => {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [fileList, setFileList] = useState([]);
    const [ingredientOptions, setIngredientOptions] = useState([]);
    const [foodIngredients, setFoodIngredients] = useState([
        { ingredientId: undefined, amount: 1 },
    ]);

    useEffect(() => {
        fetchCategories();
        fetchBranches();
        fetchIngredients();
    }, []);

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                branchId: Number(initialData.branchId),
                categoryId: initialData.categoryId,
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

            // Fetch and set food ingredients if editing
            if (initialData.id) {
                getFoodIngredients(initialData.id)
                    .then((res) => {
                        if (res && res.length > 0) {
                            setFoodIngredients(
                                res.map((item) => ({
                                    ingredientId: item.ingredientId,
                                    amount: item.amount,
                                }))
                            );
                        }
                    })
                    .catch((error) => {
                        console.error(
                            "Error fetching food ingredients:",
                            error
                        );
                        message.error("Không thể tải nguyên liệu của món ăn!");
                    });
            }
        } else {
            form.resetFields();
            form.setFieldsValue({
                status: FoodStatus.AVAILABLE,
            });
            setImageUrl("");
            setFileList([]);
            setFoodIngredients([{ ingredientId: undefined, amount: 1 }]);
        }
    }, [initialData, form]);

    useEffect(() => {
        if (initialData?.id) {
            // Lấy nguyên liệu hiện tại của món ăn
            getFoodIngredients(initialData.id).then((res) => {
                setFoodIngredients(
                    (res.data || res).map((item) => ({
                        ingredientId: item.ingredientId,
                        amount: item.amount,
                    }))
                );
            });
        } else {
            setFoodIngredients([{ ingredientId: undefined, amount: 1 }]);
        }
        // Lấy tất cả nguyên liệu để chọn
        getIngredients().then((res) => setIngredientOptions(res.data || res));
    }, [initialData]);

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

    const fetchIngredients = async () => {
        try {
            const res = await getIngredients();
            setIngredientOptions(res.data || res);
        } catch {
            setIngredientOptions([]);
        }
    };

    const fetchFoodIngredients = async (foodId) => {
        try {
            const response = await getIngredients(foodId);
            if (response && response.length > 0) {
                setFoodIngredients(
                    response.map((item) => ({
                        ingredientId: item.ingredientId,
                        amount: item.amount,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching food ingredients:", error);
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

    const handleAddIngredient = () => {
        setFoodIngredients([
            ...foodIngredients,
            { ingredientId: undefined, amount: 1 },
        ]);
    };

    const handleRemoveIngredient = (idx) => {
        setFoodIngredients(foodIngredients.filter((_, i) => i !== idx));
    };

    const handleIngredientChange = (idx, field, value) => {
        setFoodIngredients(
            foodIngredients.map((item, i) =>
                i === idx ? { ...item, [field]: value } : item
            )
        );
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const validIngredients = foodIngredients.filter(
                (i) => i.ingredientId && i.amount > 0
            );
            const foodData = {
                ...initialData,
                ...values,
                branchId: Number(values.branchId),
                categoryId: values.categoryId,
                ingredientsList: validIngredients,
            };

            if (fileList.length > 0 && fileList[0].originFileObj) {
                foodData.image = fileList[0].originFileObj;
            }

            setLoading(true);
            await onSave(foodData);
            setLoading(false);
            form.resetFields();
        } catch (info) {
            setLoading(false);
            message.error(
                "Vui lòng nhập đầy đủ thông tin món ăn và nguyên liệu"
            );
            console.error("Form validation error:", info);
        }
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
            confirmLoading={loading}
        >
            <Form layout="vertical" form={form}>
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

                <Form.Item label="Thành phần nguyên liệu" required>
                    {foodIngredients.map((item, idx) => (
                        <div
                            key={idx}
                            style={{ display: "flex", gap: 8, marginBottom: 8 }}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn nguyên liệu"
                                style={{ flex: 2 }}
                                value={item.ingredientId}
                                onChange={(v) =>
                                    handleIngredientChange(
                                        idx,
                                        "ingredientId",
                                        v
                                    )
                                }
                                filterOption={(input, option) =>
                                    option.children
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            >
                                {ingredientOptions
                                    .filter(
                                        (opt) =>
                                            !foodIngredients.some(
                                                (fi, i) =>
                                                    fi.ingredientId ===
                                                        opt.id && i !== idx
                                            )
                                    )
                                    .map((opt) => (
                                        <Select.Option
                                            key={opt.id}
                                            value={opt.id}
                                        >
                                            {opt.name}
                                        </Select.Option>
                                    ))}
                            </Select>
                            <InputNumber
                                min={1}
                                placeholder="Số lượng"
                                style={{ flex: 1 }}
                                value={item.amount}
                                onChange={(v) =>
                                    handleIngredientChange(idx, "amount", v)
                                }
                            />
                            <Button
                                danger
                                type="link"
                                onClick={() => handleRemoveIngredient(idx)}
                                disabled={foodIngredients.length === 1}
                            >
                                Xóa
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="dashed"
                        onClick={handleAddIngredient}
                        icon={<PlusOutlined />}
                    >
                        Thêm nguyên liệu
                    </Button>
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

                <Form.Item name="status" label="Trạng thái">
                    <Select>
                        <Option value={FoodStatus.AVAILABLE}>Có sẵn</Option>
                        <Option value={FoodStatus.SOLD_OUT}>Hết hàng</Option>
                        <Option value={FoodStatus.INACTIVE}>
                            Không hoạt động
                        </Option>
                    </Select>
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Mô tả về món ăn" />
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
