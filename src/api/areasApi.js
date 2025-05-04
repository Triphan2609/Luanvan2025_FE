import apiClient from "../configs/apiClient";

const API_URL = "/areas";

export const getAreas = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

export const createArea = async (data) => {
    const response = await apiClient.post(API_URL, data);
    return response.data;
};

export const updateArea = async (id, data) => {
    const response = await apiClient.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const updateAreaStatus = async (id, status) => {
    const response = await apiClient.patch(`${API_URL}/${id}/status`, {
        status,
    });
    return response.data;
};

export const deleteArea = async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
};
