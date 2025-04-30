import axios from "axios";

const API_URL = "http://localhost:8000/api/services";

export const getServices = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createService = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateService = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteService = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
