import React, { useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Space,
    message,
    Select,
    Alert,
    Divider,
} from "antd";

const { Option } = Select;

const CategoryForm = ({
    open,
    onCancel,
    onSubmit,
    editingCategory,
    branches = [],
    selectedBranch,
    loading,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingCategory) {
            form.setFieldsValue(editingCategory);
        } else {
            form.resetFields();
            if (selectedBranch) {
                form.setFieldsValue({ branchId: selectedBranch });
            }
        }
    }, [editingCategory, form, selectedBranch]);

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

    return (
        <Modal
            title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
            open={open}
            onCancel={onCancel}
            footer={null}
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
                        disabled={editingCategory || !!selectedBranch}
                        showSearch
                        optionFilterProp="children"
                        notFoundContent={
                            loading ? "Đang tải..." : "Không có chi nhánh"
                        }
                    >
                        {branches && branches.length > 0 ? (
                            branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </Option>
                            ))
                        ) : (
                            <Option disabled>Không có chi nhánh</Option>
                        )}
                    </Select>
                </Form.Item>

                <Divider />

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
                        rows={3}
                        placeholder="Nhập mô tả danh mục"
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {editingCategory ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryForm;
