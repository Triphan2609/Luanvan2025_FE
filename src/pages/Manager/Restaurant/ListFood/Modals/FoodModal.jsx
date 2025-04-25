import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const FoodModal = ({ open, onCancel, onSave, initialData }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                onSave({
                    ...initialData,
                    ...values,
                    image: values.image?.file?.thumbUrl || initialData?.image || null,
                });
                form.resetFields();
            })
            .catch((info) => {
                message.error("Vui lòng nhập đầy đủ thông tin món ăn");
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
        >
            <Form layout="vertical" form={form}>
                <Form.Item name="name" label="Tên món" rules={[{ required: true }]}>
                    <Input placeholder="Nhập tên món" />
                </Form.Item>

                <Form.Item name="price" label="Giá (VND)" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} min={1000} step={1000} />
                </Form.Item>

                <Form.Item name="ingredients" label="Nguyên liệu" rules={[{ required: true }]}>
                    <TextArea rows={3} placeholder="Liệt kê nguyên liệu chính" />
                </Form.Item>

                <Form.Item name="category" label="Loại món" rules={[{ required: true }]}>
                    <Select placeholder="Chọn loại">
                        <Select.Option value="main">Món chính</Select.Option>
                        <Select.Option value="side">Món phụ</Select.Option>
                        <Select.Option value="drink">Đồ uống</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item name="image" label="Ảnh món">
                    <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                        <UploadOutlined /> <span>Tải ảnh lên</span>
                    </Upload>
                </Form.Item>

                <Form.Item name="status" label="Trạng thái">
                    <Select>
                        <Select.Option value="available">Đang phục vụ</Select.Option>
                        <Select.Option value="unavailable">Tạm ngưng</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default FoodModal;
