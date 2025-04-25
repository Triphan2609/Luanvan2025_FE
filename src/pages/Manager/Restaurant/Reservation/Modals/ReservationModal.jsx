import React, { useEffect } from "react";
import { Modal, Form, Input, DatePicker, TimePicker, InputNumber, Select } from "antd";
import dayjs from "dayjs"; // ✅ THÊM dòng này

const { TextArea } = Input;

const areaOptions = [
    { label: "Phòng ăn chung", value: 1 },
    { label: "Phòng riêng", value: 2 },
    { label: "Phòng VIP", value: 3 },
];

const tableOptions = [
    { label: "Bàn 1", value: 1 },
    { label: "Bàn 2", value: 2 },
    { label: "Bàn 3", value: 3 },
];

export default function ReservationModal({ open, onCancel, onSave, initialData }) {
    const [form] = Form.useForm(); // ✅ Tạo form instance

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                customerName: initialData.customerName,
                phone: initialData.phone,
                numberOfPeople: initialData.people,
                areaId: convertAreaToId(initialData.area),
                tableId: convertTableToId(initialData.table),
                note: initialData.note,
                date: initialData.date ? dayjs(initialData.date) : null,
                time: initialData.time ? dayjs(initialData.time, "HH:mm") : null,
            });
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            const data = {
                ...initialData,
                customerName: values.customerName,
                phone: values.phone,
                people: values.numberOfPeople,
                area: convertIdToArea(values.areaId),
                table: `Bàn ${values.tableId}`,
                note: values.note,
                date: values.date ? values.date.format("YYYY-MM-DD") : null,
                time: values.time ? values.time.format("HH:mm") : null,
            };
            onSave(data);
        });
    };

    return (
        <Modal
            title={initialData ? "Chỉnh sửa đặt bàn" : "Thêm đặt bàn"}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Lưu"
            cancelText="Hủy"
        >
            {/* ✅ PHẢI gán form={form} ở đây */}
            <Form layout="vertical" form={form}>
                <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                    <Input placeholder="Nguyễn Văn A" />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}>
                    <Input placeholder="090xxxxxxx" />
                </Form.Item>
                <Form.Item name="numberOfPeople" label="Số người" rules={[{ required: true }]}>
                    <InputNumber min={1} max={100} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="areaId" label="Khu vực" rules={[{ required: true }]}>
                    <Select placeholder="Chọn khu vực" options={areaOptions} />
                </Form.Item>
                <Form.Item name="tableId" label="Bàn" rules={[{ required: true }]}>
                    <Select placeholder="Chọn bàn" options={tableOptions} />
                </Form.Item>
                <Form.Item name="date" label="Ngày đặt" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item name="time" label="Giờ" rules={[{ required: true }]}>
                    <TimePicker style={{ width: "100%" }} format="HH:mm" />
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                    <TextArea rows={2} placeholder="Ghi chú thêm nếu có..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}

// Helper functions
const convertAreaToId = (area) => {
    switch (area) {
        case "Phòng ăn chung":
            return 1;
        case "Phòng riêng":
            return 2;
        case "Phòng VIP":
            return 3;
        default:
            return null;
    }
};

const convertIdToArea = (id) => {
    const match = areaOptions.find((item) => item.value === id);
    return match ? match.label : "";
};

const convertTableToId = (table) => {
    if (!table) return null;
    const match = table.match(/Bàn (\d+)/);
    return match ? parseInt(match[1]) : null;
};
