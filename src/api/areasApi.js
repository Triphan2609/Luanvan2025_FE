import apiClient from "../configs/apiClient";

const API_URL = "/areas";

export const getAreas = async () => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

// New function to get restaurant areas only
export const getRestaurantAreas = async () => {
    try {
        const response = await apiClient.get(API_URL);

        // Filter areas with type 'restaurant'
        const restaurantAreas = (response.data || []).filter(
            (area) => area.type === "restaurant"
        );

        return restaurantAreas;
    } catch (error) {
        console.error("Error fetching restaurant areas:", error);
        return [];
    }
};

// Get areas by branch ID
export const getAreasByBranch = async (branchId) => {
    try {
        const response = await apiClient.get(API_URL);

        // Filter areas by branch ID
        const branchAreas = (response.data || []).filter(
            (area) => area.branch && area.branch.id === branchId
        );

        return branchAreas;
    } catch (error) {
        console.error(`Error fetching areas for branch ${branchId}:`, error);
        return [];
    }
};

// Get restaurant areas by branch ID
export const getRestaurantAreasByBranch = async (branchId) => {
    try {
        const response = await apiClient.get(API_URL);

        // Filter restaurant areas by branch ID
        const restaurantBranchAreas = (response.data || []).filter(
            (area) =>
                area.type === "restaurant" &&
                area.branch &&
                area.branch.id === branchId
        );

        return restaurantBranchAreas;
    } catch (error) {
        console.error(
            `Error fetching restaurant areas for branch ${branchId}:`,
            error
        );
        return [];
    }
};

export const createArea = async (data) => {
    const response = await apiClient.post(API_URL, data);
    return response.data;
};

export const updateArea = async (id, data) => {
    const response = await apiClient.put(`${API_URL}/${id}`, data);
    return response.data;
};

export const updateAreaStatus = async (id, status) => {
    const response = await apiClient.patch(`${API_URL}/${id}/status`, {
        status,
    });
    return response.data;
};

export const deleteArea = async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`);
    return response.data;
};
