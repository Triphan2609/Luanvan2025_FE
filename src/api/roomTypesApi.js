import apiClient from "../configs/apiClient";

const API_URL = "/room-types";

export const getRoomTypes = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

export const getRoomTypeById = async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
};

export const createRoomType = async (data) => {
    const response = await apiClient.post(API_URL, data);
    return response.data;
};

export const updateRoomType = async (id, data) => {
    const response = await apiClient.patch(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteRoomType = async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
};
