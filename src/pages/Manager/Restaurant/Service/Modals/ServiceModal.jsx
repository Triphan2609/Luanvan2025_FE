import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, InputNumber, Space, Button } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

export default function ServiceModal({
    open,
    onCancel,
    onSave,
    initialData,
    branches,
    serviceTypes,
}) {
    const [form] = Form.useForm();
    const [selectedBranch, setSelectedBranch] = useState();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                sub_services: initialData.sub_services || [],
                serviceTypeId:
                    initialData.serviceTypeId || initialData.serviceType?.id,
                branchId: initialData.branchId || initialData.branch?.id,
            });
            setSelectedBranch(initialData.branchId || initialData.branch?.id);
        } else {
            form.resetFields();
            setSelectedBranch(undefined);
            form.setFieldsValue({ status: "active" });
        }
    }, [initialData, form]);

    // Lọc loại dịch vụ theo branch
    const filteredServiceTypes = serviceTypes.filter(
        (type) => !selectedBranch || type.branchId === selectedBranch
    );

    const handleOk = () => {
        form.validateFields().then((values) => {
            const formattedValues = {
                ...values,
                branchId: Number(values.branchId),
                price: parseFloat(values.price),
                stock: Number(values.stock),
            };
            if (initialData?.id) {
                onSave({ ...formattedValues, id: initialData.id });
            } else {
                onSave(formattedValues);
            }
        });
    };

    return (
        <Modal
            title={initialData ? "Cập nhật Dịch vụ" : "Thêm Dịch vụ"}
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            okText="Lưu"
            cancelText="Hủy"
            width={800}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên dịch vụ"
                    rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                    name="branchId"
                    label="Chi nhánh"
                    rules={[
                        { required: true, message: "Vui lòng chọn chi nhánh!" },
                    ]}
                >
                    <Select
                        placeholder="Chọn chi nhánh"
                        onChange={(val) => setSelectedBranch(val)}
                        value={selectedBranch}
                    >
                        {branches.map((branch) => (
                            <Select.Option key={branch.id} value={branch.id}>
                                {branch.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="serviceTypeId"
                    label="Loại dịch vụ"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn loại dịch vụ",
                        },
                    ]}
                >
                    <Select placeholder="Chọn loại dịch vụ">
                        {filteredServiceTypes.map((type) => (
                            <Select.Option key={type.id} value={type.id}>
                                {type.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true }]}
                    initialValue="active"
                >
                    <Select>
                        <Select.Option value="active">Hoạt động</Select.Option>
                        <Select.Option value="inactive">Ngừng</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="price"
                    label="Giá dịch vụ (VND)"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập giá dịch vụ!",
                        },
                    ]}
                >
                    <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="Nhập giá dịch vụ"
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                </Form.Item>
                <Form.Item
                    name="stock"
                    label="Tồn kho"
                    rules={[
                        { required: true, message: "Nhập số lượng tồn kho" },
                    ]}
                >
                    <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}
