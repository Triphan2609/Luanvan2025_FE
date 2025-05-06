import apiClient from "../configs/apiClient";
import { message } from "antd";

const API_URL = "/floors";

export const getFloors = async (params = {}) => {
    try {
        const response = await apiClient.get(API_URL, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching floors:", error);
        message.error("Không thể tải danh sách tầng");
        return [];
    }
};

export const getFloorById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching floor ID ${id}:`, error);
        message.error("Không thể tải thông tin tầng");
        throw error;
    }
};

export const getFloorsByBranch = async (branchId) => {
    try {
        const response = await apiClient.get(`${API_URL}/branch/${branchId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching floors for branch ${branchId}:`, error);
        message.error("Không thể tải danh sách tầng theo chi nhánh");
        return [];
    }
};

export const getFloorDetails = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}/details`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching floor details for ID ${id}:`, error);
        message.error("Không thể tải chi tiết tầng");
        return null;
    }
};

export const createFloor = async (data) => {
    try {
        const response = await apiClient.post(API_URL, data);
        message.success("Thêm tầng mới thành công");
        return response.data;
    } catch (error) {
        console.error("Error creating floor:", error);
        if (error.response?.data?.message) {
            message.error(error.response.data.message);
        } else {
            message.error("Không thể tạo tầng mới");
        }
        throw error;
    }
};

export const updateFloor = async (id, data) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}`, data);
        message.success("Cập nhật tầng thành công");
        return response.data;
    } catch (error) {
        console.error("Error updating floor:", error);
        if (error.response?.data?.message) {
            message.error(error.response.data.message);
        } else {
            message.error("Không thể cập nhật tầng");
        }
        throw error;
    }
};

export const deleteFloor = async (id) => {
    try {
        await apiClient.delete(`${API_URL}/${id}`);
        message.success("Xóa tầng thành công");
        return true;
    } catch (error) {
        console.error("Error deleting floor:", error);
        if (error.response?.data?.message) {
            message.error(error.response.data.message);
        } else {
            message.error("Không thể xóa tầng");
        }
        throw error;
    }
};
