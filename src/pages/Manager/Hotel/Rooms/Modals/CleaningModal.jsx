import React from "react";
import { Modal, Form, Input, Space, Card, Typography, DatePicker } from "antd";
import { ClearOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export default function CleaningModal({ open, onClose, room, onSubmit }) {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onSubmit({
                roomId: room.id,
                note: values.note,
                cleaningEndDate: values.cleaningEndDate
                    ? values.cleaningEndDate.toDate()
                    : null,
            });
            form.resetFields();
            onClose();
        });
    };

    // Set default end date to 2 hours from now
    React.useEffect(() => {
        if (open) {
            form.setFieldsValue({
                cleaningEndDate: dayjs().add(2, "hour"),
            });
        }
    }, [open, form]);

    if (!room) return null;

    const disabledDate = (current) => {
        // Không cho phép chọn ngày quá khứ
        return current && current < dayjs().startOf("day");
    };

    return (
        <Modal
            title={
                <Space>
                    <ClearOutlined />
                    Yêu cầu dọn phòng {room.roomCode}
                </Space>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            okText="Xác nhận"
            cancelText="Hủy"
            width={600}
        >
            <Card style={{ marginBottom: 16 }}>
                <Space direction="vertical">
                    <Text>
                        Phòng: <strong>{room.roomCode}</strong>
                    </Text>
                    <Text>
                        Loại phòng: <strong>{room.roomType?.name}</strong>
                    </Text>
                    <Text>
                        Tầng: <strong>{room.floor}</strong>
                    </Text>
                </Space>
            </Card>

            <Form form={form} layout="vertical">
                <Form.Item name="note" label="Ghi chú yêu cầu dọn phòng">
                    <Input.TextArea
                        rows={3}
                        placeholder="Nhập ghi chú nếu có..."
                    />
                </Form.Item>

                <Form.Item
                    name="cleaningEndDate"
                    label={
                        <Space>
                            <CalendarOutlined />
                            Thời gian dự kiến hoàn thành dọn dẹp
                        </Space>
                    }
                    rules={[
                        {
                            required: true,
                            message:
                                "Vui lòng chọn thời gian hoàn thành dọn dẹp",
                        },
                    ]}
                    tooltip="Phòng sẽ tự động được chuyển trạng thái thành 'Còn trống' sau thời gian này"
                >
                    <DatePicker
                        showTime
                        format="DD/MM/YYYY HH:mm"
                        placeholder="Chọn thời gian hoàn thành"
                        style={{ width: "100%" }}
                        disabledDate={disabledDate}
                    />
                </Form.Item>

                <Text type="secondary">
                    Khi bạn xác nhận, trạng thái phòng sẽ được chuyển sang "Đang
                    dọn" và sẽ tự động chuyển lại thành "Còn trống" sau thời
                    gian đã chọn.
                </Text>
            </Form>
        </Modal>
    );
}
