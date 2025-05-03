import apiClient from "../configs/apiClient";

// Đăng nhập
export const login = async (username, password) => {
    try {
        const response = await apiClient.post("/auth/login", {
            username,
            password,
        });

        // Lưu tokens
        if (response.data.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);
        }
        if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        // Lưu thông tin user
        if (response.data.account) {
            localStorage.setItem("user", JSON.stringify(response.data.account));
        }

        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

// Đăng xuất
export const logout = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        // Gọi API để vô hiệu hóa refresh token trên server
        if (refreshToken) {
            await apiClient.post("/auth/logout", { refreshToken });
        }

        // Xóa tokens và thông tin user khỏi localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        return { message: "Đã đăng xuất thành công" };
    } catch (error) {
        // Vẫn xóa thông tin đăng nhập ngay cả khi API thất bại
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        console.error("Logout error:", error);
        throw error;
    }
};

// Làm mới token
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
            throw new Error("Không có refresh token");
        }

        const response = await apiClient.post("/auth/refresh", {
            refreshToken,
        });

        // Cập nhật token mới
        if (response.data.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);
        }
        if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
        }

        return response.data;
    } catch (error) {
        console.error("Refresh token error:", error);
        throw error;
    }
};

// Lấy thông tin profile
export const getProfile = async () => {
    try {
        const response = await apiClient.get("/auth/profile");
        return response.data;
    } catch (error) {
        console.error("Get profile error:", error);
        throw error;
    }
};

// Đăng ký tài khoản mới
export const signup = async (userData) => {
    try {
        const response = await apiClient.post("/auth/signup", userData);
        return response.data;
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    }
};

// Kiểm tra trạng thái đăng nhập
export const isAuthenticated = () => {
    return !!localStorage.getItem("accessToken");
};

// Lấy thông tin user hiện tại
export const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
};
