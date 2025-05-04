import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    Tabs,
    Row,
    Col,
    Card,
    Typography,
    Divider,
    Tooltip,
    Spin,
    message,
    Alert,
} from "antd";
import {
    DollarOutlined,
    BankOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    InfoCircleOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SalaryConfigForm = ({
    form,
    salaryTypes,
    departments,
    branches,
    roles,
    activeTab,
    setActiveTab,
    selectedDepartment,
    setSelectedDepartment,
    selectedRole,
    setSelectedRole,
    selectedBranch,
    setSelectedBranch,
    editingConfig,
    onFinish,
}) => {
    const [filteredRoles, setFilteredRoles] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);

    // Ensure salaryTypes is valid with fallback values
    const validSalaryTypes = useMemo(() => {
        if (salaryTypes && salaryTypes.types && salaryTypes.labels) {
            return salaryTypes;
        }
        // Default values if salaryTypes is invalid
        return {
            types: ["monthly", "hourly", "shift"],
            labels: {
                monthly: "Lương tháng",
                hourly: "Lương giờ",
                shift: "Lương ca",
            },
        };
    }, [salaryTypes]);

    useEffect(() => {
        // Update form when activeTab changes
        form.setFieldValue("salary_type", activeTab);
    }, [activeTab, form]);

    // Special effect to handle when editing configuration
    useEffect(() => {
        if (editingConfig && selectedDepartment) {
            // Filter roles for selected department
            filterRolesByDepartment(selectedDepartment);
        }
    }, [editingConfig, selectedDepartment]);

    // Filter departments when branch changes
    useEffect(() => {
        if (selectedBranch) {
            const deptsByBranch = departments.filter(
                (dept) => dept.branch && dept.branch.id === selectedBranch
            );
            setFilteredDepartments(deptsByBranch);

            // If not editing, reset department when branch changes
            if (!editingConfig) {
                form.setFieldsValue({ department_id: undefined });
                setSelectedDepartment(null);
            }
        } else {
            setFilteredDepartments(departments);
        }
    }, [selectedBranch, departments, form, editingConfig]);

    // Filter roles when department changes
    useEffect(() => {
        if (selectedDepartment) {
            filterRolesByDepartment(selectedDepartment);
        } else {
            setFilteredRoles([]);
        }
    }, [selectedDepartment, roles]);

    // Function to filter roles by department ID
    const filterRolesByDepartment = (departmentId) => {
        setLoadingRoles(true);

        try {
            if (!departmentId) {
                setFilteredRoles([]);
                return;
            }

            // Filter roles by department_id
            const departmentRoles = roles.filter(
                (role) => Number(role.department_id) === Number(departmentId)
            );

            setFilteredRoles(departmentRoles);

            // If not editing, reset role when department changes
            if (!editingConfig) {
                form.setFieldsValue({ role_id: undefined });
                setSelectedRole(null);
            }
        } catch (error) {
            message.error("Không thể lọc danh sách chức vụ. Vui lòng thử lại.");
            setFilteredRoles([]);
        } finally {
            setLoadingRoles(false);
        }
    };

    // Component for displaying helper text with icon
    const HelperText = ({ text }) => (
        <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            {text}
        </Text>
    );

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                overtime_multiplier: 1.5,
                night_shift_multiplier: 1.3,
                holiday_multiplier: 2.0,
                tax_rate: 0.1,
                insurance_rate: 0.105,
                standard_hours_per_day: 8,
                standard_days_per_month: 22,
                is_active: true,
            }}
        >
            <Tabs
                activeKey={activeTab}
                onChange={(key) => {
                    setActiveTab(key);
                    form.setFieldValue("salary_type", key);
                }}
                type="card"
                className="salary-config-tabs"
            >
                {validSalaryTypes.types.map((type) => (
                    <TabPane
                        tab={
                            <span>
                                {type === "monthly" ? (
                                    <BankOutlined />
                                ) : type === "hourly" ? (
                                    <ClockCircleOutlined />
                                ) : type === "shift" ? (
                                    <TeamOutlined />
                                ) : (
                                    <DollarOutlined />
                                )}
                                <span style={{ marginLeft: 8 }}>
                                    {validSalaryTypes.labels[type] || type}
                                </span>
                            </span>
                        }
                        key={type}
                    />
                ))}
            </Tabs>

            <Form.Item name="salary_type" hidden>
                <Input />
            </Form.Item>

            <Card className="mb-3" title="Thông tin cơ bản">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="branch_id"
                            label="Chi nhánh"
                            rules={[
                                {
                                    required: false,
                                    message: "Vui lòng chọn chi nhánh!",
                                },
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="Chọn chi nhánh"
                                optionFilterProp="children"
                                disabled={false}
                                onChange={(value) => {
                                    setSelectedBranch(value);
                                    // Reset department when branch changes
                                    form.setFieldsValue({
                                        department_id: undefined,
                                        role_id: undefined,
                                    });
                                    setSelectedDepartment(null);
                                    setSelectedRole(null);
                                }}
                            >
                                {branches.map((branch) => (
                                    <Option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </Option>
                                ))}
                            </Select>
                            <HelperText text="Chọn chi nhánh để lọc phòng ban" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
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
                                showSearch
                                placeholder="Chọn phòng ban"
                                optionFilterProp="children"
                                disabled={false} // Allow changing even when editing
                                onChange={(value) => {
                                    setSelectedDepartment(value);
                                    // Reset role when department changes
                                    form.setFieldsValue({ role_id: undefined });
                                    setSelectedRole(null);
                                }}
                            >
                                {(selectedBranch
                                    ? filteredDepartments
                                    : departments
                                ).map((dept) => (
                                    <Option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
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
                                showSearch
                                placeholder="Chọn chức vụ"
                                optionFilterProp="children"
                                disabled={!selectedDepartment}
                                onChange={(value) => setSelectedRole(value)}
                                loading={loadingRoles}
                            >
                                {filteredRoles.map((role) => (
                                    <Option key={role.id} value={role.id}>
                                        {role.name}
                                    </Option>
                                ))}
                            </Select>
                            {!selectedDepartment && (
                                <HelperText text="Vui lòng chọn phòng ban trước" />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="base_salary"
                    label="Mức lương cơ bản"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập mức lương cơ bản!",
                        },
                    ]}
                >
                    <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        min={0}
                        step={100000}
                        addonAfter="VNĐ"
                    />
                </Form.Item>

                {activeTab === "hourly" && (
                    <Form.Item
                        name="hourly_rate"
                        label="Mức lương theo giờ"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mức lương theo giờ!",
                            },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            min={0}
                            step={10000}
                            addonAfter="VNĐ/giờ"
                        />
                    </Form.Item>
                )}

                {activeTab === "shift" && (
                    <Form.Item
                        name="shift_rate"
                        label="Mức lương theo ca"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mức lương theo ca!",
                            },
                        ]}
                    >
                        <InputNumber
                            style={{ width: "100%" }}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            min={0}
                            step={50000}
                            addonAfter="VNĐ/ca"
                        />
                    </Form.Item>
                )}

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="standard_hours_per_day"
                            label="Số giờ làm tiêu chuẩn/ngày"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng nhập số giờ làm tiêu chuẩn!",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                max={24}
                                addonAfter="giờ"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="standard_days_per_month"
                            label="Số ngày làm tiêu chuẩn/tháng"
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng nhập số ngày làm tiêu chuẩn!",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                max={31}
                                addonAfter="ngày"
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            <Card className="mb-3" title="Hệ số lương">
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            name="overtime_multiplier"
                            label={
                                <Tooltip title="Hệ số nhân cho giờ làm thêm">
                                    <Text strong style={{ color: "#fa8c16" }}>
                                        <span>
                                            <ClockCircleOutlined
                                                style={{ marginRight: 5 }}
                                            />
                                            Hệ số làm thêm giờ
                                        </span>
                                    </Text>
                                </Tooltip>
                            }
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Vui lòng nhập hệ số làm thêm giờ!",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                step={0.1}
                                className="overtime-input"
                            />
                        </Form.Item>
                        <HelperText text="Thông thường áp dụng hệ số ≥ 1.5" />
                        <Alert
                            message="Quan trọng về giờ tăng ca"
                            description="Cần đảm bảo hệ số tăng ca được cấu hình đúng để tính lương cho nhân viên làm thêm giờ. Thông thường, hệ số này áp dụng là 1.5."
                            type="warning"
                            showIcon
                            style={{ marginTop: 8 }}
                        />
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="night_shift_multiplier"
                            label={
                                <Tooltip title="Hệ số nhân cho giờ làm ca đêm">
                                    <Text strong style={{ color: "#0050b3" }}>
                                        <span>
                                            <ClockCircleOutlined
                                                style={{ marginRight: 5 }}
                                            />
                                            Hệ số ca đêm
                                        </span>
                                    </Text>
                                </Tooltip>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập hệ số ca đêm!",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                step={0.1}
                                className="night-shift-input"
                            />
                        </Form.Item>
                        <HelperText text="Thông thường áp dụng hệ số ≥ 1.3 cho ca đêm" />
                        <Alert
                            message="Quan trọng về ca đêm"
                            description="Cần đảm bảo hệ số ca đêm được cấu hình đúng để tính lương cho nhân viên làm ca đêm. Giờ làm ca đêm sẽ được tính theo hệ số này."
                            type="info"
                            showIcon
                            style={{ marginTop: 8 }}
                        />
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            name="holiday_multiplier"
                            label={
                                <Tooltip title="Hệ số nhân cho giờ làm ngày lễ">
                                    Hệ số ngày lễ
                                </Tooltip>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập hệ số ngày lễ!",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={1}
                                step={0.1}
                            />
                        </Form.Item>
                        <HelperText text="Thông thường áp dụng hệ số ≥ 2.0" />
                    </Col>
                </Row>
            </Card>

            <Card className="mb-3" title="Phụ cấp và khấu trừ">
                <Row gutter={16}>
                    <Col span={12}>
                        <Title level={5}>
                            <PlusCircleOutlined
                                style={{ color: "#52c41a", marginRight: 5 }}
                            />
                            <span style={{ color: "#52c41a" }}>Phụ cấp</span>
                        </Title>

                        {/* Phụ cấp không tính thuế */}
                        <Divider orientation="left">
                            <Text className="allowance-value">
                                Phụ cấp không tính thuế
                            </Text>
                        </Divider>
                        <Form.Item
                            name="meal_allowance"
                            label={
                                <Tooltip title="Phụ cấp ăn uống không tính thuế nếu <= 730,000 VNĐ/tháng">
                                    <span>
                                        Phụ cấp ăn uống <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                            />
                        </Form.Item>
                        <Form.Item
                            name="transport_allowance"
                            label={
                                <Tooltip title="Phụ cấp đi lại không tính thuế nếu theo thực tế chi trả">
                                    <span>
                                        Phụ cấp đi lại <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                            />
                        </Form.Item>
                        <Form.Item
                            name="phone_allowance"
                            label={
                                <Tooltip title="Phụ cấp điện thoại không tính thuế nếu <= 1,000,000 VNĐ/tháng">
                                    <span>
                                        Phụ cấp điện thoại{" "}
                                        <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                            />
                        </Form.Item>

                        {/* Phụ cấp tính thuế */}
                        <Divider orientation="left">
                            <Text className="allowance-taxable-value">
                                Phụ cấp tính thuế
                            </Text>
                        </Divider>
                        <Form.Item
                            name="housing_allowance"
                            label={
                                <Tooltip title="Phụ cấp nhà ở (có tính thuế)">
                                    <span>
                                        Phụ cấp nhà ở <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                            />
                        </Form.Item>
                        <Form.Item
                            name="position_allowance"
                            label={
                                <Tooltip title="Phụ cấp chức vụ (có tính thuế)">
                                    <span>
                                        Phụ cấp chức vụ <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                            />
                        </Form.Item>
                        <Form.Item
                            name="responsibility_allowance"
                            label={
                                <Tooltip title="Phụ cấp trách nhiệm (có tính thuế)">
                                    <span>
                                        Phụ cấp trách nhiệm{" "}
                                        <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                            />
                        </Form.Item>
                        <Form.Item
                            name="attendance_bonus"
                            label={
                                <Tooltip title="Thưởng chuyên cần (có tính thuế)">
                                    <span>
                                        Thưởng chuyên cần <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Title level={5}>
                            <MinusCircleOutlined
                                style={{ color: "#f5222d", marginRight: 5 }}
                            />
                            <span style={{ color: "#f5222d" }}>Khấu trừ</span>
                        </Title>
                        <Form.Item
                            name="tax_rate"
                            label={
                                <Tooltip title="Tỷ lệ thuế thu nhập cá nhân (TNCN)">
                                    Thuế suất TNCN
                                </Tooltip>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập thuế suất!",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                max={1}
                                step={0.01}
                                formatter={(value) => `${value * 100}%`}
                                parser={(value) => value.replace("%", "") / 100}
                            />
                        </Form.Item>
                        <Form.Item
                            name="insurance_rate"
                            label={
                                <Tooltip title="Tỷ lệ bảo hiểm xã hội, y tế, thất nghiệp">
                                    Tỷ lệ BHXH, BHYT, BHTN
                                </Tooltip>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập tỷ lệ bảo hiểm!",
                                },
                            ]}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                max={1}
                                step={0.005}
                                formatter={(value) => `${value * 100}%`}
                                parser={(value) => value.replace("%", "") / 100}
                            />
                        </Form.Item>
                        <HelperText text="Tỷ lệ BHXH thông thường là 10.5% (8% BHXH + 1.5% BHYT + 1% BHTN)" />

                        <Divider />

                        <Form.Item
                            name="meal_allowance_tax_threshold"
                            label={
                                <Tooltip title="Ngưỡng tối đa phụ cấp ăn ca không tính thuế">
                                    <span>
                                        Ngưỡng phụ cấp ăn ca không thuế{" "}
                                        <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                                defaultValue={730000}
                            />
                        </Form.Item>
                        <Form.Item
                            name="phone_allowance_tax_threshold"
                            label={
                                <Tooltip title="Ngưỡng tối đa phụ cấp điện thoại không tính thuế">
                                    <span>
                                        Ngưỡng phụ cấp điện thoại không thuế{" "}
                                        <InfoCircleOutlined />
                                    </span>
                                </Tooltip>
                            }
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                                min={0}
                                step={100000}
                                addonAfter="VNĐ"
                                defaultValue={1000000}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Alert
                    message="Phân loại phụ cấp theo thuế"
                    description={
                        <ul>
                            <li>
                                <Text strong className="allowance-value">
                                    Phụ cấp không tính thuế:
                                </Text>{" "}
                                Ăn ca (≤730k), đi lại, điện thoại (≤1 triệu)
                            </li>
                            <li>
                                <Text
                                    strong
                                    className="allowance-taxable-value"
                                >
                                    Phụ cấp tính thuế:
                                </Text>{" "}
                                Nhà ở, chức vụ, trách nhiệm, thưởng chuyên cần,
                                thưởng hiệu suất
                            </li>
                        </ul>
                    }
                    type="info"
                    showIcon
                />
            </Card>

            <Card title="Thông tin khác">
                <Form.Item
                    name="is_active"
                    label="Trạng thái"
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Đang sử dụng"
                        unCheckedChildren="Đã khóa"
                    />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Card>
        </Form>
    );
};

export default SalaryConfigForm;
