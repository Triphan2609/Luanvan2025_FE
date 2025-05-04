import apiClient from "../configs/apiClient";

const API_URL = "/branch-types";

export const getBranchTypes = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

export const createBranchType = async (data) => {
    const response = await apiClient.post(API_URL, data);
    return response.data;
};

export const updateBranchType = async (id, data) => {
    const response = await apiClient.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteBranchType = async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
};
