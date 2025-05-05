import apiClient from "../configs/apiClient";
import axios from "axios";

// Tạo bản ghi chấm công mới
export const createAttendance = async (attendanceData) => {
    try {
        const response = await apiClient.post("/attendances", attendanceData);
        return response.data;
    } catch (error) {
        console.error("Error creating attendance:", error);
        throw error;
    }
};

// Lấy danh sách dữ liệu chấm công
export const getAttendances = async (params = {}) => {
    try {
        // Ensure branch_id is correctly passed in the params
        if (params.branch_id) {
            params.branch_id = Number(params.branch_id);
        }

        const response = await apiClient.get("/attendances", {
            params: params,
        });

        return response.data;
    } catch (error) {
        console.error("Error getting attendances:", error);
        throw error;
    }
};

// Lấy thông tin chi tiết một dữ liệu chấm công
export const getAttendanceById = async (id) => {
    try {
        const response = await apiClient.get(`/attendances/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error getting attendance with ID ${id}:`, error);
        throw error;
    }
};

// Tạo nhiều dữ liệu chấm công cùng lúc
export const createBulkAttendances = async (attendancesData) => {
    try {
        const response = await apiClient.post(
            "/attendances/bulk",
            attendancesData
        );
        return response.data;
    } catch (error) {
        console.error("Error creating bulk attendances:", error);
        throw error;
    }
};

// Cập nhật thông tin chấm công
export const updateAttendance = async (id, data) => {
    try {
        const response = await apiClient.put(`/attendances/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating attendance:", error);
        throw error;
    }
};

// Cập nhật trạng thái chấm công
export const updateAttendanceStatus = async (id, statusData) => {
    try {
        const response = await apiClient.patch(
            `/attendances/${id}/status`,
            statusData
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating attendance status with ID ${id}:`, error);
        throw error;
    }
};

// Cập nhật trạng thái nhiều dữ liệu chấm công
export const updateBulkAttendanceStatus = async (ids, status) => {
    try {
        const response = await apiClient.patch("/attendances/bulk-status", {
            ids,
            status,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating bulk attendance status:", error);
        throw error;
    }
};

// Xóa dữ liệu chấm công
export const deleteAttendance = async (id) => {
    try {
        const response = await apiClient.delete(`/attendances/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting attendance with ID ${id}:`, error);
        throw error;
    }
};

// Xóa nhiều dữ liệu chấm công
export const deleteBulkAttendances = async (ids) => {
    try {
        const response = await apiClient.delete("/attendances/bulk", {
            data: { ids },
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting bulk attendances:", error);
        throw error;
    }
};

// Chấm công vào
export const checkIn = async (employeeId, data = {}) => {
    try {
        const attendanceData = {
            employee_id: employeeId,
            date: data.date || new Date().toISOString().split("T")[0],
            check_in:
                data.check_in ||
                new Date().toTimeString().split(" ")[0].substring(0, 5),
            type: data.type || "normal",
            notes: data.notes || "",
        };

        const response = await apiClient.post("/attendances", attendanceData);
        return response.data;
    } catch (error) {
        console.error(`Error check-in for employee ${employeeId}:`, error);
        throw error;
    }
};

// Chấm công ra
export const checkOut = async (attendanceId, checkOutTime = null) => {
    try {
        const data = {
            check_out:
                checkOutTime ||
                new Date().toTimeString().split(" ")[0].substring(0, 5),
        };

        const response = await apiClient.patch(
            `/attendances/${attendanceId}`,
            data
        );
        return response.data;
    } catch (error) {
        console.error(`Error check-out for attendance ${attendanceId}:`, error);
        throw error;
    }
};

// Lấy dữ liệu chấm công theo ngày và nhân viên
export const getAttendanceByEmployeeAndDate = async (employeeId, date) => {
    try {
        const response = await apiClient.get("/attendances", {
            params: {
                employee_id: employeeId,
                date: date,
            },
        });

        return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
        console.error(
            `Error getting attendance for employee ${employeeId} on ${date}:`,
            error
        );
        throw error;
    }
};

// Gửi yêu cầu điều chỉnh chấm công
export const requestAttendanceAdjustment = async (data) => {
    try {
        const adjustmentData = {
            ...data,
            is_adjustment: true,
        };

        const response = await apiClient.post("/attendances", adjustmentData);
        return response.data;
    } catch (error) {
        console.error("Error requesting attendance adjustment:", error);
        throw error;
    }
};

// Duyệt yêu cầu điều chỉnh chấm công
export const approveAttendanceAdjustment = async (id, data) => {
    try {
        const approvalData = {
            status: "approved",
            ...data,
        };

        const response = await apiClient.patch(
            `/attendances/${id}/status`,
            approvalData
        );
        return response.data;
    } catch (error) {
        console.error(`Error approving attendance adjustment ${id}:`, error);
        throw error;
    }
};

// Từ chối yêu cầu điều chỉnh chấm công
export const rejectAttendanceAdjustment = async (id, data) => {
    try {
        const rejectionData = {
            status: "rejected",
            ...data,
        };

        const response = await apiClient.patch(
            `/attendances/${id}/status`,
            rejectionData
        );
        return response.data;
    } catch (error) {
        console.error(`Error rejecting attendance adjustment ${id}:`, error);
        throw error;
    }
};

// Lấy thống kê chấm công
export const getAttendanceStats = async (
    startDate,
    endDate,
    departmentId,
    branchId
) => {
    try {
        const params = {
            start_date: startDate,
            end_date: endDate,
        };

        // Chuyển departmentId thành số nếu có
        if (departmentId !== undefined && departmentId !== null) {
            params.department_id = Number(departmentId);
        }

        // Chuyển branchId thành số nếu có
        if (branchId !== undefined && branchId !== null) {
            params.branch_id = Number(branchId);
        }

        const response = await apiClient.get("/attendances/stats", {
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error getting attendance stats:", error);
        throw error;
    }
};
