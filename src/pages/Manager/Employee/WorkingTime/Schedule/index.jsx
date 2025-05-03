import React, { useState, useEffect } from "react";
import {
    Space,
    Table,
    Button,
    Typography,
    Tag,
    Row,
    Col,
    message,
    Calendar,
    Select,
    Card,
    Badge,
    Tooltip,
    Popover,
    List,
    Input,
    Dropdown,
    Menu,
    DatePicker,
    Divider,
    Checkbox,
} from "antd";
import {
    PlusOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    FilterOutlined,
    EllipsisOutlined,
    CheckOutlined,
    CloseOutlined,
    DeleteOutlined,
    SearchOutlined,
    ExportOutlined,
    SyncOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ScheduleForm from "./ScheduleForm";
import {
    getEmployeeShifts,
    createEmployeeShift,
    updateEmployeeShiftStatus,
    deleteEmployeeShift,
    bulkUpdateEmployeeShiftStatus,
    bulkDeleteEmployeeShifts,
} from "../../../../../api/employeeShiftsApi";
import { getDepartments } from "../../../../../api/departmentsApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Constants
const SCHEDULE_STATUS = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    COMPLETED: "completed",
};

export default function Schedule() {
    // States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [schedules, setSchedules] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} lịch`,
        },
        filters: {},
        sorter: { field: "date", order: "descend" },
    });
    const [searchText, setSearchText] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);

    // Load schedules on component mount
    useEffect(() => {
        loadDepartments();
        fetchSchedules();
    }, []);

    // Load schedules when department filter changes
    useEffect(() => {
        fetchSchedules();
    }, [selectedDepartment, dateRange]);

    const loadDepartments = async () => {
        try {
            const deptsData = await getDepartments();
            setDepartments(deptsData || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách phòng ban:", error);
        }
    };

    const fetchSchedules = async () => {
        try {
            setLoading(true);

            // Lấy ngày hiện tại và ngày cuối tháng
            const startDate = dateRange[0].format("YYYY-MM-DD");
            const endDate = dateRange[1].format("YYYY-MM-DD");

            // Xây dựng filter
            const filter = {
                startDate,
                endDate,
            };

            // Thêm filter theo phòng ban
            if (selectedDepartment !== "all") {
                filter.department_id = Number(selectedDepartment);
            }

            const data = await getEmployeeShifts(filter);

            // Check if roles are included in the response
            if (data && data.length > 0) {
                console.log(
                    "First employee with role:",
                    data[0].employee?.role
                );
            }

            // Chuyển đổi dữ liệu từ backend sang định dạng frontend
            const formattedSchedules = data.map((schedule) => {
                return {
                    id: schedule.id,
                    schedule_code: schedule.schedule_code,
                    employeeId: schedule.employee?.id,
                    employeeName:
                        schedule.employee?.name || schedule.employee?.fullname,
                    department:
                        schedule.employee?.department?.name || "Chưa phân loại",
                    departmentId: schedule.employee?.department?.id,
                    departmentCode:
                        schedule.employee?.department?.code || "unknown",
                    roleId: schedule.employee?.role?.id,
                    roleName:
                        schedule.employee?.role?.name || "Chưa có chức vụ",
                    shiftId: schedule.shift?.id,
                    shiftName: schedule.shift?.name,
                    shiftTime: `${schedule.shift?.start_time || ""} - ${
                        schedule.shift?.end_time || ""
                    }`,
                    date: dayjs(schedule.date).format("YYYY-MM-DD"),
                    status: schedule.status,
                    attendance_status: schedule.attendance_status,
                    check_in: schedule.check_in,
                    check_out: schedule.check_out,
                    note: schedule.note,
                };
            });

            setSchedules(formattedSchedules);
        } catch (error) {
            console.error("Lỗi khi tải lịch làm việc:", error);
            message.error("Không thể tải danh sách lịch làm việc");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateEmployeeShiftStatus(id, newStatus);
            // Cập nhật trạng thái trong state
            setSchedules(
                schedules.map((s) =>
                    s.id === id ? { ...s, status: newStatus } : s
                )
            );
            message.success("Cập nhật trạng thái thành công");
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            message.error("Không thể cập nhật trạng thái");
        }
    };

    const handleDeleteSchedule = async (id) => {
        try {
            await deleteEmployeeShift(id);
            setSchedules(schedules.filter((s) => s.id !== id));
            message.success("Xóa lịch làm việc thành công");
        } catch (error) {
            console.error("Lỗi khi xóa lịch làm việc:", error);
            message.error("Không thể xóa lịch làm việc");
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        if (selectedItems.length === 0) {
            message.warning("Vui lòng chọn ít nhất một lịch làm việc");
            return;
        }

        try {
            await bulkUpdateEmployeeShiftStatus(selectedItems, status);

            // Cập nhật state
            const updatedSchedules = schedules.map((s) =>
                selectedItems.includes(s.id) ? { ...s, status } : s
            );

            setSchedules(updatedSchedules);
            message.success(
                `Đã cập nhật ${selectedItems.length} lịch làm việc`
            );
        } catch (error) {
            console.error("Lỗi khi cập nhật hàng loạt:", error);
            message.error("Không thể cập nhật trạng thái");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) {
            message.warning("Vui lòng chọn ít nhất một lịch làm việc");
            return;
        }

        try {
            await bulkDeleteEmployeeShifts(selectedItems);

            // Cập nhật state
            const filteredSchedules = schedules.filter(
                (s) => !selectedItems.includes(s.id)
            );
            setSchedules(filteredSchedules);
            setSelectedItems([]);
            message.success(`Đã xóa ${selectedItems.length} lịch làm việc`);
        } catch (error) {
            console.error("Lỗi khi xóa hàng loạt:", error);
            message.error("Không thể xóa lịch làm việc");
        }
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            sorter: sorter.order
                ? { field: sorter.field, order: sorter.order }
                : {},
        });
    };

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setDateRange(dates);
        }
    };

    const getStatusTagColor = (status) => {
        switch (status) {
            case SCHEDULE_STATUS.PENDING:
                return "warning";
            case SCHEDULE_STATUS.CONFIRMED:
                return "success";
            case SCHEDULE_STATUS.COMPLETED:
                return "default";
            default:
                return "default";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case SCHEDULE_STATUS.PENDING:
                return "Chờ xác nhận";
            case SCHEDULE_STATUS.CONFIRMED:
                return "Đã xác nhận";
            case SCHEDULE_STATUS.COMPLETED:
                return "Đã hoàn thành";
            default:
                return "Không xác định";
        }
    };

    const columns = [
        {
            title: (
                <Checkbox
                    checked={
                        selectedItems.length > 0 &&
                        selectedItems.length === schedules.length
                    }
                    indeterminate={
                        selectedItems.length > 0 &&
                        selectedItems.length < schedules.length
                    }
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedItems(schedules.map((item) => item.id));
                        } else {
                            setSelectedItems([]);
                        }
                    }}
                />
            ),
            key: "selection",
            width: 50,
            render: (_, record) => (
                <Checkbox
                    checked={selectedItems.includes(record.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedItems([...selectedItems, record.id]);
                        } else {
                            setSelectedItems(
                                selectedItems.filter((id) => id !== record.id)
                            );
                        }
                    }}
                />
            ),
        },
        {
            title: "Nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            sorter: true,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                        {record.roleName || "Chưa có chức vụ"}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Chức vụ",
            dataIndex: "roleName",
            key: "roleName",
            filters: Array.from(new Set(schedules.map((s) => s.roleName))).map(
                (name) => ({
                    text: name || "Chưa có chức vụ",
                    value: name || "Chưa có chức vụ",
                })
            ),
            onFilter: (value, record) => record.roleName === value,
            render: (text) => (
                <Tag color="geekblue">{text || "Chưa có chức vụ"}</Tag>
            ),
        },
        {
            title: "Bộ phận",
            dataIndex: "department",
            key: "department",
            filters: departments.map((d) => ({ text: d.name, value: d.name })),
            onFilter: (value, record) => record.department === value,
            render: (dept, record) => {
                const colors = {
                    "Lễ tân": "green",
                    "Nhà hàng": "purple",
                    "Buồng phòng": "orange",
                    "Chưa phân loại": "gray",
                };
                return <Tag color={colors[dept] || "blue"}>{dept}</Tag>;
            },
        },
        {
            title: "Ca làm việc",
            dataIndex: "shiftName",
            key: "shiftName",
            filters: Array.from(new Set(schedules.map((s) => s.shiftName))).map(
                (name) => ({ text: name, value: name })
            ),
            onFilter: (value, record) => record.shiftName === value,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <span>{text}</span>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                        {record.shiftTime}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Ngày",
            dataIndex: "date",
            key: "date",
            sorter: true,
            defaultSortOrder: "descend",
            render: (date) => <Text>{dayjs(date).format("DD/MM/YYYY")}</Text>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            filters: [
                { text: "Chờ xác nhận", value: SCHEDULE_STATUS.PENDING },
                { text: "Đã xác nhận", value: SCHEDULE_STATUS.CONFIRMED },
                { text: "Đã hoàn thành", value: SCHEDULE_STATUS.COMPLETED },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status, record) => {
                return (
                    <Select
                        value={status}
                        size="small"
                        style={{ width: 130 }}
                        onChange={(value) =>
                            handleStatusChange(record.id, value)
                        }
                        dropdownMatchSelectWidth={false}
                    >
                        <Select.Option value={SCHEDULE_STATUS.PENDING}>
                            <Badge status="warning" text="Chờ xác nhận" />
                        </Select.Option>
                        <Select.Option value={SCHEDULE_STATUS.CONFIRMED}>
                            <Badge status="success" text="Đã xác nhận" />
                        </Select.Option>
                        <Select.Option value={SCHEDULE_STATUS.COMPLETED}>
                            <Badge status="default" text="Đã hoàn thành" />
                        </Select.Option>
                    </Select>
                );
            },
        },
        {
            title: "Thao tác",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item
                                key="1"
                                icon={<CheckOutlined />}
                                onClick={() =>
                                    handleStatusChange(
                                        record.id,
                                        SCHEDULE_STATUS.CONFIRMED
                                    )
                                }
                            >
                                Xác nhận
                            </Menu.Item>
                            <Menu.Item
                                key="2"
                                icon={<CloseOutlined />}
                                onClick={() =>
                                    handleStatusChange(
                                        record.id,
                                        SCHEDULE_STATUS.COMPLETED
                                    )
                                }
                            >
                                Đánh dấu hoàn thành
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                key="3"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => handleDeleteSchedule(record.id)}
                            >
                                Xóa
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={["click"]}
                >
                    <Button type="text" icon={<EllipsisOutlined />} />
                </Dropdown>
            ),
        },
    ];

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleSubmit = async (values) => {
        try {
            // Chuyển đổi dữ liệu từ frontend sang định dạng backend
            const scheduleData = {
                employee_id: values.employeeId,
                shift_id: values.shiftId,
                date: values.date,
                status: SCHEDULE_STATUS.PENDING,
            };

            // Gọi API để tạo lịch làm việc mới
            const response = await createEmployeeShift(scheduleData);

            // Tải lại danh sách lịch làm việc sau khi tạo thành công
            fetchSchedules();

            message.success("Phân công ca làm việc thành công");
            setIsModalVisible(false);
        } catch (error) {
            console.error("Lỗi khi tạo lịch làm việc:", error);
            message.error("Không thể phân công ca làm việc");
        }
    };

    // Hàm để nhóm lịch làm việc theo ca và nhân viên
    const groupSchedulesByShift = (scheduleList) => {
        const groups = {};
        scheduleList.forEach((item) => {
            const key = item.shiftId;
            if (!groups[key]) {
                groups[key] = {
                    shiftName: item.shiftName,
                    shiftTime: item.shiftTime,
                    employees: [],
                };
            }
            groups[key].employees.push({
                id: item.id,
                name: item.employeeName,
                department: item.department,
                role: item.roleName,
                status: item.status,
            });
        });
        return Object.values(groups);
    };

    const dateCellRender = (date) => {
        const dateStr = date.format("YYYY-MM-DD");
        const listData = schedules.filter((s) => s.date === dateStr);

        if (listData.length === 0) return null;

        const groupedData = groupSchedulesByShift(listData);

        return (
            <div style={{ maxHeight: "100%", overflow: "hidden" }}>
                {groupedData.map((group, index) => (
                    <Popover
                        key={index}
                        title={
                            <Space>
                                <ClockCircleOutlined />
                                <span>
                                    {group.shiftName} ({group.shiftTime})
                                </span>
                            </Space>
                        }
                        content={
                            <List
                                size="small"
                                dataSource={group.employees}
                                renderItem={(emp) => (
                                    <List.Item>
                                        <Space align="center" wrap={false}>
                                            <Badge
                                                status={
                                                    emp.status ===
                                                    SCHEDULE_STATUS.CONFIRMED
                                                        ? "success"
                                                        : emp.status ===
                                                          SCHEDULE_STATUS.COMPLETED
                                                        ? "default"
                                                        : "warning"
                                                }
                                            />
                                            <div>
                                                <div>{emp.name}</div>
                                                <div
                                                    style={{
                                                        fontSize: "11px",
                                                        color: "#888",
                                                    }}
                                                >
                                                    <Tag
                                                        color="geekblue"
                                                        style={{
                                                            fontSize: "11px",
                                                            padding: "0 4px",
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {emp.role ||
                                                            "Chưa có chức vụ"}
                                                    </Tag>
                                                    {" - "}
                                                    <Tag
                                                        color="blue"
                                                        style={{
                                                            fontSize: "11px",
                                                            padding: "0 4px",
                                                            margin: 0,
                                                        }}
                                                    >
                                                        {emp.department}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        }
                        placement="right"
                    >
                        <div
                            style={{
                                backgroundColor: "#f0f5ff",
                                borderLeft: "3px solid #1890ff",
                                borderRadius: "3px",
                                padding: "2px 6px",
                                marginBottom: "2px",
                                fontSize: "11px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {group.shiftName}: {group.employees.length} nhân
                            viên
                        </div>
                    </Popover>
                ))}
            </div>
        );
    };

    const getFilteredSchedules = () => {
        if (!searchText) return schedules;

        return schedules.filter(
            (item) =>
                item.employeeName
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                item.department
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                item.shiftName
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                item.schedule_code
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
        );
    };

    const filteredSchedules = getFilteredSchedules();

    const bulkActionMenu = (
        <Menu>
            <Menu.Item
                key="confirm"
                icon={<CheckOutlined />}
                onClick={() =>
                    handleBulkStatusUpdate(SCHEDULE_STATUS.CONFIRMED)
                }
            >
                Xác nhận tất cả
            </Menu.Item>
            <Menu.Item
                key="complete"
                icon={<CloseOutlined />}
                onClick={() =>
                    handleBulkStatusUpdate(SCHEDULE_STATUS.COMPLETED)
                }
            >
                Đánh dấu hoàn thành tất cả
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={handleBulkDelete}
            >
                Xóa tất cả
            </Menu.Item>
        </Menu>
    );

    return (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
            <Row>
                <Col span={24}>
                    <Card>
                        <Calendar
                            fullscreen={false}
                            onSelect={handleDateSelect}
                            dateCellRender={dateCellRender}
                            value={dateRange[0]}
                        />
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col span={24}>
                    <Card>
                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="middle"
                        >
                            <Row
                                justify="space-between"
                                align="middle"
                                gutter={[8, 8]}
                            >
                                <Col>
                                    <Title level={5} style={{ margin: 0 }}>
                                        Danh sách ca làm việc
                                    </Title>
                                </Col>
                                <Col>
                                    <Space>
                                        <Tooltip title="Làm mới">
                                            <Button
                                                icon={<SyncOutlined />}
                                                onClick={fetchSchedules}
                                            />
                                        </Tooltip>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() =>
                                                setIsModalVisible(true)
                                            }
                                        >
                                            Phân công
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>

                            <Row gutter={[16, 16]}>
                                <Col span={8}>
                                    <RangePicker
                                        value={dateRange}
                                        onChange={handleDateRangeChange}
                                        format="DD/MM/YYYY"
                                        style={{ width: "100%" }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Select
                                        value={selectedDepartment}
                                        onChange={setSelectedDepartment}
                                        style={{ width: "100%" }}
                                        placeholder="Chọn phòng ban"
                                    >
                                        <Select.Option value="all">
                                            Tất cả bộ phận
                                        </Select.Option>
                                        {departments.map((dept) => (
                                            <Select.Option
                                                key={dept.id}
                                                value={String(dept.id)}
                                            >
                                                {dept.name}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col span={8}>
                                    <Input
                                        placeholder="Tìm kiếm theo tên, phòng ban, ca làm việc..."
                                        prefix={<SearchOutlined />}
                                        value={searchText}
                                        onChange={(e) =>
                                            setSearchText(e.target.value)
                                        }
                                        allowClear
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col span={24} style={{ textAlign: "right" }}>
                                    {selectedItems.length > 0 && (
                                        <Dropdown
                                            overlay={bulkActionMenu}
                                            placement="bottomRight"
                                        >
                                            <Button type="primary">
                                                Thao tác hàng loạt{" "}
                                                <EllipsisOutlined />
                                            </Button>
                                        </Dropdown>
                                    )}
                                </Col>
                            </Row>

                            <Table
                                columns={columns}
                                dataSource={filteredSchedules}
                                rowKey="id"
                                size="small"
                                pagination={tableParams.pagination}
                                loading={loading}
                                onChange={handleTableChange}
                                rowClassName={(record) =>
                                    selectedItems.includes(record.id)
                                        ? "ant-table-row-selected"
                                        : ""
                                }
                                scroll={{ x: 1000, y: 500 }}
                                summary={(pageData) => {
                                    if (pageData.length === 0) return null;

                                    const statusCounts = pageData.reduce(
                                        (acc, item) => {
                                            acc[item.status] =
                                                (acc[item.status] || 0) + 1;
                                            return acc;
                                        },
                                        {}
                                    );

                                    return (
                                        <Table.Summary fixed>
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell
                                                    index={0}
                                                    colSpan={4}
                                                >
                                                    <Text strong>
                                                        Tổng lịch làm việc:{" "}
                                                        {pageData.length}
                                                    </Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell
                                                    index={4}
                                                    colSpan={3}
                                                >
                                                    <Space
                                                        split={
                                                            <Divider type="vertical" />
                                                        }
                                                    >
                                                        {Object.entries(
                                                            statusCounts
                                                        ).map(
                                                            ([
                                                                status,
                                                                count,
                                                            ]) => (
                                                                <Space
                                                                    key={status}
                                                                >
                                                                    <Badge
                                                                        status={getStatusTagColor(
                                                                            status
                                                                        )}
                                                                    />
                                                                    <Text type="secondary">
                                                                        {getStatusText(
                                                                            status
                                                                        )}
                                                                        :{" "}
                                                                        {count}
                                                                    </Text>
                                                                </Space>
                                                            )
                                                        )}
                                                    </Space>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    );
                                }}
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>

            <ScheduleForm
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                selectedDate={selectedDate}
            />
        </Space>
    );
}
