import apiClient from "../configs/apiClient";

// Menu Management API
export const menuApi = {
    // Get all menus with filtering options
    getAllMenus: async (params = {}) => {
        const response = await apiClient.get("/restaurant/menus", { params });
        return response.data;
    },

    // Get menu by ID
    getMenuById: async (id) => {
        const response = await apiClient.get(`/restaurant/menus/${id}`);
        return response.data;
    },

    // Create new menu
    createMenu: async (menuData) => {
        const response = await apiClient.post("/restaurant/menus", menuData);
        return response.data;
    },

    // Update menu
    updateMenu: async (id, menuData) => {
        const response = await apiClient.patch(
            `/restaurant/menus/${id}`,
            menuData
        );
        return response.data;
    },

    // Delete menu
    deleteMenu: async (id) => {
        const response = await apiClient.delete(`/restaurant/menus/${id}`);
        return response.data;
    },
};

// Food Category Management API
export const foodCategoryApi = {
    // Get all food categories with filtering options
    getAllCategories: async (params = {}) => {
        const response = await apiClient.get("/restaurant/food-categories", {
            params,
        });
        return response.data;
    },

    // Get category by ID
    getCategoryById: async (id) => {
        const response = await apiClient.get(
            `/restaurant/food-categories/${id}`
        );
        return response.data;
    },

    // Create new category
    createCategory: async (categoryData) => {
        const response = await apiClient.post(
            "/restaurant/food-categories",
            categoryData
        );
        return response.data;
    },

    // Update category
    updateCategory: async (id, categoryData) => {
        const response = await apiClient.patch(
            `/restaurant/food-categories/${id}`,
            categoryData
        );
        return response.data;
    },

    // Delete category
    deleteCategory: async (id) => {
        const response = await apiClient.delete(
            `/restaurant/food-categories/${id}`
        );
        return response.data;
    },

    // Upload category image
    uploadCategoryImage: async (id, imageFile) => {
        try {
            console.log("=== UPLOAD CATEGORY IMAGE START ===");
            console.log("Category ID:", id);
            console.log("Image file type:", typeof imageFile);
            console.log(
                "Image file instanceof File:",
                imageFile instanceof File
            );
            console.log("Image file properties:", Object.keys(imageFile));

            if (!imageFile) {
                throw new Error("No image file provided");
            }

            const formData = new FormData();
            formData.append("image", imageFile);

            // Log FormData content (for debugging)
            for (let pair of formData.entries()) {
                console.log("FormData entry:", pair[0], pair[1]);
                console.log(
                    "FormData entry type:",
                    pair[0],
                    typeof pair[1],
                    pair[1] instanceof File
                );
            }

            // Set proper headers for multipart form data
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            console.log(
                "Sending upload request to:",
                `/restaurant/food-categories/${id}/upload-image`
            );
            const response = await apiClient.post(
                `/restaurant/food-categories/${id}/upload-image`,
                formData,
                config
            );

            console.log("Upload category image response:", response.data);
            console.log("=== UPLOAD CATEGORY IMAGE COMPLETE ===");

            // Validate response
            if (!response.data) {
                throw new Error("Empty response from server");
            }

            if (!response.data.imageUrl) {
                console.warn(
                    "Warning: Response doesn't contain imageUrl:",
                    response.data
                );
            }

            return response.data;
        } catch (error) {
            console.error("Error uploading category image:", error);
            console.error(
                "Error details:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
};

// Food Management API
export const foodApi = {
    // Get all foods with filtering options
    getAllFoods: async (params = {}) => {
        const response = await apiClient.get("/restaurant/foods", { params });
        return response.data;
    },

    // Get food by ID
    getFoodById: async (id) => {
        const response = await apiClient.get(`/restaurant/foods/${id}`);
        return response.data;
    },

    // Create new food
    createFood: async (foodData) => {
        const response = await apiClient.post("/restaurant/foods", foodData);
        return response.data;
    },

    // Update food
    updateFood: async (id, foodData) => {
        const response = await apiClient.patch(
            `/restaurant/foods/${id}`,
            foodData
        );
        return response.data;
    },

    // Delete food
    deleteFood: async (id) => {
        const response = await apiClient.delete(`/restaurant/foods/${id}`);
        return response.data;
    },

    // Upload food image
    uploadFoodImage: async (id, imageFile) => {
        try {
            console.log("===== FOOD IMAGE UPLOAD START =====");
            console.log("Food ID:", id);
            console.log("Image file type:", typeof imageFile);
            console.log(
                "Image file instanceof File:",
                imageFile instanceof File
            );

            if (!imageFile) {
                throw new Error("No image file provided");
            }

            const formData = new FormData();
            formData.append("image", imageFile);

            // Log FormData content (for debugging)
            for (let pair of formData.entries()) {
                console.log("FormData entry:", pair[0], pair[1]);
                console.log(
                    "FormData entry type:",
                    pair[0],
                    typeof pair[1],
                    pair[1] instanceof File
                );
            }

            // Log detailed file info
            console.log("Image file details:", {
                name: imageFile.name,
                type: imageFile.type,
                size: `${(imageFile.size / 1024).toFixed(2)} KB`,
                lastModified: new Date(imageFile.lastModified).toISOString(),
            });

            // Set proper headers for multipart form data
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            console.log(
                "Sending upload request to:",
                `/restaurant/foods/${id}/upload-image`
            );

            const response = await apiClient.post(
                `/restaurant/foods/${id}/upload-image`,
                formData,
                config
            );

            console.log("Upload food image response:", response.data);
            console.log("===== FOOD IMAGE UPLOAD COMPLETE =====");

            // Validate response
            if (!response.data) {
                throw new Error("Empty response from server");
            }

            if (!response.data.imageUrl) {
                console.warn(
                    "Warning: Response doesn't contain imageUrl:",
                    response.data
                );
            }

            return response.data;
        } catch (error) {
            console.error("Error uploading food image:", error);
            console.error(
                "Error details:",
                error.response?.data || error.message
            );
            message.error(
                "Không thể tải lên hình ảnh món ăn. Vui lòng thử lại!"
            );
            throw error;
        }
    },
};

// Table Management API
export const tableApi = {
    // Get all tables with filtering options
    getAllTables: async (params = {}) => {
        const response = await apiClient.get("/restaurant/tables", { params });
        return response.data;
    },

    // Get table by ID
    getTableById: async (id) => {
        const response = await apiClient.get(`/restaurant/tables/${id}`);
        return response.data;
    },

    // Create new table
    createTable: async (tableData) => {
        const response = await apiClient.post("/restaurant/tables", tableData);
        return response.data;
    },

    // Update table
    updateTable: async (id, tableData) => {
        const response = await apiClient.patch(
            `/restaurant/tables/${id}`,
            tableData
        );
        return response.data;
    },

    // Delete table
    deleteTable: async (id) => {
        const response = await apiClient.delete(`/restaurant/tables/${id}`);
        return response.data;
    },

    // Get tables by status
    getTablesByStatus: async (status) => {
        const response = await apiClient.get("/restaurant/tables", {
            params: { status },
        });
        return response.data;
    },

    // Get tables by area
    getTablesByArea: async (areaId) => {
        const response = await apiClient.get(
            `/restaurant/tables/by-area/${areaId}`
        );
        return response.data;
    },
};

// Reservation Management API
export const reservationApi = {
    // Get all reservations with filtering options
    getAllReservations: async (params = {}) => {
        const response = await apiClient.get("/restaurant/reservations", {
            params,
        });
        return response.data;
    },

    // Get reservation by ID
    getReservationById: async (id) => {
        const response = await apiClient.get(`/restaurant/reservations/${id}`);
        return response.data;
    },

    // Create new reservation
    createReservation: async (reservationData) => {
        const response = await apiClient.post(
            "/restaurant/reservations",
            reservationData
        );
        return response.data;
    },

    // Update reservation
    updateReservation: async (id, reservationData) => {
        const response = await apiClient.patch(
            `/restaurant/reservations/${id}`,
            reservationData
        );
        return response.data;
    },

    // Delete reservation
    deleteReservation: async (id) => {
        const response = await apiClient.delete(
            `/restaurant/reservations/${id}`
        );
        return response.data;
    },

    // Get reservations by date
    getReservationsByDate: async (date) => {
        const response = await apiClient.get("/restaurant/reservations", {
            params: { date },
        });
        return response.data;
    },

    // Get reservations by status
    getReservationsByStatus: async (status) => {
        const response = await apiClient.get("/restaurant/reservations", {
            params: { status },
        });
        return response.data;
    },

    // Get reservations by customer
    getReservationsByCustomer: async (customerId) => {
        const response = await apiClient.get("/restaurant/reservations", {
            params: { customerId },
        });
        return response.data;
    },

    // Change reservation status
    changeReservationStatus: async (id, status) => {
        const response = await apiClient.patch(
            `/restaurant/reservations/${id}`,
            {
                status,
            }
        );
        return response.data;
    },
};

// Ingredient APIs
export const getIngredients = () => apiClient.get("/ingredients");
export const createIngredient = (data) => apiClient.post("/ingredients", data);
export const updateIngredient = (id, data) =>
    apiClient.put(`/ingredients/${id}`, data);
export const deleteIngredient = (id) => apiClient.delete(`/ingredients/${id}`);

// FoodIngredient APIs
export const getFoodIngredients = (foodId) =>
    apiClient.get(`/food-ingredients/food/${foodId}`);
export const addFoodIngredient = (data) =>
    apiClient.post("/food-ingredients", data);
export const updateFoodIngredient = (id, data) =>
    apiClient.put(`/food-ingredients/${id}`, data);
export const deleteFoodIngredient = (id) =>
    apiClient.delete(`/food-ingredients/${id}`);

// Unit APIs
export const getUnits = () => apiClient.get("/units");
export const createUnit = (data) => apiClient.post("/units", data);
export const updateUnit = (id, data) => apiClient.put(`/units/${id}`, data);
export const deleteUnit = (id) => apiClient.delete(`/units/${id}`);

// Kitchen Order Management API
export const kitchenOrderApi = {
    // Get all orders
    getAllOrders: async (params = {}) => {
        try {
            const response = await apiClient.get("/restaurant/kitchen-orders", {
                params,
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching kitchen orders:", error);
            throw error;
        }
    },

    // Get order by ID
    getOrderById: async (id) => {
        try {
            const response = await apiClient.get(
                `/restaurant/kitchen-orders/${id}`
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching kitchen order ${id}:`, error);
            throw error;
        }
    },

    // Update order status
    updateOrderStatus: async (id, status) => {
        try {
            const response = await apiClient.patch(
                `/restaurant/kitchen-orders/${id}/status`,
                { status }
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating kitchen order ${id} status:`, error);
            throw error;
        }
    },

    // Update item status within an order
    updateItemStatus: async (orderId, itemId, status) => {
        try {
            const response = await apiClient.patch(
                `/restaurant/kitchen-orders/${orderId}/items/${itemId}/status`,
                { status }
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error updating item ${itemId} status in order ${orderId}:`,
                error
            );
            throw error;
        }
    },

    // Add notes to an order
    addOrderNote: async (id, note) => {
        try {
            const response = await apiClient.post(
                `/restaurant/kitchen-orders/${id}/notes`,
                { note }
            );
            return response.data;
        } catch (error) {
            console.error(`Error adding note to kitchen order ${id}:`, error);
            throw error;
        }
    },

    // Get orders by status
    getOrdersByStatus: async (status) => {
        try {
            const response = await apiClient.get(
                `/restaurant/kitchen-orders/by-status/${status}`
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error fetching kitchen orders with status ${status}:`,
                error
            );
            throw error;
        }
    },

    // Get orders by priority
    getOrdersByPriority: async (priority) => {
        try {
            const response = await apiClient.get(
                `/restaurant/kitchen-orders/by-priority/${priority}`
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error fetching kitchen orders with priority ${priority}:`,
                error
            );
            throw error;
        }
    },
};

// Export all APIs together
export default {
    menu: menuApi,
    foodCategory: foodCategoryApi,
    food: foodApi,
    table: tableApi,
    reservation: reservationApi,
    kitchenOrder: kitchenOrderApi,
};

export const setIngredientsForFood = (foodId, ingredients) =>
    apiClient.put(`/food-ingredients/set-for-food/${foodId}`, { ingredients });
