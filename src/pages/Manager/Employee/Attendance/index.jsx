import React, { useState, useEffect } from "react";
import {
    Card,
    Button,
    Table,
    Space,
    Tag,
    Tooltip,
    DatePicker,
    Select,
    Input,
    Form,
    Modal,
    Row,
    Col,
    TimePicker,
    Tabs,
    message,
    Badge,
    Popconfirm,
    Typography,
    Divider,
    Radio,
    Alert,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    FilterOutlined,
    HistoryOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getDepartments } from "../../../../api/departmentsApi";
import { getEmployees } from "../../../../api/employeesApi";
import {
    createAttendance,
    getAttendances,
    updateAttendanceStatus,
    deleteAttendance,
} from "../../../../api/attendanceApi";
import utc from "dayjs/plugin/utc";
import { getEmployeeShifts } from "../../../../api/employeeShiftsApi";

dayjs.extend(utc);

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const AttendanceStatus = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

const AttendanceType = {
    NORMAL: "normal",
    OVERTIME: "overtime",
    NIGHT_SHIFT: "night_shift",
    HOLIDAY: "holiday",
};

const statusColors = {
    [AttendanceStatus.PENDING]: "warning",
    [AttendanceStatus.APPROVED]: "success",
    [AttendanceStatus.REJECTED]: "error",
};

const statusLabels = {
    [AttendanceStatus.PENDING]: "Chờ xác nhận",
    [AttendanceStatus.APPROVED]: "Đã xác nhận",
    [AttendanceStatus.REJECTED]: "Đã từ chối",
};

const typeLabels = {
    [AttendanceType.NORMAL]: "Thông thường",
    [AttendanceType.OVERTIME]: "Tăng ca",
    [AttendanceType.NIGHT_SHIFT]: "Ca đêm",
    [AttendanceType.HOLIDAY]: "Ngày lễ",
};

export default function AttendanceManagement() {
    const [attendances, setAttendances] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [adjustModalVisible, setAdjustModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [filterForm] = Form.useForm();
    const [addForm] = Form.useForm();
    const [adjustForm] = Form.useForm();
    const [activeTab, setActiveTab] = useState("all");
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);
    const [employeeShifts, setEmployeeShifts] = useState([]);
    const [adjustShifts, setAdjustShifts] = useState([]);
    const [attendanceType, setAttendanceType] = useState(AttendanceType.NORMAL);

    // Statistics
    const [statistics, setStatistics] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
        byDepartment: {},
    });

    // Initial data load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptResponse, employeeResponse] = await Promise.all([
                    getDepartments(),
                    getEmployees(),
                ]);

                setDepartments(deptResponse);

                // Đảm bảo employees luôn là mảng
                if (Array.isArray(employeeResponse)) {
                    setEmployees(employeeResponse);
                } else if (
                    employeeResponse &&
                    Array.isArray(employeeResponse.data)
                ) {
                    // Nếu response có định dạng { data: [...], total: ... }
                    setEmployees(employeeResponse.data);
                } else {
                    // Trường hợp không có dữ liệu hoặc format không đúng
                    setEmployees([]);
                    console.warn(
                        "Dữ liệu nhân viên không đúng định dạng:",
                        employeeResponse
                    );
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
                message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
                setEmployees([]); // Đảm bảo là mảng rỗng trong trường hợp lỗi
            }
        };

        fetchData();
    }, []);

    // Effect to fetch attendances when filters change
    useEffect(() => {
        fetchAttendances();
    }, [dateRange, activeTab]);

    // Effect to fetch employee shifts when employee changes in the add form
    useEffect(() => {
        const fetchEmployeeShifts = async () => {
            const employeeId = addForm.getFieldValue("employee_id");
            const date = addForm.getFieldValue("date");
            if (employeeId && date) {
                try {
                    const formattedDate = date.format("YYYY-MM-DD");
                    const response = await getEmployeeShifts({
                        employeeId: employeeId,
                        date: formattedDate,
                    });
                    setEmployeeShifts(response);
                } catch (error) {
                    console.error("Error fetching employee shifts:", error);
                    setEmployeeShifts([]);
                }
            }
        };

        fetchEmployeeShifts();
    }, [addForm.getFieldValue("employee_id"), addForm.getFieldValue("date")]);

    // Effect to fetch employee shifts when employee changes in the adjust form
    useEffect(() => {
        const fetchAdjustShifts = async () => {
            const employeeId = adjustForm.getFieldValue("employee_id");
            const date = adjustForm.getFieldValue("date");
            if (employeeId && date) {
                try {
                    const formattedDate = date.format("YYYY-MM-DD");
                    const response = await getEmployeeShifts({
                        employeeId: employeeId,
                        date: formattedDate,
                    });
                    setAdjustShifts(response);
                } catch (error) {
                    console.error(
                        "Error fetching employee shifts for adjustment:",
                        error
                    );
                    setAdjustShifts([]);
                }
            }
        };

        fetchAdjustShifts();
    }, [
        adjustForm.getFieldValue("employee_id"),
        adjustForm.getFieldValue("date"),
    ]);

    const fetchAttendances = async () => {
        setLoading(true);
        try {
            const filters = {
                start_date: dateRange[0].format("YYYY-MM-DD"),
                end_date: dateRange[1].format("YYYY-MM-DD"),
            };

            // Add status filter if not on 'all' tab
            if (activeTab !== "all") {
                filters.status = activeTab;
            }

            // Add other filters from form
            const formValues = filterForm.getFieldsValue();
            if (formValues.department_id) {
                filters.department_id = formValues.department_id;
            }
            if (formValues.employee_id) {
                filters.employee_id = formValues.employee_id;
            }
            if (formValues.type) {
                filters.type = formValues.type;
            }
            if (formValues.search) {
                filters.search = formValues.search;
            }

            const data = await getAttendances(filters);
            setAttendances(data);

            // Calculate statistics
            const stats = {
                pending: 0,
                approved: 0,
                rejected: 0,
                total: data.length,
                byDepartment: {},
            };

            data.forEach((att) => {
                // Count by status
                stats[att.status]++;

                // Count by department
                const deptName =
                    att.employee?.department?.name || "Không có phòng ban";
                if (!stats.byDepartment[deptName]) {
                    stats.byDepartment[deptName] = 0;
                }
                stats.byDepartment[deptName]++;
            });

            setStatistics(stats);
        } catch (error) {
            console.error("Error fetching attendances:", error);
            message.error("Không thể tải dữ liệu chấm công");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAttendance = async () => {
        try {
            const values = await addForm.validateFields();

            setLoading(true);

            const payload = {
                employee_id: values.employee_id,
                date: values.date.format("YYYY-MM-DD"),
                type: values.type || AttendanceType.NORMAL,
                notes: values.notes,
            };

            // Add employee_shift_id if selected
            if (values.employee_shift_id) {
                payload.employee_shift_id = values.employee_shift_id;
            }

            if (values.check_in) {
                payload.check_in = values.check_in.format("HH:mm:ss");
            }

            if (values.check_out) {
                payload.check_out = values.check_out.format("HH:mm:ss");
            }

            await createAttendance(payload);
            message.success("Thêm chấm công thành công");
            setAddModalVisible(false);
            addForm.resetFields();
            fetchAttendances();
        } catch (error) {
            console.error("Error adding attendance:", error);
            message.error("Không thể thêm chấm công");
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustRequest = async () => {
        try {
            const values = await adjustForm.validateFields();
            setLoading(true);

            const payload = {
                employee_id: values.employee_id,
                date: values.date.format("YYYY-MM-DD"),
                type: values.type || AttendanceType.NORMAL,
                notes: values.notes,
                adjustment_reason: values.adjustment_reason,
                is_adjustment: true,
            };

            // Add employee_shift_id if selected
            if (values.employee_shift_id) {
                payload.employee_shift_id = values.employee_shift_id;
            }

            if (values.check_in) {
                payload.check_in = values.check_in.format("HH:mm:ss");
            }

            if (values.check_out) {
                payload.check_out = values.check_out.format("HH:mm:ss");
            }

            await createAttendance(payload);
            message.success("Gửi yêu cầu điều chỉnh thành công");
            setAdjustModalVisible(false);
            adjustForm.resetFields();
            fetchAttendances();
        } catch (error) {
            console.error("Error submitting adjustment:", error);
            message.error("Không thể gửi yêu cầu điều chỉnh");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (record, newStatus) => {
        try {
            setLoading(true);
            await updateAttendanceStatus(record.id, { status: newStatus });
            message.success("Cập nhật trạng thái thành công");
            fetchAttendances();
        } catch (error) {
            console.error("Error updating status:", error);
            message.error("Không thể cập nhật trạng thái");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await deleteAttendance(id);
            message.success("Xóa chấm công thành công");
            fetchAttendances();
        } catch (error) {
            console.error("Error deleting attendance:", error);
            message.error("Không thể xóa chấm công");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handleDateRangeChange = (dates) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    const handleSearch = () => {
        fetchAttendances();
    };

    const handleReset = () => {
        filterForm.resetFields();
        fetchAttendances();
    };

    const columns = [
        {
            title: "Mã NV",
            dataIndex: ["employee", "employee_code"],
            key: "employee_code",
            width: 100,
        },
        {
            title: "Nhân viên",
            dataIndex: ["employee", "name"],
            key: "employee_name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary">
                        {record.employee?.department?.name ||
                            "Chưa có phòng ban"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Ngày",
            dataIndex: "date",
            key: "date",
            render: (text) => dayjs(text).format("DD/MM/YYYY"),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: "Check-in",
            dataIndex: "check_in",
            key: "check_in",
            render: (text) => text || "-",
        },
        {
            title: "Check-out",
            dataIndex: "check_out",
            key: "check_out",
            render: (text) => text || "-",
        },
        {
            title: "Giờ làm",
            dataIndex: "working_hours",
            key: "working_hours",
            render: (text) => (text ? `${text.toFixed(1)} giờ` : "0 giờ"),
            sorter: (a, b) => a.working_hours - b.working_hours,
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            render: (type) => (
                <Tag
                    color={
                        type === AttendanceType.OVERTIME
                            ? "orange"
                            : type === AttendanceType.NIGHT_SHIFT
                            ? "purple"
                            : type === AttendanceType.HOLIDAY
                            ? "green"
                            : "blue"
                    }
                >
                    {typeLabels[type]}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
            ),
        },
        {
            title: "Thao tác",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {record.status === AttendanceStatus.PENDING && (
                        <>
                            <Tooltip title="Xác nhận">
                                <Button
                                    type="text"
                                    icon={
                                        <CheckCircleOutlined
                                            style={{ color: "green" }}
                                        />
                                    }
                                    onClick={() =>
                                        handleStatusChange(
                                            record,
                                            AttendanceStatus.APPROVED
                                        )
                                    }
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button
                                    type="text"
                                    icon={
                                        <CloseCircleOutlined
                                            style={{ color: "red" }}
                                        />
                                    }
                                    onClick={() =>
                                        handleStatusChange(
                                            record,
                                            AttendanceStatus.REJECTED
                                        )
                                    }
                                />
                            </Tooltip>
                        </>
                    )}
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    // Statistics for displaying in cards
    const renderStatistics = () => (
        <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Tổng chấm công"
                        value={statistics.total}
                        prefix={<ClockCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Chờ xác nhận"
                        value={statistics.pending}
                        valueStyle={{ color: "#faad14" }}
                        prefix={<ExclamationCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Đã xác nhận"
                        value={statistics.approved}
                        valueStyle={{ color: "#52c41a" }}
                        prefix={<CheckCircleOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6}>
                <Card hoverable>
                    <Statistic
                        title="Đã từ chối"
                        value={statistics.rejected}
                        valueStyle={{ color: "#f5222d" }}
                        prefix={<CloseCircleOutlined />}
                    />
                </Card>
            </Col>
        </Row>
    );

    return (
        <div>
            <Card
                title={
                    <Space>
                        <ClockCircleOutlined />
                        <span>Quản lý chấm công</span>
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setAddModalVisible(true)}
                        >
                            Thêm chấm công
                        </Button>
                        <Button
                            type="default"
                            icon={<EditOutlined />}
                            onClick={() => setAdjustModalVisible(true)}
                        >
                            Yêu cầu điều chỉnh
                        </Button>
                    </Space>
                }
            >
                <Form
                    form={filterForm}
                    layout="vertical"
                    onFinish={handleSearch}
                    initialValues={{}}
                >
                    <Row gutter={16}>
                        <Col span={5}>
                            <Form.Item name="department_id" label="Phòng ban">
                                <Select
                                    allowClear
                                    placeholder="Chọn phòng ban"
                                    onChange={fetchAttendances}
                                >
                                    {departments.map((dept) => (
                                        <Option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name="employee_id" label="Nhân viên">
                                <Select
                                    allowClear
                                    placeholder="Chọn nhân viên"
                                    onChange={fetchAttendances}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {Array.isArray(employees)
                                        ? employees.map((emp) => (
                                              <Option
                                                  key={emp.id}
                                                  value={emp.id}
                                              >
                                                  {emp.employee_code} -{" "}
                                                  {emp.name}
                                              </Option>
                                          ))
                                        : null}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name="type" label="Loại chấm công">
                                <Select
                                    allowClear
                                    placeholder="Chọn loại"
                                    onChange={fetchAttendances}
                                >
                                    {Object.keys(AttendanceType).map((key) => (
                                        <Option
                                            key={key}
                                            value={AttendanceType[key]}
                                        >
                                            {typeLabels[AttendanceType[key]]}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Khoảng thời gian">
                                <RangePicker
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item label=" " colon={false}>
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SearchOutlined />}
                                    >
                                        Tìm
                                    </Button>
                                    <Button
                                        onClick={handleReset}
                                        icon={<FilterOutlined />}
                                    >
                                        Đặt lại
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <Divider style={{ margin: "8px 0 16px" }} />

                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                    <TabPane tab="Tất cả" key="all" />
                    <TabPane
                        tab={
                            <Badge
                                count={statistics.pending}
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#faad14",
                                    marginRight: "8px",
                                }}
                            >
                                Chờ xác nhận
                            </Badge>
                        }
                        key={AttendanceStatus.PENDING}
                    />
                    <TabPane
                        tab={
                            <Badge
                                count={statistics.approved}
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#52c41a",
                                    marginRight: "8px",
                                }}
                            >
                                Đã xác nhận
                            </Badge>
                        }
                        key={AttendanceStatus.APPROVED}
                    />
                    <TabPane
                        tab={
                            <Badge
                                count={statistics.rejected}
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#f5222d",
                                    marginRight: "8px",
                                }}
                            >
                                Đã từ chối
                            </Badge>
                        }
                        key={AttendanceStatus.REJECTED}
                    />
                </Tabs>

                {/* Statistics */}
                {/* {renderStatistics()} */}

                <Table
                    columns={columns}
                    dataSource={attendances}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bản ghi`,
                    }}
                />
            </Card>

            {/* Modal thêm chấm công mới */}
            <Modal
                title="Thêm chấm công"
                visible={addModalVisible}
                onCancel={() => {
                    setAddModalVisible(false);
                    addForm.resetFields();
                }}
                onOk={handleAddAttendance}
                confirmLoading={loading}
                width={650}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onValuesChange={(changedValues) => {
                        // When employee or date changes, fetch shifts
                        if (changedValues.employee_id || changedValues.date) {
                            const employeeId =
                                addForm.getFieldValue("employee_id");
                            const date = addForm.getFieldValue("date");

                            if (employeeId && date) {
                                const fetchShifts = async () => {
                                    try {
                                        const formattedDate =
                                            date.format("YYYY-MM-DD");
                                        const response =
                                            await getEmployeeShifts({
                                                employeeId: employeeId,
                                                date: formattedDate,
                                            });
                                        setEmployeeShifts(response);
                                    } catch (error) {
                                        console.error(
                                            "Error fetching employee shifts:",
                                            error
                                        );
                                        setEmployeeShifts([]);
                                    }
                                };
                                fetchShifts();
                            }
                        }
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employee_id"
                                label="Nhân viên"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn nhân viên",
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn nhân viên"
                                    optionFilterProp="children"
                                >
                                    {Array.isArray(employees)
                                        ? employees.map((emp) => (
                                              <Option
                                                  key={emp.id}
                                                  value={emp.id}
                                              >
                                                  {emp.employee_code} -{" "}
                                                  {emp.name}
                                              </Option>
                                          ))
                                        : null}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Ngày"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employee_shift_id"
                                label="Ca làm việc"
                                tooltip="Chọn ca làm việc sẽ giúp liên kết dữ liệu chấm công với lịch làm việc"
                            >
                                <Select
                                    allowClear
                                    placeholder="Chọn ca làm việc"
                                    loading={loading}
                                >
                                    {employeeShifts &&
                                    employeeShifts.length > 0 ? (
                                        employeeShifts.map((shift) => (
                                            <Option
                                                key={shift.id}
                                                value={shift.id}
                                            >
                                                {shift.schedule_code} -{" "}
                                                {shift.shift?.name ||
                                                    "Ca không xác định"}
                                                :{" "}
                                                {shift.shift?.start_time ||
                                                    "--:--"}{" "}
                                                -{" "}
                                                {shift.shift?.end_time ||
                                                    "--:--"}
                                            </Option>
                                        ))
                                    ) : (
                                        <Option disabled>
                                            Không có ca làm việc cho ngày này
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Loại chấm công"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn loại chấm công",
                                    },
                                ]}
                            >
                                <Radio.Group
                                    onChange={(e) =>
                                        setAttendanceType(e.target.value)
                                    }
                                >
                                    <Radio value={AttendanceType.NORMAL}>
                                        Bình thường
                                    </Radio>
                                    <Radio value={AttendanceType.OVERTIME}>
                                        Tăng ca
                                    </Radio>
                                    <Radio value={AttendanceType.NIGHT_SHIFT}>
                                        <Text
                                            strong
                                            style={{ color: "#0050b3" }}
                                        >
                                            Ca đêm
                                        </Text>
                                    </Radio>
                                    <Radio value={AttendanceType.HOLIDAY}>
                                        Ngày lễ
                                    </Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    {attendanceType === AttendanceType.NIGHT_SHIFT && (
                        <Alert
                            message="Thông tin ca đêm"
                            description="Các giờ làm việc trong ca đêm sẽ được tính phụ cấp ca đêm theo hệ số cấu hình trong bảng lương."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                    )}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="check_in" label="Giờ check-in">
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: "100%" }}
                                    placeholder="Giờ check-in"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="check_out" label="Giờ check-out">
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: "100%" }}
                                    placeholder="Giờ check-out"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal yêu cầu điều chỉnh */}
            <Modal
                title="Yêu cầu điều chỉnh chấm công"
                visible={adjustModalVisible}
                onCancel={() => {
                    setAdjustModalVisible(false);
                    adjustForm.resetFields();
                }}
                onOk={handleAdjustRequest}
                confirmLoading={loading}
                width={650}
            >
                <Form
                    form={adjustForm}
                    layout="vertical"
                    onValuesChange={(changedValues) => {
                        // When employee or date changes, fetch shifts
                        if (changedValues.employee_id || changedValues.date) {
                            const employeeId =
                                adjustForm.getFieldValue("employee_id");
                            const date = adjustForm.getFieldValue("date");

                            if (employeeId && date) {
                                const fetchShifts = async () => {
                                    try {
                                        const formattedDate =
                                            date.format("YYYY-MM-DD");
                                        const response =
                                            await getEmployeeShifts({
                                                employeeId: employeeId,
                                                date: formattedDate,
                                            });
                                        setAdjustShifts(response);
                                    } catch (error) {
                                        console.error(
                                            "Error fetching employee shifts:",
                                            error
                                        );
                                        setAdjustShifts([]);
                                    }
                                };
                                fetchShifts();
                            }
                        }
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employee_id"
                                label="Nhân viên"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn nhân viên",
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn nhân viên"
                                    optionFilterProp="children"
                                >
                                    {Array.isArray(employees)
                                        ? employees.map((emp) => (
                                              <Option
                                                  key={emp.id}
                                                  value={emp.id}
                                              >
                                                  {emp.employee_code} -{" "}
                                                  {emp.name}
                                              </Option>
                                          ))
                                        : null}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Ngày"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="employee_shift_id"
                                label="Ca làm việc"
                                tooltip="Chọn ca làm việc sẽ giúp liên kết dữ liệu chấm công với lịch làm việc"
                            >
                                <Select
                                    allowClear
                                    placeholder="Chọn ca làm việc"
                                    loading={loading}
                                >
                                    {adjustShifts && adjustShifts.length > 0 ? (
                                        adjustShifts.map((shift) => (
                                            <Option
                                                key={shift.id}
                                                value={shift.id}
                                            >
                                                {shift.schedule_code} -{" "}
                                                {shift.shift?.name ||
                                                    "Ca không xác định"}
                                                :{" "}
                                                {shift.shift?.start_time ||
                                                    "--:--"}{" "}
                                                -{" "}
                                                {shift.shift?.end_time ||
                                                    "--:--"}
                                            </Option>
                                        ))
                                    ) : (
                                        <Option disabled>
                                            Không có ca làm việc cho ngày này
                                        </Option>
                                    )}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="type" label="Loại chấm công">
                                <Select placeholder="Chọn loại">
                                    {Object.keys(AttendanceType).map((key) => (
                                        <Option
                                            key={key}
                                            value={AttendanceType[key]}
                                        >
                                            {typeLabels[AttendanceType[key]]}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="check_in" label="Giờ check-in">
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: "100%" }}
                                    placeholder="Giờ check-in"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="check_out" label="Giờ check-out">
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: "100%" }}
                                    placeholder="Giờ check-out"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="adjustment_reason"
                        label="Lý do điều chỉnh"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập lý do điều chỉnh",
                            },
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập lý do điều chỉnh"
                        />
                    </Form.Item>
                    <Form.Item name="notes" label="Ghi chú">
                        <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

// Statistic component
function Statistic({ title, value, prefix, valueStyle }) {
    return (
        <div>
            <div style={{ color: "#00000073", fontSize: 14 }}>{title}</div>
            <div
                style={{
                    fontSize: 24,
                    fontWeight: 600,
                    marginTop: 4,
                    ...valueStyle,
                }}
            >
                <Space>
                    {prefix}
                    <span>{value}</span>
                </Space>
            </div>
        </div>
    );
}
