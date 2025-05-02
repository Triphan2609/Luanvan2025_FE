import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Lấy danh sách chức vụ
export const getPositions = async () => {
    try {
        console.log("Fetching positions...");
        const response = await axios.get(`${API_URL}/roles-employee`);
        console.log("Positions response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching positions:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
};

// Lấy chi tiết chức vụ theo ID
export const getPositionById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/roles-employee/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching position with id ${id}:`, error);
        throw error;
    }
};

// Tạo chức vụ mới
export const createPosition = async (data) => {
    try {
        console.log("Creating position with data:", data);
        const response = await axios.post(`${API_URL}/roles-employee`, data);
        console.log("Create position response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating position:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
};

// Cập nhật chức vụ
export const updatePosition = async (id, data) => {
    try {
        console.log("Updating position with data:", data);
        const response = await axios.patch(
            `${API_URL}/roles-employee/${id}`,
            data
        );
        console.log("Update position response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating position:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
};

// Xóa chức vụ
export const deletePosition = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/roles-employee/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting position:", error);
        console.error("Error response:", error.response?.data);
        throw error;
    }
};

// Lấy số lượng nhân viên theo chức vụ
export const getEmployeeCountByPosition = async (id) => {
    try {
        const response = await axios.get(
            `${API_URL}/roles-employee/${id}/employee-count`
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching employee count for position ${id}:`,
            error
        );
        return { count: 0 }; // Trả về 0 nếu API chưa có
    }
};
