import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, InputNumber } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const PROMOTION_TYPES = [
    { label: "Giảm theo %", value: "percentage" },
    { label: "Giảm số tiền", value: "amount" },
    { label: "Miễn phí món", value: "free_item" },
];

export default function PromotionModal({ open, onCancel, onSave, initialData }) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                dateRange: [dayjs(initialData.startDate), dayjs(initialData.endDate)],
            });
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    const handleFinish = (values) => {
        const [start, end] = values.dateRange;
        const data = {
            ...initialData,
            ...values,
            startDate: start.format("YYYY-MM-DD"),
            endDate: end.format("YYYY-MM-DD"),
        };
        delete data.dateRange;
        onSave(data);
    };

    return (
        <Modal
            open={open}
            title={initialData ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
            onCancel={onCancel}
            onOk={() => form.submit()}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: "Nhập tên chương trình" }]}>
                    <Input placeholder="Ví dụ: Khuyến mãi 20% cuối tuần" />
                </Form.Item>

                <Form.Item name="type" label="Loại khuyến mãi" rules={[{ required: true }]}>
                    <Select options={PROMOTION_TYPES} placeholder="Chọn loại" />
                </Form.Item>

                <Form.Item name="value" label="Giá trị khuyến mãi" rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="Ví dụ: 20 (nếu là %), 50000 (nếu là số tiền)" />
                </Form.Item>

                <Form.Item name="dateRange" label="Thời gian áp dụng" rules={[{ required: true }]}>
                    <RangePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Ghi chú thêm (tuỳ chọn)" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
