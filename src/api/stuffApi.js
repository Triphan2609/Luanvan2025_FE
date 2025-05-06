import apiClient from "../configs/apiClient";
import { message } from "antd";

const API_URL = "/items";
const CATEGORIES_URL = "/item-categories";

// Utility to handle foreign key errors
const handleForeignKeyError = (error) => {
    if (
        error?.response?.data?.message?.includes("foreign key constraint fails")
    ) {
        message.error(
            "Lỗi dữ liệu: Chi nhánh không hợp lệ. Vui lòng chọn chi nhánh khác."
        );
        return true;
    }
    return false;
};

// Lấy danh sách vật dụng
export const getItems = async (categoryId = null, branchId = null) => {
    try {
        const params = {};

        if (categoryId) {
            params.categoryId = categoryId;
        }

        if (branchId) {
            params.branchId = branchId;
        }

        const response = await apiClient.get(API_URL, { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch items:", error);
        message.error("Không thể tải danh sách vật dụng");
        throw error;
    }
};

// Lấy thông tin chi tiết vật dụng
export const getItemById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch item id: ${id}`, error);
        message.error("Không thể tải thông tin vật dụng");
        throw error;
    }
};

// Tạo vật dụng mới
export const createItem = async (itemData) => {
    try {
        const response = await apiClient.post(API_URL, itemData);
        return response.data;
    } catch (error) {
        console.error("Failed to create item:", error);

        if (!handleForeignKeyError(error)) {
            message.error("Không thể tạo vật dụng mới");
        }

        throw error;
    }
};

// Cập nhật vật dụng
export const updateItem = async (id, itemData) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}`, itemData);
        return response.data;
    } catch (error) {
        console.error(`Failed to update item id: ${id}`, error);

        if (!handleForeignKeyError(error)) {
            message.error("Không thể cập nhật vật dụng");
        }

        throw error;
    }
};

// Xóa vật dụng
export const deleteItem = async (id) => {
    try {
        const response = await apiClient.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete item id: ${id}`, error);
        message.error("Không thể xóa vật dụng");
        throw error;
    }
};

// Cập nhật số lượng vật dụng trong kho
export const updateItemStock = async (id, quantity) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}`, {
            stockQuantity: quantity,
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to update item stock id: ${id}`, error);
        message.error("Không thể cập nhật số lượng vật dụng");
        throw error;
    }
};

// Xử lý việc sử dụng vật dụng (khi đặt phòng hoặc sử dụng)
export const processItemUsage = async (id, quantity = 1) => {
    try {
        const response = await apiClient.post(`${API_URL}/${id}/usage`, {
            quantity,
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to process item usage id: ${id}`, error);
        message.error("Không thể xử lý việc sử dụng vật dụng");
        throw error;
    }
};

// Xử lý việc trả lại vật dụng (khi trả phòng)
export const processItemReturn = async (id, quantity = 1) => {
    try {
        const response = await apiClient.post(`${API_URL}/${id}/return`, {
            quantity,
        });
        return response.data;
    } catch (error) {
        console.error(`Failed to process item return id: ${id}`, error);
        message.error("Không thể xử lý việc trả lại vật dụng");
        throw error;
    }
};

// Lấy vật dụng theo danh mục và chi nhánh
export const getItemsByCategory = async (categoryId, branchId = null) => {
    try {
        const params = { categoryId };

        if (branchId) {
            params.branchId = branchId;
        }

        const response = await apiClient.get(API_URL, { params });
        return response.data;
    } catch (error) {
        console.error(
            `Failed to fetch items by category: ${categoryId}`,
            error
        );
        message.error("Không thể tải danh sách vật dụng theo danh mục");
        throw error;
    }
};

// Lấy vật dụng theo loại sử dụng (dài hạn, dùng 1 lần, dùng nhiều lần)
export const getItemsByType = async (itemType, branchId = null) => {
    try {
        const params = { itemType };

        if (branchId) {
            params.branchId = branchId;
        }

        const response = await apiClient.get(API_URL, { params });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch items by type: ${itemType}`, error);
        message.error("Không thể tải danh sách vật dụng theo loại");
        throw error;
    }
};

// Lấy danh sách danh mục vật dụng
export const getItemCategories = async (branchId = null) => {
    try {
        const params = {};

        if (branchId) {
            params.branchId = branchId;
        }

        const response = await apiClient.get(CATEGORIES_URL, { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch item categories:", error);
        message.error("Không thể tải danh sách danh mục vật dụng");
        throw error;
    }
};

// Tạo danh mục vật dụng mới
export const createItemCategory = async (categoryData) => {
    try {
        const response = await apiClient.post(CATEGORIES_URL, categoryData);
        return response.data;
    } catch (error) {
        console.error("Failed to create item category:", error);

        if (!handleForeignKeyError(error)) {
            message.error("Không thể tạo danh mục vật dụng mới");
        }

        throw error;
    }
};

// Cập nhật danh mục vật dụng
export const updateItemCategory = async (id, categoryData) => {
    try {
        const response = await apiClient.patch(
            `${CATEGORIES_URL}/${id}`,
            categoryData
        );
        return response.data;
    } catch (error) {
        console.error(`Failed to update item category id: ${id}`, error);

        if (!handleForeignKeyError(error)) {
            message.error("Không thể cập nhật danh mục vật dụng");
        }

        throw error;
    }
};

// Xóa danh mục vật dụng
export const deleteItemCategory = async (id) => {
    try {
        const response = await apiClient.delete(`${CATEGORIES_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to delete item category id: ${id}`, error);
        message.error("Không thể xóa danh mục vật dụng");
        throw error;
    }
};

// Cập nhật tất cả vật dụng chưa có chi nhánh
export const updateAllItemsBranch = async (branchId) => {
    try {
        const response = await apiClient.post(`${API_URL}/update-all-branch`, {
            branchId,
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update all items branch:", error);
        message.error("Không thể cập nhật chi nhánh cho tất cả vật dụng");
        throw error;
    }
};

// Cập nhật tất cả danh mục chưa có chi nhánh
export const updateAllCategoriesBranch = async (branchId) => {
    try {
        const response = await apiClient.post(
            `${CATEGORIES_URL}/update-all-branch`,
            { branchId }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to update all categories branch:", error);
        message.error("Không thể cập nhật chi nhánh cho tất cả danh mục");
        throw error;
    }
};

export default {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    updateItemStock,
    processItemUsage,
    processItemReturn,
    getItemsByCategory,
    getItemsByType,
    getItemCategories,
    createItemCategory,
    updateItemCategory,
    deleteItemCategory,
    updateAllItemsBranch,
    updateAllCategoriesBranch,
};
