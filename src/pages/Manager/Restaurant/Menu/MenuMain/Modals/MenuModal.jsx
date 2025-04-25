import React from "react";
import { Modal, Form, Input, Select, Switch } from "antd";

const { TextArea } = Input;

const MenuModal = ({ open, onCancel, onSave, initialData, foodOptions = [] }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                onSave({ ...initialData, ...values });
                form.resetFields();
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    React.useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    return (
        <Modal
            title={initialData ? "Chỉnh sửa thực đơn" : "Thêm thực đơn"}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={600}
            okText={initialData ? "Cập nhật" : "Thêm"}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" initialValues={{ status: true }}>
                <Form.Item name="name" label="Tên thực đơn" rules={[{ required: true, message: "Vui lòng nhập tên thực đơn!" }]}>
                    <Input placeholder="Nhập tên thực đơn" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Nhập mô tả cho thực đơn" />
                </Form.Item>

                <Form.Item name="foods" label="Món ăn" rules={[{ required: true, message: "Vui lòng chọn ít nhất một món ăn!" }]}>
                    <Select
                        mode="multiple"
                        placeholder="Chọn các món ăn"
                        style={{ width: "100%" }}
                        options={foodOptions.map((food) => ({
                            label: `${food.name} - ${food.price.toLocaleString()}đ`,
                            value: food.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item name="status" label="Trạng thái" valuePropName="checked">
                    <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MenuModal;
