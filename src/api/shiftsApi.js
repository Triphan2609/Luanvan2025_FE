import axios from "axios";

const API_URL = "http://localhost:8000";

// Lấy danh sách ca làm việc
export const getShifts = async (params = {}) => {
    try {
        const { type, isActive } = params;
        let url = `${API_URL}/api/shifts`;

        // Xây dựng query params
        const queryParams = new URLSearchParams();
        if (type) queryParams.append("type", type);
        if (isActive !== undefined) queryParams.append("isActive", isActive);

        const queryString = queryParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts:", error);
        throw error;
    }
};

// Lấy danh sách ca làm việc đang hoạt động
export const getActiveShifts = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/shifts/active`);
        return response.data;
    } catch (error) {
        console.error("Error fetching active shifts:", error);
        throw error;
    }
};

// Lấy chi tiết ca làm việc theo ID
export const getShiftById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/api/shifts/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching shift with id ${id}:`, error);
        throw error;
    }
};

// Lấy ca làm việc theo mã
export const getShiftByCode = async (code) => {
    try {
        const response = await axios.get(`${API_URL}/api/shifts/code/${code}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching shift with code ${code}:`, error);
        throw error;
    }
};

// Tạo ca làm việc mới
export const createShift = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/api/shifts`, data);
        return response.data;
    } catch (error) {
        console.error("Error creating shift:", error);
        throw error;
    }
};

// Cập nhật ca làm việc
export const updateShift = async (id, data) => {
    try {
        const response = await axios.patch(`${API_URL}/api/shifts/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating shift:", error);
        throw error;
    }
};

// Kích hoạt ca làm việc
export const activateShift = async (id) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/shifts/${id}/activate`
        );
        return response.data;
    } catch (error) {
        console.error(`Error activating shift ${id}:`, error);
        throw error;
    }
};

// Vô hiệu hóa ca làm việc
export const deactivateShift = async (id) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/shifts/${id}/deactivate`
        );
        return response.data;
    } catch (error) {
        console.error(`Error deactivating shift ${id}:`, error);
        throw error;
    }
};

// Xóa ca làm việc
export const deleteShift = async (id) => {
    try {
        await axios.delete(`${API_URL}/api/shifts/${id}`);
        return true;
    } catch (error) {
        console.error("Error deleting shift:", error);
        throw error;
    }
};
