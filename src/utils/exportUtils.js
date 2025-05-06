import * as XLSX from "xlsx";
import { message } from "antd";
import { EMPLOYEE_STATUS_LABELS } from "../constants/employee";
import { formatDate } from "./dateUtils";

/**
 * Hàm xuất dữ liệu sang file Excel
 * @param {Array} data - Mảng dữ liệu cần xuất
 * @param {string} fileName - Tên file xuất ra
 * @param {Object} options - Tùy chọn bổ sung
 */
export const exportToExcel = (data, fileName = "export", options = {}) => {
    try {
        if (!data || data.length === 0) {
            message.warning("Không có dữ liệu để xuất");
            return;
        }

        // Chuẩn bị dữ liệu để xuất
        const exportData = formatDataForExport(data, options);

        // Tạo workbook và worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Tùy chỉnh độ rộng cột
        const columnWidths = calculateColumnWidths(exportData);
        ws["!cols"] = columnWidths;

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(wb, ws, "Data");

        // Tạo tên file
        const finalFileName = `${fileName}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

        // Xuất file
        XLSX.writeFile(wb, finalFileName);

        message.success(`Đã xuất file Excel thành công: ${finalFileName}`);
    } catch (error) {
        console.error("Lỗi khi xuất Excel:", error);
        message.error("Có lỗi xảy ra khi xuất file Excel");
    }
};

/**
 * Hàm xuất dữ liệu sang file CSV
 * @param {Array} data - Mảng dữ liệu cần xuất
 * @param {string} fileName - Tên file xuất ra
 * @param {Object} options - Tùy chọn bổ sung
 */
export const exportToCSV = (data, fileName = "export", options = {}) => {
    try {
        if (!data || data.length === 0) {
            message.warning("Không có dữ liệu để xuất");
            return;
        }

        // Chuẩn bị dữ liệu để xuất
        const exportData = formatDataForExport(data, options);

        // Tạo worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Tạo tên file
        const finalFileName = `${fileName}_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;

        // Tạo workbook và xuất ra CSV
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, finalFileName);

        message.success(`Đã xuất file CSV thành công: ${finalFileName}`);
    } catch (error) {
        console.error("Lỗi khi xuất CSV:", error);
        message.error("Có lỗi xảy ra khi xuất file CSV");
    }
};

/**
 * Định dạng dữ liệu cho việc xuất Excel/CSV
 * @param {Array} data - Dữ liệu gốc
 * @param {Object} options - Tùy chọn cho việc định dạng
 * @returns {Array} - Dữ liệu đã được định dạng
 */
const formatDataForExport = (data, options = {}) => {
    const { type = "all", branches = [] } = options;

    // Kiểm tra dữ liệu hợp lệ
    if (!data || data.length === 0) {
        return [];
    }

    // Xử lý dữ liệu dựa trên loại
    if (type === "employees") {
        console.log(
            "Đang chuẩn bị xuất dữ liệu nhân viên:",
            data.length,
            "bản ghi"
        );

        return data.map((employee) => {
            // Kiểm tra đảm bảo properties tồn tại
            const deptName =
                employee.department && typeof employee.department === "object"
                    ? employee.department.name
                    : "";

            const roleName =
                employee.role && typeof employee.role === "object"
                    ? employee.role.name
                    : "";

            const branchName =
                employee.branch && typeof employee.branch === "object"
                    ? employee.branch.name
                    : "";

            // Log thông tin để debug
            if (!deptName && employee.department) {
                console.log(
                    "Phát hiện phòng ban không có tên:",
                    employee.department
                );
            }

            if (!roleName && employee.role) {
                console.log("Phát hiện chức vụ không có tên:", employee.role);
            }

            if (!branchName && employee.branch) {
                console.log(
                    "Phát hiện chi nhánh không có tên:",
                    employee.branch
                );
            }

            return {
                "Mã NV": employee.employee_code || "",
                "Họ và tên": employee.name || "",
                Email: employee.email || "",
                "Số điện thoại": employee.phone || "",
                "Phòng ban": deptName,
                "Chức vụ": roleName,
                "Chi nhánh": branchName,
                "Ngày vào làm": formatDate(employee.join_date),
                "Ngày sinh": formatDate(employee.birthday),
                "Địa chỉ": employee.address || "",
                "Trạng thái": EMPLOYEE_STATUS_LABELS[employee.status] || "",
            };
        });
    } else if (type === "customers") {
        console.log(
            "Đang chuẩn bị xuất dữ liệu khách hàng:",
            data.length,
            "bản ghi"
        );

        return data.map((customer, index) => {
            // Xử lý thông tin chi nhánh
            let branchName = "";
            let branchId = null;

            // Xác định branchId từ dữ liệu khách hàng
            if (
                customer.branch &&
                typeof customer.branch === "object" &&
                customer.branch.id
            ) {
                branchId = customer.branch.id;
            } else if (customer.branch && typeof customer.branch !== "object") {
                branchId = customer.branch;
            } else if (customer.branchId) {
                branchId = customer.branchId;
            }

            // Tìm tên chi nhánh từ danh sách branches nếu có
            if (branchId && branches && branches.length > 0) {
                const foundBranch = branches.find(
                    (branch) => String(branch.id) === String(branchId)
                );
                if (foundBranch) {
                    branchName = foundBranch.name;
                } else {
                    branchName = `Chi nhánh ${branchId}`;
                }
            } else {
                // Các trường hợp có thể xảy ra với dữ liệu chi nhánh khi không có branches
                if (customer.branch) {
                    // Trường hợp 1: branch là object có thuộc tính name
                    if (
                        typeof customer.branch === "object" &&
                        customer.branch.name
                    ) {
                        branchName = customer.branch.name;
                    }
                    // Trường hợp 2: branch có đủ thông tin nhưng tên được lưu ở branchName
                    else if (
                        typeof customer.branch === "object" &&
                        customer.branch.branchName
                    ) {
                        branchName = customer.branch.branchName;
                    }
                    // Ghi log để debug nếu chi nhánh là object nhưng không có tên
                    else if (typeof customer.branch === "object") {
                        console.log("Chi nhánh không có tên:", customer.branch);
                        // Nếu có id, hiển thị tên chi nhánh theo id
                        if (customer.branch.id) {
                            branchName = customer.branch.id
                                .toString()
                                .includes("Chi nhánh")
                                ? customer.branch.id.toString()
                                : `Chi nhánh ${customer.branch.id}`;
                        }
                    }
                    // Trường hợp 3: branch là giá trị đơn (có thể là string hoặc số)
                    else if (typeof customer.branch !== "object") {
                        // Kiểm tra nếu đã có tiền tố "Chi nhánh" thì không thêm nữa
                        branchName = String(customer.branch).includes(
                            "Chi nhánh"
                        )
                            ? String(customer.branch)
                            : `Chi nhánh ${customer.branch}`;
                    }
                }
                // Trường hợp 4: không có branch nhưng có branchId
                else if (customer.branchId) {
                    // Kiểm tra nếu đã có tiền tố "Chi nhánh" thì không thêm nữa
                    branchName = String(customer.branchId).includes("Chi nhánh")
                        ? String(customer.branchId)
                        : `Chi nhánh ${customer.branchId}`;
                }
            }

            const customerType =
                customer.type === "vip" ? "Khách VIP" : "Khách thường";
            const customerStatus =
                customer.status === "active" ? "Đang hoạt động" : "Đã khóa";

            return {
                STT: index + 1,
                "Mã KH": customer.customer_code || "",
                "Họ và tên": customer.name || "",
                "Số điện thoại": customer.phone || "",
                Email: customer.email || "",
                "CCCD/Passport": customer.idNumber || "",
                "Địa chỉ": customer.address || "",
                "Chi nhánh": branchName || "Chưa có chi nhánh",
                "Loại khách hàng": customerType,
                "Trạng thái": customerStatus,
                "Số lần đặt": customer.totalBookings || 0,
                "Tổng chi tiêu": formatCurrency(customer.totalSpent || 0),
                "Ngày sinh": formatDate(customer.birthday),
                "Ngày tạo": formatDate(customer.createdAt),
                "Ghi chú": customer.note || "",
            };
        });
    }

    // Mặc định trả về dữ liệu gốc chuyển sang dạng phẳng
    return data.map((item) => {
        const flatItem = {};

        // Làm phẳng các đối tượng lồng nhau
        Object.keys(item).forEach((key) => {
            if (
                item[key] &&
                typeof item[key] === "object" &&
                !Array.isArray(item[key])
            ) {
                Object.keys(item[key]).forEach((nestedKey) => {
                    flatItem[`${key}_${nestedKey}`] = item[key][nestedKey];
                });
            } else if (!Array.isArray(item[key])) {
                flatItem[key] = item[key];
            }
        });

        return flatItem;
    });
};

/**
 * Tính toán độ rộng cột dựa trên dữ liệu
 * @param {Array} data - Dữ liệu xuất
 * @returns {Array} - Mảng độ rộng cột
 */
const calculateColumnWidths = (data) => {
    if (!data || data.length === 0) return [];

    const sampleRow = data[0];
    return Object.keys(sampleRow).map((key) => {
        // Tính độ rộng dựa trên độ dài của tên cột + 2
        let width = key.length + 2;

        // Kiểm tra độ dài dữ liệu trong cột
        data.forEach((row) => {
            const cellValue = String(row[key] || "");
            if (cellValue.length > width) {
                width = Math.min(cellValue.length + 2, 50); // Giới hạn độ rộng tối đa là 50
            }
        });

        return { wch: width };
    });
};

/**
 * Định dạng số tiền thành tiền tệ Việt Nam
 * @param {number} value - Số tiền cần định dạng
 * @returns {string} - Chuỗi đã định dạng
 */
const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);
};
