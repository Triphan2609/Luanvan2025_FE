import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Radio } from "antd";

const { Option } = Select;

export default function AreaModal({ open, onCancel, onSave, initialData }) {
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
                if (initialData?.id) {
                    onSave({ ...initialData, ...values });
                } else {
                    onSave(values);
                }
            })
            .catch((info) => {
                console.log("Validation Failed:", info);
            });
    };

    return (
        <Modal
            open={open}
            title={initialData ? "Chỉnh sửa Khu vực" : "Thêm Khu vực"}
            okText={initialData ? "Cập nhật" : "Thêm"}
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={handleOk}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên khu vực" rules={[{ required: true, message: "Vui lòng nhập tên khu vực" }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="type" label="Loại" rules={[{ required: true, message: "Vui lòng chọn loại khu vực" }]}>
                    <Select placeholder="Chọn loại">
                        <Option value="hotel">Khách sạn</Option>
                        <Option value="restaurant">Nhà hàng</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
                    <Radio.Group>
                        <Radio value="active">Hoạt động</Radio>
                        <Radio value="inactive">Ngừng</Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
}
