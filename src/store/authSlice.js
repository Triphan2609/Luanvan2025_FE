import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    account: null, // Thông tin tài khoản
    accessToken: null, // Token JWT
    isAuthenticated: false, // Trạng thái đăng nhập
    loading: false, // Trạng thái loading
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
            state.loading = false; // Tắt loading
        },
        // Xử lý khi đăng xuất
        logout: (state) => {
            state.account = null; // Xóa thông tin tài khoản
            state.accessToken = null; // Xóa token
            state.isAuthenticated = false; // Đặt trạng thái đăng xuất
            state.loading = false; // Tắt loading
        },
        // Xử lý khi bắt đầu loading
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

// Export các action
export const { loginSuccess, logout, setLoading } = authSlice.actions;

// Export các selector
export const selectAccount = (state) => state.auth.account;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectLoading = (state) => state.auth.loading;

// Export reducer
export default authSlice.reducer;
