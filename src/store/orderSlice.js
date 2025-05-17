import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // Lưu đơn hàng đã gửi bếp theo bàn
    orders: {}, // format: { tableId: { orderData } }
    // Thêm carts tạm thời cho từng bàn
    carts: {}, // format: { tableId: [items] }
    // Thêm đơn hàng đang xử lý cho từng bàn
    processingOrders: {}, // { tableId: [items] }
    // Format orderData: {
    //     id: orderId,
    //     items: [], // [{ type: 'food'|'service', foodId/itemId, name, price, quantity, note, status }]
    //     note: "",
    //     total: 0,
    //     tableNumber: "",
    //     tableId: "",
    //     branchId: "",
    //     status: "new"|"preparing"|"completed",
    //     priority: "normal"|"high"|"urgent"
    // }
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        // Lưu đơn hàng đã gửi bếp
        saveOrder: (state, action) => {
            const { tableId, orderData } = action.payload;
            state.orders[tableId] = orderData;
        },
        // Cập nhật đơn hàng
        updateOrder: (state, action) => {
            const { tableId, orderData } = action.payload;
            if (state.orders[tableId]) {
                state.orders[tableId] = {
                    ...state.orders[tableId],
                    ...orderData,
                };
            }
        },
        // Thêm item vào đơn hàng
        addOrderItem: (state, action) => {
            const { tableId, item } = action.payload;
            if (state.orders[tableId]) {
                state.orders[tableId].items = [
                    ...state.orders[tableId].items,
                    item,
                ];
            }
        },
        // Cập nhật item trong đơn hàng
        updateOrderItem: (state, action) => {
            const { tableId, itemId, itemData } = action.payload;
            // Cập nhật trong orders (nếu có)
            if (state.orders[tableId]) {
                state.orders[tableId].items = state.orders[tableId].items.map(
                    (item) =>
                        item.id === itemId ? { ...item, ...itemData } : item
                );
            }
            // Cập nhật trong carts (giỏ hàng tạm thời)
            if (state.carts && state.carts[tableId]) {
                state.carts[tableId] = state.carts[tableId].map((item) =>
                    item.id === itemId ? { ...item, ...itemData } : item
                );
            }
        },
        // Xóa item khỏi đơn hàng
        removeOrderItem: (state, action) => {
            const { tableId, itemId } = action.payload;
            if (state.orders[tableId]) {
                state.orders[tableId].items = state.orders[
                    tableId
                ].items.filter((item) => item.id !== itemId);
            }
        },
        // Xóa đơn hàng sau khi thanh toán
        removeOrder: (state, action) => {
            const { tableId } = action.payload;
            delete state.orders[tableId];
        },
        // Cập nhật trạng thái món ăn
        updateOrderItemStatus: (state, action) => {
            const { tableId, itemId, status } = action.payload;
            if (state.orders[tableId] && state.orders[tableId].items) {
                const item = state.orders[tableId].items.find(
                    (item) => item.orderItemId === itemId
                );
                if (item) {
                    item.status = status;
                }
            }
        },
        // Clear tất cả đơn hàng (ví dụ: khi đăng xuất)
        clearAllOrders: (state) => {
            state.orders = {};
        },
        // Thêm item vào cart tạm thời
        addToCart: (state, action) => {
            const { tableId, item } = action.payload;
            if (!state.carts) state.carts = {};
            if (!state.carts[tableId]) state.carts[tableId] = [];
            // Nếu đã có item cùng id, tăng quantity
            const idx = state.carts[tableId].findIndex(
                (i) => i.id === item.id && i.type === item.type
            );
            if (idx !== -1) {
                state.carts[tableId][idx].quantity += item.quantity || 1;
            } else {
                state.carts[tableId].push({
                    ...item,
                    quantity: item.quantity || 1,
                });
            }
        },
        // Xóa item khỏi cart tạm thời
        removeFromCart: (state, action) => {
            const { tableId, itemId, type } = action.payload;
            if (!state.carts) state.carts = {};
            if (state.carts[tableId]) {
                state.carts[tableId] = state.carts[tableId].filter(
                    (i) => !(i.id === itemId && i.type === type)
                );
            }
        },
        // Xóa toàn bộ cart của bàn
        clearCart: (state, action) => {
            const { tableId } = action.payload;
            if (!state.carts) state.carts = {};
            state.carts[tableId] = [];
        },
        // Đặt lại cart cho bàn (ví dụ khi load lại từ backend)
        setCart: (state, action) => {
            const { tableId, items } = action.payload;
            if (!state.carts) state.carts = {};
            state.carts[tableId] = items;
        },
        // Lưu đơn hàng đang xử lý cho từng bàn
        setProcessingOrder: (state, action) => {
            const { tableId, items } = action.payload;
            if (!state.processingOrders) state.processingOrders = {};
            state.processingOrders[tableId] = items;
        },
    },
});

// Export actions
export const {
    saveOrder,
    updateOrder,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    removeOrder,
    updateOrderItemStatus,
    clearAllOrders,
    addToCart,
    removeFromCart,
    clearCart,
    setCart,
    setProcessingOrder,
} = orderSlice.actions;

// Export selectors
export const selectOrderByTableId = (state, tableId) =>
    state.order.orders[tableId];
export const selectAllOrders = (state) => state.order.orders;
export const selectCartByTableId = (state, tableId) =>
    state.order.carts[tableId] || [];
export const selectProcessingOrderByTableId = (state, tableId) =>
    (state.order.processingOrders && state.order.processingOrders[tableId]) ||
    [];

export default orderSlice.reducer;
