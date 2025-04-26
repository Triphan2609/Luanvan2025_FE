import React, { useEffect } from "react";
import { Modal, Form, Select, DatePicker, Input, Space, Button, Row, Col, Card, List, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const CardForm = ({
    open,
    onCancel,
    onSubmit,
    editingCard,
    TYPE_CONFIGS,
    customerList, // danh sách khách hàng chưa có thẻ
}) => {
    const [form] = Form.useForm();
    const [selectedType, setSelectedType] = React.useState(null);

    useEffect(() => {
        if (editingCard) {
            form.setFieldsValue({
                ...editingCard,
                issueDate: dayjs(editingCard.issueDate),
                expireDate: dayjs(editingCard.expireDate),
            });
            setSelectedType(editingCard.type);
        } else {
            form.resetFields();
            setSelectedType(null);
        }
    }, [editingCard, form]);

    const handleSubmit = async (values) => {
        const submitData = {
            ...values,
            issueDate: values.issueDate.format("YYYY-MM-DD"),
            expireDate: values.expireDate.format("YYYY-MM-DD"),
        };
        await onSubmit(submitData);
        form.resetFields();
    };

    return (
        <Modal
            title={editingCard ? "Cập nhật thẻ thành viên" : "Cấp thẻ thành viên mới"}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="customerId"
                            label="Chọn khách hàng"
                            rules={[{ required: true, message: "Vui lòng chọn khách hàng!" }]}
                        >
                            <Select placeholder="Chọn khách hàng" disabled={!!editingCard} showSearch optionFilterProp="children">
                                {customerList?.map((customer) => (
                                    <Select.Option key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.phone}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="type" label="Hạng thẻ" rules={[{ required: true, message: "Vui lòng chọn hạng thẻ!" }]}>
                            <Select placeholder="Chọn hạng thẻ" onChange={(value) => setSelectedType(value)}>
                                {Object.entries(TYPE_CONFIGS).map(([value, config]) => (
                                    <Select.Option key={value} value={value}>
                                        {config.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="issueDate" label="Ngày cấp" rules={[{ required: true, message: "Chọn ngày cấp!" }]}>
                                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="expireDate"
                                    label="Ngày hết hạn"
                                    rules={[{ required: true, message: "Chọn ngày hết hạn!" }]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD/MM/YYYY"
                                        disabledDate={(current) => current && current < dayjs().endOf("day")}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="note" label="Ghi chú">
                            <Input.TextArea rows={4} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        {selectedType && (
                            <Card title="Thông tin hạng thẻ">
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    <Text strong>Hạng: {TYPE_CONFIGS[selectedType].name}</Text>
                                    <Text>
                                        Chi tiêu tối thiểu:{" "}
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(TYPE_CONFIGS[selectedType].minSpent)}
                                    </Text>
                                    <Text>Tỷ lệ tích điểm: {TYPE_CONFIGS[selectedType].pointRate} điểm/10.000đ</Text>
                                    <Text strong>Quyền lợi:</Text>
                                    <List
                                        size="small"
                                        dataSource={TYPE_CONFIGS[selectedType].benefits}
                                        renderItem={(item) => <List.Item>• {item}</List.Item>}
                                    />
                                </Space>
                            </Card>
                        )}
                    </Col>
                </Row>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit">
                            {editingCard ? "Cập nhật" : "Cấp thẻ"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CardForm;
