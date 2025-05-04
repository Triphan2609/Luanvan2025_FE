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

// Theo dõi các yêu cầu đang refresh token để tránh race condition
let isRefreshing = false;
let failedQueue = [];

// Xử lý hàng đợi các requests đang chờ token mới
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Xử lý response và các lỗi
apiClient.interceptors.response.use(
    (response) => {
        // Log responses for debugging
        console.log(
            `🟢 [API Response] ${response.config.method.toUpperCase()} ${
                response.config.url
            }`,
            {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data,
            }
        );
        return response;
    },
    async (error) => {
        // Log error responses
        console.error(
            `🔴 [API Error] ${error.config?.method?.toUpperCase()} ${
                error.config?.url
            }`,
            {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            }
        );

        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            // Đánh dấu request này đã thử refresh
            originalRequest._retry = true;

            // Nếu đang refresh token, thêm request vào hàng đợi
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axios(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                // Lấy refresh token từ localStorage
                const refreshToken = localStorage.getItem("refreshToken");

                if (!refreshToken) {
                    throw new Error("Không có refresh token");
                }

                // Gọi API refresh token
                const response = await axios.post(
                    "http://localhost:8000/api/auth/refresh",
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } =
                    response.data;

                // Lưu tokens mới
                localStorage.setItem("accessToken", accessToken);
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                }

                // Cập nhật header và xử lý hàng đợi
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                processQueue(null, accessToken);
                isRefreshing = false;

                // Gửi lại request ban đầu
                return axios(originalRequest);
            } catch (refreshError) {
                // Nếu refresh token thất bại, đăng xuất
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");

                // Xử lý hàng đợi với lỗi
                processQueue(refreshError, null);
                isRefreshing = false;

                // Kiểm tra nếu không phải đang ở trang đăng nhập
                const currentPath = window.location.pathname;
                if (
                    !currentPath.includes("/login") &&
                    !currentPath.includes("/register")
                ) {
                    // Chuyển hướng đến trang đăng nhập và giữ URL hiện tại để redirect sau
                    window.location.href = `/login?redirect=${encodeURIComponent(
                        currentPath
                    )}`;
                }

                return Promise.reject(refreshError);
            }
        }

        // Các lỗi khác
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
