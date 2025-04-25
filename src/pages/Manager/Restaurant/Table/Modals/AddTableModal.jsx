import React from "react";
import { Modal, Form, Input, InputNumber, Select, Space } from "antd";
import { TableOutlined, TeamOutlined } from "@ant-design/icons";

const AddTableModal = ({ open, onClose, onAdd, areas }) => {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                onAdd({
                    ...values,
                    status: "available",
                    orders: [],
                });
                form.resetFields();
                onClose();
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    return (
        <Modal
            title={
                <Space>
                    <TableOutlined />
                    Thêm bàn mới
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            okText="Thêm"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" initialValues={{ areaId: 1 }}>
                <Form.Item name="name" label="Tên bàn" rules={[{ required: true, message: "Vui lòng nhập tên bàn" }]}>
                    <Input placeholder="Ví dụ: Bàn 1, Bàn VIP 1..." prefix={<TableOutlined />} />
                </Form.Item>

                <Form.Item
                    name="seats"
                    label={
                        <Space>
                            <TeamOutlined />
                            Số chỗ ngồi
                        </Space>
                    }
                    rules={[{ required: true, message: "Vui lòng nhập số chỗ ngồi" }]}
                    initialValue={4}
                >
                    <InputNumber min={1} max={20} style={{ width: "100%" }} addonAfter="người" />
                </Form.Item>

                <Form.Item name="areaId" label="Khu vực" rules={[{ required: true, message: "Vui lòng chọn khu vực" }]}>
                    <Select>
                        {areas.map((area) => (
                            <Select.Option key={area.id} value={area.id}>
                                {area.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddTableModal;
