import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Space, Upload, message } from "antd";
import { PlusOutlined, HomeOutlined, TeamOutlined, DollarOutlined } from "@ant-design/icons";

const amenitiesOptions = [
    { label: "TV", value: "TV" },
    { label: "Điều hòa", value: "AC" },
    { label: "WiFi", value: "WiFi" },
    { label: "Tủ lạnh", value: "Fridge" },
    { label: "Minibar", value: "Minibar" },
    { label: "Ban công", value: "Balcony" },
];

export default function AddEditRoomModal({ open, onClose, onSubmit, initialData, floors, roomTypes }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        }
    }, [initialData]);

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                onSubmit(values);
                form.resetFields();
                message.success(`${initialData ? "Cập nhật" : "Thêm"} phòng thành công`);
                onClose();
            })
            .catch(() => {
                message.error("Vui lòng kiểm tra lại thông tin!");
            });
    };

    return (
        <Modal
            title={
                <Space>
                    <HomeOutlined />
                    {initialData ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            width={600}
        >
            <Form form={form} layout="vertical" initialValues={{ status: "Available", amenities: [] }}>
                <Form.Item name="roomCode" label="Mã phòng" rules={[{ required: true, message: "Vui lòng nhập mã phòng" }]}>
                    <Input prefix={<HomeOutlined />} placeholder="VD: P101" />
                </Form.Item>

                <Space style={{ width: "100%" }} size="large">
                    <Form.Item name="floor" label="Tầng" rules={[{ required: true }]} style={{ width: "200px" }}>
                        <Select options={floors.filter((f) => f.id !== 0)} />
                    </Form.Item>

                    <Form.Item name="roomType" label="Loại phòng" rules={[{ required: true }]} style={{ flex: 1 }}>
                        <Select options={roomTypes.filter((t) => t.id !== "all")} />
                    </Form.Item>
                </Space>

                <Space style={{ width: "100%" }} size="large">
                    <Form.Item
                        name="capacity"
                        label={
                            <Space>
                                <TeamOutlined /> Sức chứa
                            </Space>
                        }
                        rules={[{ required: true }]}
                        style={{ width: "200px" }}
                    >
                        <InputNumber min={1} max={10} style={{ width: "100%" }} addonAfter="người" />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label={
                            <Space>
                                <DollarOutlined /> Giá phòng
                            </Space>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            min={0}
                            step={100000}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            addonAfter="đ/đêm"
                        />
                    </Form.Item>
                </Space>

                <Form.Item name="amenities" label="Tiện nghi" rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 tiện nghi" }]}>
                    <Select mode="multiple" allowClear placeholder="Chọn tiện nghi" options={amenitiesOptions} />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={4} placeholder="Nhập mô tả về phòng..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
