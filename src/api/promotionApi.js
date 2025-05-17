import apiClient from "../configs/apiClient";

export const getPromotions = async (params) => {
    const res = await apiClient.get("/promotions", { params });
    return res.data;
};

export const getPromotionById = async (id) => {
    const res = await apiClient.get(`/promotions/${id}`);
    return res.data;
};

export const createPromotion = async (data) => {
    const res = await apiClient.post("/promotions", data);
    return res.data;
};

export const updatePromotion = async (id, data) => {
    const res = await apiClient.patch(`/promotions/${id}`, data);
    return res.data;
};

export const deletePromotion = async (id) => {
    const res = await apiClient.delete(`/promotions/${id}`);
    return res.data;
};

// Nếu có upload ảnh banner
export const uploadPromotionImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post("/uploads/promotion", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};
