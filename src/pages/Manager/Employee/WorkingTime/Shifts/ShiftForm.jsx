import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    TimePicker,
    InputNumber,
    Space,
    Button,
    Spin,
} from "antd";
import dayjs from "dayjs";
import { getBranches } from "../../../../../api/branchesApi";

const { TextArea } = Input;
const { Option } = Select;

const ShiftForm = ({ open, onCancel, onSubmit, editingShift, SHIFT_TYPE }) => {
    const [form] = Form.useForm();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchBranches();
        }
    }, [open]);

    useEffect(() => {
        if (editingShift) {
            // Kiểm tra và xử lý dữ liệu breakTime
            let breakTimePicker = null;
            if (editingShift.breakTime) {
                const breakTimes = editingShift.breakTime.split("-");
                if (breakTimes.length === 2) {
                    breakTimePicker = breakTimes.map((time) =>
                        dayjs(time, "HH:mm")
                    );
                }
            }

            form.setFieldsValue({
                ...editingShift,
                startTime: dayjs(editingShift.startTime, "HH:mm"),
                endTime: dayjs(editingShift.endTime, "HH:mm"),
                breakTime: breakTimePicker,
                branch_id: editingShift.branch?.id,
            });
        } else {
            form.resetFields();
        }
    }, [editingShift, form]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const data = await getBranches();
            setBranches(data || []);
        } catch (error) {
            console.error("Error fetching branches:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (values) => {
        const formData = {
            ...values,
            startTime: values.startTime.format("HH:mm"),
            endTime: values.endTime.format("HH:mm"),
            breakTime:
                values.breakTime && values.breakTime.length === 2
                    ? values.breakTime
                          .map((time) => time.format("HH:mm"))
                          .join("-")
                    : "",
        };
        onSubmit(formData);
    };

    return (
        <Modal
            title={
                editingShift ? "Cập nhật ca làm việc" : "Thêm ca làm việc mới"
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="branch_id"
                        label="Chi nhánh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chi nhánh!",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn chi nhánh">
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="name"
                        label="Tên ca làm việc"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập tên ca làm việc!",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập tên ca làm việc" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Loại ca"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn loại ca!",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn loại ca">
                            <Option value={SHIFT_TYPE.MORNING}>Ca Sáng</Option>
                            <Option value={SHIFT_TYPE.AFTERNOON}>
                                Ca Chiều
                            </Option>
                            <Option value={SHIFT_TYPE.EVENING}>Ca Tối</Option>
                            <Option value={SHIFT_TYPE.NIGHT}>Ca Đêm</Option>
                        </Select>
                    </Form.Item>

                    <Space style={{ width: "100%" }} size="large">
                        <Form.Item
                            name="startTime"
                            label="Giờ bắt đầu"
                            rules={[
                                {
                                    required: true,
                                    message: "Chọn giờ bắt đầu!",
                                },
                            ]}
                            style={{ width: "100%" }}
                        >
                            <TimePicker
                                format="HH:mm"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="endTime"
                            label="Giờ kết thúc"
                            rules={[
                                {
                                    required: true,
                                    message: "Chọn giờ kết thúc!",
                                },
                            ]}
                            style={{ width: "100%" }}
                        >
                            <TimePicker
                                format="HH:mm"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item name="breakTime" label="Thời gian nghỉ">
                        <TimePicker.RangePicker format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                        name="workingHours"
                        label="Số giờ làm việc"
                        rules={[
                            {
                                required: true,
                                message: "Nhập số giờ làm việc!",
                            },
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={12}
                            style={{ width: "100%" }}
                            addonAfter="giờ"
                        />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea
                            rows={4}
                            placeholder="Nhập mô tả về ca làm việc"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Space>
                            <Button onClick={onCancel}>Hủy</Button>
                            <Button type="primary" htmlType="submit">
                                {editingShift ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ShiftForm;
