import React, { useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, Space, Upload, Button, Row, Col, Divider } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

const EmployeeForm = ({ open, onCancel, onSubmit, editingEmployee, EMPLOYEE_ROLE, DEPARTMENT }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (editingEmployee) {
            form.setFieldsValue({
                ...editingEmployee,
                joinDate: dayjs(editingEmployee.joinDate),
                birthday: editingEmployee.birthday ? dayjs(editingEmployee.birthday) : undefined,
            });
        } else {
            form.resetFields();
        }
    }, [editingEmployee, form]);

    const handleSubmit = async (values) => {
        const submitData = {
            ...values,
            joinDate: values.joinDate.format("YYYY-MM-DD"),
            birthday: values.birthday?.format("YYYY-MM-DD"),
        };
        await onSubmit(submitData);
        form.resetFields();
    };

    return (
        <Modal
            title={editingEmployee ? "Cập nhật thông tin nhân viên" : "Thêm nhân viên mới"}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item>
                            <Upload name="avatar" listType="picture-card" showUploadList={false} beforeUpload={() => false}>
                                {editingEmployee?.avatar ? (
                                    <img src={editingEmployee.avatar} alt="avatar" style={{ width: "100%" }} />
                                ) : (
                                    <div>
                                        <UploadOutlined />
                                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>
                    </Col>

                    <Col span={16}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}>
                                    <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="id"
                                    label="Mã nhân viên"
                                    rules={[{ required: true, message: "Vui lòng nhập mã nhân viên!" }]}
                                >
                                    <Input disabled={!!editingEmployee} placeholder="Nhập mã nhân viên" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập email!" },
                                        { type: "email", message: "Email không hợp lệ!" },
                                    ]}
                                >
                                    <Input placeholder="Nhập email" />
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
                    </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="department" label="Phòng ban" rules={[{ required: true, message: "Vui lòng chọn phòng ban!" }]}>
                            <Select placeholder="Chọn phòng ban">
                                {Object.entries(DEPARTMENT).map(([key, value]) => (
                                    <Select.Option key={key} value={value}>
                                        {value === "management"
                                            ? "Quản lý"
                                            : value === "front_desk"
                                            ? "Lễ tân"
                                            : value === "housekeeping"
                                            ? "Buồng phòng"
                                            : value === "restaurant"
                                            ? "Nhà hàng"
                                            : "Kỹ thuật"}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="role" label="Chức vụ" rules={[{ required: true, message: "Vui lòng chọn chức vụ!" }]}>
                            <Select placeholder="Chọn chức vụ">
                                {Object.entries(EMPLOYEE_ROLE).map(([key, value]) => (
                                    <Select.Option key={key} value={value}>
                                        {value === "admin"
                                            ? "Quản trị"
                                            : value === "manager"
                                            ? "Quản lý"
                                            : value === "receptionist"
                                            ? "Lễ tân"
                                            : "Nhân viên"}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="birthday" label="Ngày sinh">
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="joinDate"
                            label="Ngày vào làm"
                            rules={[{ required: true, message: "Vui lòng chọn ngày vào làm!" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày vào làm" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Địa chỉ">
                    <TextArea rows={3} placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú">
                    <TextArea rows={3} placeholder="Nhập ghi chú" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingEmployee ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EmployeeForm;
