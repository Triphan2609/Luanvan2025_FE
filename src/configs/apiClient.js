import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // Timeout sau 10 giây
});

// Thêm Authorization header nếu token tồn tại
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Xử lý response và các lỗi
apiClient.interceptors.response.use(
    (response) => {
        // Log responses for debugging

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Lấy refresh token từ localStorage
                const refreshToken = localStorage.getItem("refreshToken");

                if (refreshToken) {
                    // Gọi API refresh token
                    const response = await axios.post(
                        "http://localhost:8000/api/auth/refresh",
                        {
                            refresh_token: refreshToken,
                        }
                    );

                    // Lưu token mới vào localStorage
                    if (response.data.access_token) {
                        localStorage.setItem(
                            "accessToken",
                            response.data.access_token
                        );

                        // Cập nhật header và gửi lại request ban đầu
                        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
                        return axios(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Nếu refresh token thất bại, đăng xuất
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                // Chuyển hướng đến trang đăng nhập
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
