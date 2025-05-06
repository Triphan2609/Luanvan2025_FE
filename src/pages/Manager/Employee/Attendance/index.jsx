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
    Drawer,
    Descriptions,
    Switch,
    Checkbox,
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
    InfoCircleOutlined,
    BuildOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getDepartments } from "../../../../api/departmentsApi";
import { getEmployees } from "../../../../api/employeesApi";
import {
    createAttendance,
    getAttendances,
    updateAttendanceStatus,
    deleteAttendance,
    updateAttendance,
} from "../../../../api/attendanceApi";
import { getBranches } from "../../../../api/branchesApi";
import utc from "dayjs/plugin/utc";
import { getEmployeeShifts } from "../../../../api/employeeShiftsApi";
import AttendanceDetailDrawer from "./AttendanceDetailDrawer";

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
    const [branches, setBranches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [filterForm] = Form.useForm();
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [activeTab, setActiveTab] = useState("all");
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);
    const [employeeShifts, setEmployeeShifts] = useState([]);
    const [attendanceType, setAttendanceType] = useState(AttendanceType.NORMAL);
    const [showNotes, setShowNotes] = useState(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);

    // Statistics
    const [statistics, setStatistics] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
        late: 0,
        earlyLeave: 0,
        onLeave: 0,
        byDepartment: {},
        byBranch: {},
    });

    // State để lưu các trạng thái đặc biệt đã phát hiện
    const [detectedStatuses, setDetectedStatuses] = useState({
        late: false,
        earlyLeave: false,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        ignored: false,
        isSpecialShift: false,
    });

    // Initial data load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptResponse, employeeResponse, branchResponse] =
                    await Promise.all([
                        getDepartments(),
                        getEmployees(),
                        getBranches(),
                    ]);

                setDepartments(deptResponse);
                setBranches(branchResponse);

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
    }, [dateRange, activeTab, selectedBranch]);

    // Update the function to fetch shifts for employee
    useEffect(() => {
        const fetchEmployeeShifts = async () => {
            const employeeId = addForm.getFieldValue("employee_id");
            const date = addForm.getFieldValue("date");
            const branchId = addForm.getFieldValue("branch_id");

            if (employeeId && date) {
                try {
                    const formattedDate = date.format("YYYY-MM-DD");
                    const response = await getEmployeeShifts({
                        employeeId: employeeId,
                        date: formattedDate,
                        branch_id: branchId,
                    });
                    setEmployeeShifts(response);
                } catch (error) {
                    console.error("Error fetching employee shifts:", error);
                    setEmployeeShifts([]);
                }
            }
        };

        fetchEmployeeShifts();
    }, [
        addForm.getFieldValue("employee_id"),
        addForm.getFieldValue("date"),
        addForm.getFieldValue("branch_id"),
    ]);

    const fetchAttendances = async () => {
        try {
            setLoading(true);
            const filterValues = filterForm.getFieldsValue();
            const start = dateRange[0].format("YYYY-MM-DD");
            const end = dateRange[1].format("YYYY-MM-DD");

            // Build filter object
            const filter = {
                start_date: start,
                end_date: end,
            };

            // Add status filter based on active tab
            if (activeTab !== "all") {
                filter.status = activeTab;
            }

            // Add department filter if selected
            if (filterValues.department_id) {
                filter.department_id = filterValues.department_id;
            }

            // Add branch filter if selected
            if (selectedBranch) {
                filter.branch_id = selectedBranch;
            }

            // Add employee filter if selected
            if (filterValues.employee_id) {
                filter.employee_id = filterValues.employee_id;
            }

            // Add search filter if entered
            if (filterValues.search) {
                filter.search = filterValues.search;
            }

            // Add adjustment filter
            if (filterValues.is_adjustment !== undefined) {
                filter.is_adjustment = filterValues.is_adjustment;
            }

            // Add type filter
            if (filterValues.type) {
                filter.type = filterValues.type;
            }

            // Get attendances with filters
            const attendanceData = await getAttendances(filter);

            // Update attendances
            setAttendances(attendanceData || []);

            // Calculate statistics
            calculateStatistics(attendanceData || []);
        } catch (error) {
            console.error("Error fetching attendances:", error);
            message.error("Không thể tải dữ liệu chấm công");
            setAttendances([]);
        } finally {
            setLoading(false);
        }
    };

    // Function to calculate statistics from attendance data
    const calculateStatistics = (data) => {
        if (!Array.isArray(data)) {
            console.error("Expected array for attendance data, got:", data);
            return;
        }

        // Initialize counters
        const stats = {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: data.length,
            late: 0,
            earlyLeave: 0,
            onLeave: 0,
            byDepartment: {},
            byBranch: {},
        };

        // Process each attendance record
        data.forEach((item) => {
            // Count by status
            if (item.status === AttendanceStatus.PENDING) stats.pending++;
            if (item.status === AttendanceStatus.APPROVED) stats.approved++;
            if (item.status === AttendanceStatus.REJECTED) stats.rejected++;

            // Count special statuses
            const notes = item.notes || "";
            if (notes.includes("late")) stats.late++;
            if (notes.includes("early_leave")) stats.earlyLeave++;
            if (notes.includes("on_leave")) stats.onLeave++;

            // Group by department
            const departmentName = item.employee?.department?.name || "Khác";
            stats.byDepartment[departmentName] =
                (stats.byDepartment[departmentName] || 0) + 1;

            // Group by branch
            const branchName = item.employee?.branch?.name || "Khác";
            stats.byBranch[branchName] = (stats.byBranch[branchName] || 0) + 1;
        });

        // Update statistics state
        setStatistics(stats);
    };

    const handleAddAttendance = async () => {
        try {
            const values = await addForm.validateFields();
            setLoading(true);

            // Kiểm tra đi trễ/về sớm nếu có ca làm việc được chọn
            let notes = values.notes || "";
            const shiftId = values.employee_shift_id;

            if (shiftId && employeeShifts.length > 0) {
                const selectedShift = employeeShifts.find(
                    (s) => s.id === shiftId
                );

                if (selectedShift && selectedShift.shift) {
                    // Kiểm tra đi trễ
                    if (values.check_in) {
                        const shiftStartTime = selectedShift.shift.start_time;
                        const checkInTime = values.check_in.format("HH:mm");

                        // Chuyển đổi thời gian sang phút để so sánh
                        const [shiftStartHour, shiftStartMinute] =
                            shiftStartTime.split(":").map(Number);
                        const [checkInHour, checkInMinute] = checkInTime
                            .split(":")
                            .map(Number);

                        const shiftStartMinutes =
                            shiftStartHour * 60 + shiftStartMinute;
                        const checkInMinutes = checkInHour * 60 + checkInMinute;

                        // Dung sai 10 phút
                        const toleranceMinutes = 10;

                        if (
                            checkInMinutes >
                            shiftStartMinutes + toleranceMinutes
                        ) {
                            // Nhân viên đi trễ
                            if (notes) {
                                if (!notes.includes("late")) {
                                    notes += ", late";
                                }
                            } else {
                                notes = "late";
                            }

                            message.warning(
                                `Nhân viên đi trễ ${
                                    checkInMinutes - shiftStartMinutes
                                } phút`
                            );
                        }
                    }

                    // Kiểm tra về sớm
                    if (values.check_out) {
                        const shiftEndTime = selectedShift.shift.end_time;
                        const checkOutTime = values.check_out.format("HH:mm");

                        // Chuyển đổi thời gian sang phút
                        const [shiftEndHour, shiftEndMinute] = shiftEndTime
                            .split(":")
                            .map(Number);
                        const [checkOutHour, checkOutMinute] = checkOutTime
                            .split(":")
                            .map(Number);

                        const shiftEndMinutes =
                            shiftEndHour * 60 + shiftEndMinute;
                        const checkOutMinutes =
                            checkOutHour * 60 + checkOutMinute;

                        // Dung sai 10 phút
                        const toleranceMinutes = 10;

                        if (
                            checkOutMinutes <
                            shiftEndMinutes - toleranceMinutes
                        ) {
                            // Nhân viên về sớm
                            if (notes) {
                                if (!notes.includes("early_leave")) {
                                    notes += ", early_leave";
                                }
                            } else {
                                notes = "early_leave";
                            }

                            message.warning(
                                `Nhân viên về sớm ${
                                    shiftEndMinutes - checkOutMinutes
                                } phút`
                            );
                        }
                    }
                }
            }

            const payload = {
                employee_id: values.employee_id,
                date: values.date.format("YYYY-MM-DD"),
                type: values.type || AttendanceType.NORMAL,
                notes: notes, // Sử dụng notes đã được cập nhật
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
            // Also update the form field
            filterForm.setFieldsValue({ date_range: dates });
            // Refresh data with the new date range
            fetchAttendances();
        }
    };

    const handleSearch = () => {
        fetchAttendances();
    };

    const handleReset = () => {
        // Reset to current month date range
        const defaultDateRange = [
            dayjs().startOf("month"),
            dayjs().endOf("month"),
        ];
        setDateRange(defaultDateRange);

        // Reset form fields including the date_range
        filterForm.resetFields();
        filterForm.setFieldsValue({ date_range: defaultDateRange });

        // Fetch attendances with reset filters
        fetchAttendances();
    };

    // Thêm hàm hiển thị drawer
    const showDrawer = (record) => {
        setSelectedRecord(record);
        setDrawerVisible(true);
    };

    // Hàm đóng drawer
    const closeDrawer = () => {
        setDrawerVisible(false);
        setSelectedRecord(null);
    };

    // Add a function to filter employees by branch
    const getFilteredEmployees = () => {
        if (!selectedBranch) {
            return [];
        }
        return employees.filter(
            (emp) => emp.branch && emp.branch.id === selectedBranch
        );
    };

    // Add a function to load departments by branch
    const loadDepartmentsByBranch = async (branchId) => {
        if (!branchId) return;

        try {
            setLoading(true);
            const deptData = await getDepartmentsByBranch(branchId);
            setDepartments(deptData || []);
        } catch (error) {
            console.error("Error loading departments by branch:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle branch change in filter
    const handleBranchChange = (value) => {
        setSelectedBranch(value);

        // Reset department selection, employee selection và dữ liệu khi thay đổi chi nhánh
        filterForm.setFieldsValue({
            department_id: undefined,
            employee_id: undefined,
        });

        // If a branch is selected, load its departments
        if (value) {
            loadDepartmentsByBranch(value);
        } else {
            // If no branch selected, load all departments
            getDepartments().then((deptData) => setDepartments(deptData || []));
        }

        // Refresh data with the new filters
        fetchAttendances();
    };

    // Effect to handle branch change in add form
    const handleAddFormBranchChange = (value) => {
        addForm.setFieldsValue({
            employee_id: undefined,
            employee_shift_id: undefined,
        });
        setSelectedBranch(value);
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);

        // Chuẩn bị dữ liệu cho form
        const initialValues = {
            employee_id: record.employee?.id,
            branch_id: record.employee?.branch?.id,
            date: dayjs(record.date),
            employee_shift_id: record.employee_shift_id,
            check_in: record.check_in
                ? dayjs(
                      record.date + " " + record.check_in,
                      "YYYY-MM-DD HH:mm:ss"
                  )
                : null,
            check_out: record.check_out
                ? dayjs(
                      record.date + " " + record.check_out,
                      "YYYY-MM-DD HH:mm:ss"
                  )
                : null,
            type: record.type || AttendanceType.NORMAL,
            notes: record.notes,
        };

        // Reset form và cập nhật giá trị
        editForm.resetFields();
        editForm.setFieldsValue(initialValues);

        // Tải ca làm việc của nhân viên
        const fetchShifts = async () => {
            try {
                const formattedDate = dayjs(record.date).format("YYYY-MM-DD");
                const response = await getEmployeeShifts({
                    employeeId: record.employee?.id,
                    date: formattedDate,
                });
                setEmployeeShifts(response);
            } catch (error) {
                console.error("Error fetching employee shifts:", error);
                setEmployeeShifts([]);
            }
        };

        fetchShifts();

        // Mở modal
        setEditModalVisible(true);
    };

    const handleUpdateAttendance = async () => {
        try {
            const values = await editForm.validateFields();
            setLoading(true);

            // Kiểm tra đi trễ/về sớm nếu có ca làm việc được chọn
            let notes = values.notes || "";
            // Xóa thông tin trạng thái đặc biệt cũ từ ghi chú
            notes = notes
                .replace(/,?\s*late/g, "")
                .replace(/,?\s*early_leave/g, "")
                .trim();

            const shiftId = values.employee_shift_id;

            if (shiftId && employeeShifts.length > 0) {
                const selectedShift = employeeShifts.find(
                    (s) => s.id === shiftId
                );

                if (selectedShift && selectedShift.shift) {
                    // Kiểm tra đi trễ
                    if (values.check_in) {
                        const shiftStartTime = selectedShift.shift.start_time;
                        const checkInTime = values.check_in.format("HH:mm");

                        // Chuyển đổi thời gian sang phút để so sánh
                        const [shiftStartHour, shiftStartMinute] =
                            shiftStartTime.split(":").map(Number);
                        const [checkInHour, checkInMinute] = checkInTime
                            .split(":")
                            .map(Number);

                        const shiftStartMinutes =
                            shiftStartHour * 60 + shiftStartMinute;
                        const checkInMinutes = checkInHour * 60 + checkInMinute;

                        // Dung sai 10 phút
                        const toleranceMinutes = 10;

                        if (
                            checkInMinutes >
                            shiftStartMinutes + toleranceMinutes
                        ) {
                            // Nhân viên đi trễ
                            if (notes) {
                                notes += ", late";
                            } else {
                                notes = "late";
                            }

                            message.warning(
                                `Nhân viên đi trễ ${
                                    checkInMinutes - shiftStartMinutes
                                } phút`
                            );
                        }
                    }

                    // Kiểm tra về sớm
                    if (values.check_out) {
                        const shiftEndTime = selectedShift.shift.end_time;
                        const checkOutTime = values.check_out.format("HH:mm");

                        // Chuyển đổi thời gian sang phút
                        const [shiftEndHour, shiftEndMinute] = shiftEndTime
                            .split(":")
                            .map(Number);
                        const [checkOutHour, checkOutMinute] = checkOutTime
                            .split(":")
                            .map(Number);

                        const shiftEndMinutes =
                            shiftEndHour * 60 + shiftEndMinute;
                        const checkOutMinutes =
                            checkOutHour * 60 + checkOutMinute;

                        // Xử lý đặc biệt cho ca đêm/ca qua đêm
                        const isNightShift =
                            values.type === AttendanceType.NIGHT_SHIFT ||
                            selectedShift.shift.end_time === "00:00:00" ||
                            selectedShift.shift.start_time === "00:00:00" ||
                            selectedShift.shift.start_time >
                                selectedShift.shift.end_time;

                        // Dung sai 10 phút
                        const toleranceMinutes = 10;

                        // Chỉ xét về sớm nếu không phải ca đêm hoặc ca đặc biệt
                        if (
                            !isNightShift &&
                            checkOutMinutes < shiftEndMinutes - toleranceMinutes
                        ) {
                            // Nhân viên về sớm
                            if (notes) {
                                notes += ", early_leave";
                            } else {
                                notes = "early_leave";
                            }

                            message.warning(
                                `Nhân viên về sớm ${
                                    shiftEndMinutes - checkOutMinutes
                                } phút`
                            );
                        }
                    }
                }
            }

            const payload = {
                employee_id: values.employee_id,
                date: values.date.format("YYYY-MM-DD"),
                type: values.type || AttendanceType.NORMAL,
                notes: notes, // Sử dụng notes đã được cập nhật với trạng thái đặc biệt
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

            // Gọi API cập nhật
            await updateAttendance(currentRecord.id, payload);

            message.success("Cập nhật chấm công thành công");
            setEditModalVisible(false);
            editForm.resetFields();
            setCurrentRecord(null);
            fetchAttendances();
        } catch (error) {
            console.error("Error updating attendance:", error);
            message.error(
                "Không thể cập nhật chấm công: " +
                    (error.response?.data?.message || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Mã NV",
            dataIndex: ["employee", "employee_code"],
            key: "employee_code",
            width: 80,
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
            title: "Check-in/out",
            key: "check_time",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.check_in || "-"}</Text>
                    <Text>{record.check_out || "-"}</Text>
                </Space>
            ),
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
            title: "Ghi chú",
            dataIndex: "notes",
            key: "notes",
            render: (notes) => {
                const lateTags = [];
                const earlyLeaveTags = [];
                const otherNotes = [];

                if (notes) {
                    if (notes.includes("late")) {
                        lateTags.push(
                            <Tag color="orange" key="late">
                                Đi trễ
                            </Tag>
                        );
                    }

                    if (notes.includes("early_leave")) {
                        earlyLeaveTags.push(
                            <Tag color="orange" key="early_leave">
                                Về sớm
                            </Tag>
                        );
                    }

                    // Xóa trạng thái đặc biệt để lấy ghi chú thực sự
                    let realNotes = notes
                        .replace(/,?\s*late/g, "")
                        .replace(/,?\s*early_leave/g, "")
                        .trim();

                    if (realNotes) {
                        otherNotes.push(
                            <span key="notes" style={{ marginLeft: 8 }}>
                                {realNotes}
                            </span>
                        );
                    }
                }

                return (
                    <Space>
                        {lateTags}
                        {earlyLeaveTags}
                        {otherNotes}
                    </Space>
                );
            },
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
            title: "Chi tiết",
            key: "detail",
            width: 80,
            render: (_, record) => (
                <Button type="link" onClick={() => showDrawer(record)}>
                    Xem
                </Button>
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
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: "#1890ff" }} />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
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
            <Col span={6} style={{ marginTop: "16px" }}>
                <Card hoverable>
                    <Statistic
                        title="Đi trễ"
                        value={statistics.late}
                        valueStyle={{ color: "#fa8c16" }}
                        prefix={<HistoryOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6} style={{ marginTop: "16px" }}>
                <Card hoverable>
                    <Statistic
                        title="Về sớm"
                        value={statistics.earlyLeave}
                        valueStyle={{ color: "#faad14" }}
                        prefix={<HistoryOutlined />}
                    />
                </Card>
            </Col>
            <Col span={6} style={{ marginTop: "16px" }}>
                <Card hoverable>
                    <Statistic
                        title="Nghỉ phép"
                        value={statistics.onLeave}
                        valueStyle={{ color: "#1890ff" }}
                        prefix={<CalendarOutlined />}
                    />
                </Card>
            </Col>
            <Col span={24} style={{ marginTop: "16px" }}>
                <Card
                    title={
                        <div>
                            <TeamOutlined /> Thống kê theo phòng ban
                        </div>
                    }
                    hoverable
                >
                    <Row gutter={16}>
                        {Object.entries(statistics.byDepartment).map(
                            ([dept, count]) => (
                                <Col
                                    span={6}
                                    key={dept}
                                    style={{ marginBottom: "8px" }}
                                >
                                    <Card bordered={false}>
                                        <Statistic title={dept} value={count} />
                                    </Card>
                                </Col>
                            )
                        )}
                    </Row>
                </Card>
            </Col>
            <Col span={24} style={{ marginTop: "16px" }}>
                <Card
                    title={
                        <div>
                            <BuildOutlined /> Thống kê theo chi nhánh
                        </div>
                    }
                    hoverable
                >
                    <Row gutter={16}>
                        {Object.entries(statistics.byBranch || {}).map(
                            ([branch, count]) => (
                                <Col
                                    span={6}
                                    key={branch}
                                    style={{ marginBottom: "8px" }}
                                >
                                    <Card bordered={false}>
                                        <Statistic
                                            title={branch}
                                            value={count}
                                        />
                                    </Card>
                                </Col>
                            )
                        )}
                    </Row>
                </Card>
            </Col>
        </Row>
    );

    // Thêm hàm để bỏ qua cảnh báo
    const ignoreWarning = (type) => {
        if (type === "add") {
            setDetectedStatuses((prev) => ({ ...prev, ignored: true }));
            // Xóa các thẻ "late" và "early_leave" khỏi ghi chú
            const currentNotes = addForm.getFieldValue("notes") || "";
            const cleanNotes = currentNotes
                .replace(/,?\s*late/g, "")
                .replace(/,?\s*early_leave/g, "")
                .trim();
            addForm.setFieldsValue({ notes: cleanNotes });
        }
    };

    // Thêm một hàm kiểm tra liệu ca làm việc có phải ca đặc biệt hay không
    const isSpecialShift = (shift) => {
        if (!shift || !shift.shift) return false;

        return (
            shift.shift.end_time === "00:00:00" ||
            shift.shift.start_time === "00:00:00" ||
            shift.shift.start_time > shift.shift.end_time
        );
    };

    // Cập nhật phần phát hiện đi trễ/về sớm trong onAddFormValuesChange
    const onAddFormValuesChange = (changedValues) => {
        // Reset trạng thái ignored khi có thay đổi mới
        if (
            changedValues.employee_shift_id ||
            changedValues.check_in ||
            changedValues.check_out ||
            changedValues.type
        ) {
            setDetectedStatuses((prev) => ({ ...prev, ignored: false }));
        }

        // When employee or date changes, fetch shifts
        if (changedValues.employee_id || changedValues.date) {
            const employeeId = addForm.getFieldValue("employee_id");
            const date = addForm.getFieldValue("date");

            if (employeeId && date) {
                const fetchShifts = async () => {
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
                };
                fetchShifts();
            }
        }

        // Kiểm tra đi trễ/về sớm khi thay đổi ca làm việc hoặc thời gian checkin/checkout
        if (
            changedValues.employee_shift_id ||
            changedValues.check_in ||
            changedValues.check_out ||
            changedValues.type
        ) {
            const shiftId = addForm.getFieldValue("employee_shift_id");
            const checkIn = addForm.getFieldValue("check_in");
            const checkOut = addForm.getFieldValue("check_out");
            const attendanceType = addForm.getFieldValue("type");

            const newDetectedStatuses = {
                late: false,
                earlyLeave: false,
                lateMinutes: 0,
                earlyLeaveMinutes: 0,
                ignored: false,
                isSpecialShift: false,
            };

            if (shiftId && employeeShifts.length > 0) {
                const selectedShift = employeeShifts.find(
                    (s) => s.id === shiftId
                );

                if (selectedShift && selectedShift.shift) {
                    // Kiểm tra xem có phải ca đặc biệt không
                    newDetectedStatuses.isSpecialShift =
                        attendanceType === AttendanceType.NIGHT_SHIFT ||
                        isSpecialShift(selectedShift);

                    // Kiểm tra đi trễ
                    if (checkIn) {
                        const shiftStartTime = selectedShift.shift.start_time;
                        const checkInTime = checkIn.format("HH:mm");

                        // Chuyển đổi thời gian sang phút để so sánh
                        const [shiftStartHour, shiftStartMinute] =
                            shiftStartTime.split(":").map(Number);
                        const [checkInHour, checkInMinute] = checkInTime
                            .split(":")
                            .map(Number);

                        const shiftStartMinutes =
                            shiftStartHour * 60 + shiftStartMinute;
                        const checkInMinutes = checkInHour * 60 + checkInMinute;

                        // Dung sai 10 phút
                        const toleranceMinutes = 10;

                        if (
                            checkInMinutes >
                            shiftStartMinutes + toleranceMinutes
                        ) {
                            newDetectedStatuses.late = true;
                            newDetectedStatuses.lateMinutes =
                                checkInMinutes - shiftStartMinutes;
                        }
                    }

                    // Kiểm tra về sớm
                    if (checkOut) {
                        const shiftEndTime = selectedShift.shift.end_time;
                        const checkOutTime = checkOut.format("HH:mm");

                        // Chuyển đổi thời gian sang phút
                        const [shiftEndHour, shiftEndMinute] = shiftEndTime
                            .split(":")
                            .map(Number);
                        const [checkOutHour, checkOutMinute] = checkOutTime
                            .split(":")
                            .map(Number);

                        const shiftEndMinutes =
                            shiftEndHour * 60 + shiftEndMinute;
                        const checkOutMinutes =
                            checkOutHour * 60 + checkOutMinute;

                        // Xử lý đặc biệt cho trường hợp ca kết thúc vào 00:00
                        const isEndAtMidnight =
                            shiftEndTime === "00:00" || shiftEndMinutes === 0;

                        // Dung sai 10 phút
                        const toleranceMinutes = 10;

                        if (isEndAtMidnight) {
                            // Nếu ca kết thúc lúc 00:00 và checkout trước 00:00
                            if (checkOutMinutes < 24 * 60 - toleranceMinutes) {
                                newDetectedStatuses.earlyLeave = true;
                                newDetectedStatuses.earlyLeaveMinutes =
                                    24 * 60 - checkOutMinutes;
                            }
                        } else if (
                            !newDetectedStatuses.isSpecialShift && // Không phải ca đặc biệt
                            checkOutMinutes < shiftEndMinutes - toleranceMinutes
                        ) {
                            newDetectedStatuses.earlyLeave = true;
                            newDetectedStatuses.earlyLeaveMinutes =
                                shiftEndMinutes - checkOutMinutes;
                        }
                    }
                }
            }

            setDetectedStatuses(newDetectedStatuses);

            // Tự động cập nhật ghi chú nếu phát hiện trạng thái đặc biệt
            let currentNotes = addForm.getFieldValue("notes") || "";

            // Xóa các trạng thái đặc biệt khỏi ghi chú hiện tại nếu có
            currentNotes = currentNotes
                .replace(/,?\s*late/g, "")
                .replace(/,?\s*early_leave/g, "")
                .trim();

            // Thêm trạng thái đặc biệt mới
            const specialStatuses = [];
            if (newDetectedStatuses.late) specialStatuses.push("late");
            if (newDetectedStatuses.earlyLeave)
                specialStatuses.push("early_leave");

            if (specialStatuses.length > 0) {
                currentNotes = currentNotes
                    ? `${currentNotes}, ${specialStatuses.join(", ")}`
                    : specialStatuses.join(", ");
            }

            addForm.setFieldsValue({ notes: currentNotes });
        }
    };

    // Thêm hàm xử lý khi giá trị trong form chỉnh sửa thay đổi
    const onEditFormValuesChange = (changedValues) => {
        // Reset trạng thái ignored khi có thay đổi mới
        if (
            changedValues.employee_shift_id ||
            changedValues.check_in ||
            changedValues.check_out ||
            changedValues.type
        ) {
            setDetectedStatuses((prev) => ({ ...prev, ignored: false }));
        }

        // When employee or date changes, fetch shifts for edit form
        if (
            currentRecord &&
            (changedValues.employee_id || changedValues.date)
        ) {
            const employeeId = editForm.getFieldValue("employee_id");
            const date = editForm.getFieldValue("date");

            if (employeeId && date) {
                const fetchEditShifts = async () => {
                    try {
                        const formattedDate = date.format("YYYY-MM-DD");
                        const response = await getEmployeeShifts({
                            employeeId: employeeId,
                            date: formattedDate,
                        });
                        setEmployeeShifts(response);
                    } catch (error) {
                        console.error(
                            "Error fetching employee shifts for edit:",
                            error
                        );
                        setEmployeeShifts([]);
                    }
                };
                fetchEditShifts();
            }
        }

        // Kiểm tra đi trễ/về sớm khi thay đổi ca làm việc hoặc thời gian checkin/checkout
        if (
            changedValues.employee_shift_id ||
            changedValues.check_in ||
            changedValues.check_out ||
            changedValues.type
        ) {
            const shiftId = editForm.getFieldValue("employee_shift_id");
            const checkIn = editForm.getFieldValue("check_in");
            const checkOut = editForm.getFieldValue("check_out");
            const attendanceType = editForm.getFieldValue("type");

            const newDetectedStatuses = {
                late: false,
                earlyLeave: false,
                lateMinutes: 0,
                earlyLeaveMinutes: 0,
                ignored: false,
                isSpecialShift: false,
            };

            if (shiftId && employeeShifts.length > 0) {
                const selectedShift = employeeShifts.find(
                    (s) => s.id === shiftId
                );

                if (selectedShift && selectedShift.shift) {
                    // Kiểm tra xem có phải ca đặc biệt không
                    newDetectedStatuses.isSpecialShift =
                        attendanceType === AttendanceType.NIGHT_SHIFT ||
                        isSpecialShift(selectedShift);

                    // Kiểm tra đi trễ
                    if (checkIn) {
                        const shiftStartTime = selectedShift.shift.start_time;
                        const checkInTime = checkIn.format("HH:mm");

                        // Chuyển đổi thời gian sang phút để so sánh
                        const [shiftStartHour, shiftStartMinute] =
                            shiftStartTime.split(":").map(Number);
                        const [checkInHour, checkInMinute] = checkInTime
                            .split(":")
                            .map(Number);

                        const shiftStartMinutes =
                            shiftStartHour * 60 + shiftStartMinute;
                        const checkInMinutes = checkInHour * 60 + checkInMinute;

                        // Dung sai 10 phút
                        const toleranceMinutes = 10;

                        if (
                            checkInMinutes >
                            shiftStartMinutes + toleranceMinutes
                        ) {
                            newDetectedStatuses.late = true;
                            newDetectedStatuses.lateMinutes =
                                checkInMinutes - shiftStartMinutes;
                        }
                    }

                    // Kiểm tra về sớm
                    if (checkOut) {
                        const shiftEndTime = selectedShift.shift.end_time;
                        const checkOutTime = checkOut.format("HH:mm");

                        // Chuyển đổi thời gian sang phút
                        const [shiftEndHour, shiftEndMinute] = shiftEndTime
                            .split(":")
                            .map(Number);
                        const [checkOutHour, checkOutMinute] = checkOutTime
                            .split(":")
                            .map(Number);

                        const shiftEndMinutes =
                            shiftEndHour * 60 + shiftEndMinute;
                        const checkOutMinutes =
                            checkOutHour * 60 + checkOutMinute;

                        // Xử lý đặc biệt cho trường hợp ca kết thúc vào 00:00
                        const isEndAtMidnight =
                            shiftEndTime === "00:00" || shiftEndMinutes === 0;

                        // Dung sai 10 phút
                        const toleranceMinutes = 10;

                        if (isEndAtMidnight) {
                            // Nếu ca kết thúc lúc 00:00 và checkout trước 00:00
                            if (checkOutMinutes < 24 * 60 - toleranceMinutes) {
                                newDetectedStatuses.earlyLeave = true;
                                newDetectedStatuses.earlyLeaveMinutes =
                                    24 * 60 - checkOutMinutes;
                            }
                        } else if (
                            !newDetectedStatuses.isSpecialShift && // Không phải ca đặc biệt
                            checkOutMinutes < shiftEndMinutes - toleranceMinutes
                        ) {
                            newDetectedStatuses.earlyLeave = true;
                            newDetectedStatuses.earlyLeaveMinutes =
                                shiftEndMinutes - checkOutMinutes;
                        }
                    }
                }
            }

            setDetectedStatuses(newDetectedStatuses);

            // Tự động cập nhật ghi chú nếu phát hiện trạng thái đặc biệt
            let currentNotes = editForm.getFieldValue("notes") || "";

            // Xóa các trạng thái đặc biệt khỏi ghi chú hiện tại nếu có
            currentNotes = currentNotes
                .replace(/,?\s*late/g, "")
                .replace(/,?\s*early_leave/g, "")
                .trim();

            // Thêm trạng thái đặc biệt mới
            const specialStatuses = [];
            if (newDetectedStatuses.late) specialStatuses.push("late");
            if (newDetectedStatuses.earlyLeave)
                specialStatuses.push("early_leave");

            if (specialStatuses.length > 0) {
                currentNotes = currentNotes
                    ? `${currentNotes}, ${specialStatuses.join(", ")}`
                    : specialStatuses.join(", ");
            }

            editForm.setFieldsValue({ notes: currentNotes });
        }
    };

    // Helper function to filter employees by branch in add form
    const getFilteredEmployeesByBranch = (branchId) => {
        if (!branchId) {
            return [];
        }
        return employees.filter(
            (emp) => emp.branch && emp.branch.id === Number(branchId)
        );
    };

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
                    </Space>
                }
            >
                <Form
                    form={filterForm}
                    layout="vertical"
                    onFinish={handleSearch}
                    initialValues={{
                        is_adjustment: false,
                        date_range: dateRange,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="branch_id" label="Chi nhánh">
                                <Select
                                    allowClear
                                    placeholder="Chọn chi nhánh"
                                    onChange={handleBranchChange}
                                    value={selectedBranch}
                                >
                                    {branches.map((branch) => (
                                        <Option
                                            key={branch.id}
                                            value={branch.id}
                                        >
                                            {branch.name}
                                            {branch.type &&
                                                ` (${
                                                    branch.type === "hotel"
                                                        ? "Khách sạn"
                                                        : branch.type ===
                                                          "restaurant"
                                                        ? "Nhà hàng"
                                                        : branch.type
                                                })`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="department_id" label="Phòng ban">
                                <Select
                                    allowClear
                                    placeholder={
                                        selectedBranch
                                            ? "Chọn phòng ban"
                                            : "Chọn chi nhánh trước"
                                    }
                                    onChange={fetchAttendances}
                                    disabled={!selectedBranch}
                                >
                                    {departments.map((dept) => (
                                        <Option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="employee_id" label="Nhân viên">
                                <Select
                                    allowClear
                                    placeholder={
                                        selectedBranch
                                            ? "Chọn nhân viên"
                                            : "Chọn chi nhánh trước"
                                    }
                                    onChange={fetchAttendances}
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {getFilteredEmployees().map((emp) => (
                                        <Option key={emp.id} value={emp.id}>
                                            {emp.name || emp.fullname}
                                            {emp.department &&
                                                ` - ${emp.department.name}`}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="type" label="Loại chấm công">
                                <Select
                                    allowClear
                                    placeholder="Loại chấm công"
                                    onChange={fetchAttendances}
                                >
                                    {Object.entries(typeLabels).map(
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
                        <Col span={6}>
                            <Form.Item
                                name="date_range"
                                label="Khoảng thời gian"
                            >
                                <RangePicker
                                    style={{ width: "100%" }}
                                    format="DD/MM/YYYY"
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                    allowClear={false}
                                />
                            </Form.Item>
                        </Col>
                        <Col
                            span={2}
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                paddingBottom: "24px",
                                marginRight: "24px",
                            }}
                        >
                            <Space>
                                <Button
                                    onClick={handleReset}
                                    icon={<FilterOutlined />}
                                >
                                    Đặt lại bộ lọc
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>

                {!selectedBranch && (
                    <Alert
                        message="Vui lòng chọn chi nhánh để xem dữ liệu chấm công"
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

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
                {renderStatistics()}

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
                    setShowNotes(false);
                }}
                onOk={handleAddAttendance}
                confirmLoading={loading}
                width={650}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onValuesChange={onAddFormValuesChange}
                >
                    <Row gutter={16}>
                        <Col span={12}>
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
                                    onChange={handleAddFormBranchChange}
                                >
                                    {branches.map((branch) => (
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
                        <Col span={12}>
                            <Form.Item
                                name="employee_id"
                                label="Nhân viên"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn nhân viên!",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder={
                                        addForm.getFieldValue("branch_id")
                                            ? "Chọn nhân viên"
                                            : "Chọn chi nhánh trước"
                                    }
                                    showSearch
                                    optionFilterProp="children"
                                    disabled={
                                        !addForm.getFieldValue("branch_id")
                                    }
                                    onChange={(value) => {
                                        // Tìm nhân viên để lấy thông tin phòng ban
                                        const selectedEmployee = employees.find(
                                            (emp) => emp.id === value
                                        );
                                        if (
                                            selectedEmployee &&
                                            selectedEmployee.branch
                                        ) {
                                            addForm.setFieldsValue({
                                                branch_id:
                                                    selectedEmployee.branch.id,
                                            });
                                        }
                                    }}
                                >
                                    {getFilteredEmployeesByBranch(
                                        addForm.getFieldValue("branch_id")
                                    ).map((emp) => (
                                        <Option key={emp.id} value={emp.id}>
                                            {emp.name || emp.fullname} -{" "}
                                            {emp.department?.name ||
                                                "Không có phòng ban"}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Ngày"
                                initialValue={dayjs()}
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày!",
                                    },
                                ]}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="employee_shift_id"
                                label="Ca làm việc"
                            >
                                <Select
                                    placeholder="Chọn ca làm việc"
                                    allowClear
                                    disabled={
                                        !addForm.getFieldValue("employee_id") ||
                                        !addForm.getFieldValue("date")
                                    }
                                >
                                    {employeeShifts.map((shift) => (
                                        <Option key={shift.id} value={shift.id}>
                                            {shift.shift?.name} (
                                            {shift.shift?.start_time} -{" "}
                                            {shift.shift?.end_time})
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
                                    placeholder="Chọn giờ check-in"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="check_out" label="Giờ check-out">
                                <TimePicker
                                    format="HH:mm"
                                    placeholder="Chọn giờ check-out"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Loại chấm công"
                                initialValue={AttendanceType.NORMAL}
                            >
                                <Select placeholder="Chọn loại chấm công">
                                    <Option value={AttendanceType.NORMAL}>
                                        {typeLabels[AttendanceType.NORMAL]}
                                    </Option>
                                    <Option value={AttendanceType.OVERTIME}>
                                        {typeLabels[AttendanceType.OVERTIME]}
                                    </Option>
                                    <Option value={AttendanceType.NIGHT_SHIFT}>
                                        {typeLabels[AttendanceType.NIGHT_SHIFT]}
                                    </Option>
                                    <Option value={AttendanceType.HOLIDAY}>
                                        {typeLabels[AttendanceType.HOLIDAY]}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="notes" label="Ghi chú">
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <Switch
                                        checked={!showNotes}
                                        onChange={(checked) =>
                                            setShowNotes(!checked)
                                        }
                                        checkedChildren="Ẩn"
                                        unCheckedChildren="Hiện"
                                    />
                                </div>
                                {!showNotes && (
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Nhập ghi chú"
                                        disabled={
                                            (detectedStatuses.late ||
                                                detectedStatuses.earlyLeave) &&
                                            !detectedStatuses.ignored
                                        }
                                    />
                                )}
                                {(detectedStatuses.late ||
                                    detectedStatuses.earlyLeave) &&
                                    !detectedStatuses.ignored &&
                                    !showNotes && (
                                        <div style={{ marginTop: "4px" }}>
                                            <Text type="secondary">
                                                Trường ghi chú đã bị khóa do hệ
                                                thống tự động thêm thông tin về
                                                trạng thái đi trễ/về sớm. Nhấn
                                                "Bỏ qua" nếu bạn muốn tự điền
                                                ghi chú.
                                            </Text>
                                        </div>
                                    )}
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Show warning for late/early leave */}
                    {(detectedStatuses.late || detectedStatuses.earlyLeave) &&
                        !detectedStatuses.ignored && (
                            <Alert
                                message="Phát hiện trạng thái đặc biệt"
                                description={
                                    <div>
                                        {detectedStatuses.late && (
                                            <div>
                                                Đi trễ:{" "}
                                                <Text type="warning">
                                                    {
                                                        detectedStatuses.lateMinutes
                                                    }{" "}
                                                    phút
                                                </Text>
                                            </div>
                                        )}
                                        {detectedStatuses.earlyLeave && (
                                            <div>
                                                Về sớm:{" "}
                                                <Text type="warning">
                                                    {
                                                        detectedStatuses.earlyLeaveMinutes
                                                    }{" "}
                                                    phút
                                                </Text>
                                                {detectedStatuses.isSpecialShift && (
                                                    <span>
                                                        {" "}
                                                        (Ca đặc biệt/Ca đêm)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                }
                                type="warning"
                                showIcon
                                style={{ marginBottom: 16 }}
                                action={
                                    <Button
                                        size="small"
                                        onClick={() => ignoreWarning("add")}
                                    >
                                        Bỏ qua
                                    </Button>
                                }
                            />
                        )}

                    {/* Rest of the form fields */}
                </Form>
            </Modal>

            {/* Drawer hiển thị chi tiết chấm công */}
            <AttendanceDetailDrawer
                visible={drawerVisible}
                onClose={closeDrawer}
                selectedRecord={selectedRecord}
            />

            {/* Modal chỉnh sửa chấm công */}
            <Modal
                title="Chỉnh sửa chấm công"
                visible={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    editForm.resetFields();
                    setCurrentRecord(null);
                }}
                onOk={handleUpdateAttendance}
                confirmLoading={loading}
                width={650}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onValuesChange={onEditFormValuesChange}
                >
                    {detectedStatuses.late || detectedStatuses.earlyLeave ? (
                        <Alert
                            message={
                                <Space direction="vertical">
                                    {detectedStatuses.late && (
                                        <Tag color="orange">
                                            Đi trễ{" "}
                                            {detectedStatuses.lateMinutes} phút
                                        </Tag>
                                    )}
                                    {detectedStatuses.earlyLeave && (
                                        <Tag color="orange">
                                            Về sớm{" "}
                                            {detectedStatuses.earlyLeaveMinutes}{" "}
                                            phút
                                        </Tag>
                                    )}
                                    {detectedStatuses.isSpecialShift && (
                                        <Tag color="blue">
                                            Ca đặc biệt/Ca đêm
                                        </Tag>
                                    )}
                                </Space>
                            }
                            type="info"
                            style={{ marginBottom: 16 }}
                        />
                    ) : null}
                    <Row gutter={16}>
                        <Col span={12}>
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
                                    onChange={handleAddFormBranchChange}
                                    disabled={true}
                                >
                                    {branches.map((branch) => (
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
                        <Col span={12}>
                            <Form.Item
                                name="employee_id"
                                label="Nhân viên"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn nhân viên!",
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Chọn nhân viên"
                                    showSearch
                                    optionFilterProp="children"
                                    disabled={true}
                                >
                                    {getFilteredEmployeesByBranch(
                                        editForm.getFieldValue("branch_id")
                                    ).map((emp) => (
                                        <Option key={emp.id} value={emp.id}>
                                            {emp.name || emp.fullname} -{" "}
                                            {emp.department?.name ||
                                                "Không có phòng ban"}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Ngày"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng chọn ngày!",
                                    },
                                ]}
                            >
                                <DatePicker
                                    format="DD/MM/YYYY"
                                    style={{ width: "100%" }}
                                    disabled={true}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="employee_shift_id"
                                label="Ca làm việc"
                            >
                                <Select
                                    placeholder="Chọn ca làm việc"
                                    allowClear
                                >
                                    {employeeShifts.map((shift) => (
                                        <Option key={shift.id} value={shift.id}>
                                            {shift.shift?.name} (
                                            {shift.shift?.start_time} -{" "}
                                            {shift.shift?.end_time})
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
                                    placeholder="Chọn giờ check-in"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="check_out" label="Giờ check-out">
                                <TimePicker
                                    format="HH:mm"
                                    placeholder="Chọn giờ check-out"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="type" label="Loại chấm công">
                                <Select placeholder="Chọn loại chấm công">
                                    <Option value={AttendanceType.NORMAL}>
                                        {typeLabels[AttendanceType.NORMAL]}
                                    </Option>
                                    <Option value={AttendanceType.OVERTIME}>
                                        {typeLabels[AttendanceType.OVERTIME]}
                                    </Option>
                                    <Option value={AttendanceType.NIGHT_SHIFT}>
                                        {typeLabels[AttendanceType.NIGHT_SHIFT]}
                                    </Option>
                                    <Option value={AttendanceType.HOLIDAY}>
                                        {typeLabels[AttendanceType.HOLIDAY]}
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="notes" label="Ghi chú">
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <Switch
                                        checked={!showNotes}
                                        onChange={(checked) =>
                                            setShowNotes(!checked)
                                        }
                                        checkedChildren="Ẩn"
                                        unCheckedChildren="Hiện"
                                    />
                                </div>
                                {!showNotes && (
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Nhập ghi chú"
                                        disabled={
                                            (detectedStatuses.late ||
                                                detectedStatuses.earlyLeave) &&
                                            !detectedStatuses.ignored
                                        }
                                    />
                                )}
                                {(detectedStatuses.late ||
                                    detectedStatuses.earlyLeave) &&
                                    !detectedStatuses.ignored &&
                                    !showNotes && (
                                        <div style={{ marginTop: "4px" }}>
                                            <Text type="secondary">
                                                Trường ghi chú đã bị khóa do hệ
                                                thống tự động thêm thông tin về
                                                trạng thái đi trễ/về sớm. Nhấn
                                                "Bỏ qua" nếu bạn muốn tự điền
                                                ghi chú.
                                            </Text>
                                        </div>
                                    )}
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Show warning for late/early leave */}
                    {(detectedStatuses.late || detectedStatuses.earlyLeave) &&
                        !detectedStatuses.ignored && (
                            <Alert
                                message="Phát hiện trạng thái đặc biệt"
                                description={
                                    <div>
                                        {detectedStatuses.late && (
                                            <div>
                                                Đi trễ:{" "}
                                                <Text type="warning">
                                                    {
                                                        detectedStatuses.lateMinutes
                                                    }{" "}
                                                    phút
                                                </Text>
                                            </div>
                                        )}
                                        {detectedStatuses.earlyLeave && (
                                            <div>
                                                Về sớm:{" "}
                                                <Text type="warning">
                                                    {
                                                        detectedStatuses.earlyLeaveMinutes
                                                    }{" "}
                                                    phút
                                                </Text>
                                                {detectedStatuses.isSpecialShift && (
                                                    <span>
                                                        {" "}
                                                        (Ca đặc biệt/Ca đêm)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                }
                                type="warning"
                                showIcon
                                style={{ marginBottom: 16 }}
                                action={
                                    <Button
                                        size="small"
                                        onClick={() => ignoreWarning("add")}
                                    >
                                        Bỏ qua
                                    </Button>
                                }
                            />
                        )}
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
