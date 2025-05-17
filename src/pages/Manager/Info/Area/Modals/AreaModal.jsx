import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Radio } from "antd";

const { Option } = Select;

export default function AreaModal({ open, onCancel, onSave, initialData, branches }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            // Chế độ chỉnh sửa: Ánh xạ branch.id thành branch_id
            const mappedData = {
                ...initialData,
                branch_id: initialData.branch?.id || null, // Lấy branch_id từ branch object
            };
            form.setFieldsValue(mappedData);
        } else {
            // Chế độ thêm: Reset form
            form.resetFields();
        }
    }, [initialData, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            const dataToSend = {
                ...values,
                branch_id: values.branch_id, // Đảm bảo chỉ gửi branch_id
            };

            if (initialData) {
                // Chế độ chỉnh sửa: Gửi thêm id
                onSave({ ...dataToSend, id: initialData.id });
            } else {
                // Chế độ thêm
                onSave(dataToSend);
            }
        });
    };

    return (
        <Modal title={initialData ? "Chỉnh sửa khu vực" : "Thêm khu vực"} open={open} onCancel={onCancel} onOk={handleOk}>
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên khu vực" rules={[{ required: true, message: "Vui lòng nhập tên khu vực" }]}>
                    <Input placeholder="Nhập tên khu vực (VD: Khu vực phòng đôi)" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả" rules={[{ required: false }]}>
                    <Input.TextArea rows={3} placeholder="Nhập mô tả khu vực (VD: Khu vực dành cho phòng đôi)" />
                </Form.Item>

                <Form.Item name="type" label="Loại khu vực" rules={[{ required: true, message: "Vui lòng chọn loại khu vực" }]}>
                    <Select placeholder="Chọn loại">
                        <Option value="hotel">Khách sạn</Option>
                        <Option value="restaurant">Nhà hàng</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="branch_id" label="Chi nhánh" rules={[{ required: true, message: "Vui lòng chọn chi nhánh" }]}>
                    <Select placeholder="Chọn chi nhánh">
                        {branches.map((branch) => (
                            <Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Option>
                        ))}
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
