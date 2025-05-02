import React, { useEffect } from "react";
import { Form, Input, Space, Button, Spin } from "antd";

const { TextArea } = Input;

const DepartmentForm = ({ onSubmit, editingDepartment }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (editingDepartment) {
            form.setFieldsValue(editingDepartment);
        } else {
            form.resetFields();
        }
    }, [editingDepartment, form]);

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
        <Spin spinning={loading}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ height: "100%" }}
            >
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
