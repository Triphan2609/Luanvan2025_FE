import axios from "axios";

const API_URL = "http://localhost:8000/api/branches";

export const getBranches = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createBranch = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

export const updateBranch = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const deleteBranch = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const updateBranchStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status });
    return response.data;
};
