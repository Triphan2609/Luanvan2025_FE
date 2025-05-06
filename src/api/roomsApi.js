import apiClient from "../configs/apiClient";
import { message } from "antd";

const API_URL = "/rooms";

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

export const getRooms = async (params = {}) => {
    try {
        const response = await apiClient.get(API_URL, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching rooms:", error);
        message.error("Không thể tải danh sách phòng");
        return [];
    }
};

export const getRoomById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching room ID ${id}:`, error);
        message.error("Không thể tải thông tin phòng");
        throw error;
    }
};

export const createRoom = async (data) => {
    try {
        const response = await apiClient.post(API_URL, data);
        return response.data;
    } catch (error) {
        console.error("Error creating room:", error);

        if (!handleForeignKeyError(error)) {
            message.error("Không thể tạo phòng mới");
        }

        throw error;
    }
};

export const updateRoom = async (id, data) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating room:", error);

        if (!handleForeignKeyError(error)) {
            message.error("Không thể cập nhật phòng");
        }

        throw error;
    }
};

export const deleteRoom = async (id) => {
    try {
        const response = await apiClient.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting room:", error);
        message.error("Không thể xóa phòng");
        throw error;
    }
};

export const updateRoomStatus = async (id, status, additionalData = {}) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}/status`, {
            status,
            ...additionalData,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating room status:", error);
        message.error("Không thể cập nhật trạng thái phòng");
        throw error;
    }
};

export const getRoomStats = async (params = {}) => {
    try {
        const response = await apiClient.get(`${API_URL}/stats`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching room stats:", error);
        message.error("Không thể tải thống kê phòng");
        return {
            total: 0,
            available: 0,
            booked: 0,
            cleaning: 0,
            maintenance: 0,
        };
    }
};

export const getFloors = async () => {
    try {
        const response = await apiClient.get(`${API_URL}/floors`);
        return response.data;
    } catch (error) {
        console.error("Error fetching floors:", error);
        message.error("Không thể tải danh sách tầng");
        return [];
    }
};

export const updateAllRoomsBranch = async (branchId) => {
    try {
        const response = await apiClient.post(`${API_URL}/update-all-branch`, {
            branchId,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating rooms branch:", error);
        message.error("Không thể cập nhật chi nhánh cho phòng");
        throw error;
    }
};

// Room items integration
export const getRoomItems = async (roomId) => {
    try {
        console.log(`Calling API to get items for room ID: ${roomId}`);
        const response = await apiClient.get(`${API_URL}/${roomId}/items`);
        console.log(`API response for room items:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching room items for roomId ${roomId}:`, error);
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        message.error("Không thể tải danh sách vật dụng của phòng");
        return [];
    }
};

export const updateRoomItems = async (roomId, itemIds) => {
    try {
        console.log(
            `API call: Updating items for room ${roomId} with items:`,
            itemIds
        );
        const response = await apiClient.post(`${API_URL}/${roomId}/items`, {
            itemIds,
        });
        console.log(
            `API response for room ${roomId} items update:`,
            response.data
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating room items for roomId ${roomId}:`, error);
        console.error("Request data:", { roomId, itemIds });
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);

        if (error.response?.status === 404) {
            message.error(
                `API endpoint không tồn tại: ${API_URL}/${roomId}/items`
            );
        } else {
            message.error(
                "Không thể cập nhật vật dụng của phòng: " +
                    (error.response?.data?.message || error.message)
            );
        }
        throw error;
    }
};

// Kiểm tra xem API endpoint có tồn tại không
export const checkItemsEndpointAvailability = async () => {
    try {
        // Kiểm tra endpoint OPTIONS để xem API endpoint có được định nghĩa không
        const response = await apiClient.options(`${API_URL}/1/items`);
        console.log("Items endpoint check result:", response);
        return {
            available: true,
            status: response.status,
            message: "API endpoint is available",
        };
    } catch (error) {
        console.error("Error checking items endpoint availability:", error);
        return {
            available: false,
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
        };
    }
};
