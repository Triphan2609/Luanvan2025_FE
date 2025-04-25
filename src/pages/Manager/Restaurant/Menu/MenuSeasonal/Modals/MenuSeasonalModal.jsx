import React from "react";
import { Modal, Form, Input, DatePicker, Select, Switch } from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MenuSeasonalModal = ({ open, onCancel, onSave, initialData, foodOptions = [] }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                const [startDate, endDate] = values.dateRange || [];
                const transformedValues = {
                    ...values,
                    startDate: startDate?.format("YYYY-MM-DD"),
                    endDate: endDate?.format("YYYY-MM-DD"),
                    id: initialData?.id,
                };
                delete transformedValues.dateRange;
                onSave(transformedValues);
                form.resetFields();
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    React.useEffect(() => {
        if (initialData) {
            const dateRange = [dayjs(initialData.startDate), dayjs(initialData.endDate)];
            form.setFieldsValue({
                ...initialData,
                dateRange,
            });
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    return (
        <Modal
            title={initialData ? "Chỉnh sửa thực đơn theo mùa" : "Thêm thực đơn theo mùa"}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={600}
            okText={initialData ? "Cập nhật" : "Thêm"}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên thực đơn" rules={[{ required: true, message: "Vui lòng nhập tên thực đơn!" }]}>
                    <Input placeholder="Nhập tên thực đơn" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Nhập mô tả cho thực đơn" />
                </Form.Item>

                <Form.Item
                    name="dateRange"
                    label="Thời gian áp dụng"
                    rules={[{ required: true, message: "Vui lòng chọn thời gian áp dụng!" }]}
                >
                    <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item name="foods" label="Món ăn" rules={[{ required: true, message: "Vui lòng chọn ít nhất một món ăn!" }]}>
                    <Select
                        mode="multiple"
                        placeholder="Chọn các món ăn"
                        style={{ width: "100%" }}
                        options={foodOptions.map((food) => ({
                            label: `${food.name} - ${food.price.toLocaleString()}đ`,
                            value: food.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item name="status" label="Trạng thái" valuePropName="checked">
                    <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" defaultChecked />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MenuSeasonalModal;
