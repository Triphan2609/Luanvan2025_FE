import apiClient from "../configs/apiClient";
import axios from "axios";

// API QUẢN LÝ CẤU HÌNH LƯƠNG

// Lấy danh sách cấu hình lương
export const getSalaryConfigs = async (filters = {}) => {
    try {
        const response = await apiClient.get("/salary-configs", {
            params: filters,
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy cấu hình lương theo ID
export const getSalaryConfigById = async (id) => {
    try {
        const response = await apiClient.get(`/salary-configs/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy cấu hình lương theo phòng ban và chức vụ
export const getSalaryConfigByDepartmentAndRole = async (
    departmentId,
    roleId
) => {
    try {
        const response = await apiClient.get(
            `/salary-configs/department/${departmentId}/role/${roleId}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy cấu hình lương của nhân viên
export const getEmployeeSalaryConfig = async (employeeId) => {
    try {
        const response = await apiClient.get(
            `/salary-configs/employee/${employeeId}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Tạo mới cấu hình lương
export const createSalaryConfig = async (salaryConfigData) => {
    try {
        const response = await apiClient.post(
            "/salary-configs",
            salaryConfigData
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật cấu hình lương
export const updateSalaryConfig = async (id, salaryConfigData) => {
    try {
        const response = await apiClient.patch(
            `/salary-configs/${id}`,
            salaryConfigData
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật trạng thái cấu hình lương
export const updateSalaryConfigStatus = async (id, isActive) => {
    try {
        const response = await apiClient.patch(`/salary-configs/${id}/status`, {
            is_active: isActive,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa cấu hình lương
export const deleteSalaryConfig = async (id) => {
    try {
        const response = await apiClient.delete(`/salary-configs/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy danh sách loại lương
export const getSalaryTypes = async () => {
    // Trả về giá trị mặc định ngay lập tức thay vì gọi API
    return {
        types: ["monthly", "hourly", "shift"],
        labels: {
            monthly: "Lương tháng",
            hourly: "Lương giờ",
            shift: "Lương ca",
        },
    };

    // Code dưới đây đã bị vô hiệu hóa để tránh lỗi
    /*
    try {
        const response = await apiClient.get("/salary-configs/types");
        return response.data;
    } catch (error) {
        // Return default values when API fails
        return {
            types: ["monthly", "hourly", "shift"],
            labels: {
                monthly: "Lương tháng",
                hourly: "Lương giờ",
                shift: "Lương ca",
            },
        };
    }
    */
};

// API QUẢN LÝ BẢNG LƯƠNG

// Lấy danh sách bảng lương
export const getPayrolls = async (params = {}) => {
    try {
        const response = await apiClient.get("/payrolls", {
            params: params,
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy thông tin chi tiết bảng lương
export const getPayrollById = async (id) => {
    try {
        const response = await apiClient.get(`/payrolls/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy bảng lương theo mã
export const getPayrollByCode = async (code) => {
    try {
        const response = await apiClient.get(`/payrolls/code/${code}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy bảng lương của một nhân viên
export const getEmployeePayrolls = async (employeeId, params = {}) => {
    try {
        const queryParams = {
            ...params,
            employee_id: employeeId,
        };

        const response = await apiClient.get("/payrolls", {
            params: queryParams,
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

// Tạo mới bảng lương
export const createPayroll = async (payrollData) => {
    try {
        // Log dữ liệu đang gửi để debug
        console.log(
            "Creating payroll with data:",
            JSON.stringify(payrollData, null, 2)
        );

        // Đảm bảo ca đêm có hệ số nếu có giờ làm ca đêm
        if (
            payrollData.night_shift_hours &&
            payrollData.night_shift_hours > 0 &&
            !payrollData.night_shift_multiplier
        ) {
            // Đặt giá trị mặc định nếu không có
            payrollData.night_shift_multiplier = 1.3;
            console.log("Added default night shift multiplier: 1.3");
        }

        // Validate night shift multiplier is a number
        if (payrollData.night_shift_multiplier) {
            const multiplier = Number(payrollData.night_shift_multiplier);
            if (!isNaN(multiplier)) {
                payrollData.night_shift_multiplier = multiplier;
                console.log(`Validated night shift multiplier: ${multiplier}`);
            }
        }

        // Final log before sending to API
        if (payrollData.night_shift_hours > 0) {
            console.log(
                `Final night shift data - Hours: ${
                    payrollData.night_shift_hours
                }, Multiplier: ${
                    payrollData.night_shift_multiplier ||
                    "not set (will use default)"
                }`
            );
        }

        const response = await apiClient.post("/payrolls", payrollData);
        return response.data;
    } catch (error) {
        console.error("Error creating payroll:", error);
        throw error;
    }
};

// Tạo nhiều bảng lương cùng lúc
export const createBulkPayrolls = async (payrollsData) => {
    try {
        const response = await apiClient.post("/payrolls/bulk", payrollsData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật bảng lương
export const updatePayroll = async (id, payrollData) => {
    try {
        const response = await apiClient.patch(`/payrolls/${id}`, payrollData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật trạng thái bảng lương
export const updatePayrollStatus = async (id, statusData) => {
    try {
        const response = await apiClient.patch(
            `/payrolls/${id}/status`,
            statusData
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Hoàn thiện bảng lương
export const finalizePayroll = async (id) => {
    try {
        const response = await apiClient.patch(`/payrolls/${id}/status`, {
            status: "finalized",
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Thanh toán bảng lương
export const payPayroll = async (id, paymentData) => {
    try {
        const data = {
            status: "paid",
            payment_date:
                paymentData.payment_date ||
                new Date().toISOString().split("T")[0],
            notes: paymentData.notes || "",
        };

        const response = await apiClient.patch(`/payrolls/${id}/status`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa bảng lương
export const deletePayroll = async (id) => {
    try {
        const response = await apiClient.delete(`/payrolls/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xuất báo cáo bảng lương
export const exportPayrollReport = async (id) => {
    try {
        const response = await apiClient.get(`/payrolls/${id}/export`, {
            responseType: "blob",
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

// Tạo bảng lương hàng loạt theo kỳ
export const generatePeriodPayrolls = async (periodData) => {
    try {
        const response = await apiClient.post(
            "/payrolls/generate-period",
            periodData
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy báo cáo tổng hợp lương theo phòng ban
export const getDepartmentPayrollSummary = async (
    departmentId,
    params = {}
) => {
    try {
        const queryParams = {
            ...params,
            department_id: departmentId,
        };

        const response = await apiClient.get("/payrolls/summary/department", {
            params: queryParams,
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy báo cáo tổng hợp lương theo kỳ
export const getPeriodPayrollSummary = async (params = {}) => {
    try {
        const response = await apiClient.get("/payrolls/summary/period", {
            params: params,
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy thống kê bảng lương
export const getPayrollStats = async (startDate, endDate, departmentId) => {
    try {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };

        if (departmentId) {
            params.department_id = departmentId;
        }

        const response = await apiClient.get("/payrolls/stats", {
            params: params,
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy dữ liệu tích hợp chấm công và lương
export const getAttendanceIntegration = async (
    employeeId,
    startDate,
    endDate
) => {
    try {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };

        const response = await apiClient.get(
            `/payrolls/attendance-integration/${employeeId}`,
            {
                params: params,
            }
        );

        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Process payment for a payroll
 * @param {number} id - Payroll ID
 * @param {Object} paymentDetails - Optional payment details
 * @param {Date} paymentDetails.paymentDate - Payment date
 * @param {string} paymentDetails.notes - Payment notes
 * @param {string} paymentDetails.paymentReference - Payment reference
 * @returns {Promise<Object>} Updated payroll object
 */
export const processPayrollPayment = async (id, paymentDetails = {}) => {
    try {
        const response = await apiClient.patch(
            `/payrolls/${id}/process-payment`,
            paymentDetails
        );
        return response.data;
    } catch (error) {
        console.error("Error processing payroll payment:", error);
        throw error;
    }
};

/**
 * Process payment for multiple payrolls at once
 * @param {number[]} ids - Array of payroll IDs
 * @param {Object} paymentDetails - Optional payment details
 * @returns {Promise<Object>} Results summary
 */
export const batchProcessPayrollPayments = async (ids, paymentDetails = {}) => {
    try {
        const response = await apiClient.patch(
            `/payrolls/batch-process-payment`,
            {
                ids,
                ...paymentDetails,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error batch processing payroll payments:", error);
        throw error;
    }
};

// Tạo bảng lương hàng loạt theo kỳ
export const generateBatchPayrolls = async (batchData) => {
    try {
        const response = await apiClient.post(
            "/payrolls/generate-batch",
            batchData
        );
        return response.data;
    } catch (error) {
        console.error("Error generating batch payrolls:", error);
        throw error;
    }
};

/**
 * Tiện ích để kiểm tra tính toán lương ca đêm
 * Có thể gọi từ console để debug: window.testNightShiftCalc(3500000, 6, 1.3)
 *
 * @param {number} baseSalary - Lương cơ bản
 * @param {number} hours - Số giờ ca đêm
 * @param {number} multiplier - Hệ số lương ca đêm (mặc định 1.3)
 * @returns {object} - Kết quả tính toán với chi tiết
 */
export const testNightShiftCalc = (baseSalary, hours, multiplier = 1.3) => {
    const standardDaysInMonth = 22;
    const standardHoursPerDay = 8;

    // Đảm bảo giá trị hợp lệ
    const validMultiplier = Math.max(Number(multiplier) || 1.0, 1.0);
    const validHours = Math.max(Number(hours) || 0, 0);
    const validSalary = Math.max(Number(baseSalary) || 0, 0);

    // Tính lương theo giờ
    const hourlyRate =
        validSalary / (standardDaysInMonth * standardHoursPerDay);

    // Tính lương ca đêm
    const nightShiftPay = validHours * hourlyRate * validMultiplier;

    const result = {
        baseSalary: validSalary,
        nightShiftHours: validHours,
        nightShiftMultiplier: validMultiplier,
        hourlyRate: hourlyRate,
        nightShiftPay: nightShiftPay,
        formattedNightShiftPay: new Intl.NumberFormat("vi-VN").format(
            Math.round(nightShiftPay)
        ),
        formattedHourlyRate: new Intl.NumberFormat("vi-VN").format(
            Math.round(hourlyRate)
        ),
    };

    console.log("=== Kết quả tính lương ca đêm ===");
    console.log(
        `Lương cơ bản: ${(result.formattedBaseSalary = new Intl.NumberFormat(
            "vi-VN"
        ).format(validSalary))} VND`
    );
    console.log(`Số giờ ca đêm: ${validHours} giờ`);
    console.log(`Hệ số ca đêm: ${validMultiplier}`);
    console.log(`Lương theo giờ: ${result.formattedHourlyRate} VND/giờ`);
    console.log(`Lương ca đêm: ${result.formattedNightShiftPay} VND`);
    console.log("================================");

    return result;
};

// Expose to window for browser console testing
if (typeof window !== "undefined") {
    window.testNightShiftCalc = testNightShiftCalc;
}
