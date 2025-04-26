import React, { useEffect } from "react";
import { Modal, Form, Input, Space, Button, Select } from "antd";

const { TextArea } = Input;

// Constants
const POSITION_TYPE = {
    MANAGEMENT: "management", // Ban quản lý
    FRONT_DESK: "front_desk", // Lễ tân
    HOUSEKEEPING: "housekeeping", // Buồng phòng
    RESTAURANT: "restaurant", // Nhà hàng
    SERVICE: "service", // Dịch vụ
    MAINTENANCE: "maintenance", // Bảo trì
};

const PositionForm = ({ open, onCancel, onSubmit, editingPosition }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingPosition) {
            form.setFieldsValue(editingPosition);
        } else {
            form.resetFields();
        }
    }, [editingPosition, form]);

    const handleSubmit = async (values) => {
        await onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal title={editingPosition ? "Cập nhật chức vụ" : "Thêm chức vụ mới"} open={open} onCancel={onCancel} footer={null} width={600}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="name" label="Tên chức vụ" rules={[{ required: true, message: "Vui lòng nhập tên chức vụ!" }]}>
                    <Input placeholder="Nhập tên chức vụ" />
                </Form.Item>

                <Form.Item
                    name="code"
                    label="Mã chức vụ"
                    rules={[
                        { required: true, message: "Vui lòng nhập mã chức vụ!" },
                        { pattern: /^[A-Z_]+$/, message: "Mã chức vụ chỉ được chứa chữ hoa và dấu gạch dưới!" },
                    ]}
                >
                    <Input placeholder="Ví dụ: MANAGER, RECEPTIONIST" style={{ textTransform: "uppercase" }} />
                </Form.Item>

                <Form.Item name="department" label="Thuộc bộ phận" rules={[{ required: true, message: "Vui lòng chọn bộ phận!" }]}>
                    <Select placeholder="Chọn bộ phận">
                        <Select.Option value={POSITION_TYPE.MANAGEMENT}>Ban quản lý</Select.Option>
                        <Select.Option value={POSITION_TYPE.FRONT_DESK}>Lễ tân</Select.Option>
                        <Select.Option value={POSITION_TYPE.HOUSEKEEPING}>Buồng phòng</Select.Option>
                        <Select.Option value={POSITION_TYPE.RESTAURANT}>Nhà hàng</Select.Option>
                        <Select.Option value={POSITION_TYPE.SERVICE}>Dịch vụ</Select.Option>
                        <Select.Option value={POSITION_TYPE.MAINTENANCE}>Bảo trì</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item name="salary" label="Mức lương cơ bản" rules={[{ required: true, message: "Vui lòng nhập mức lương!" }]}>
                    <Input type="number" placeholder="Nhập mức lương cơ bản" addonAfter="VNĐ" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả công việc">
                    <TextArea rows={4} placeholder="Nhập mô tả công việc" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingPosition ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PositionForm;
