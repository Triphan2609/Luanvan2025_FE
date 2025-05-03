import apiClient from "../configs/apiClient";

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
        const response = await apiClient.post("/payrolls", payrollData);
        return response.data;
    } catch (error) {
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
