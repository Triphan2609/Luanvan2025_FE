import apiClient from "../configs/apiClient";

const API_URL = "/amenities";

export const getAmenities = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

export const getAmenity = async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
};

export const createAmenity = async (amenityData) => {
    const response = await apiClient.post(API_URL, amenityData);
    return response.data;
};

export const updateAmenity = async (id, amenityData) => {
    const response = await apiClient.patch(`${API_URL}/${id}`, amenityData);
    return response.data;
};

export const deleteAmenity = async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
};
