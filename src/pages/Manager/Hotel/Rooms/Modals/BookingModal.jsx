import React, { useState } from "react";
import { Modal, Form, Input, DatePicker, InputNumber, Space, Divider, Card, Descriptions, Tag } from "antd";
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, CreditCardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function BookingModal({ open, onClose, room, onSubmit }) {
    const [form] = Form.useForm();
    const [nights, setNights] = useState(1);

    const handleDateRangeChange = (dates) => {
        if (dates && dates[0] && dates[1]) {
            const nightsCount = dates[1].diff(dates[0], "day");
            setNights(nightsCount);
            form.setFieldsValue({ totalAmount: room.price * nightsCount });
        }
    };

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            const booking = {
                ...values,
                roomId: room.id,
                roomCode: room.roomCode,
                status: "confirmed",
                bookingDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            };
            onSubmit(booking);
            form.resetFields();
            onClose();
        });
    };

    return (
        <Modal
            title={
                <Space>
                    <CalendarOutlined />
                    Đặt phòng {room?.roomCode}
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            width={700}
            okText="Xác nhận đặt phòng"
            cancelText="Hủy"
        >
            <Card size="small" className="mb-4">
                <Descriptions column={2} size="small">
                    <Descriptions.Item label="Loại phòng">
                        <Tag color="blue">{room?.roomType}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá phòng/đêm">
                        <span style={{ color: "#f50" }}>{room?.price?.toLocaleString()}đ</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Sức chứa">{room?.capacity} người</Descriptions.Item>
                    <Descriptions.Item label="Tiện nghi">{room?.amenities?.join(", ")}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    checkIn: dayjs(),
                    checkOut: dayjs().add(1, "day"),
                    adults: 1,
                    totalAmount: room?.price,
                }}
            >
                <Space size="large" style={{ width: "100%" }}>
                    <Form.Item
                        name="guestName"
                        label="Tên khách hàng"
                        rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
                        style={{ width: "100%" }}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        style={{ width: "100%" }}
                    >
                        <Input placeholder="0123456789" />
                    </Form.Item>
                </Space>

                <Form.Item
                    name="dateRange"
                    label={
                        <Space>
                            <ClockCircleOutlined />
                            Thời gian lưu trú ({nights} đêm)
                        </Space>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                >
                    <RangePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        onChange={handleDateRangeChange}
                        disabledDate={(current) => current && current < dayjs().startOf("day")}
                    />
                </Form.Item>

                <Space size="large" style={{ width: "100%" }}>
                    <Form.Item name="adults" label="Số người lớn" rules={[{ required: true }]} style={{ width: "200px" }}>
                        <InputNumber min={1} max={room?.capacity} style={{ width: "100%" }} addonAfter="người" />
                    </Form.Item>
                    <Form.Item name="children" label="Trẻ em (dưới 12 tuổi)" initialValue={0} style={{ width: "200px" }}>
                        <InputNumber min={0} max={room?.capacity} style={{ width: "100%" }} addonAfter="trẻ" />
                    </Form.Item>
                </Space>

                <Divider />

                <Form.Item
                    name="totalAmount"
                    label={
                        <Space>
                            <CreditCardOutlined />
                            Tổng tiền
                        </Space>
                    }
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        readOnly
                        addonAfter="đ"
                    />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Yêu cầu thêm..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
