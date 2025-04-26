import React from "react";
import { Modal, Form, Input, Select, DatePicker, Space, Button, Row, Col } from "antd";
import locale from "antd/es/date-picker/locale/vi_VN";
import dayjs from "dayjs";

const CustomerForm = ({ open, onCancel, onSubmit, editingCustomer, CUSTOMER_TYPE }) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (editingCustomer) {
            const formData = {
                ...editingCustomer,
                birthday: editingCustomer.birthday ? dayjs(editingCustomer.birthday) : null,
            };
            form.setFieldsValue(formData);
        } else {
            form.resetFields();
        }
    }, [editingCustomer, form]);

    const handleSubmit = async (values) => {
        const submitData = {
            ...values,
            birthday: values.birthday?.format("YYYY-MM-DD"),
        };
        await onSubmit(submitData);
        form.resetFields();
    };

    return (
        <Modal
            title={editingCustomer ? "Cập nhật thông tin khách hàng" : "Thêm khách hàng mới"}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: "Vui lòng nhập số điện thoại!" },
                                { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" },
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Email không hợp lệ!" }]}>
                            <Input placeholder="Nhập email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="idNumber"
                            label="CCCD/Passport"
                            rules={[{ required: true, message: "Vui lòng nhập CCCD/Passport!" }]}
                        >
                            <Input placeholder="Nhập CCCD/Passport" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="birthday" label="Ngày sinh">
                            <DatePicker locale={locale} style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Giới tính">
                            <Select placeholder="Chọn giới tính">
                                <Select.Option value="male">Nam</Select.Option>
                                <Select.Option value="female">Nữ</Select.Option>
                                <Select.Option value="other">Khác</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Địa chỉ">
                    <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="type"
                            label="Loại khách hàng"
                            rules={[{ required: true, message: "Vui lòng chọn loại khách hàng!" }]}
                        >
                            <Select placeholder="Chọn loại khách hàng">
                                <Select.Option value={CUSTOMER_TYPE.NORMAL}>Khách thường</Select.Option>
                                <Select.Option value={CUSTOMER_TYPE.VIP}>Khách VIP</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="note" label="Ghi chú">
                            <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingCustomer ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CustomerForm;
