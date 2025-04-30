import axios from "axios";

const API_URL = "http://localhost:8000/api/branch-types";

export const getBranchTypes = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createBranchType = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateBranchType = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteBranchType = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
