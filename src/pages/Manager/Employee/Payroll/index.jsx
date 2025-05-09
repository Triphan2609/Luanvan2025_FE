import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    Button,
    Table,
    Space,
    Tag,
    Form,
    Modal,
    Row,
    Col,
    Tabs,
    message,
    Badge,
    Popconfirm,
    Typography,
    Divider,
    Input,
    DatePicker,
    Select,
    Tooltip,
    Spin,
    InputNumber,
    Alert,
    Statistic,
    Radio,
    Dropdown,
    Menu,
} from "antd";
import {
    SearchOutlined,
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    LineChartOutlined,
    PlusCircleOutlined,
    MinusCircleOutlined,
    PrinterOutlined,
    DownloadOutlined,
    EditOutlined,
    DeleteOutlined,
    FilterOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    MoreOutlined,
    FilePdfOutlined,
    CloseCircleOutlined,
    TeamOutlined,
    BranchesOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    getDepartments,
    getDepartmentsByBranch,
} from "../../../../api/departmentsApi";
import { getEmployees } from "../../../../api/employeesApi";
import { getBranches, getBranchById } from "../../../../api/branchesApi";
import {
    createPayroll,
    getPayrolls,
    getPayrollById as getPayroll,
    updatePayrollStatus,
    deletePayroll,
    getPayrollStats,
} from "../../../../api/salaryApi";
import PayrollDetail from "./PayrollDetail";
import FilterControls from "./FilterControls";
import StatisticsCards from "./StatisticsCards";
import "./styles.css";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import PayrollForm from "./PayrollForm";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const PayrollStatus = {
    DRAFT: "draft",
    FINALIZED: "finalized",
    PAID: "paid",
};

const statusColors = {
    [PayrollStatus.DRAFT]: "warning",
    [PayrollStatus.FINALIZED]: "success",
    [PayrollStatus.PAID]: "green",
};

const statusLabels = {
    [PayrollStatus.DRAFT]: "Nháp",
    [PayrollStatus.FINALIZED]: "Đã hoàn thiện",
    [PayrollStatus.PAID]: "Đã thanh toán",
};

const PayrollPeriodType = {
    MONTHLY: "monthly",
    BIWEEKLY: "biweekly",
};

const periodTypeLabels = {
    [PayrollPeriodType.MONTHLY]: "Tháng",
    [PayrollPeriodType.BIWEEKLY]: "Nửa tháng",
};

export default function PayrollPage() {
    // State for data
    const [payrolls, setPayrolls] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [currentPayroll, setCurrentPayroll] = useState(null);
    const [currentBranch, setCurrentBranch] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [statusChangeLoading, setStatusChangeLoading] = useState({});

    // Helper function to get branch display name
    const getBranchDisplayName = (branch) => {
        if (!branch) return "CÔNG TY KHÁCH SẠN & NHÀ HÀNG";

        // Cố gắng xác định loại chi nhánh từ nhiều nguồn thông tin
        let branchType = "";

        // Kiểm tra trường type trực tiếp
        if (branch.type) {
            branchType = branch.type.toLowerCase();
        }
        // Kiểm tra thông tin từ branchType nếu có
        else if (branch.branchType && branch.branchType.name) {
            const btName = branch.branchType.name.toLowerCase();
            if (btName.includes("hotel") || btName.includes("khách sạn")) {
                branchType = "hotel";
            } else if (
                btName.includes("restaurant") ||
                btName.includes("nhà hàng")
            ) {
                branchType = "restaurant";
            }
        }
        // Kiểm tra tên chi nhánh nếu vẫn chưa xác định được
        else if (branch.name) {
            const branchName = branch.name.toLowerCase();
            if (
                branchName.includes("hotel") ||
                branchName.includes("khách sạn")
            ) {
                branchType = "hotel";
            } else if (
                branchName.includes("restaurant") ||
                branchName.includes("nhà hàng")
            ) {
                branchType = "restaurant";
            }
        }

        // Lấy tên chi nhánh, ưu tiên tên đầy đủ nếu có
        const branchName = branch.name || "";
        const brandName = branch.brand_name || "";

        // Xây dựng tên hiển thị dựa trên loại chi nhánh
        if (branchType === "hotel") {
            return `${branchName}`.trim();
        } else if (branchType === "restaurant") {
            return `${branchName}`.trim();
        } else if (brandName) {
            // Sử dụng brand_name nếu có
            return brandName.toUpperCase();
        } else if (branchName) {
            // Sử dụng tên chi nhánh thông thường
            return branchName.toUpperCase();
        } else {
            // Fallback nếu không có thông tin nào
            return "CÔNG TY KHÁCH SẠN & NHÀ HÀNG";
        }
    };

    // Helper function to get manager title based on branch type
    const getManagerTitle = (branch) => {
        if (!branch) return "Trưởng phòng nhân sự";

        // Cố gắng xác định loại chi nhánh từ nhiều nguồn thông tin
        let branchType = "";

        // Kiểm tra trường type trực tiếp
        if (branch.type) {
            branchType = branch.type.toLowerCase();
        }
        // Kiểm tra thông tin từ branchType nếu có
        else if (branch.branchType && branch.branchType.name) {
            const btName = branch.branchType.name.toLowerCase();
            if (btName.includes("hotel") || btName.includes("khách sạn")) {
                branchType = "hotel";
            } else if (
                btName.includes("restaurant") ||
                btName.includes("nhà hàng")
            ) {
                branchType = "restaurant";
            }
        }
        // Kiểm tra tên chi nhánh nếu vẫn chưa xác định được
        else if (branch.name) {
            const branchName = branch.name.toLowerCase();
            if (
                branchName.includes("hotel") ||
                branchName.includes("khách sạn")
            ) {
                branchType = "hotel";
            } else if (
                branchName.includes("restaurant") ||
                branchName.includes("nhà hàng")
            ) {
                branchType = "restaurant";
            }
        }

        // Ưu tiên sử dụng tên quản lý từ dữ liệu chi nhánh nếu có
        if (branch.manager_name) {
            return branch.manager_name;
        }

        // Nếu không có tên quản lý cụ thể, trả về chức danh dựa trên loại chi nhánh
        if (branchType === "hotel") {
            return "Quản lý khách sạn";
        } else if (branchType === "restaurant") {
            return "Quản lý nhà hàng";
        } else {
            return "Trưởng phòng nhân sự";
        }
    };

    // Forms
    const [filterForm] = Form.useForm();
    const [createForm] = Form.useForm();

    // Filters
    const [activeTab, setActiveTab] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState(null);
    const [branchFilter, setBranchFilter] = useState(null);
    const [dateRange, setDateRange] = useState([
        dayjs().startOf("month"),
        dayjs().endOf("month"),
    ]);

    // Statistics
    const [statistics, setStatistics] = useState({
        totalPayrolls: 0,
        totalEmployees: 0,
        totalGrossPay: 0,
        totalNetPay: 0,
        byStatus: {},
        byDepartment: {},
        byBranch: {},
    });

    const printComponentRef = useRef();

    // Initial data load
    useEffect(() => {
        const fetchDepartmentsAndEmployees = async () => {
            try {
                const [departmentsData, employeesData, branchesData] =
                    await Promise.all([
                        getDepartments(),
                        getEmployees(),
                        getBranches(),
                    ]);

                setDepartments(departmentsData || []);
                setBranches(branchesData || []);
                // Employee API returns {data: [...], total: number}
                setEmployees(employeesData.data || []);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchDepartmentsAndEmployees();
    }, []);

    // Effect to fetch payrolls when filters change
    useEffect(() => {
        fetchPayrolls();
        fetchPayrollStats();
    }, [dateRange, activeTab]);

    // Handle branch filter changes
    const handleBranchChange = async (value) => {
        setBranchFilter(value);

        // Clear department filter
        filterForm.setFieldsValue({ department_id: undefined });
        setDepartmentFilter(null);

        if (value) {
            try {
                // Fetch departments for the selected branch
                const deptsByBranch = await getDepartmentsByBranch(value);
                setDepartments(deptsByBranch || []);

                // Filter employees by branch
                if (employees.length > 0) {
                    const filteredEmps = employees.filter(
                        (emp) => emp.branch && emp.branch.id === value
                    );
                    setEmployees(filteredEmps);
                }
            } catch (error) {
                console.error("Error fetching departments by branch:", error);
                message.error(
                    "Không thể tải danh sách phòng ban theo chi nhánh"
                );
            }
        } else {
            // If no branch selected, load all departments and employees
            try {
                const [allDepts, allEmps] = await Promise.all([
                    getDepartments(),
                    getEmployees(),
                ]);
                setDepartments(allDepts || []);
                setEmployees(allEmps?.data || allEmps || []);
            } catch (error) {
                console.error(
                    "Error fetching all departments and employees:",
                    error
                );
            }
        }

        // Refresh data with the new filters
        fetchPayrolls();
        fetchPayrollStats();
    };

    // Fetch payrolls with filters
    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            // Build filter params
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

            // Ensure branch_id is a number if present
            if (formValues.branch_id) {
                filters.branch_id = Number(formValues.branch_id);
                if (isNaN(filters.branch_id)) {
                    delete filters.branch_id;
                }
            }

            // Ensure department_id is a number if present
            if (formValues.department_id) {
                filters.department_id = Number(formValues.department_id);
                if (isNaN(filters.department_id)) {
                    delete filters.department_id;
                }
            }

            // Ensure employee_id is a number if present
            if (formValues.employee_id) {
                filters.employee_id = Number(formValues.employee_id);
                if (isNaN(filters.employee_id)) {
                    delete filters.employee_id;
                }
            }

            if (formValues.period_type) {
                filters.period_type = formValues.period_type;
            }

            if (formValues.search) {
                filters.search = formValues.search;
            }

            const data = await getPayrolls(filters);
            setPayrolls(data);
        } catch (error) {
            console.error("Error fetching payrolls:", error);
            message.error("Không thể tải dữ liệu bảng lương");
        } finally {
            setLoading(false);
        }
    };

    // Fetch payroll statistics
    const fetchPayrollStats = async () => {
        try {
            const startDate = dateRange[0].format("YYYY-MM-DD");
            const endDate = dateRange[1].format("YYYY-MM-DD");
            const formValues = filterForm.getFieldsValue();

            let departmentId = undefined;
            if (formValues.department_id) {
                departmentId = Number(formValues.department_id);
                if (isNaN(departmentId)) {
                    departmentId = undefined;
                }
            }

            let branchId = undefined;
            if (formValues.branch_id) {
                branchId = Number(formValues.branch_id);
                if (isNaN(branchId)) {
                    branchId = undefined;
                }
            }

            const stats = await getPayrollStats(
                startDate,
                endDate,
                departmentId,
                branchId
            );
            setStatistics(stats);
        } catch (error) {
            console.error("Error fetching payroll statistics:", error);
            // Keep the current stats if error
        }
    };

    // Create new payroll
    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            setSubmitting(true);

            // Format dates properly
            const periodStartDate = values.period?.[0].format("YYYY-MM-DD");
            const periodEndDate = values.period?.[1].format("YYYY-MM-DD");

            // Prepare data for API call
            const payrollData = {
                employee_id: values.employee_id,
                branch_id: values.branch_id,
                period_start: periodStartDate,
                period_end: periodEndDate,
                period_type: values.period_type,
                base_salary: values.base_salary,
                working_days: values.working_days,
                total_working_hours: values.total_working_hours,
                overtime_hours: values.overtime_hours,
                night_shift_hours: values.night_shift_hours,
                night_shift_multiplier: values.night_shift_multiplier,
                holiday_hours: values.holiday_hours,
                allowances: values.allowances || {},
                deductions: values.deductions || {},
                notes: values.notes,
            };

            // Convert numbers to ensure they're passed correctly
            if (payrollData.branch_id) {
                payrollData.branch_id = Number(payrollData.branch_id);
            }

            if (payrollData.employee_id) {
                payrollData.employee_id = Number(payrollData.employee_id);
            }

            // Create payroll
            const result = await createPayroll(payrollData);

            setCreateModalVisible(false);
            createForm.resetFields();
            message.success("Tạo bảng lương thành công");

            // Refresh payroll list
            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error creating payroll:", error);
            message.error(
                error.response?.data?.message ||
                    error.message ||
                    "Không thể tạo bảng lương. Vui lòng thử lại."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // View payroll details
    const handleViewDetail = async (id) => {
        try {
            setLoading(true);

            // Lấy thông tin chi tiết của bảng lương
            const data = await getPayroll(id);
            setCurrentPayroll(data);

            // Lấy thông tin chi nhánh để hiển thị trên phiếu lương
            // Ưu tiên: 1. branch_id từ bảng Payroll, 2. branch từ Employee
            const branchId = data?.branch?.id || data?.employee?.branch?.id;

            if (branchId) {
                try {
                    // Fetch detailed branch information
                    const branchData = await getBranchById(branchId);

                    // Lấy các thông tin chi nhánh từ các nguồn dữ liệu có sẵn
                    // Ưu tiên từ API, sau đó từ payroll.branch, cuối cùng từ employee.branch
                    const payrollBranch = data?.branch || {};
                    const employeeBranch = data?.employee?.branch || {};

                    // Gộp thông tin từ các nguồn
                    const completeData = {
                        ...employeeBranch, // Dữ liệu cơ bản từ employee.branch
                        ...payrollBranch, // Ghi đè bằng dữ liệu từ payroll.branch nếu có
                        ...branchData, // Ghi đè bằng dữ liệu chi tiết từ API

                        // Đảm bảo các trường quan trọng luôn có giá trị
                        id: branchId,
                        type:
                            branchData.type ||
                            payrollBranch.type ||
                            employeeBranch.type ||
                            "",
                        name:
                            branchData.name ||
                            payrollBranch.name ||
                            employeeBranch.name ||
                            "",
                        address:
                            branchData.address ||
                            payrollBranch.address ||
                            employeeBranch.address ||
                            "",
                        phone:
                            branchData.phone ||
                            payrollBranch.phone ||
                            employeeBranch.phone ||
                            "",
                        email:
                            branchData.email ||
                            payrollBranch.email ||
                            employeeBranch.email ||
                            "",
                        tax_code:
                            branchData.tax_code ||
                            payrollBranch.tax_code ||
                            employeeBranch.tax_code ||
                            "",
                        brand_name:
                            branchData.brand_name ||
                            payrollBranch.brand_name ||
                            employeeBranch.brand_name ||
                            "",
                        branch_code:
                            branchData.branch_code ||
                            payrollBranch.branch_code ||
                            employeeBranch.branch_code ||
                            "",
                    };

                    // Nếu có branchType, sử dụng nó để xác định loại chi nhánh
                    if (branchData.branchType?.name) {
                        if (
                            branchData.branchType.name
                                .toLowerCase()
                                .includes("hotel")
                        ) {
                            completeData.type = "hotel";
                        } else if (
                            branchData.branchType.name
                                .toLowerCase()
                                .includes("restaurant")
                        ) {
                            completeData.type = "restaurant";
                        }
                    }

                    setCurrentBranch(completeData);
                } catch (branchError) {
                    console.error(
                        "Error fetching branch details:",
                        branchError
                    );

                    // Nếu API lỗi, sử dụng dữ liệu từ payroll.branch hoặc employee.branch
                    const fallbackBranch =
                        data?.branch || data?.employee?.branch;
                    setCurrentBranch(fallbackBranch);
                }
            } else {
                setCurrentBranch(null);
                console.warn(
                    "No branch information available for this payroll"
                );
            }

            setDetailModalVisible(true);
        } catch (error) {
            console.error("Error fetching payroll details:", error);
            message.error("Không thể tải thông tin bảng lương");
        } finally {
            setLoading(false);
        }
    };

    // Change payroll status
    const handleStatusChange = async (id, newStatus) => {
        try {
            // Set loading state for this specific payroll
            setStatusChangeLoading((prev) => ({ ...prev, [id]: true }));

            await updatePayrollStatus(id, { status: newStatus });

            message.success(
                <div>
                    <div style={{ marginBottom: "6px", fontWeight: "bold" }}>
                        {newStatus === PayrollStatus.FINALIZED
                            ? "Hoàn thiện bảng lương thành công!"
                            : newStatus === PayrollStatus.PAID
                            ? "Đánh dấu đã thanh toán thành công!"
                            : "Cập nhật trạng thái thành công!"}
                    </div>
                    <div>
                        Bảng lương đã được chuyển sang trạng thái{" "}
                        <Tag color={statusColors[newStatus]}>
                            {statusLabels[newStatus]}
                        </Tag>
                    </div>
                </div>,
                5
            );

            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error updating status:", error);
            message.error("Không thể cập nhật trạng thái bảng lương");
        } finally {
            setStatusChangeLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

    // Delete payroll
    const handleDelete = async (id) => {
        try {
            setStatusChangeLoading((prev) => ({ ...prev, [id]: true }));

            await deletePayroll(id);

            message.success("Xóa bảng lương thành công");
            fetchPayrolls();
            fetchPayrollStats();
        } catch (error) {
            console.error("Error deleting payroll:", error);
            message.error("Không thể xóa bảng lương");
        } finally {
            setStatusChangeLoading((prev) => ({ ...prev, [id]: false }));
        }
    };

    // Handle tab change
    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    // Handle date range change
    const handleDateRangeChange = (dates) => {
        if (dates) {
            setDateRange(dates);
        }
    };

    // Handle search button click
    const handleSearch = () => {
        fetchPayrolls();
        fetchPayrollStats();
    };

    // Reset filters
    const handleReset = () => {
        // Reset form fields
        filterForm.resetFields();

        // Reset filter state
        setSearchText("");
        setDepartmentFilter(null);
        setBranchFilter(null);

        // Reset to default date range (current month)
        setDateRange([dayjs().startOf("month"), dayjs().endOf("month")]);

        // Reload all departments and employees
        Promise.all([getDepartments(), getEmployees(), getBranches()])
            .then(([deptsData, empsData, branchesData]) => {
                setDepartments(deptsData || []);
                setBranches(branchesData || []);
                setEmployees(empsData?.data || empsData || []);

                // Fetch data with reset filters
                fetchPayrolls();
                fetchPayrollStats();
            })
            .catch((error) => {
                console.error("Error reloading data:", error);
                message.error(
                    "Không thể tải lại dữ liệu. Vui lòng thử lại sau."
                );
            });
    };

    // Cấu hình in phiếu lương
    const handlePrint = useReactToPrint({
        content: () => printComponentRef.current,
        documentTitle: `Phiếu lương_${
            currentPayroll?.payroll_code || "Bảng_lương"
        }`,
        onBeforeGetContent: () => {
            message.loading({
                content: "Đang chuẩn bị bản in...",
                key: "print",
            });
            return new Promise((resolve) => {
                setTimeout(() => {
                    message.success({
                        content: "Sẵn sàng in!",
                        key: "print",
                        duration: 2,
                    });
                    resolve();
                }, 1000);
            });
        },
        onAfterPrint: () => message.success("In phiếu lương thành công!"),
    });

    // Tạo và tải xuống PDF từ HTML
    const handleExportPDF = async () => {
        message.loading({
            content: "Đang tạo file PDF...",
            key: "export-pdf",
            duration: 0,
        });

        try {
            const element = printComponentRef.current;

            // Đảm bảo element đã được render đầy đủ
            if (!element) {
                throw new Error("Không thể tìm thấy nội dung để xuất PDF");
            }

            // Thiết lập kích thước A4
            const PDF_WIDTH = 210; // mm, chiều rộng A4
            const PDF_HEIGHT = 297; // mm, chiều cao A4
            const MARGIN = 10; // mm, lề

            // Sử dụng html2canvas để chuyển đổi HTML thành hình ảnh
            const canvas = await html2canvas(element, {
                scale: 2, // Scale cao hơn cho chất lượng tốt hơn
                useCORS: true, // Cho phép tải hình ảnh từ các domain khác
                logging: false,
                width: element.offsetWidth,
                height: element.offsetHeight,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                windowWidth: element.offsetWidth,
                windowHeight: element.offsetHeight,
            });

            // Tạo tài liệu PDF với kích thước A4
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            // Lấy tỷ lệ để fit vừa chiều rộng A4 (trừ lề)
            const contentWidth = PDF_WIDTH - 2 * MARGIN;
            const contentHeight = PDF_HEIGHT - 2 * MARGIN;

            // Tính toán tỷ lệ co giãn để vừa với trang A4
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Tỷ lệ giữa chiều rộng thực tế và chiều rộng nội dung PDF
            const ratio = Math.min(
                contentWidth / imgWidth,
                contentHeight / imgHeight
            );

            // Kích thước sau khi scale
            const scaledWidth = imgWidth * ratio;
            const scaledHeight = imgHeight * ratio;

            // Tính toán vị trí để căn giữa trang
            const x = (PDF_WIDTH - scaledWidth) / 2;
            const y = (PDF_HEIGHT - scaledHeight) / 2;

            // Thêm hình ảnh vào PDF
            pdf.addImage(
                canvas.toDataURL("image/jpeg", 1.0),
                "JPEG",
                x,
                y,
                scaledWidth,
                scaledHeight
            );

            // Lưu tệp PDF
            pdf.save(
                `Phiếu lương_${
                    currentPayroll?.payroll_code || "Bảng_lương"
                }.pdf`
            );

            message.success({
                content: "Xuất PDF thành công!",
                key: "export-pdf",
            });
        } catch (error) {
            console.error("Error exporting PDF:", error);
            message.error({
                content: `Không thể xuất file PDF: ${error.message}`,
                key: "export-pdf",
            });
        }
    };

    // Table columns definition
    const columns = [
        {
            title: "Mã bảng lương",
            dataIndex: "payroll_code",
            key: "payroll_code",
            width: 150,
            render: (text, record) => (
                <Button
                    type="link"
                    style={{ padding: 0, fontWeight: 500 }}
                    onClick={() => handleViewDetail(record.id)}
                >
                    {text}
                </Button>
            ),
            sorter: (a, b) => a.payroll_code.localeCompare(b.payroll_code),
        },
        {
            title: "Nhân viên",
            dataIndex: ["employee", "name"],
            key: "employee_name",
            width: 200,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary">
                        {record.employee?.department?.name ||
                            "Chưa có phòng ban"}
                    </Text>
                </Space>
            ),
            sorter: (a, b) => {
                const nameA = a.employee?.name || "";
                const nameB = b.employee?.name || "";
                return nameA.localeCompare(nameB);
            },
        },
        {
            title: "Chức vụ",
            dataIndex: ["employee", "role", "name"],
            key: "role_name",
            width: 150,
            render: (text) => text || "Chưa có chức vụ",
            sorter: (a, b) => {
                const roleA = a.employee?.role?.name || "";
                const roleB = b.employee?.role?.name || "";
                return roleA.localeCompare(roleB);
            },
        },
        {
            title: "Kỳ lương",
            key: "period",
            width: 200,
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text>
                        {dayjs(record.period_start).format("DD/MM/YYYY")} -{" "}
                        {dayjs(record.period_end).format("DD/MM/YYYY")}
                    </Text>
                    <Tag color="blue">
                        {periodTypeLabels[record.period_type]}
                    </Tag>
                </Space>
            ),
            sorter: (a, b) =>
                dayjs(a.period_start).valueOf() -
                dayjs(b.period_start).valueOf(),
        },
        {
            title: "Số ngày công",
            dataIndex: "working_days",
            key: "working_days",
            width: 130,
            render: (value) => (value || 0) + " ngày",
            sorter: (a, b) => (a.working_days || 0) - (b.working_days || 0),
        },
        {
            title: "Tổng giờ làm",
            dataIndex: "total_working_hours",
            key: "total_working_hours",
            width: 130,
            render: (value) => (value ? value.toFixed(1) + " giờ" : "0 giờ"),
            sorter: (a, b) =>
                (a.total_working_hours || 0) - (b.total_working_hours || 0),
        },
        {
            title: "Giờ tăng ca",
            dataIndex: "overtime_hours",
            key: "overtime_hours",
            width: 130,
            render: (value, record) => (
                <Space direction="vertical" size={0}>
                    <span className="overtime-value">
                        {value ? value.toFixed(1) + " giờ" : "0 giờ"}
                    </span>
                    {value > 0 && (
                        <Tooltip title="Hệ số tăng ca">
                            <Tag color="orange" style={{ marginTop: 3 }}>
                                x
                                {record.overtime_multiplier?.toFixed(2) ||
                                    "1.50"}
                            </Tag>
                        </Tooltip>
                    )}
                </Space>
            ),
            sorter: (a, b) => (a.overtime_hours || 0) - (b.overtime_hours || 0),
        },
        {
            title: "Phụ cấp tăng ca",
            dataIndex: "overtime_pay",
            key: "overtime_pay",
            width: 150,
            render: (value) => (
                <span className="overtime-value">
                    {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                    }).format(value || 0)}
                </span>
            ),
            sorter: (a, b) => (a.overtime_pay || 0) - (b.overtime_pay || 0),
        },
        {
            title: "Giờ làm đêm",
            dataIndex: "night_shift_hours",
            key: "night_shift_hours",
            width: 130,
            render: (value, record) => (
                <Space direction="vertical" size={0}>
                    <span className="night-shift-value">
                        {value ? value.toFixed(1) + " giờ" : "0 giờ"}
                    </span>
                    {value > 0 && (
                        <Tooltip title="Hệ số ca đêm">
                            <Tag color="blue" style={{ marginTop: 3 }}>
                                x
                                {record.night_shift_multiplier?.toFixed(2) ||
                                    "1.30"}
                            </Tag>
                        </Tooltip>
                    )}
                </Space>
            ),
            sorter: (a, b) =>
                (a.night_shift_hours || 0) - (b.night_shift_hours || 0),
        },
        {
            title: "Phụ cấp ca đêm",
            dataIndex: "night_shift_pay",
            key: "night_shift_pay",
            width: 150,
            render: (value) => (
                <span className="night-shift-value">
                    {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                    }).format(value || 0)}
                </span>
            ),
            sorter: (a, b) =>
                (a.night_shift_pay || 0) - (b.night_shift_pay || 0),
        },
        {
            title: (
                <span>
                    <PlusCircleOutlined style={{ color: "#52c41a" }} /> Phụ cấp
                    không thuế
                </span>
            ),
            dataIndex: "non_taxable_allowances",
            key: "non_taxable_allowances",
            width: 150,
            render: (value) => (
                <span className="allowance-value">
                    {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                    }).format(value || 0)}
                </span>
            ),
            sorter: (a, b) =>
                (a.non_taxable_allowances || 0) -
                (b.non_taxable_allowances || 0),
        },
        {
            title: (
                <span>
                    <PlusCircleOutlined style={{ color: "#faad14" }} /> Phụ cấp
                    tính thuế
                </span>
            ),
            dataIndex: "taxable_allowances",
            key: "taxable_allowances",
            width: 150,
            render: (value) => (
                <span className="allowance-taxable-value">
                    {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                    }).format(value || 0)}
                </span>
            ),
            sorter: (a, b) =>
                (a.taxable_allowances || 0) - (b.taxable_allowances || 0),
        },
        {
            title: (
                <span>
                    <MinusCircleOutlined style={{ color: "#f5222d" }} /> Khấu
                    trừ
                </span>
            ),
            dataIndex: "deductions",
            key: "deductions",
            width: 150,
            render: (value) => (
                <span className="deduction-value">
                    {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                    }).format(value || 0)}
                </span>
            ),
            sorter: (a, b) => (a.deductions || 0) - (b.deductions || 0),
        },
        {
            title: "Tổng lương gộp",
            dataIndex: "gross_pay",
            key: "gross_pay",
            width: 150,
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value || 0),
            sorter: (a, b) => (a.gross_pay || 0) - (b.gross_pay || 0),
        },
        {
            title: "Lương thực lãnh",
            dataIndex: "net_pay",
            key: "net_pay",
            width: 150,
            render: (value) =>
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(value || 0),
            sorter: (a, b) => (a.net_pay || 0) - (b.net_pay || 0),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status) => (
                <Tag
                    color={statusColors[status]}
                    className={`status-${status}`}
                >
                    {statusLabels[status]}
                </Tag>
            ),
            filters: [
                {
                    text: statusLabels[PayrollStatus.DRAFT],
                    value: PayrollStatus.DRAFT,
                },
                {
                    text: statusLabels[PayrollStatus.FINALIZED],
                    value: PayrollStatus.FINALIZED,
                },
                {
                    text: statusLabels[PayrollStatus.PAID],
                    value: PayrollStatus.PAID,
                },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 180,
            fixed: "right",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            ghost
                            icon={<FileTextOutlined />}
                            onClick={() => handleViewDetail(record.id)}
                        />
                    </Tooltip>

                    {record.status === PayrollStatus.DRAFT && (
                        <>
                            <Tooltip title="Hoàn thiện">
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<CheckCircleOutlined />}
                                    onClick={() =>
                                        Modal.confirm({
                                            title: "Hoàn thiện bảng lương",
                                            icon: (
                                                <CheckCircleOutlined
                                                    style={{ color: "#52c41a" }}
                                                />
                                            ),
                                            content: `Bạn có chắc chắn muốn hoàn thiện bảng lương cho nhân viên ${
                                                record.employee?.name || "này"
                                            }?`,
                                            okText: "Xác nhận",
                                            cancelText: "Hủy",
                                            onOk: () =>
                                                handleStatusChange(
                                                    record.id,
                                                    PayrollStatus.FINALIZED
                                                ),
                                        })
                                    }
                                    loading={statusChangeLoading[record.id]}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Xóa bảng lương"
                                description="Bạn có chắc chắn muốn xóa bảng lương này?"
                                icon={
                                    <InfoCircleOutlined
                                        style={{ color: "#ff4d4f" }}
                                    />
                                }
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Tooltip title="Xóa">
                                    <Button
                                        type="primary"
                                        danger
                                        ghost
                                        icon={<DeleteOutlined />}
                                        loading={statusChangeLoading[record.id]}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}

                    {record.status === PayrollStatus.FINALIZED && (
                        <>
                            <Tooltip title="Đánh dấu đã thanh toán">
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<DollarOutlined />}
                                    onClick={() =>
                                        Modal.confirm({
                                            title: "Đánh dấu đã thanh toán",
                                            icon: (
                                                <DollarOutlined
                                                    style={{ color: "#13c2c2" }}
                                                />
                                            ),
                                            content: `Bạn có chắc chắn muốn đánh dấu bảng lương cho nhân viên ${
                                                record.employee?.name || "này"
                                            } là đã thanh toán?`,
                                            okText: "Xác nhận",
                                            cancelText: "Hủy",
                                            onOk: () =>
                                                handleStatusChange(
                                                    record.id,
                                                    PayrollStatus.PAID
                                                ),
                                        })
                                    }
                                    loading={statusChangeLoading[record.id]}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Xóa bảng lương"
                                description="Bạn có chắc chắn muốn xóa bảng lương đã hoàn thiện này?"
                                icon={
                                    <InfoCircleOutlined
                                        style={{ color: "#ff4d4f" }}
                                    />
                                }
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Tooltip title="Xóa">
                                    <Button
                                        type="primary"
                                        danger
                                        ghost
                                        icon={<DeleteOutlined />}
                                        loading={statusChangeLoading[record.id]}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}

                    {record.status === PayrollStatus.PAID && (
                        <>
                            <Tooltip title="In bảng lương">
                                <Button
                                    type="default"
                                    icon={<PrinterOutlined />}
                                    onClick={() => {
                                        handleViewDetail(record.id);
                                        // Sau khi lấy dữ liệu chi tiết, sẽ hiển thị modal chi tiết và có thể in
                                        // Chờ một chút để dữ liệu được tải xong
                                        setTimeout(() => {
                                            handlePrint();
                                        }, 1000);
                                    }}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Xóa bảng lương đã thanh toán"
                                description={
                                    <div>
                                        <p>
                                            Bạn có chắc chắn muốn xóa bảng lương
                                            đã thanh toán này?
                                        </p>
                                        <p style={{ color: "#ff4d4f" }}>
                                            Lưu ý: Thao tác này sẽ xóa hoàn toàn
                                            dữ liệu lương đã thanh toán và không
                                            thể khôi phục.
                                        </p>
                                    </div>
                                }
                                icon={
                                    <InfoCircleOutlined
                                        style={{ color: "#ff4d4f" }}
                                    />
                                }
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa vĩnh viễn"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Tooltip title="Xóa bảng lương đã thanh toán">
                                    <Button
                                        type="primary"
                                        danger
                                        ghost
                                        icon={<DeleteOutlined />}
                                        loading={statusChangeLoading[record.id]}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="payroll-page">
            <div className="page-header">
                <div>
                    <Title level={3}>
                        <DollarOutlined /> Quản lý bảng lương
                    </Title>
                    <Text type="secondary">
                        Quản lý thanh toán lương cho nhân viên trong tổ chức
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    onClick={() => setCreateModalVisible(true)}
                    size="large"
                >
                    Tạo bảng lương
                </Button>
            </div>

            {/* Statistics Cards */}
            <StatisticsCards
                statistics={statistics}
                statusFilters={PayrollStatus}
                resetFilters={handleReset}
                onChangeTab={handleTabChange}
            />

            {/* Filter Card */}
            <Card className="filter-card">
                <FilterControls
                    form={filterForm}
                    departments={departments}
                    employees={employees}
                    branches={branches}
                    periodTypes={PayrollPeriodType}
                    periodTypeLabels={periodTypeLabels}
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    loading={loading}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    onFetchData={fetchPayrolls}
                    onBranchChange={handleBranchChange}
                />
            </Card>

            {/* Data Card */}
            <Card className="data-card">
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    className="tab-container"
                >
                    <TabPane tab="Tất cả" key="all" />
                    <TabPane
                        tab={
                            <Badge
                                count={
                                    statistics.byStatus?.[
                                        PayrollStatus.DRAFT
                                    ] || 0
                                }
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#faad14",
                                    marginRight: "8px",
                                }}
                            >
                                Nháp
                            </Badge>
                        }
                        key={PayrollStatus.DRAFT}
                    />
                    <TabPane
                        tab={
                            <Badge
                                count={
                                    statistics.byStatus?.[
                                        PayrollStatus.FINALIZED
                                    ] || 0
                                }
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#52c41a",
                                    marginRight: "8px",
                                }}
                            >
                                Đã hoàn thiện
                            </Badge>
                        }
                        key={PayrollStatus.FINALIZED}
                    />
                    <TabPane
                        tab={
                            <Badge
                                count={
                                    statistics.byStatus?.[PayrollStatus.PAID] ||
                                    0
                                }
                                size="small"
                                offset={[10, 0]}
                                style={{
                                    backgroundColor: "#13c2c2",
                                    marginRight: "8px",
                                }}
                            >
                                Đã thanh toán
                            </Badge>
                        }
                        key={PayrollStatus.PAID}
                    />
                </Tabs>

                <Table
                    columns={columns}
                    dataSource={payrolls}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} bảng lương`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    bordered
                    size="middle"
                    scroll={{ x: "max-content" }}
                    className="data-table"
                    locale={{
                        emptyText: (
                            <div style={{ padding: "20px 0" }}>
                                <div
                                    style={{
                                        fontSize: "24px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <SearchOutlined />
                                </div>
                                <p>Không tìm thấy bảng lương nào</p>
                                <p style={{ fontSize: "13px", color: "#999" }}>
                                    Thử thay đổi bộ lọc hoặc tạo mới một bảng
                                    lương
                                </p>
                            </div>
                        ),
                    }}
                />
            </Card>

            {/* Modal tạo bảng lương mới */}
            <Modal
                title={
                    <Space>
                        <PlusCircleOutlined />
                        <span>Tạo bảng lương mới</span>
                    </Space>
                }
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                onOk={handleCreate}
                confirmLoading={submitting}
                width={800}
                maskClosable={false}
            >
                <PayrollForm
                    form={createForm}
                    branches={branches}
                    employees={employees}
                />
            </Modal>

            {/* Modal chi tiết bảng lương */}
            <Modal
                title={
                    <Space align="center">
                        <FileTextOutlined />
                        <span>
                            Chi tiết bảng lương: {currentPayroll?.payroll_code}
                        </span>
                    </Space>
                }
                width={800}
                visible={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setCurrentPayroll(null);
                    setCurrentBranch(null);
                }}
                footer={[
                    <Button
                        key="print"
                        type="primary"
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                    >
                        In phiếu lương
                    </Button>,
                    <Button
                        key="pdf"
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={handleExportPDF}
                        style={{
                            background: "#ff4d4f",
                            borderColor: "#ff4d4f",
                        }}
                    >
                        Xuất PDF
                    </Button>,
                    <Button
                        key="close"
                        onClick={() => {
                            setDetailModalVisible(false);
                            setCurrentPayroll(null);
                            setCurrentBranch(null);
                        }}
                    >
                        Đóng
                    </Button>,
                ]}
                bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin size="large" />
                        <p>Đang tải thông tin...</p>
                    </div>
                ) : (
                    <div>
                        <div ref={printComponentRef} className="print-content">
                            <div className="print-header">
                                <Row gutter={16} align="middle">
                                    <Col span={14}>
                                        <Typography.Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                textAlign: "left",
                                            }}
                                        >
                                            {getBranchDisplayName(
                                                currentBranch
                                            )}
                                        </Typography.Title>
                                        <Typography.Text
                                            type="secondary"
                                            style={{
                                                display: "block",
                                                textAlign: "left",
                                                fontSize: "12px",
                                                marginTop: "4px",
                                            }}
                                        >
                                            {currentBranch?.address
                                                ? `Địa chỉ: ${currentBranch.address}`
                                                : "Địa chỉ chưa cập nhật"}
                                        </Typography.Text>

                                        <Typography.Text
                                            type="secondary"
                                            style={{
                                                display: "block",
                                                textAlign: "left",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {currentBranch?.phone
                                                ? `ĐT: ${currentBranch.phone}`
                                                : ""}
                                            {currentBranch?.phone &&
                                            currentBranch?.email
                                                ? " | "
                                                : ""}
                                            {currentBranch?.email
                                                ? `Email: ${currentBranch.email}`
                                                : ""}
                                            {!currentBranch?.phone &&
                                                !currentBranch?.email &&
                                                "Thông tin liên hệ chưa cập nhật"}
                                        </Typography.Text>

                                        {currentBranch?.tax_code && (
                                            <Typography.Text
                                                type="secondary"
                                                style={{
                                                    display: "block",
                                                    textAlign: "center",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                Mã số thuế:{" "}
                                                {currentBranch.tax_code}
                                            </Typography.Text>
                                        )}
                                    </Col>
                                    <Col
                                        span={10}
                                        style={{
                                            textAlign: "right",
                                            float: "right",
                                        }}
                                    >
                                        <div className="document-info">
                                            <Typography.Text
                                                strong
                                                style={{ fontSize: "12px" }}
                                            >
                                                MÃ SỐ:{" "}
                                            </Typography.Text>
                                            <Typography.Text
                                                style={{ fontSize: "12px" }}
                                            >
                                                {currentPayroll?.payroll_code}
                                            </Typography.Text>
                                            <br />
                                            <Typography.Text
                                                strong
                                                style={{ fontSize: "12px" }}
                                            >
                                                NGÀY:{" "}
                                            </Typography.Text>
                                            <Typography.Text
                                                style={{ fontSize: "12px" }}
                                            >
                                                {new Date().toLocaleDateString(
                                                    "vi-VN"
                                                )}
                                            </Typography.Text>
                                        </div>
                                    </Col>
                                </Row>
                                <Divider style={{ margin: "10px 0" }} />
                                <Typography.Title
                                    level={3}
                                    style={{
                                        textAlign: "center",
                                        margin: "10px 0",
                                    }}
                                >
                                    PHIẾU LƯƠNG
                                </Typography.Title>
                                <Typography.Title
                                    level={5}
                                    style={{
                                        textAlign: "center",
                                        margin: 0,
                                        fontWeight: "normal",
                                    }}
                                >
                                    Kỳ lương:{" "}
                                    {currentPayroll?.period_start &&
                                        dayjs(
                                            currentPayroll.period_start
                                        ).format("DD/MM/YYYY")}{" "}
                                    -{" "}
                                    {currentPayroll?.period_end &&
                                        dayjs(currentPayroll.period_end).format(
                                            "DD/MM/YYYY"
                                        )}
                                </Typography.Title>
                            </div>
                            <div className="compact-payroll-detail">
                                <PayrollDetail
                                    payroll={currentPayroll}
                                    periodTypeLabels={periodTypeLabels}
                                    statusLabels={statusLabels}
                                    statusColors={statusColors}
                                    compact={true}
                                />
                            </div>
                            <div
                                className="print-signatures"
                                style={{ marginTop: "20px" }}
                            >
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <div
                                            className="signature-box"
                                            style={{ textAlign: "center" }}
                                        >
                                            <Typography.Text
                                                strong
                                                style={{ fontSize: "12px" }}
                                            >
                                                Người lập phiếu
                                            </Typography.Text>
                                            <div className="signature-line-compact"></div>
                                            <Typography.Text
                                                style={{ fontSize: "12px" }}
                                            >
                                                Ngày ký: ___/___/____
                                            </Typography.Text>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div
                                            className="signature-box"
                                            style={{ textAlign: "center" }}
                                        >
                                            <Typography.Text
                                                strong
                                                style={{ fontSize: "12px" }}
                                            >
                                                Trưởng phòng nhân sự
                                            </Typography.Text>
                                            <div className="signature-line-compact"></div>
                                            <Typography.Text
                                                style={{ fontSize: "12px" }}
                                            >
                                                Ngày ký: ___/___/____
                                            </Typography.Text>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div
                                            className="signature-box"
                                            style={{ textAlign: "center" }}
                                        >
                                            <Typography.Text
                                                strong
                                                style={{ fontSize: "12px" }}
                                            >
                                                Người nhận
                                            </Typography.Text>
                                            <div className="signature-line-compact"></div>
                                            <Typography.Text
                                                style={{ fontSize: "12px" }}
                                            >
                                                Ngày ký: ___/___/____
                                            </Typography.Text>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <div
                                className="print-footer"
                                style={{ marginTop: "10px" }}
                            >
                                <Divider style={{ margin: "8px 0" }} />
                                <Row>
                                    <Col
                                        span={24}
                                        style={{ textAlign: "center" }}
                                    >
                                        <Typography.Text
                                            type="secondary"
                                            style={{ fontSize: "10px" }}
                                        >
                                            © {new Date().getFullYear()}{" "}
                                            {getBranchDisplayName(
                                                currentBranch
                                            )}
                                            {currentBranch?.tax_code &&
                                                ` - Mã số thuế: ${currentBranch.tax_code}`}
                                        </Typography.Text>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
