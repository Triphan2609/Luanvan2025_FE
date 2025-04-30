import axios from "axios";

const API_URL = "http://localhost:8000/api/areas";

export const getAreas = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createArea = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateArea = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const updateAreaStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
};

export const deleteArea = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
