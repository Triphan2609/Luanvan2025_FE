import axios from "axios";

const API_URL = "http://localhost:8000";

// Lấy danh sách lịch làm việc của nhân viên
export const getEmployeeShifts = async (filters = {}) => {
    try {
        const {
            employeeId,
            shiftId,
            date,
            startDate,
            endDate,
            status,
            department_id,
        } = filters;

        // Xây dựng query params
        const queryParams = new URLSearchParams();
        if (employeeId) queryParams.append("employeeId", employeeId);
        if (shiftId) queryParams.append("shiftId", shiftId);
        if (date) queryParams.append("date", date);
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);
        if (status) queryParams.append("status", status);
        if (department_id) queryParams.append("department_id", department_id);

        const response = await axios.get(
            `${API_URL}/api/employee-shifts?${queryParams.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching employee shifts:", error);
        throw error;
    }
};

// Lấy chi tiết lịch làm việc theo ID
export const getEmployeeShiftById = async (id) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/employee-shifts/${id}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching employee shift with id ${id}:`, error);
        throw error;
    }
};

// Lấy lịch làm việc theo mã
export const getEmployeeShiftByCode = async (code) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/employee-shifts/code/${code}`
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching employee shift with code ${code}:`,
            error
        );
        throw error;
    }
};

// Tạo lịch làm việc mới cho nhân viên
export const createEmployeeShift = async (data) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/employee-shifts`,
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error creating employee shift:", error);
        throw error;
    }
};

// Cập nhật lịch làm việc
export const updateEmployeeShift = async (id, data) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/employee-shifts/${id}`,
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error updating employee shift:", error);
        throw error;
    }
};

// Cập nhật trạng thái lịch làm việc
export const updateEmployeeShiftStatus = async (id, status) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/employee-shifts/${id}/status`,
            { status }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating status for employee shift ${id}:`, error);
        throw error;
    }
};

// Xóa lịch làm việc
export const deleteEmployeeShift = async (id) => {
    try {
        await axios.delete(`${API_URL}/api/employee-shifts/${id}`);
        return true;
    } catch (error) {
        console.error("Error deleting employee shift:", error);
        throw error;
    }
};

// Tạo nhiều lịch làm việc cùng lúc
export const bulkCreateEmployeeShifts = async (data) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/employee-shifts/bulk`,
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error creating bulk employee shifts:", error);
        throw error;
    }
};

// Cập nhật trạng thái cho nhiều lịch làm việc
export const bulkUpdateEmployeeShiftStatus = async (ids, status) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/employee-shifts/bulk-status`,
            { ids, status }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating bulk employee shift status:", error);
        throw error;
    }
};
