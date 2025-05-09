import apiClient from "../configs/apiClient";
import { message } from "antd";

const API_URL = "/branches";

export const getBranches = async () => {
    try {
        const response = await apiClient.get(API_URL);

        return response.data || [];
    } catch (error) {
        console.error("Error fetching branches:", error);
        message.error(
            "Không thể tải danh sách chi nhánh. Vui lòng thử lại sau."
        );
        return [];
    }
};

// Add new function to get hotel branches only
export const getHotelBranches = async () => {
    try {
        const response = await apiClient.get(API_URL);

        // Filter branches that have branchType.key_name as 'hotel' or 'both'
        const hotelBranches = (response.data || []).filter(
            (branch) =>
                branch.branchType &&
                (branch.branchType.key_name === "hotel" ||
                    branch.branchType.key_name === "both")
        );

        return hotelBranches;
    } catch (error) {
        console.error("Error fetching hotel branches:", error);
        message.error(
            "Không thể tải danh sách chi nhánh khách sạn. Vui lòng thử lại sau."
        );
        return [];
    }
};

// Add new function to get restaurant branches only
export const getRestaurantBranches = async () => {
    try {
        const response = await apiClient.get(API_URL);

        // Filter branches that have branchType.key_name as 'restaurant' or 'both'
        const restaurantBranches = (response.data || []).filter(
            (branch) =>
                branch.branchType &&
                (branch.branchType.key_name === "restaurant" ||
                    branch.branchType.key_name === "both")
        );

        return restaurantBranches;
    } catch (error) {
        console.error("Error fetching restaurant branches:", error);
        message.error(
            "Không thể tải danh sách chi nhánh nhà hàng. Vui lòng thử lại sau."
        );
        return [];
    }
};

export const getBranchById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching branch ID ${id}:`, error);
        message.error("Không thể tải thông tin chi nhánh");
        throw error;
    }
};

export const createBranch = async (data) => {
    const response = await apiClient.post(API_URL, data);
    return response.data;
};

export const updateBranch = async (id, data) => {
    const response = await apiClient.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteBranch = async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
};

export const updateBranchStatus = async (id, status) => {
    const response = await apiClient.patch(`${API_URL}/${id}/status`, {
        status,
    });
    return response.data;
};
