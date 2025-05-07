import React from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    Space,
    Button,
    Row,
    Col,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    IdcardOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import locale from "antd/es/date-picker/locale/vi_VN";

const { TextArea } = Input;
const { Option } = Select;

export default function AddCustomerModal({
    open,
    onCancel,
    onSubmit,
    branchId,
}) {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (open) {
            form.resetFields();
            if (branchId) {
                form.setFieldsValue({
                    type: "normal",
                    status: "active",
                    branchId: branchId,
                });
            }
        }
    }, [open, form, branchId]);

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (values.birthday) {
                values.birthday = values.birthday.format("YYYY-MM-DD");
            }

            if (!values.branchId && branchId) {
                values.branchId = branchId;
            }

            onSubmit(values);
        });
    };

    return (
        <Modal
            title="Thêm khách hàng mới"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Lưu khách hàng"
            cancelText="Hủy"
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    type: "normal",
                    status: "active",
                    branchId: branchId,
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Họ và tên"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập họ tên!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Nguyễn Văn A"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập số điện thoại!",
                                },
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message: "Số điện thoại không hợp lệ!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<PhoneOutlined />}
                                placeholder="0901234567"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                {
                                    type: "email",
                                    message: "Email không hợp lệ!",
                                },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="example@gmail.com"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="idNumber"
                            label="CCCD/Passport"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập CCCD/Passport!",
                                },
                                {
                                    pattern: /^[0-9]{9,12}$/,
                                    message:
                                        "CCCD/Passport phải có 9-12 chữ số",
                                },
                            ]}
                        >
                            <Input
                                prefix={<IdcardOutlined />}
                                placeholder="0123456789"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="birthday" label="Ngày sinh">
                            <DatePicker
                                locale={locale}
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày sinh"
                                disabledDate={(current) =>
                                    current && current > dayjs().endOf("day")
                                }
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Giới tính">
                            <Select placeholder="Chọn giới tính">
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Địa chỉ">
                    <Input
                        prefix={<HomeOutlined />}
                        placeholder="123 Đường A, Quận B, TP.C"
                    />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="type" label="Loại khách hàng">
                            <Select placeholder="Chọn loại khách hàng">
                                <Option value="normal">Khách thường</Option>
                                <Option value="vip">Khách VIP</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>{/* Trường branchId ẩn */}</Col>
                </Row>

                <Form.Item name="branchId" hidden>
                    <Input />
                </Form.Item>

                <Form.Item name="note" label="Ghi chú">
                    <TextArea
                        rows={3}
                        placeholder="Ghi chú thêm về khách hàng"
                        maxLength={200}
                        showCount
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
