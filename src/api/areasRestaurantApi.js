import apiClient from "../configs/apiClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const areasRestaurantApi = {
    /**
     * Lấy danh sách khu vực nhà hàng
     * @param {Object} params - Các tham số truy vấn
     * @param {number} [params.branchId] - ID của chi nhánh (không bắt buộc)
     * @param {boolean} [params.includeInactive] - Bao gồm các khu vực không hoạt động (không bắt buộc)
     * @returns {Promise<Object[]>} Danh sách khu vực
     */
    getAreas: async (params = {}) => {
        try {
            const response = await apiClient.get("/restaurant/areas", {
                params,
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching restaurant areas:", error);
            throw error;
        }
    },

    /**
     * Lấy thông tin khu vực theo ID
     * @param {number} id - ID của khu vực
     * @returns {Promise<Object>} Thông tin chi tiết khu vực
     */
    getAreaById: async (id) => {
        try {
            const response = await apiClient.get(`/restaurant/areas/${id}`);
            return response.data;
        } catch (error) {
            console.error(
                `Error fetching restaurant area with ID ${id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Tạo khu vực mới
     * @param {Object} areaData - Dữ liệu khu vực
     * @param {string} areaData.name - Tên khu vực
     * @param {string} [areaData.description] - Mô tả khu vực (không bắt buộc)
     * @param {boolean} [areaData.isActive] - Trạng thái hoạt động (mặc định: true)
     * @param {number} areaData.branchId - ID của chi nhánh
     * @returns {Promise<Object>} Khu vực đã tạo
     */
    createArea: async (areaData) => {
        try {
            const response = await apiClient.post(
                "/restaurant/areas",
                areaData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating restaurant area:", error);
            throw error;
        }
    },

    /**
     * Cập nhật thông tin khu vực
     * @param {number} id - ID của khu vực
     * @param {Object} areaData - Dữ liệu cập nhật
     * @returns {Promise<Object>} Khu vực đã cập nhật
     */
    updateArea: async (id, areaData) => {
        try {
            const response = await apiClient.patch(
                `/restaurant/areas/${id}`,
                areaData
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error updating restaurant area with ID ${id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Kích hoạt khu vực
     * @param {number} id - ID của khu vực
     * @returns {Promise<Object>} Khu vực đã kích hoạt
     */
    activateArea: async (id) => {
        try {
            const response = await apiClient.patch(
                `/restaurant/areas/${id}/activate`,
                {}
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error activating restaurant area with ID ${id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Vô hiệu hóa khu vực
     * @param {number} id - ID của khu vực
     * @returns {Promise<Object>} Khu vực đã vô hiệu hóa
     */
    deactivateArea: async (id) => {
        try {
            const response = await apiClient.patch(
                `/restaurant/areas/${id}/deactivate`,
                {}
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error deactivating restaurant area with ID ${id}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Tạo các khu vực mặc định cho chi nhánh
     * @param {number} branchId - ID của chi nhánh
     * @returns {Promise<Object[]>} Danh sách khu vực đã tạo
     */
    createDefaultAreas: async (branchId) => {
        try {
            const response = await apiClient.post(
                `/restaurant/areas/create-default`,
                null,
                {
                    params: { branchId },
                }
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error creating default restaurant areas for branch ID ${branchId}:`,
                error
            );
            throw error;
        }
    },

    /**
     * Xóa khu vực
     * @param {number} id - ID của khu vực
     * @returns {Promise<void>}
     */
    deleteArea: async (id) => {
        try {
            await apiClient.delete(`/restaurant/areas/${id}`);
        } catch (error) {
            console.error(
                `Error deleting restaurant area with ID ${id}:`,
                error
            );
            throw error;
        }
    },
};
