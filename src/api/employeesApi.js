import apiClient from "../configs/apiClient";
import { message } from "antd";

// Hàm xử lý lỗi API để hiển thị thông báo lỗi rõ ràng
const handleApiError = (error) => {
    console.error("API error:", error);

    // Nếu là lỗi từ phản hồi của server
    if (error.response) {
        // Hiển thị chi tiết lỗi
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);

        // Xử lý mã lỗi HTTP
        switch (error.response.status) {
            case 400:
                // Bad request
                if (error.response.data?.message) {
                    message.error(`Lỗi: ${error.response.data.message}`);
                } else {
                    message.error("Dữ liệu gửi lên không hợp lệ");
                }
                break;
            case 404:
                // Not found
                message.error("Không tìm thấy dữ liệu yêu cầu");
                break;
            case 500:
                message.error("Lỗi máy chủ, vui lòng thử lại sau");
                break;
            default:
                message.error(
                    `Lỗi: ${error.response.data?.message || "Không xác định"}`
                );
        }
    } else if (error.request) {
        // Lỗi mạng, không nhận được phản hồi
        console.error("No response from server:", error.request);
        message.error(
            "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối"
        );
    } else {
        // Lỗi khác
        message.error("Có lỗi xảy ra, vui lòng thử lại");
    }

    // Ném lại lỗi để xử lý ở component nếu cần
    throw error;
};

// Hàm hỗ trợ chuyển đổi ngày tháng sang định dạng chính xác cho backend
const prepareDateFields = (data) => {
    const result = { ...data };

    // Chuyển đổi các trường ngày tháng từ chuỗi hoặc đối tượng Date thành chuỗi yyyy-mm-dd
    // Backend sẽ xử lý chuyển đổi sang Date object
    if (data.birthday) {
        if (data.birthday instanceof Date) {
            result.birthday = data.birthday.toISOString().split("T")[0];
        }
    }

    if (data.join_date) {
        if (data.join_date instanceof Date) {
            result.join_date = data.join_date.toISOString().split("T")[0];
        }
    }

    return result;
};

// Kiểm tra ID hợp lệ
const validateId = (id) => {
    if (!id || isNaN(parseInt(id))) {
        throw new Error(`ID không hợp lệ: ${id}`);
    }
    return id;
};

// Lấy danh sách nhân viên
export const getEmployees = async (params = {}) => {
    try {
        // Lọc các tham số không xác định hoặc rỗng
        const filteredParams = {};
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== "" && value !== null) {
                // Chuyển đổi department_id và role_id thành số nếu là chuỗi
                if (
                    (key === "department_id" ||
                        key === "role_id" ||
                        key === "page" ||
                        key === "limit") &&
                    value !== undefined
                ) {
                    filteredParams[key] = Number(value);
                } else {
                    filteredParams[key] = value;
                }
            }
        }

        const response = await apiClient.get("/employees", {
            params: filteredParams,
        });

        // Kiểm tra nếu response có dữ liệu
        if (!response.data) {
            console.error("API không trả về dữ liệu");
            return { data: [], total: 0 };
        }

        // Trả về đúng định dạng mà component cần
        if (Array.isArray(response.data)) {
            return {
                data: response.data,
                total: response.data.length,
            };
        } else if (response.data.data && Array.isArray(response.data.data)) {
            // Nếu API trả về định dạng { data: [...], total: number }
            return response.data;
        } else {
            console.warn(
                "API trả về định dạng dữ liệu không mong đợi:",
                response.data
            );
            return { data: response.data, total: 1 };
        }
    } catch (error) {
        return handleApiError(error);
    }
};

// Lấy thông tin chi tiết nhân viên
export const getEmployeeById = async (id) => {
    try {
        // Kiểm tra ID hợp lệ
        validateId(id);

        const response = await apiClient.get(`/employees/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

// Tạo nhân viên mới
export const createEmployee = async (data) => {
    try {
        // Xử lý các trường ngày tháng
        const processedData = prepareDateFields(data);

        // Đảm bảo department_id và role_id được gửi dưới dạng số
        if (processedData.department_id) {
            processedData.department_id = Number(processedData.department_id);
        }

        if (processedData.role_id) {
            processedData.role_id = Number(processedData.role_id);
        }

        const response = await apiClient.post("/employees", processedData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

// Cập nhật thông tin nhân viên
export const updateEmployee = async (id, data) => {
    try {
        // Kiểm tra ID hợp lệ
        validateId(id);

        // Xử lý các trường ngày tháng
        const processedData = prepareDateFields(data);

        // Đảm bảo department_id và role_id được gửi dưới dạng số
        if (processedData.department_id) {
            processedData.department_id = Number(processedData.department_id);
        }

        if (processedData.role_id) {
            processedData.role_id = Number(processedData.role_id);
        }

        const response = await apiClient.patch(
            `/employees/${id}`,
            processedData
        );
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

// Xóa nhân viên
export const deleteEmployee = async (id) => {
    try {
        // Kiểm tra ID hợp lệ
        validateId(id);

        const response = await apiClient.delete(`/employees/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

// Upload avatar (phương thức cũ - sử dụng FormData cho file)
export const uploadAvatar = async (file) => {
    try {
        if (!file) {
            throw new Error("Không có file được chọn");
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post(`/employees/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        // Trả về URL từ server, nếu URL không phải là URL đầy đủ thì thêm URL gốc
        let imageUrl = response.data.url;
        if (imageUrl && !imageUrl.startsWith("http")) {
            // Thêm domain của backend vào URL
            imageUrl = `http://localhost:8000${imageUrl}`;
        }

        return {
            ...response.data,
            url: imageUrl,
        };
    } catch (error) {
        return handleApiError(error);
    }
};

// Upload avatar sử dụng base64 (phương thức mới - tránh lỗi "Data too long")
export const uploadBase64Avatar = async (base64Image, options = {}) => {
    try {
        if (!base64Image) {
            throw new Error("Không có dữ liệu ảnh");
        }

        // Nén ảnh trước khi gửi đến server
        const optimizedImage = await optimizeBase64Image(base64Image, options);

        const response = await apiClient.post(`/employees/upload-base64`, {
            image: optimizedImage,
        });

        // Trả về URL từ server, nếu URL không phải là URL đầy đủ thì thêm URL gốc
        let imageUrl = response.data.url;
        if (imageUrl && !imageUrl.startsWith("http")) {
            // Thêm domain của backend vào URL
            imageUrl = `http://localhost:8000${imageUrl}`;
        }

        return {
            ...response.data,
            url: imageUrl,
        };
    } catch (error) {
        return handleApiError(error);
    }
};

// Hàm tối ưu hóa ảnh base64
const optimizeBase64Image = (base64Image, options = {}) => {
    return new Promise((resolve, reject) => {
        try {
            // Các tham số mặc định
            const defaults = {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.8,
            };

            // Kết hợp options với defaults
            const settings = { ...defaults, ...options };

            // Tạo ảnh từ chuỗi base64
            const img = new Image();
            img.onload = () => {
                // Tạo canvas để vẽ và nén ảnh
                const canvas = document.createElement("canvas");

                // Tính toán kích thước mới giữ nguyên tỷ lệ
                let width = img.width;
                let height = img.height;

                if (width > settings.maxWidth) {
                    const ratio = settings.maxWidth / width;
                    width = settings.maxWidth;
                    height = height * ratio;
                }

                if (height > settings.maxHeight) {
                    const ratio = settings.maxHeight / height;
                    height = settings.maxHeight;
                    width = width * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Vẽ ảnh lên canvas với kích thước mới
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Chuyển canvas thành chuỗi base64 với chất lượng đã cài đặt
                const optimizedBase64 = canvas.toDataURL(
                    "image/jpeg",
                    settings.quality
                );

                // Trả về chuỗi base64 đã tối ưu
                resolve(optimizedBase64);
            };

            img.onerror = (error) => {
                reject(new Error("Không thể xử lý hình ảnh"));
            };

            // Gán nguồn cho ảnh
            img.src = base64Image;
        } catch (error) {
            reject(error);
        }
    });
};

// Lấy danh sách phòng ban
export const getDepartments = async () => {
    try {
        const response = await apiClient.get(`/employees/departments`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

// Lấy danh sách chức vụ
export const getRoles = async () => {
    try {
        const response = await apiClient.get(`/employees/roles`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

// Cập nhật trạng thái nhân viên
export const updateEmployeeStatus = async (id, status) => {
    try {
        // Kiểm tra ID hợp lệ
        validateId(id);

        // Log ra request
        console.log(`Cập nhật nhân viên id=${id} sang trạng thái: ${status}`);

        // Gọi API trực tiếp
        const response = await apiClient.patch(`/employees/${id}/status`, {
            status,
        });

        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái:", error);
        return handleApiError(error);
    }
};

// Lấy lịch sử làm việc
export const getWorkHistory = async (id) => {
    try {
        // Kiểm tra ID hợp lệ
        validateId(id);

        const response = await apiClient.get(`/employees/${id}/work-history`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

// Cập nhật trạng thái hàng loạt
export const bulkUpdateStatus = async (ids, status) => {
    try {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new Error("Danh sách ID nhân viên không hợp lệ");
        }

        // Log ra request
        console.log(
            `Cập nhật hàng loạt ${ids.length} nhân viên sang trạng thái: ${status}`
        );

        // Gọi API trực tiếp
        const response = await apiClient.post(`/employees/bulk/status`, {
            ids,
            status,
        });

        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái hàng loạt:", error);
        return handleApiError(error);
    }
};

// Xóa nhân viên hàng loạt
export const bulkDeleteEmployees = async (ids) => {
    try {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new Error("Danh sách ID nhân viên không hợp lệ");
        }

        const response = await apiClient.post(`/employees/bulk/delete`, {
            ids,
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
