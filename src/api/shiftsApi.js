import apiClient from "../configs/apiClient";

const API_URL = "/shifts";

// Lấy danh sách ca làm việc
export const getShifts = async (options = {}) => {
    try {
        const { type, isActive, branch_id } = options;

        const queryParams = new URLSearchParams();
        if (type) queryParams.append("type", type);
        if (isActive !== undefined) queryParams.append("isActive", isActive);
        if (branch_id) queryParams.append("branch_id", branch_id);

        const response = await apiClient.get(
            `${API_URL}?${queryParams.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts:", error);
        throw error;
    }
};

// Lấy danh sách ca làm việc theo chi nhánh
export const getShiftsByBranch = async (branchId) => {
    try {
        const response = await apiClient.get(
            `${API_URL}/by-branch/${branchId}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching shifts for branch ${branchId}:`, error);
        throw error;
    }
};

// Lấy danh sách ca làm việc đang hoạt động
export const getActiveShifts = async () => {
    try {
        const response = await apiClient.get(`${API_URL}/active`);
        return response.data;
    } catch (error) {
        console.error("Error fetching active shifts:", error);
        throw error;
    }
};

// Lấy chi tiết ca làm việc theo ID
export const getShiftById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching shift with id ${id}:`, error);
        throw error;
    }
};

// Lấy chi tiết ca làm việc theo mã
export const getShiftByCode = async (code) => {
    try {
        const response = await apiClient.get(`${API_URL}/code/${code}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching shift with code ${code}:`, error);
        throw error;
    }
};

// Tạo ca làm việc mới
export const createShift = async (data) => {
    try {
        const response = await apiClient.post(`${API_URL}`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating shift:", error);
        throw error;
    }
};

// Cập nhật ca làm việc
export const updateShift = async (id, data) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating shift:", error);
        throw error;
    }
};

// Kích hoạt ca làm việc
export const activateShift = async (id) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}/activate`);
        return response.data;
    } catch (error) {
        console.error(`Error activating shift ${id}:`, error);
        throw error;
    }
};

// Vô hiệu hóa ca làm việc
export const deactivateShift = async (id) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}/deactivate`);
        return response.data;
    } catch (error) {
        console.error(`Error deactivating shift ${id}:`, error);
        throw error;
    }
};

// Xóa ca làm việc
export const deleteShift = async (id) => {
    try {
        await apiClient.delete(`${API_URL}/${id}`);
        return true;
    } catch (error) {
        console.error("Error deleting shift:", error);
        throw error;
    }
};
