import apiClient from "../configs/apiClient";

// Lấy danh sách vai trò nhân viên
export const getRoles = async (filters = {}) => {
    try {
        const response = await apiClient.get("/roles-employee", {
            params: filters,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy chi tiết vai trò
export const getRole = async (id) => {
    try {
        const response = await apiClient.get(`/roles-employee/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Tạo vai trò mới
export const createRole = async (data) => {
    try {
        const response = await apiClient.post("/roles-employee", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật vai trò
export const updateRole = async (id, data) => {
    try {
        const response = await apiClient.patch(`/roles-employee/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa vai trò
export const deleteRole = async (id) => {
    try {
        const response = await apiClient.delete(`/roles-employee/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy tất cả vai trò để hiển thị trong dropdown
export const getAllRoles = async () => {
    try {
        const response = await apiClient.get("/roles-employee/all");
        return response.data;
    } catch (error) {
        throw error;
    }
};
