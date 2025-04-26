import React from "react";
import { Modal, Form, Input, Select, Space, Button, Alert, Typography } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

const ResponseForm = ({ open, onCancel, onSubmit, feedback, FEEDBACK_STATUS }) => {
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        await onSubmit({
            ...values,
            feedbackId: feedback.id,
            createdAt: new Date().toISOString(),
            staff: "Staff Name", // Should come from auth context
        });
        form.resetFields();
    };

    return (
        <Modal title="Trả lời phản hồi" open={open} onCancel={onCancel} footer={null} width={600}>
            {feedback && (
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Thông tin phản hồi */}
                    <Alert
                        message={
                            <Space direction="vertical">
                                <Text strong>{feedback.subject}</Text>
                                <Text type="secondary">{feedback.content}</Text>
                            </Space>
                        }
                        type="info"
                    />

                    {/* Form trả lời */}
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            status: FEEDBACK_STATUS.PROCESSING,
                        }}
                    >
                        <Form.Item
                            name="content"
                            label="Nội dung trả lời"
                            rules={[{ required: true, message: "Vui lòng nhập nội dung trả lời!" }]}
                        >
                            <TextArea rows={4} placeholder="Nhập nội dung trả lời cho khách hàng..." />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="Cập nhật trạng thái"
                            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                        >
                            <Select>
                                <Select.Option value={FEEDBACK_STATUS.PROCESSING}>Đang xử lý</Select.Option>
                                <Select.Option value={FEEDBACK_STATUS.RESOLVED}>Đã xử lý</Select.Option>
                                <Select.Option value={FEEDBACK_STATUS.CLOSED}>Đóng phản hồi</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                            <Space>
                                <Button onClick={onCancel}>Hủy</Button>
                                <Button type="primary" htmlType="submit">
                                    Gửi phản hồi
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Space>
            )}
        </Modal>
    );
};

export default ResponseForm;
