import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Space, Button, Spin, Select } from "antd";
import { getDepartments } from "../../../../../api/departmentsApi";

const { TextArea } = Input;
const { Option } = Select;

const PositionForm = ({ open, onCancel, onSubmit, editingPosition }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    useEffect(() => {
        if (open) {
            fetchDepartments();
        }
    }, [open]);

    useEffect(() => {
        if (editingPosition) {
            form.setFieldsValue({
                ...editingPosition,
                department_id: editingPosition.department?.id,
            });
        } else {
            form.resetFields();
        }
    }, [editingPosition, form]);

    const fetchDepartments = async () => {
        try {
            setLoadingDepartments(true);
            const data = await getDepartments();
            setDepartments(data || []);
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setLoadingDepartments(false);
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
        <Modal
            title={
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "1.2em",
                        fontWeight: "bold",
                    }}
                >
                    {editingPosition ? "Cập nhật chức vụ" : "Thêm chức vụ mới"}
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
            maskClosable={true}
            destroyOnClose
            bodyStyle={{ padding: "24px 32px" }}
        >
            <Spin spinning={loading || loadingDepartments}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label="Tên chức vụ"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên chức vụ!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên chức vụ" />
                    </Form.Item>

                    <Form.Item
                        name="department_id"
                        label="Thuộc phòng ban"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn phòng ban!",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn phòng ban"
                            loading={loadingDepartments}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {departments.map((dept) => (
                                <Option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả chức vụ">
                        <TextArea
                            rows={5}
                            placeholder="Nhập mô tả chi tiết về chức vụ này"
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
                                {editingPosition ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default PositionForm;
