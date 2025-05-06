import React from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    Space,
    Card,
    Typography,
    DatePicker,
} from "antd";
import {
    ToolOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const maintenanceTypes = [
    { label: "Sửa chữa thiết bị", value: "repair" },
    { label: "Bảo trì định kỳ", value: "regular" },
    { label: "Thay thế thiết bị", value: "replace" },
];

const priorityOptions = [
    { label: "Cao", value: "high", color: "#f5222d" },
    { label: "Trung bình", value: "medium", color: "#faad14" },
    { label: "Thấp", value: "low", color: "#52c41a" },
];

export default function MaintenanceModal({ open, onClose, room, onSubmit }) {
    const [form] = Form.useForm();

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onSubmit({
                roomId: room.id,
                ...values,
                maintenanceEndDate: values.maintenanceEndDate
                    ? values.maintenanceEndDate.toDate()
                    : null,
            });
            form.resetFields();
            onClose();
        });
    };

    // Set default end date to 24 hours from now
    React.useEffect(() => {
        if (open) {
            form.setFieldsValue({
                maintenanceEndDate: dayjs().add(24, "hour"),
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
                    <ToolOutlined />
                    Báo cáo bảo trì phòng {room.roomCode}
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
                <Form.Item
                    name="maintenanceType"
                    label="Loại bảo trì"
                    rules={[{ required: true }]}
                >
                    <Select>
                        {maintenanceTypes.map((type) => (
                            <Select.Option key={type.value} value={type.value}>
                                {type.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="issue"
                    label={
                        <Space>
                            <ExclamationCircleOutlined />
                            Mô tả vấn đề
                        </Space>
                    }
                    rules={[
                        { required: true, message: "Vui lòng mô tả vấn đề" },
                    ]}
                >
                    <Input.TextArea
                        rows={3}
                        placeholder="Mô tả chi tiết vấn đề cần bảo trì..."
                    />
                </Form.Item>

                <Form.Item
                    name="maintenanceEndDate"
                    label={
                        <Space>
                            <CalendarOutlined />
                            Thời gian dự kiến hoàn thành
                        </Space>
                    }
                    rules={[
                        {
                            required: true,
                            message:
                                "Vui lòng chọn thời gian hoàn thành bảo trì",
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

                <Form.Item
                    name="priority"
                    label="Mức độ ưu tiên"
                    rules={[{ required: true }]}
                >
                    <Select>
                        {priorityOptions.map((option) => (
                            <Select.Option
                                key={option.value}
                                value={option.value}
                            >
                                <Space>
                                    <span style={{ color: option.color }}>
                                        ●
                                    </span>
                                    {option.label}
                                </Space>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Text type="secondary">
                    Khi bạn xác nhận, trạng thái phòng sẽ được chuyển sang "Bảo
                    trì" và sẽ tự động chuyển lại thành "Còn trống" sau thời
                    gian đã chọn.
                </Text>
            </Form>
        </Modal>
    );
}
