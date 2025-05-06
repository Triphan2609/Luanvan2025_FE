import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Space,
    Button,
    message,
    Divider,
    Alert,
    Row,
    Col,
} from "antd";
import {
    InfoCircleOutlined,
    SyncOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";

// Định nghĩa các loại vật dụng
const ITEM_TYPES = [
    {
        value: "long_term",
        label: "Dài hạn",
        icon: <ClockCircleOutlined />,
        description: "Vật dụng sử dụng lâu dài, có thể tái sử dụng nhiều lần",
    },
    {
        value: "single_use",
        label: "Dùng 1 lần",
        icon: <InfoCircleOutlined />,
        description: "Vật dụng dùng 1 lần và không thu hồi sau khi sử dụng",
    },
    {
        value: "multiple_use",
        label: "Dùng nhiều lần",
        icon: <SyncOutlined />,
        description:
            "Vật dụng có thể sử dụng với số lần giới hạn trước khi thay mới",
    },
];

const StuffForm = ({
    open,
    onCancel,
    onSubmit,
    editingStuff,
    categories,
    branches = [],
    selectedBranch,
    loading,
}) => {
    const [form] = Form.useForm();
    const [itemType, setItemType] = useState("long_term");

    useEffect(() => {
        if (editingStuff) {
            // Format data from API to match form fields
            form.setFieldsValue({
                ...editingStuff,
                categoryId:
                    editingStuff.categoryId || editingStuff.category?.id,
                branchId: editingStuff.branchId || editingStuff.branch?.id,
                itemType: editingStuff.itemType || "long_term",
                inUseQuantity: editingStuff.inUseQuantity || 0,
                maxUses: editingStuff.maxUses || 0,
                currentUses: editingStuff.currentUses || 0,
            });
            setItemType(editingStuff.itemType || "long_term");
        } else {
            form.resetFields();
            if (selectedBranch) {
                form.setFieldsValue({
                    branchId: selectedBranch,
                    itemType: "long_term",
                    stockQuantity: 0,
                    inUseQuantity: 0,
                    maxUses: 0,
                    currentUses: 0,
                });
            }
            setItemType("long_term");
        }
    }, [editingStuff, form, selectedBranch, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error("Form validation failed:", error);
            message.error("Vui lòng kiểm tra lại các trường thông tin");
        }
    };

    // Find branch name by ID
    const findBranchName = (branchId) => {
        const branch = branches.find((b) => b.id === branchId);
        return branch ? branch.name : "";
    };

    // Filter categories to show only those from the selected branch
    const filteredCategories = categories.filter(
        (category) => !selectedBranch || category.branchId === selectedBranch
    );

    // Xử lý khi loại vật dụng thay đổi
    const handleItemTypeChange = (value) => {
        setItemType(value);

        // Reset các trường không áp dụng cho loại mới
        if (value === "long_term") {
            form.setFieldsValue({
                maxUses: 0,
                currentUses: 0,
            });
        }
    };

    return (
        <Modal
            title={editingStuff ? "Sửa vật dụng" : "Thêm vật dụng mới"}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {selectedBranch && (
                    <Alert
                        message={`Chi nhánh: ${findBranchName(selectedBranch)}`}
                        type="info"
                        style={{ marginBottom: 16 }}
                    />
                )}

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
                    <Select
                        placeholder="Chọn chi nhánh"
                        disabled={editingStuff || !!selectedBranch}
                        showSearch
                        optionFilterProp="children"
                        notFoundContent={
                            loading ? "Đang tải..." : "Không có chi nhánh"
                        }
                    >
                        {branches && branches.length > 0 ? (
                            branches.map((branch) => (
                                <Select.Option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </Select.Option>
                            ))
                        ) : (
                            <Select.Option disabled>
                                Không có chi nhánh
                            </Select.Option>
                        )}
                    </Select>
                </Form.Item>

                <Divider />

                <Form.Item
                    name="name"
                    label="Tên vật dụng"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên vật dụng!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên vật dụng" />
                </Form.Item>

                <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[
                        { required: true, message: "Vui lòng chọn danh mục!" },
                    ]}
                >
                    <Select
                        placeholder="Chọn danh mục vật dụng"
                        loading={loading}
                        optionFilterProp="children"
                        showSearch
                        notFoundContent={
                            selectedBranch
                                ? "Không có danh mục nào cho chi nhánh này"
                                : "Vui lòng chọn chi nhánh trước"
                        }
                    >
                        {filteredCategories.map((category) => (
                            <Select.Option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea
                        rows={2}
                        placeholder="Nhập mô tả vật dụng"
                    />
                </Form.Item>

                <Form.Item
                    name="itemType"
                    label="Loại sử dụng"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn loại sử dụng!",
                        },
                    ]}
                >
                    <Select
                        placeholder="Chọn loại sử dụng"
                        onChange={handleItemTypeChange}
                    >
                        {ITEM_TYPES.map((type) => (
                            <Select.Option key={type.value} value={type.value}>
                                <Space>
                                    {type.icon} {type.label}
                                    <span
                                        style={{
                                            color: "#888",
                                            fontSize: "12px",
                                        }}
                                    >
                                        ({type.description})
                                    </span>
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="stockQuantity"
                            label="Số lượng trong kho"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng nhập số lượng trong kho!",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                placeholder="Nhập số lượng trong kho"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="inUseQuantity"
                            label="Số lượng đang sử dụng"
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                placeholder="Nhập số lượng đang sử dụng"
                            />
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
                                        required: itemType === "multiple_use",
                                        message:
                                            "Vui lòng nhập số lần sử dụng tối đa!",
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
                                    style={{ width: "100%" }}
                                    min={1}
                                    placeholder="Nhập số lần sử dụng tối đa"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="currentUses"
                                label="Số lần đã sử dụng"
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={0}
                                    placeholder="Nhập số lần đã sử dụng"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                <Form.Item name="unitPrice" label="Đơn giá (VNĐ)">
                    <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        step={1000}
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        placeholder="Nhập đơn giá"
                    />
                </Form.Item>

                <Form.Item name="image" label="Hình ảnh URL">
                    <Input placeholder="Nhập URL hình ảnh" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {editingStuff ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StuffForm;
