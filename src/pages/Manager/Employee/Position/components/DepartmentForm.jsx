import React, { useEffect, useState } from "react";
import { Form, Input, Space, Button, Spin, Select } from "antd";
import { getBranches } from "../../../../../api/branchesApi";

const { TextArea } = Input;
const { Option } = Select;

const DepartmentForm = ({ onSubmit, editingDepartment }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [branches, setBranches] = useState([]);
    const [loadingBranches, setLoadingBranches] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if (editingDepartment) {
            form.setFieldsValue({
                ...editingDepartment,
                branch_id: editingDepartment.branch?.id,
            });
        } else {
            form.resetFields();
        }
    }, [editingDepartment, form]);

    const fetchBranches = async () => {
        try {
            setLoadingBranches(true);
            const data = await getBranches();
            setBranches(data || []);
        } catch (error) {
            console.error("Error fetching branches:", error);
        } finally {
            setLoadingBranches(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Spin spinning={loading || loadingBranches}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ height: "100%" }}
            >
                <Form.Item
                    name="branch_id"
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
                        loading={loadingBranches}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {branches.map((branch) => (
                            <Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Tên phòng ban"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên phòng ban!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên phòng ban" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả phòng ban">
                    <TextArea
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về phòng ban này"
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {editingDepartment ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Spin>
    );
};

export default DepartmentForm;
