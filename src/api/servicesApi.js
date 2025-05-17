import apiClient from "../configs/apiClient";

// Service Type APIs
export const getServiceTypes = async (branchId) => {
    try {
        const response = await apiClient.get("/services/types", {
            params: { branchId },
        });
        return response.data;
    } catch (error) {
        console.error("Get service types error:", error);
        throw error;
    }
};

export const getServiceTypeById = async (id) => {
    try {
        const response = await apiClient.get(`/services/types/${id}`);
        return response.data;
    } catch (error) {
        console.error("Get service type error:", error);
        throw error;
    }
};

export const createServiceType = async (serviceTypeData) => {
    try {
        const response = await apiClient.post(
            "/services/types",
            serviceTypeData
        );
        return response.data;
    } catch (error) {
        console.error("Create service type error:", error);
        throw error;
    }
};

export const updateServiceType = async (id, serviceTypeData) => {
    try {
        const response = await apiClient.patch(
            `/services/types/${id}`,
            serviceTypeData
        );
        return response.data;
    } catch (error) {
        console.error("Update service type error:", error);
        throw error;
    }
};

export const deleteServiceType = async (id) => {
    try {
        const response = await apiClient.delete(`/services/types/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete service type error:", error);
        throw error;
    }
};

// Service APIs
export const getServices = async (branchId, serviceTypeId) => {
    try {
        const response = await apiClient.get("/services", {
            params: { branchId, serviceTypeId },
        });
        return response.data;
    } catch (error) {
        console.error("Get services error:", error);
        throw error;
    }
};

export const getServiceById = async (id) => {
    try {
        const response = await apiClient.get(`/services/${id}`);
        return response.data;
    } catch (error) {
        console.error("Get service error:", error);
        throw error;
    }
};

export const createService = async (serviceData) => {
    try {
        const response = await apiClient.post("/services", {
            ...serviceData,
            stock: serviceData.stock !== undefined ? serviceData.stock : 0,
        });
        return response.data;
    } catch (error) {
        console.error("Create service error:", error);
        throw error;
    }
};

export const updateService = async (id, serviceData) => {
    try {
        const response = await apiClient.patch(`/services/${id}`, {
            ...serviceData,
            stock: serviceData.stock !== undefined ? serviceData.stock : 0,
        });
        return response.data;
    } catch (error) {
        console.error("Update service error:", error);
        throw error;
    }
};

export const deleteService = async (id) => {
    try {
        const response = await apiClient.delete(`/services/${id}`);
        return response.data;
    } catch (error) {
        console.error("Delete service error:", error);
        throw error;
    }
};
