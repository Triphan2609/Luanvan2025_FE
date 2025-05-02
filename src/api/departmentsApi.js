import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Lấy danh sách phòng ban
export const getDepartments = async () => {
    try {
        console.log("Fetching departments...");
        const response = await axios.get(`${API_URL}/departments`);
        console.log("Departments response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching departments:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
};

// Lấy chi tiết phòng ban theo ID
export const getDepartmentById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/departments/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching department with id ${id}:`, error);
        throw error;
    }
};

// Tạo phòng ban mới
export const createDepartment = async (data) => {
    try {
        console.log("Creating department with data:", data);
        const response = await axios.post(`${API_URL}/departments`, data);
        console.log("Create department response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating department:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
};

// Cập nhật phòng ban
export const updateDepartment = async (id, data) => {
    try {
        console.log("Updating department with data:", data);
        const response = await axios.patch(
            `${API_URL}/departments/${id}`,
            data
        );
        console.log("Update department response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating department:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
};

// Xóa phòng ban
export const deleteDepartment = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/departments/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting department:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
};

// Lấy số lượng nhân viên theo phòng ban
export const getEmployeeCountByDepartment = async (id) => {
    try {
        const response = await axios.get(
            `${API_URL}/departments/${id}/employee-count`
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching employee count for department ${id}:`,
            error
        );
        return { count: 0 }; // Trả về 0 nếu API chưa có
    }
};
