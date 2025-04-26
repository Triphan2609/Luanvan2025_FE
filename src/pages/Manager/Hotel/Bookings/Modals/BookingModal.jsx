import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, InputNumber, Select, Space, Typography } from "antd";
import { UserOutlined, PhoneOutlined, TeamOutlined, HomeOutlined, CalendarOutlined, CreditCardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const roomTypes = [
    { label: "Phòng đơn", value: "Phòng đơn" },
    { label: "Phòng đôi", value: "Phòng đôi" },
    { label: "Phòng VIP", value: "Phòng VIP" },
];

const roomNumbers = {
    "Phòng đơn": ["101", "102", "103"],
    "Phòng đôi": ["201", "202", "203"],
    "Phòng VIP": ["301", "302"],
};

export default function BookingModal({ open, onCancel, onSave, initialData }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.setFieldsValue({
                    ...initialData,
                    dateRange: [dayjs(initialData.checkIn), dayjs(initialData.checkOut)],
                    // Tính tổng số người từ adults và children nếu có
                    people: (initialData.adults || 0) + (initialData.children || 0),
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    people: 1, // Giá trị mặc định cho số người
                });
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            const [checkIn, checkOut] = values.dateRange;
            const submitData = {
                ...values,
                checkIn: checkIn.format("YYYY-MM-DD"),
                checkOut: checkOut.format("YYYY-MM-DD"),
            };
            delete submitData.dateRange;
            onSave(submitData);
        });
    };

    return (
        <Modal
            title={initialData ? "Chỉnh sửa đặt phòng" : "Thêm đặt phòng mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Lưu"
            cancelText="Hủy"
            width={700}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
                    <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true }, { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ" }]}
                >
                    <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
                </Form.Item>

                <Space style={{ width: "100%" }}>
                    <Form.Item name="roomType" label="Loại phòng" rules={[{ required: true }]} style={{ width: "200px" }}>
                        <Select
                            options={roomTypes}
                            placeholder="Chọn loại phòng"
                            onChange={() => form.setFieldValue("roomNumber", undefined)}
                        />
                    </Form.Item>

                    <Form.Item name="roomNumber" label="Số phòng" rules={[{ required: true }]} style={{ width: "200px" }}>
                        <Select
                            placeholder="Chọn số phòng"
                            disabled={!form.getFieldValue("roomType")}
                            options={
                                form.getFieldValue("roomType")
                                    ? roomNumbers[form.getFieldValue("roomType")].map((num) => ({
                                          label: num,
                                          value: num,
                                      }))
                                    : []
                            }
                        />
                    </Form.Item>
                </Space>

                <Form.Item name="dateRange" label="Thời gian lưu trú" rules={[{ required: true }]}>
                    <RangePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder={["Check-in", "Check-out"]}
                        disabledDate={(current) => current && current < dayjs().startOf("day")}
                    />
                </Form.Item>

                <Form.Item name="people" label="Số người" rules={[{ required: true, message: "Vui lòng nhập số người" }]}>
                    <InputNumber min={1} max={10} style={{ width: "100%" }} prefix={<TeamOutlined />} placeholder="Nhập số người" />
                </Form.Item>

                <Form.Item name="totalAmount" label="Tổng tiền" rules={[{ required: true }]}>
                    <InputNumber
                        prefix="₫"
                        style={{ width: "100%" }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        min={0}
                        step={100000}
                    />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú">
                    <TextArea rows={3} maxLength={200} showCount />
                </Form.Item>
            </Form>
        </Modal>
    );
}
