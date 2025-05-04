import apiClient from "../configs/apiClient";

const API_URL = "/services";

export const getServices = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

export const createService = async (data) => {
    const response = await apiClient.post(API_URL, data);
    return response.data;
};

export const updateService = async (id, data) => {
    const response = await apiClient.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteService = async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
};
