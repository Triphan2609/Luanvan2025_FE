import React, { useEffect } from "react";
import { Modal, Form, Input, Select, InputNumber } from "antd";

export default function ServiceModal({ open, onCancel, onSave, initialData, branches }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            const formattedValues = {
                ...values,
                price: parseFloat(values.price), // Chuyển đổi price thành số
            };
            if (initialData?.id) {
                onSave({ ...formattedValues, id: initialData.id });
            } else {
                onSave(formattedValues);
            }
        });
    };

    return (
        <Modal
            title={initialData ? "Cập nhật Dịch vụ" : "Thêm Dịch vụ"}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                    <Select>
                        <Select.Option value="active">Hoạt động</Select.Option>
                        <Select.Option value="inactive">Ngừng</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="price" label="Giá dịch vụ (VND)" rules={[{ required: true, message: "Vui lòng nhập giá dịch vụ!" }]}>
                    <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Nhập giá dịch vụ"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} // Hiển thị định dạng số
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")} // Xóa dấu phẩy khi nhập
                    />
                </Form.Item>
                <Form.Item name="branch_id" label="Chi nhánh" rules={[{ required: true, message: "Vui lòng chọn chi nhánh!" }]}>
                    <Select placeholder="Chọn chi nhánh">
                        {branches.map((branch) => (
                            <Select.Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
