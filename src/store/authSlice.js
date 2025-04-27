import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    account: null, // Thông tin tài khoản
    accessToken: null, // Token JWT
    isAuthenticated: false, // Trạng thái đăng nhập
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Xử lý khi đăng nhập thành công
        loginSuccess: (state, action) => {
            state.account = action.payload.account; // Lưu thông tin tài khoản
            state.accessToken = action.payload.accessToken; // Lưu token
            state.isAuthenticated = true; // Đánh dấu trạng thái đăng nhập
        },
        // Xử lý khi đăng xuất
        logout: (state) => {
            state.account = null; // Xóa thông tin tài khoản
            state.accessToken = null; // Xóa token
            state.isAuthenticated = false; // Đặt trạng thái đăng xuất
        },
    },
});

// Export các action
export const { loginSuccess, logout } = authSlice.actions;

// Export các selector
export const selectAccount = (state) => state.auth.account;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

// Export reducer
export default authSlice.reducer;
