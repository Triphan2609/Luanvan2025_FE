import apiClient from "../configs/apiClient";

// Lấy danh sách phòng ban
export const getDepartments = async () => {
    try {
        const response = await apiClient.get("/departments");
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy danh sách phòng ban theo chi nhánh
export const getDepartmentsByBranch = async (branchId) => {
    try {
        const response = await apiClient.get(
            `/departments/by-branch/${branchId}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy chi tiết phòng ban theo ID
export const getDepartmentById = async (id) => {
    try {
        const response = await apiClient.get(`/departments/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Tạo phòng ban mới
export const createDepartment = async (data) => {
    try {
        const response = await apiClient.post("/departments", data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật phòng ban
export const updateDepartment = async (id, data) => {
    try {
        const response = await apiClient.patch(`/departments/${id}`, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa phòng ban
export const deleteDepartment = async (id) => {
    try {
        const response = await apiClient.delete(`/departments/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy số lượng nhân viên theo phòng ban
export const getEmployeeCountByDepartment = async (id) => {
    try {
        const response = await apiClient.get(
            `/departments/${id}/employee-count`
        );
        return response.data;
    } catch (error) {
        return { count: 0 }; // Trả về 0 nếu API chưa có
    }
};
