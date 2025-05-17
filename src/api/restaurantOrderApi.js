import apiClient from "../configs/apiClient";

const ORDERS_API = "/restaurant/orders";

export const restaurantOrderApi = {
    // Get all restaurant orders
    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get(ORDERS_API, { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching restaurant orders:", error);
            throw error;
        }
    },

    // Get order by ID
    getById: async (id) => {
        try {
            const response = await apiClient.get(`${ORDERS_API}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    },

    // Create new order
    create: async (data) => {
        try {
            // Ensure tableId is a number
            if (data.tableId && typeof data.tableId === "string") {
                data.tableId = parseInt(data.tableId, 10);
            }

            // Ensure branchId is a number
            if (data.branchId && typeof data.branchId === "string") {
                data.branchId = parseInt(data.branchId, 10);
            }

            console.log("Creating order with data:", data);
            const response = await apiClient.post(ORDERS_API, data);
            return response.data;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },

    // Update existing order
    update: async (id, data) => {
        try {
            // Ensure tableId is a number if present
            if (data.tableId && typeof data.tableId === "string") {
                data.tableId = parseInt(data.tableId, 10);
            }

            // Ensure branchId is a number if present
            if (data.branchId && typeof data.branchId === "string") {
                data.branchId = parseInt(data.branchId, 10);
            }

            console.log("Updating order with data:", data);
            const response = await apiClient.patch(`${ORDERS_API}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating order ${id}:`, error);
            throw error;
        }
    },

    // Delete order
    delete: async (id) => {
        try {
            const response = await apiClient.delete(`${ORDERS_API}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting order ${id}:`, error);
            throw error;
        }
    },

    // Send order to kitchen
    sendToKitchen: async (id) => {
        try {
            const response = await apiClient.post(
                `${ORDERS_API}/${id}/send-to-kitchen`
            );
            return response.data;
        } catch (error) {
            console.error(`Error sending order ${id} to kitchen:`, error);
            throw error;
        }
    },

    // Update order item status
    updateOrderItemStatus: async (orderId, itemId, status) => {
        try {
            const response = await apiClient.patch(
                `${ORDERS_API}/${orderId}/items/${itemId}`,
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

    // Confirm cooking order item (change status from new to preparing)
    confirmCooking: async (orderId, itemId) => {
        try {
            const response = await apiClient.patch(
                `${ORDERS_API}/${orderId}/items/${itemId}/confirm-cooking`,
                { status: "preparing" }
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error confirming cooking for item ${itemId} in order ${orderId}:`,
                error
            );
            throw error;
        }
    },

    // Get all orders for a specific table
    getOrdersByTable: async (tableId) => {
        try {
            // Ensure tableId is a number
            if (typeof tableId === "string") {
                tableId = parseInt(tableId, 10);
            }

            const response = await apiClient.get(
                `${ORDERS_API}/by-table/${tableId}`
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching orders for table ${tableId}:`, error);
            throw error;
        }
    },

    // Get active orders (not completed)
    getActiveOrders: async () => {
        try {
            const response = await apiClient.get(`${ORDERS_API}/active`);
            return response.data;
        } catch (error) {
            console.error("Error fetching active orders:", error);
            throw error;
        }
    },

    // Update order item
    updateOrderItem: async (orderId, itemId, data) => {
        try {
            const response = await apiClient.patch(
                `${ORDERS_API}/${orderId}/items/${itemId}`,
                data
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error updating item ${itemId} in order ${orderId}:`,
                error
            );
            throw error;
        }
    },

    // Add items to existing order
    addItems: async (orderId, items) => {
        try {
            const response = await apiClient.post(
                `${ORDERS_API}/${orderId}/items`,
                { items }
            );
            return response.data;
        } catch (error) {
            console.error(`Error adding items to order ${orderId}:`, error);
            throw error;
        }
    },

    // Add more items to existing order and send to kitchen in one operation
    addMoreItemsAndSendToKitchen: async (orderId, items) => {
        try {
            const response = await apiClient.post(
                `${ORDERS_API}/${orderId}/add-more-items`,
                { items }
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error adding more items to order ${orderId}:`,
                error
            );
            throw error;
        }
    },

    // Remove item from order
    removeItem: async (orderId, itemId) => {
        try {
            const response = await apiClient.delete(
                `${ORDERS_API}/${orderId}/items/${itemId}`
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error removing item ${itemId} from order ${orderId}:`,
                error
            );
            throw error;
        }
    },

    // Process payment for order
    processPayment: async (orderId, paymentData) => {
        try {
            const response = await apiClient.post(
                `${ORDERS_API}/${orderId}/payment`,
                paymentData
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error processing payment for order ${orderId}:`,
                error
            );
            throw error;
        }
    },

    // Get kitchen status of order
    getKitchenStatus: async (orderId) => {
        try {
            const response = await apiClient.get(
                `${ORDERS_API}/${orderId}/kitchen-status`
            );
            return response.data;
        } catch (error) {
            console.error(
                `Error fetching kitchen status for order ${orderId}:`,
                error
            );
            throw error;
        }
    },

    // Add note to order
    addNote: async (orderId, note) => {
        try {
            const response = await apiClient.post(
                `${ORDERS_API}/${orderId}/note`,
                { note }
            );
            return response.data;
        } catch (error) {
            console.error(`Error adding note to order ${orderId}:`, error);
            throw error;
        }
    },
};
