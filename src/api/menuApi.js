import apiClient from "../configs/apiClient";

const MENU_API = "/menus";

export const menuApi = {
    // Lấy danh sách menu
    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get(MENU_API, { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching menus:", error);
            throw error;
        }
    },

    // Lấy chi tiết menu
    getById: async (id) => {
        try {
            const response = await apiClient.get(`${MENU_API}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching menu ${id}:`, error);
            throw error;
        }
    },

    // Tạo menu mới
    create: async (data) => {
        try {
            if (!data.name || !data.branchId) {
                throw new Error("Name and branchId are required");
            }
            // Đảm bảo foodIds là mảng chuỗi
            let foodIds = [];
            if (data.foodIds) {
                foodIds = Array.isArray(data.foodIds)
                    ? data.foodIds
                    : [data.foodIds];
            }
            const response = await apiClient.post(MENU_API, {
                name: data.name,
                description: data.description,
                type: data.type || "REGULAR",
                status: data.status || "ACTIVE",
                branchId: data.branchId,
                foodIds: foodIds,
                startDate: data.startDate,
                endDate: data.endDate,
                price: data.price,
                season: data.season,
            });
            return response.data;
        } catch (error) {
            console.error("Error creating menu:", error);
            throw error;
        }
    },

    // Cập nhật menu
    update: async (id, data) => {
        try {
            let foodIds = undefined;
            if (data.foodIds) {
                foodIds = Array.isArray(data.foodIds)
                    ? data.foodIds
                    : [data.foodIds];
            }
            const response = await apiClient.patch(`${MENU_API}/${id}`, {
                name: data.name,
                description: data.description,
                type: data.type,
                status: data.status,
                branchId: data.branchId,
                foodIds: foodIds,
                startDate: data.startDate,
                endDate: data.endDate,
                price: data.price,
                season: data.season,
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating menu ${id}:`, error);
            throw error;
        }
    },

    // Xóa menu
    delete: async (id) => {
        try {
            const response = await apiClient.delete(`${MENU_API}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting menu ${id}:`, error);
            throw error;
        }
    },

    // Cập nhật thứ tự món ăn
    updateFoodOrder: async (id, foodIds) => {
        try {
            if (!Array.isArray(foodIds)) {
                throw new Error("foodIds must be an array");
            }
            const response = await apiClient.put(
                `${MENU_API}/${id}/food-order`,
                { foodIds }
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating food order for menu ${id}:`, error);
            throw error;
        }
    },

    // Lấy danh sách combo
    getCombos: async () => {
        try {
            const response = await apiClient.get(`${MENU_API}/combos`);
            return response.data;
        } catch (error) {
            console.error("Error fetching combos:", error);
            throw error;
        }
    },

    // Lấy danh sách món ăn
    getItems: async () => {
        try {
            const response = await apiClient.get(`${MENU_API}/items`);
            return response.data;
        } catch (error) {
            console.error("Error fetching items:", error);
            throw error;
        }
    },
};
