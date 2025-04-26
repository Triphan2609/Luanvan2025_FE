import React from "react";
import { Modal, Form, Input, Select, InputNumber, Space, Button } from "antd";

const StuffForm = ({
    open,
    onCancel,
    onSubmit,
    editingStuff,
    TYPE_LABELS, // Nhận TYPE_LABELS từ props
}) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (editingStuff) {
            form.setFieldsValue(editingStuff);
        } else {
            form.resetFields();
        }
    }, [editingStuff, form]);

    const handleSubmit = async (values) => {
        await onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal title={editingStuff ? "Sửa vật dụng" : "Thêm vật dụng mới"} open={open} onCancel={onCancel} footer={null} width={600}>
            {/* ...existing form fields... */}
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="name" label="Tên vật dụng" rules={[{ required: true, message: "Vui lòng nhập tên vật dụng!" }]}>
                    <Input placeholder="Nhập tên vật dụng" />
                </Form.Item>

                <Form.Item name="type" label="Loại vật dụng" rules={[{ required: true, message: "Vui lòng chọn loại!" }]}>
                    <Select placeholder="Chọn loại vật dụng">
                        {Object.entries(TYPE_LABELS).map(([value, label]) => (
                            <Select.Option key={value} value={value}>
                                {label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Space style={{ width: "100%" }} size="middle">
                    <Form.Item
                        name="quantity"
                        label="Số lượng"
                        style={{ width: "100%" }}
                        rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập số lượng" />
                    </Form.Item>

                    <Form.Item
                        name="minQuantity"
                        label="Số lượng tối thiểu"
                        style={{ width: "100%" }}
                        rules={[{ required: true, message: "Vui lòng nhập số lượng tối thiểu!" }]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} placeholder="Nhập số lượng tối thiểu" />
                    </Form.Item>
                </Space>

                <Form.Item name="unit" label="Đơn vị" rules={[{ required: true, message: "Vui lòng nhập đơn vị!" }]}>
                    <Input placeholder="Nhập đơn vị (ví dụ: cái, chiếc, bộ)" />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingStuff ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StuffForm;
