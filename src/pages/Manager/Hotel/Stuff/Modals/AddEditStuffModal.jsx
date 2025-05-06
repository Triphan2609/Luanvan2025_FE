import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Button,
    message,
    Spin,
    Row,
    Col,
    Switch,
    Space,
    Divider,
} from "antd";
import {
    PlusOutlined,
    UploadOutlined,
    InboxOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { getItemCategories } from "../../../../../api/stuffApi";

const { Option } = Select;
const { TextArea } = Input;

// Item types
const ITEM_TYPES = [
    {
        value: "long_term",
        label: "Dài hạn",
        description: "Vật dụng sử dụng lâu dài",
    },
    {
        value: "single_use",
        label: "Dùng 1 lần",
        description: "Vật dụng dùng 1 lần và không thu hồi",
    },
    {
        value: "multiple_use",
        label: "Dùng nhiều lần",
        description: "Vật dụng có số lần sử dụng giới hạn",
    },
];

export default function AddEditStuffModal({
    open,
    onClose,
    onSubmit,
    loading,
    initialData,
    selectedBranch,
}) {
    const [form] = Form.useForm();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [itemType, setItemType] = useState("long_term");

    // Set initial form values if editing
    useEffect(() => {
        if (open && initialData) {
            form.setFieldsValue({
                name: initialData.name,
                description: initialData.description,
                stockQuantity: initialData.stockQuantity,
                inUseQuantity: initialData.inUseQuantity || 0,
                unitPrice: initialData.unitPrice,
                categoryId: initialData.categoryId,
                branchId: initialData.branchId || selectedBranch,
                isActive: initialData.isActive !== false,
                itemType: initialData.itemType || "long_term",
                maxUses: initialData.maxUses || 0,
                currentUses: initialData.currentUses || 0,
            });
            setImageUrl(initialData.image);
            setItemType(initialData.itemType || "long_term");
        } else if (open) {
            // Set default values for new item
            form.setFieldsValue({
                branchId: selectedBranch,
                isActive: true,
                itemType: "long_term",
                stockQuantity: 0,
                inUseQuantity: 0,
                maxUses: 0,
                currentUses: 0,
            });
            setImageUrl(null);
            setItemType("long_term");
        }
    }, [open, initialData, form, selectedBranch]);

    // Load categories
    useEffect(() => {
        if (open && selectedBranch) {
            fetchCategories();
        }
    }, [open, selectedBranch]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const data = await getItemCategories(selectedBranch);
            setCategories(data);
            setLoadingCategories(false);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            message.error("Không thể tải danh mục vật dụng");
            setLoadingCategories(false);
        }
    };

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                // Add image URL to form data if available
                if (imageUrl) {
                    values.image = imageUrl;
                }
                onSubmit(values);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    // Image upload
    const handleUpload = ({ file }) => {
        if (file.status === "uploading") {
            setUploadingImage(true);
            return;
        }
        if (file.status === "done") {
            // Could use actual image upload here
            setImageUrl(URL.createObjectURL(file.originFileObj));
            setUploadingImage(false);
        }
    };

    // Handling item type change to show/hide relevant fields
    const handleItemTypeChange = (value) => {
        setItemType(value);

        // Reset fields that may not apply to the new type
        if (value === "long_term") {
            form.setFieldsValue({
                maxUses: 0,
                currentUses: 0,
            });
        }
    };

    return (
        <Modal
            title={initialData ? "Sửa vật dụng" : "Thêm vật dụng mới"}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={800}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item
                            name="name"
                            label="Tên vật dụng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tên vật dụng",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên vật dụng" />
                        </Form.Item>

                        <Form.Item name="description" label="Mô tả">
                            <TextArea
                                rows={3}
                                placeholder="Nhập mô tả về vật dụng"
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="categoryId"
                                    label="Danh mục"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng chọn danh mục",
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="Chọn danh mục"
                                        loading={loadingCategories}
                                        notFoundContent={
                                            loadingCategories ? (
                                                <Spin size="small" />
                                            ) : null
                                        }
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {categories.map((category) => (
                                            <Option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="unitPrice"
                                    label="Đơn giá (VNĐ)"
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
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="itemType"
                            label="Loại vật dụng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn loại vật dụng",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Chọn loại vật dụng"
                                onChange={handleItemTypeChange}
                            >
                                {ITEM_TYPES.map((type) => (
                                    <Option key={type.value} value={type.value}>
                                        <Space>
                                            {type.label}
                                            <span
                                                style={{
                                                    color: "#888",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                ({type.description})
                                            </span>
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="stockQuantity"
                                    label="Số lượng trong kho"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Vui lòng nhập số lượng",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        min={0}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="inUseQuantity"
                                    label="Số lượng đang sử dụng"
                                >
                                    <InputNumber
                                        min={0}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="branchId"
                                    label="Chi nhánh"
                                    hidden={!selectedBranch}
                                    initialValue={selectedBranch}
                                >
                                    <Input type="hidden" />
                                </Form.Item>
                                <Form.Item
                                    name="isActive"
                                    label="Kích hoạt"
                                    valuePropName="checked"
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>

                        {itemType === "multiple_use" && (
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxUses"
                                        label="Số lần sử dụng tối đa"
                                        rules={[
                                            {
                                                required:
                                                    itemType === "multiple_use",
                                                message:
                                                    "Vui lòng nhập số lần sử dụng tối đa",
                                            },
                                            {
                                                type: "number",
                                                min: 1,
                                                message:
                                                    "Số lần sử dụng phải lớn hơn 0",
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            min={1}
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="currentUses"
                                        label="Số lần đã sử dụng"
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                    </Col>

                    <Col span={8}>
                        <Form.Item
                            label="Hình ảnh"
                            name="image"
                            valuePropName="file"
                        >
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: 16,
                                }}
                            >
                                {imageUrl ? (
                                    <div
                                        style={{
                                            position: "relative",
                                            display: "inline-block",
                                        }}
                                    >
                                        <img
                                            src={imageUrl}
                                            alt="avatar"
                                            style={{
                                                width: "100%",
                                                maxHeight: 200,
                                                objectFit: "contain",
                                            }}
                                        />
                                        <Button
                                            type="primary"
                                            danger
                                            shape="circle"
                                            icon={<DeleteOutlined />}
                                            size="small"
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                            }}
                                            onClick={() => setImageUrl(null)}
                                        />
                                    </div>
                                ) : (
                                    <InboxOutlined
                                        style={{
                                            fontSize: 64,
                                            color: "#d9d9d9",
                                        }}
                                    />
                                )}
                            </div>
                            <Upload
                                name="image"
                                listType="picture"
                                showUploadList={false}
                                customRequest={({ file, onSuccess }) => {
                                    setTimeout(() => {
                                        onSuccess("ok");
                                    }, 0);
                                }}
                                onChange={handleUpload}
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    loading={uploadingImage}
                                    style={{ width: "100%" }}
                                >
                                    {imageUrl
                                        ? "Thay đổi hình ảnh"
                                        : "Tải lên hình ảnh"}
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}
