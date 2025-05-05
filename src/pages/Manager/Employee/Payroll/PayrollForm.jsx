import React, { useState, useEffect } from "react";
import {
    Form,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Row,
    Col,
    Divider,
    Typography,
    Tooltip,
    Alert,
    message,
} from "antd";
import {
    UserOutlined,
    CalendarOutlined,
    PlusCircleOutlined,
    InfoCircleOutlined,
    MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getDepartmentsByBranch } from "../../../../api/departmentsApi";
import {
    getEmployeesByDepartment,
    getEmployees,
} from "../../../../api/employeesApi";

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PayrollPeriodType = {
    MONTHLY: "monthly",
    BIWEEKLY: "biweekly",
};

const PayrollForm = ({
    form,
    branches = [],
    initialValues = {},
    employees: initialEmployees = [],
}) => {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState(initialEmployees || []);
    const [loading, setLoading] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);

    useEffect(() => {
        // Load all employees initially if no filters are active and no initial employees provided
        if (
            !initialEmployees?.length &&
            !selectedBranchId &&
            !selectedDepartmentId
        ) {
            fetchAllEmployees();
        }
    }, []);

    useEffect(() => {
        if (selectedBranchId) {
            fetchDepartmentsByBranch(selectedBranchId);
        }
    }, [selectedBranchId]);

    useEffect(() => {
        if (selectedDepartmentId) {
            fetchEmployeesByDepartment(selectedDepartmentId);
        } else if (selectedBranchId && !selectedDepartmentId) {
            // If branch is selected but no department, fetch all employees from that branch
            fetchEmployeesByBranch(selectedBranchId);
        }
    }, [selectedDepartmentId]);

    const fetchAllEmployees = async () => {
        setLoading(true);
        try {
            const result = await getEmployees();
            setEmployees(result?.data || []);
        } catch (error) {
            console.error("Error fetching all employees:", error);
            message.error("Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeesByBranch = async (branchId) => {
        setLoading(true);
        try {
            const result = await getEmployees({ branch_id: branchId });
            setEmployees(result?.data || []);
        } catch (error) {
            console.error("Error fetching employees by branch:", error);
            message.error("Không thể tải danh sách nhân viên theo chi nhánh");
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartmentsByBranch = async (branchId) => {
        setLoading(true);
        try {
            const depts = await getDepartmentsByBranch(branchId);
            setDepartments(depts || []);
            // Reset department and employee selection
            form.setFieldsValue({
                department_id: undefined,
                employee_id: undefined,
            });

            // After resetting department, fetch employees for this branch
            fetchEmployeesByBranch(branchId);
        } catch (error) {
            console.error("Error fetching departments:", error);
            message.error("Không thể tải danh sách phòng ban");
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeesByDepartment = async (departmentId) => {
        setLoading(true);
        try {
            const emps = await getEmployeesByDepartment(departmentId);
            setEmployees(emps?.data || []);
            // Reset employee selection
            form.setFieldsValue({ employee_id: undefined });
        } catch (error) {
            console.error("Error fetching employees:", error);
            message.error("Không thể tải danh sách nhân viên theo phòng ban");
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchChange = (value) => {
        setSelectedBranchId(value);
        // Reset department selection
        setSelectedDepartmentId(null);
    };

    const handleDepartmentChange = (value) => {
        setSelectedDepartmentId(value);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                period_type: PayrollPeriodType.MONTHLY,
                ...initialValues,
                period:
                    initialValues.period_start && initialValues.period_end
                        ? [
                              dayjs(initialValues.period_start),
                              dayjs(initialValues.period_end),
                          ]
                        : [dayjs().startOf("month"), dayjs().endOf("month")],
            }}
        >
            <Divider orientation="left">Thông tin cơ bản</Divider>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name="branch_id"
                        label={
                            <span>
                                <UserOutlined /> Chi nhánh
                            </span>
                        }
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn chi nhánh",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn chi nhánh"
                            onChange={handleBranchChange}
                            loading={loading}
                        >
                            {branches.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="department_id"
                        label={
                            <span>
                                <UserOutlined /> Phòng ban
                            </span>
                        }
                    >
                        <Select
                            placeholder="Chọn phòng ban"
                            onChange={handleDepartmentChange}
                            loading={loading}
                            disabled={!selectedBranchId}
                        >
                            {departments.map((dept) => (
                                <Option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="employee_id"
                        label={
                            <span>
                                <UserOutlined /> Nhân viên
                            </span>
                        }
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn nhân viên",
                            },
                        ]}
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            loading={loading}
                            disabled={!selectedBranchId}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) => {
                                return option.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase());
                            }}
                        >
                            {employees.map((emp) => (
                                <Option key={emp.id} value={emp.id}>
                                    {emp.name}{" "}
                                    {emp.employee_code
                                        ? `(${emp.employee_code})`
                                        : ""}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={16}>
                    <Form.Item
                        name="period"
                        label={
                            <span>
                                <CalendarOutlined /> Kỳ lương
                            </span>
                        }
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn kỳ lương",
                            },
                        ]}
                    >
                        <RangePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="period_type"
                        label="Loại kỳ lương"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn loại kỳ lương",
                            },
                        ]}
                    >
                        <Select placeholder="Chọn loại kỳ lương">
                            <Option value={PayrollPeriodType.MONTHLY}>
                                Tháng
                            </Option>
                            <Option value={PayrollPeriodType.BIWEEKLY}>
                                Nửa tháng
                            </Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Divider orientation="left">Thông tin điều chỉnh chi tiết</Divider>
            <Alert
                message="Để trống nếu muốn sử dụng dữ liệu mặc định từ cấu hình lương."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="base_salary" label="Lương cơ bản">
                        <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Nhập lương cơ bản (nếu khác cấu hình)"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="working_days" label="Số ngày công">
                        <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Số ngày công"
                            min={0}
                            max={31}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="total_working_hours"
                        label="Tổng số giờ làm việc"
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            placeholder="Tổng số giờ làm việc"
                            min={0}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* Phụ cấp không tính thuế */}
            <Divider
                orientation="left"
                plain
                style={{ margin: "12px 0 8px", fontSize: 14 }}
            >
                <Text type="secondary">Phụ cấp không tính thuế</Text>
            </Divider>

            <Alert
                message="Để trống nếu muốn sử dụng dữ liệu mặc định từ cấu hình lương. Nhập số tiền phụ cấp trực tiếp."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name={["allowances", "meal_allowance"]}
                        label={
                            <span>
                                <PlusCircleOutlined
                                    style={{ color: "#52c41a" }}
                                />{" "}
                                Phụ cấp ăn ca
                                <Tooltip title="Không tính thuế nếu ≤ 730,000đ/tháng">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#1890ff",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập phụ cấp ăn ca"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={["allowances", "transport_allowance"]}
                        label={
                            <span>
                                <PlusCircleOutlined
                                    style={{ color: "#52c41a" }}
                                />{" "}
                                Phụ cấp đi lại
                                <Tooltip title="Không tính thuế nếu theo thực tế">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#1890ff",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập phụ cấp đi lại"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={["allowances", "phone_allowance"]}
                        label={
                            <span>
                                <PlusCircleOutlined
                                    style={{ color: "#52c41a" }}
                                />{" "}
                                Phụ cấp điện thoại
                                <Tooltip title="Không tính thuế nếu ≤ 1,000,000đ/tháng">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#1890ff",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập phụ cấp điện thoại"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* Phụ cấp có tính thuế */}
            <Divider
                orientation="left"
                plain
                style={{ margin: "12px 0 8px", fontSize: 14 }}
            >
                <Text type="secondary">Phụ cấp có tính thuế</Text>
            </Divider>

            <Alert
                message="Để trống nếu muốn sử dụng dữ liệu mặc định từ cấu hình lương. Nhập số tiền phụ cấp trực tiếp."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name={["allowances", "housing_allowance"]}
                        label={
                            <span>
                                <PlusCircleOutlined
                                    style={{ color: "#faad14" }}
                                />{" "}
                                Phụ cấp nhà ở
                                <Tooltip title="Có tính thuế">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#faad14",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập phụ cấp nhà ở"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={["allowances", "position_allowance"]}
                        label={
                            <span>
                                <PlusCircleOutlined
                                    style={{ color: "#faad14" }}
                                />{" "}
                                Phụ cấp chức vụ
                                <Tooltip title="Có tính thuế">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#faad14",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập phụ cấp chức vụ"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={["allowances", "responsibility_allowance"]}
                        label={
                            <span>
                                <PlusCircleOutlined
                                    style={{ color: "#faad14" }}
                                />{" "}
                                Phụ cấp trách nhiệm
                                <Tooltip title="Có tính thuế">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#faad14",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập phụ cấp trách nhiệm"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* Thưởng */}
            <Divider
                orientation="left"
                plain
                style={{ margin: "12px 0 8px", fontSize: 14 }}
            >
                <Text type="secondary">Thưởng (có tính thuế)</Text>
            </Divider>

            <Alert
                message="Để trống nếu không có thưởng cho kỳ lương này. Nhập số tiền thưởng trực tiếp."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name={["allowances", "attendance_bonus"]}
                        label={
                            <span>
                                <PlusCircleOutlined
                                    style={{ color: "#faad14" }}
                                />{" "}
                                Thưởng chuyên cần
                                <Tooltip title="Có tính thuế">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#faad14",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập thưởng chuyên cần"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name={["allowances", "performance_bonus"]}
                        label={
                            <span>
                                <PlusCircleOutlined
                                    style={{ color: "#faad14" }}
                                />{" "}
                                Thưởng hiệu suất
                                <Tooltip title="Có tính thuế">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#faad14",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập thưởng hiệu suất"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
            </Row>

            {/* Khấu trừ */}
            <Divider orientation="left">Khấu trừ</Divider>
            <Alert
                message="Để trống nếu muốn sử dụng tỷ lệ khấu trừ mặc định từ cấu hình lương. Nhập số tiền khấu trừ trực tiếp hoặc tỷ lệ %."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name={["deductions", "tax"]}
                        label={
                            <span>
                                <MinusCircleOutlined
                                    style={{ color: "#f5222d" }}
                                />{" "}
                                Thuế TNCN
                                <Tooltip title="Thuế thu nhập cá nhân">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#1890ff",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập thuế TNCN"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={["deductions", "insurance"]}
                        label={
                            <span>
                                <MinusCircleOutlined
                                    style={{ color: "#f5222d" }}
                                />{" "}
                                Bảo hiểm
                                <Tooltip title="BHXH, BHYT, BHTN">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#1890ff",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập tiền bảo hiểm"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name={["deductions", "other_deductions"]}
                        label={
                            <span>
                                <MinusCircleOutlined
                                    style={{ color: "#f5222d" }}
                                />{" "}
                                Khấu trừ khác
                                <Tooltip title="Các khoản khấu trừ khác">
                                    <InfoCircleOutlined
                                        style={{
                                            marginLeft: 5,
                                            color: "#1890ff",
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="Nhập khấu trừ khác"
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
            </Form.Item>
        </Form>
    );
};

export default PayrollForm;
