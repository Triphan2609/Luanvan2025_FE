import React from "react";
import { Modal, Form, Input, Select, InputNumber, Space, Button } from "antd";
const { Option } = Select;

const ServiceModal = ({ open, onCancel, onSubmit, editingService }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (editingService) {
            form.setFieldsValue(editingService);
        } else {
            form.resetFields();
        }
    }, [editingService, form]);

    const handleSubmit = async (values) => {
        await onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal title={editingService ? "Sửa dịch vụ" : "Thêm dịch vụ mới"} open={open} onCancel={onCancel} footer={null}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: "Vui lòng nhập tên dịch vụ!" }]}>
                    <Input placeholder="Nhập tên dịch vụ" />
                </Form.Item>

                <Form.Item name="type" label="Loại dịch vụ" rules={[{ required: true, message: "Vui lòng chọn loại dịch vụ!" }]}>
                    <Select placeholder="Chọn loại dịch vụ">
                        <Option value="additional">Dịch vụ thêm</Option>
                        <Option value="snack">Món ăn kèm</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="unit" label="Đơn vị" rules={[{ required: true, message: "Vui lòng nhập đơn vị!" }]}>
                    <Input placeholder="Nhập đơn vị (ví dụ: cái, đĩa)" />
                </Form.Item>

                <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá!" }]}>
                    <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Nhập giá"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        min={0}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingService ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ServiceModal;
