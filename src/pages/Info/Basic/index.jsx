import React from "react";
import { Card, Form, Input, Button, Select, Row, Col, TimePicker } from "antd";
import { HomeOutlined, MailOutlined, PhoneOutlined, FieldTimeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;

export default function InfoPage() {
    const [form] = Form.useForm();

    const handleFinish = (values) => {
        console.log("Dữ liệu tổng quan:", values);
        // TODO: Gửi dữ liệu đến backend hoặc lưu tạm
    };

    return (
        <Card title="Thông tin tổng quan" bordered={false}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                    loaiHinh: "ca-hai",
                    thoiGianMo: dayjs("08:00", "HH:mm"),
                    thoiGianDong: dayjs("22:00", "HH:mm"),
                }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="ten" label="Tên nhà hàng / khách sạn" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                            <Input prefix={<HomeOutlined />} placeholder="Nhập tên" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Email không hợp lệ" }]}>
                            <Input prefix={<MailOutlined />} placeholder="example@email.com" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="soDienThoai"
                            label="Số điện thoại"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="diaChi" label="Địa chỉ" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
                            <Input placeholder="123 Đường ABC, Quận 1, TP.HCM" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="thoiGianMo" label="Giờ mở cửa" rules={[{ required: true, message: "Vui lòng chọn giờ mở cửa" }]}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} prefix={<FieldTimeOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="thoiGianDong"
                            label="Giờ đóng cửa"
                            rules={[{ required: true, message: "Vui lòng chọn giờ đóng cửa" }]}
                        >
                            <TimePicker format="HH:mm" style={{ width: "100%" }} prefix={<FieldTimeOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="loaiHinh" label="Loại hình hoạt động" rules={[{ required: true }]}>
                            <Select>
                                <Option value="nha-hang">Nhà hàng</Option>
                                <Option value="khach-san">Khách sạn</Option>
                                <Option value="ca-hai">Cả hai</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Lưu thông tin
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}
