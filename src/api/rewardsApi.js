import apiClient from "../configs/apiClient";

const API_URL = "/membership-cards/rewards";

/**
 * Lấy danh sách tất cả phần thưởng (bao gồm cả inactive)
 * @param {Object} params Tham số truy vấn
 * @returns {Promise<Array>} Danh sách phần thưởng
 */
export const getAllRewards = async (params = {}) => {
    try {
        const response = await apiClient.get(`${API_URL}/all`, { params });
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy danh sách phần thưởng",
            }
        );
    }
};

/**
 * Lấy thông tin chi tiết phần thưởng
 * @param {number} id ID của phần thưởng
 * @returns {Promise<Object>} Thông tin chi tiết phần thưởng
 */
export const getRewardById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy thông tin phần thưởng",
            }
        );
    }
};

/**
 * Tạo phần thưởng mới
 * @param {Object} data Dữ liệu phần thưởng
 * @returns {Promise<Object>} Phần thưởng đã tạo
 */
export const createReward = async (data) => {
    try {
        const formData = new FormData();
        for (const key in data) {
            if (key === "image" && data[key] instanceof File) {
                formData.append("image", data[key]);
            } else {
                formData.append(key, data[key]);
            }
        }

        const response = await apiClient.post(API_URL, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Lỗi khi tạo phần thưởng" };
    }
};

/**
 * Cập nhật thông tin phần thưởng
 * @param {number} id ID của phần thưởng
 * @param {Object} data Dữ liệu cập nhật
 * @returns {Promise<Object>} Phần thưởng đã cập nhật
 */
export const updateReward = async (id, data) => {
    try {
        const formData = new FormData();
        for (const key in data) {
            if (key === "image" && data[key] instanceof File) {
                formData.append("image", data[key]);
            } else {
                formData.append(key, data[key]);
            }
        }

        const response = await apiClient.patch(`${API_URL}/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || { message: "Lỗi khi cập nhật phần thưởng" }
        );
    }
};

/**
 * Xóa phần thưởng
 * @param {number} id ID của phần thưởng
 * @returns {Promise<Object>} Kết quả xóa
 */
export const deleteReward = async (id) => {
    try {
        const response = await apiClient.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Lỗi khi xóa phần thưởng" };
    }
};

/**
 * Cập nhật trạng thái phần thưởng
 * @param {number} id ID của phần thưởng
 * @param {string} status Trạng thái mới ('active' hoặc 'inactive')
 * @returns {Promise<Object>} Phần thưởng đã cập nhật
 */
export const updateRewardStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}/status`, {
            status,
        });
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi cập nhật trạng thái phần thưởng",
            }
        );
    }
};
