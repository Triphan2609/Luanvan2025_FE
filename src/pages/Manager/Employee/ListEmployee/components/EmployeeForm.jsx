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
import { getDepartmentsByBranch } from "../../../../../api/departmentsApi";
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
    branches,
}) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
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
                branch_id: editingEmployee.branch?.id,
                avatar: avatarValue,
            });

            if (editingEmployee.branch) {
                setSelectedBranch(editingEmployee.branch.id);
                loadDepartmentsByBranch(editingEmployee.branch.id);
            }

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
            setSelectedBranch(null);
            setFilteredDepartments([]);
            setAvatarUrl("");
        }
        setFormError("");
    }, [editingEmployee, form, open, departments, roles, branches]);

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

    const loadDepartmentsByBranch = async (branchId) => {
        if (!branchId) {
            setFilteredDepartments([]);
            return;
        }

        try {
            setLoading(true);
            const branchDepartments = await getDepartmentsByBranch(branchId);
            setFilteredDepartments(branchDepartments || []);
        } catch (error) {
            console.error("Error loading departments by branch:", error);
            message.error("Không thể tải danh sách phòng ban theo chi nhánh");
            setFilteredDepartments([]);
        } finally {
            setLoading(false);
        }
    };

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

            // Đảm bảo department_id, role_id và branch_id là số nguyên (number)
            const formData = {
                ...otherValues,
                department_id: values.department_id
                    ? Number(values.department_id)
                    : undefined,
                role_id: values.role_id ? Number(values.role_id) : undefined,
                branch_id: values.branch_id
                    ? Number(values.branch_id)
                    : undefined,
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

    const handleBranchChange = (value) => {
        setSelectedBranch(value);
        // Reset department and role when branch changes
        form.setFieldsValue({
            department_id: undefined,
            role_id: undefined,
        });
        setSelectedDepartment(null);

        // Load departments for this branch
        loadDepartmentsByBranch(value);
    };

    const handleAvatarChange = (url) => {
        setAvatarUrl(url);
        form.setFieldsValue({ avatar: url });
    };

    // Get only active branches
    const activeBranches = branches.filter(
        (branch) => branch.status === "active"
    );

    // Determine which departments to show in the dropdown
    const departmentsToShow = selectedBranch
        ? filteredDepartments
        : departments;

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
            cancelText="Hủy"
            width={800}
            confirmLoading={loading}
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    name="employeeForm"
                    initialValues={{
                        status: "active",
                        join_date: dayjs(),
                    }}
                >
                    {formError && (
                        <Alert
                            type="error"
                            message="Lỗi"
                            description={formError}
                            style={{ marginBottom: 16 }}
                            showIcon
                        />
                    )}

                    <Row gutter={16}>
                        <Col span={24} style={{ textAlign: "center" }}>
                            <Form.Item name="avatar" hidden>
                                <Input />
                            </Form.Item>
                            <AvatarUpload
                                value={avatarUrl}
                                onChange={handleAvatarChange}
                            />
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employee_code"
                                label="Mã nhân viên"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập mã nhân viên!",
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="Mã nhân viên (NV001)"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên nhân viên"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên nhân viên!",
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Tên nhân viên"
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
                                        message: "Vui lòng nhập email!",
                                    },
                                    {
                                        type: "email",
                                        message: "Email không hợp lệ!",
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="Email"
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
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="Số điện thoại"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                                rules={[
                                    {
                                        required: false,
                                    },
                                ]}
                            >
                                <Input placeholder="Địa chỉ" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="birthday"
                                label="Ngày sinh"
                                rules={[
                                    {
                                        required: false,
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder="Chọn ngày sinh"
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="join_date"
                                label="Ngày vào làm"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày vào làm!",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    placeholder="Chọn ngày vào làm"
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn trạng thái!",
                                    },
                                ]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    {Object.entries(EMPLOYEE_STATUS_LABELS).map(
                                        ([value, label]) => (
                                            <Option key={value} value={value}>
                                                {label}
                                            </Option>
                                        )
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
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
                                <Select
                                    placeholder="Chọn chi nhánh"
                                    onChange={handleBranchChange}
                                >
                                    {activeBranches.map((branch) => (
                                        <Option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="department_id"
                                label="Phòng ban"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn phòng ban!",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder={
                                        selectedBranch
                                            ? "Chọn phòng ban"
                                            : "Chọn chi nhánh trước"
                                    }
                                    onChange={handleDepartmentChange}
                                    disabled={!selectedBranch}
                                >
                                    {departmentsToShow.map((dept) => (
                                        <Option key={dept.id} value={dept.id}>
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
                                        message: "Vui lòng chọn chức vụ!",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder={
                                        selectedDepartment
                                            ? "Chọn chức vụ"
                                            : "Chọn phòng ban trước"
                                    }
                                    disabled={!selectedDepartment}
                                >
                                    {filteredRoles.map((role) => (
                                        <Option key={role.id} value={role.id}>
                                            {role.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Spin>
        </Modal>
    );
}
