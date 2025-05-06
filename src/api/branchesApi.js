import apiClient from "../configs/apiClient";
import { message } from "antd";

const API_URL = "/branches";

export const getBranches = async () => {
    try {
        console.log("Calling getBranches API...");
        const response = await apiClient.get(API_URL);
        console.log("getBranches raw response:", response);
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
        console.log("Fetching hotel branches...");
        const response = await apiClient.get(API_URL);
        console.log("All branches response:", response);

        // Filter branches that have branchType.key_name as 'hotel' or 'both'
        const hotelBranches = (response.data || []).filter(
            (branch) =>
                branch.branchType &&
                (branch.branchType.key_name === "hotel" ||
                    branch.branchType.key_name === "both")
        );

        console.log("Filtered hotel branches:", hotelBranches);
        return hotelBranches;
    } catch (error) {
        console.error("Error fetching hotel branches:", error);
        message.error(
            "Không thể tải danh sách chi nhánh khách sạn. Vui lòng thử lại sau."
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
