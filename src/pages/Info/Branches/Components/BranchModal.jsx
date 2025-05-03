import React, { useEffect } from "react";
import { Modal, Form, Input, Select, TimePicker } from "antd";
import moment from "moment";

const { Option } = Select;

export default function BranchModal({
    open,
    onCancel,
    onSave,
    initialData,
    branchTypes,
}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                branch_type_id: initialData.branchType?.id, // Map branchType to branch_type_id
                open_time: initialData.open_time
                    ? moment(initialData.open_time, "HH:mm")
                    : null,
                close_time: initialData.close_time
                    ? moment(initialData.close_time, "HH:mm")
                    : null,
            });
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                const payload = {
                    ...initialData, // Bao gồm dữ liệu ban đầu
                    ...values, // Ghi đè bằng dữ liệu mới từ form
                    branch_type_id: values.branch_type_id, // Đảm bảo gửi đúng branch_type_id
                    staff_count: Number(values.staff_count), // Chuyển đổi staff_count thành số
                    open_time: values.open_time
                        ? values.open_time.format("HH:mm")
                        : null, // Format time
                    close_time: values.close_time
                        ? values.close_time.format("HH:mm")
                        : null, // Format time
                };

                // Loại bỏ branchType nếu tồn tại
                delete payload.branchType;

                onSave(payload); // Gửi toàn bộ payload
                form.resetFields();
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    return (
        <Modal
            title={initialData ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={initialData ? "Cập nhật" : "Thêm mới"}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="branch_code"
                    label="Mã chi nhánh"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập mã chi nhánh!",
                        },
                    ]}
                >
                    <Input
                        placeholder="Nhập mã chi nhánh"
                        disabled={!!initialData?.id}
                    />
                </Form.Item>
                <Form.Item
                    name="name"
                    label="Tên chi nhánh"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên chi nhánh!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên chi nhánh (ví dụ: Chi nhánh Quận 1)" />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[
                        { required: true, message: "Vui lòng nhập địa chỉ!" },
                    ]}
                >
                    <Input placeholder="Nhập địa chỉ (ví dụ: 123 Lê Lợi, Quận 1)" />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập số điện thoại!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                    ]}
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>
                <Form.Item
                    name="branch_type_id"
                    label="Loại chi nhánh"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn loại chi nhánh!",
                        },
                    ]}
                >
                    <Select placeholder="Chọn loại chi nhánh">
                        {branchTypes.map((type) => (
                            <Option key={type.id} value={type.id}>
                                {type.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="working_days"
                    label="Ngày hoạt động"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập ngày hoạt động!",
                        },
                    ]}
                >
                    <Input placeholder="Ví dụ: Thứ 2 - Chủ nhật" />
                </Form.Item>
                <Form.Item
                    name="open_time"
                    label="Giờ mở cửa"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập giờ mở cửa!",
                        },
                    ]}
                >
                    <TimePicker format="HH:mm" />
                </Form.Item>
                <Form.Item
                    name="close_time"
                    label="Giờ đóng cửa"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập giờ đóng cửa!",
                        },
                    ]}
                >
                    <TimePicker format="HH:mm" />
                </Form.Item>
                <Form.Item
                    name="manager_name"
                    label="Tên người quản lý"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập tên người quản lý!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập tên người quản lý" />
                </Form.Item>
                <Form.Item
                    name="manager_phone"
                    label="Số điện thoại người quản lý"
                    rules={[
                        {
                            required: true,
                            message:
                                "Vui lòng nhập số điện thoại người quản lý!",
                        },
                    ]}
                >
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item
                    name="staff_count"
                    label="Số lượng nhân viên"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập số lượng nhân viên!",
                        },
                    ]}
                >
                    <Input
                        type="number"
                        placeholder="Nhập số lượng nhân viên"
                    />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea
                        rows={3}
                        placeholder="Nhập mô tả chi nhánh"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
