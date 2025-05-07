import React, { useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Space,
    Button,
    Row,
    Col,
    Alert,
} from "antd";
import locale from "antd/es/date-picker/locale/vi_VN";
import dayjs from "dayjs";
import { getBranches } from "../../../../../api/branchesApi";
import { getCustomerById } from "../../../../../api/customersApi";

const CustomerForm = ({
    open,
    onCancel,
    onSubmit,
    editingCustomer,
    CUSTOMER_TYPE,
}) => {
    const [form] = Form.useForm();
    const [branches, setBranches] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [formError, setFormError] = React.useState(null);
    const [customerData, setCustomerData] = React.useState(null);

    // Fetch branches for dropdown
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const branchesData = await getBranches();
                setBranches(branchesData);
            } catch (error) {
                console.error("Error fetching branches:", error);
            }
        };
        fetchBranches();
    }, []);

    // Fetch complete customer data when editing
    useEffect(() => {
        const fetchCustomerData = async () => {
            if (editingCustomer?.id) {
                try {
                    setLoading(true);
                    const data = await getCustomerById(editingCustomer.id);
                    setCustomerData(data);
                    console.log("Loaded customer data for editing:", data);
                } catch (error) {
                    console.error("Error loading customer data:", error);
                    setFormError(
                        "Không thể tải dữ liệu khách hàng để chỉnh sửa"
                    );
                } finally {
                    setLoading(false);
                }
            } else {
                setCustomerData(null);
            }
        };

        if (editingCustomer) {
            fetchCustomerData();
        }
    }, [editingCustomer]);

    // Set form values when customer data changes
    useEffect(() => {
        if (open) {
            if (customerData) {
                // We have complete customer data from API
                const formData = {
                    ...customerData,
                    branchId: customerData.branchId
                        ? parseInt(customerData.branchId, 10)
                        : undefined,
                    birthday: customerData.birthday
                        ? dayjs(customerData.birthday)
                        : null,
                };
                console.log("Setting form data for editing:", formData);
                form.setFieldsValue(formData);
            } else if (editingCustomer) {
                // Fallback to using the editingCustomer directly
                const formData = {
                    ...editingCustomer,
                    branchId: editingCustomer.branchId
                        ? parseInt(editingCustomer.branchId, 10)
                        : editingCustomer.branch?.id
                        ? parseInt(editingCustomer.branch.id, 10)
                        : undefined,
                    birthday: editingCustomer.birthday
                        ? dayjs(editingCustomer.birthday)
                        : null,
                };
                console.log("Using fallback data for editing:", formData);
                form.setFieldsValue(formData);
            } else {
                // New customer - reset form
                form.resetFields();
                form.setFieldsValue({
                    type: CUSTOMER_TYPE.NORMAL,
                    status: "active",
                });
            }
            setFormError(null);
        }
    }, [customerData, editingCustomer, form, CUSTOMER_TYPE, open]);

    const handleSubmit = async () => {
        setLoading(true);
        setFormError(null);

        try {
            const values = await form.validateFields();

            // Chuyển đổi dữ liệu trước khi gửi
            const submitData = {
                ...values,
                birthday: values.birthday?.format("YYYY-MM-DD"),
                // Đảm bảo branchId là số nguyên
                branchId: values.branchId
                    ? parseInt(values.branchId, 10)
                    : undefined,
            };

            // Loại bỏ các trường undefined hoặc null
            Object.keys(submitData).forEach((key) => {
                if (
                    submitData[key] === undefined ||
                    submitData[key] === null ||
                    submitData[key] === ""
                ) {
                    delete submitData[key];
                }
            });

            console.log("Form data to submit:", submitData);
            await onSubmit(submitData);
            form.resetFields();
        } catch (error) {
            console.error("Form validation or submission failed:", error);

            if (error.errorFields) {
                // Form validation error
                setFormError("Vui lòng kiểm tra lại các trường bắt buộc");
            } else {
                // API or other error
                setFormError(
                    error.message || "Đã xảy ra lỗi khi xử lý biểu mẫu"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setFormError(null);
        setCustomerData(null);
        onCancel();
    };

    return (
        <Modal
            title={
                editingCustomer
                    ? "Cập nhật thông tin khách hàng"
                    : "Thêm khách hàng mới"
            }
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            confirmLoading={loading}
        >
            {formError && (
                <Alert
                    message="Lỗi"
                    description={formError}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {loading && (
                <Alert
                    message="Đang tải dữ liệu..."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                            <Input placeholder="Nhập họ và tên" />
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
                            <Input placeholder="Nhập số điện thoại" />
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
                            <Input placeholder="Nhập email" />
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
                            <Input placeholder="Nhập CCCD/Passport" />
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
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gender" label="Giới tính">
                            <Select placeholder="Chọn giới tính">
                                <Select.Option value="male">Nam</Select.Option>
                                <Select.Option value="female">Nữ</Select.Option>
                                <Select.Option value="other">
                                    Khác
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="address" label="Địa chỉ">
                    <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="type"
                            label="Loại khách hàng"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn loại khách hàng!",
                                },
                            ]}
                        >
                            <Select placeholder="Chọn loại khách hàng">
                                <Select.Option value={CUSTOMER_TYPE.NORMAL}>
                                    Khách thường
                                </Select.Option>
                                <Select.Option value={CUSTOMER_TYPE.VIP}>
                                    Khách VIP
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {/*
                         * Chi nhánh là bắt buộc trong quản lý khách hàng.
                         * Khi thêm khách hàng từ phần quản lý khách sạn, branchId sẽ được tự động
                         * thiết lập từ chi nhánh hiện tại đang sử dụng.
                         */}
                        <Form.Item name="branchId" label="Chi nhánh">
                            <Select placeholder="Chọn chi nhánh">
                                {branches.map((branch) => (
                                    <Select.Option
                                        key={branch.id}
                                        value={parseInt(branch.id, 10)}
                                    >
                                        {branch.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                        <Button onClick={handleCancel}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {editingCustomer ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CustomerForm;
