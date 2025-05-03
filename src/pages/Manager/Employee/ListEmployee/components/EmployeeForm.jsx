import React, { useEffect, useState } from "react";
import {
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Button,
    message,
    Space,
    Spin,
    Row,
    Col,
    Divider,
    Alert,
    Typography,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined,
} from "@ant-design/icons";
import {
    createEmployee,
    updateEmployee,
} from "../../../../../api/employeesApi";
import { EMPLOYEE_STATUS_LABELS } from "../../../../../constants/employee";
import dayjs from "dayjs";
import AvatarUpload from "../../../../../components/AvatarUpload";

const { Option } = Select;
const { Text } = Typography;

export default function EmployeeForm({
    open,
    onCancel,
    onSubmit,
    editingEmployee,
    departments,
    roles,
}) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        if (editingEmployee) {
            const avatarValue = editingEmployee.avatar || "";
            setAvatarUrl(avatarValue);

            form.setFieldsValue({
                ...editingEmployee,
                birthday: editingEmployee.birthday
                    ? dayjs(editingEmployee.birthday)
                    : null,
                join_date: dayjs(editingEmployee.join_date),
                department_id: editingEmployee.department?.id,
                role_id: editingEmployee.role?.id,
                avatar: avatarValue,
            });
            if (editingEmployee.department) {
                setSelectedDepartment(editingEmployee.department.id);
            }
        } else {
            form.resetFields();
            form.setFieldsValue({
                status: "active",
                join_date: dayjs(),
            });
            setSelectedDepartment(null);
            setAvatarUrl("");
        }
        setFormError("");
    }, [editingEmployee, form, open, departments, roles]);

    useEffect(() => {
        if (selectedDepartment && roles.length > 0) {
            const filtered = roles.filter(
                (role) =>
                    Number(role.department_id) === Number(selectedDepartment)
            );

            setFilteredRoles(filtered);

            const currentRoleId = form.getFieldValue("role_id");
            const roleStillValid = filtered.some(
                (role) => role.id === currentRoleId
            );

            if (!roleStillValid) {
                form.setFieldValue("role_id", undefined);
            }
        } else {
            setFilteredRoles([]);
        }
    }, [selectedDepartment, roles, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setFormError("");
            const values = await form.validateFields();

            // Log dữ liệu form gốc để debug

            const {
                birthday: birthdayValue,
                join_date: joinDateValue,
                ...otherValues
            } = values;

            // Đảm bảo department_id và role_id là số nguyên (number)
            const formData = {
                ...otherValues,
                department_id: values.department_id
                    ? Number(values.department_id)
                    : undefined,
                role_id: values.role_id ? Number(values.role_id) : undefined,
            };

            if (birthdayValue) {
                formData.birthday = new Date(
                    birthdayValue.format("YYYY-MM-DD")
                );
            }

            if (joinDateValue) {
                formData.join_date = new Date(
                    joinDateValue.format("YYYY-MM-DD")
                );
            }

            // Log dữ liệu sẽ gửi lên server để debug

            if (editingEmployee) {
                await updateEmployee(editingEmployee.id, formData);
                message.success("Cập nhật nhân viên thành công");
            } else {
                await createEmployee(formData);
                message.success("Thêm nhân viên mới thành công");
            }
            onSubmit();
        } catch (error) {
            console.error("Error submitting form:", error);
            console.error("Error response:", error.response?.data);

            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage =
                error.response?.data?.message ||
                (editingEmployee
                    ? "Lỗi khi cập nhật nhân viên"
                    : "Lỗi khi thêm nhân viên mới");

            // Nếu là lỗi validation từ server
            if (
                error.response?.data?.message &&
                Array.isArray(error.response.data.message)
            ) {
                errorMessage = error.response.data.message.join(", ");
            }

            setFormError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDepartmentChange = (value) => {
        setSelectedDepartment(value);
        form.setFieldValue("role_id", undefined);
    };

    const handleAvatarChange = (url) => {
        setAvatarUrl(url);
        form.setFieldsValue({ avatar: url });
    };

    return (
        <Modal
            title={
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "1.2em",
                        fontWeight: "bold",
                    }}
                >
                    {editingEmployee
                        ? "Chỉnh sửa nhân viên"
                        : "Thêm nhân viên mới"}
                </div>
            }
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText={editingEmployee ? "Cập nhật" : "Thêm mới"}
            okButtonProps={{ loading }}
            cancelText="Hủy"
            width={900}
            destroyOnClose
            maskClosable={false}
            closable={!loading}
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: "active",
                        join_date: dayjs(),
                    }}
                >
                    {formError && (
                        <Alert
                            message="Lỗi khi lưu thông tin"
                            description={formError}
                            type="error"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    <Row gutter={24}>
                        <Col span={6} style={{ textAlign: "center" }}>
                            <Form.Item name="avatar" label="Ảnh đại diện">
                                <AvatarUpload
                                    value={avatarUrl}
                                    onChange={handleAvatarChange}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={18}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="employee_code"
                                        label="Mã nhân viên"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng nhập mã nhân viên",
                                            },
                                            {
                                                pattern: /^[A-Za-z0-9]{3,10}$/,
                                                message:
                                                    "Mã nhân viên phải từ 3-10 ký tự, chỉ gồm chữ và số",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Nhập mã nhân viên"
                                            prefix={<IdcardOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="name"
                                        label="Họ và tên"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng nhập họ và tên",
                                            },
                                            {
                                                min: 3,
                                                message:
                                                    "Tên phải có ít nhất 3 ký tự",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Nhập họ và tên"
                                            prefix={<UserOutlined />}
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
                                                required: true,
                                                message: "Vui lòng nhập email",
                                            },
                                            {
                                                type: "email",
                                                message: "Email không hợp lệ",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Nhập email"
                                            prefix={<MailOutlined />}
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
                                                message:
                                                    "Vui lòng nhập số điện thoại",
                                            },
                                            {
                                                pattern: /^[0-9]{10}$/,
                                                message:
                                                    "Số điện thoại không hợp lệ",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Nhập số điện thoại"
                                            prefix={<PhoneOutlined />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Divider style={{ margin: "16px 0" }} />

                    <Row gutter={24}>
                        <Col span={24}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="department_id"
                                        label="Phòng ban"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng chọn phòng ban",
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Chọn phòng ban"
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={handleDepartmentChange}
                                        >
                                            {departments &&
                                                departments.map((dept) => (
                                                    <Option
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        {dept.name}
                                                    </Option>
                                                ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="role_id"
                                        label="Chức vụ"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng chọn chức vụ",
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder={
                                                selectedDepartment
                                                    ? "Chọn chức vụ"
                                                    : "Vui lòng chọn phòng ban trước"
                                            }
                                            showSearch
                                            optionFilterProp="children"
                                            disabled={!selectedDepartment}
                                            notFoundContent={
                                                filteredRoles.length === 0
                                                    ? "Không có chức vụ phù hợp"
                                                    : null
                                            }
                                        >
                                            {filteredRoles.map((role) => (
                                                <Option
                                                    key={role.id}
                                                    value={role.id}
                                                >
                                                    {role.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="status"
                                        label="Trạng thái"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng chọn trạng thái",
                                            },
                                        ]}
                                    >
                                        <Select placeholder="Chọn trạng thái">
                                            {Object.entries(
                                                EMPLOYEE_STATUS_LABELS
                                            ).map(([value, label]) => (
                                                <Option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item name="birthday" label="Ngày sinh">
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) =>
                                        current &&
                                        current > dayjs().endOf("day")
                                    }
                                    placeholder="Chọn ngày sinh"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="join_date"
                                label="Ngày vào làm"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày vào làm",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    disabledDate={(current) =>
                                        current &&
                                        current > dayjs().endOf("day")
                                    }
                                    placeholder="Chọn ngày vào làm"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider style={{ margin: "16px 0" }} />

                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item name="address" label="Địa chỉ">
                                <Input.TextArea
                                    placeholder="Nhập địa chỉ"
                                    rows={3}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
}
