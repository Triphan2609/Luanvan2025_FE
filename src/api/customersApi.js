import apiClient from "../configs/apiClient";

const API_URL = `/customers`;

// Lấy danh sách khách hàng với các tùy chọn lọc
/**
 * Lấy danh sách khách hàng với các tùy chọn lọc
 * @param {Object} params Các tham số lọc
 * @param {number} params.page Số trang
 * @param {number} params.limit Số lượng mỗi trang
 * @param {string} params.search Tìm kiếm theo tên, số điện thoại, CCCD
 * @param {string} params.type Lọc theo loại khách hàng (normal/vip)
 * @param {string} params.status Lọc theo trạng thái (active/blocked)
 * @param {number} params.branchId Lọc theo chi nhánh
 * @param {string} params.sortBy Sắp xếp theo trường
 * @param {string} params.sortOrder Thứ tự sắp xếp (asc/desc)
 * @param {string} params.startDate Lọc từ ngày (YYYY-MM-DD)
 * @param {string} params.endDate Lọc đến ngày (YYYY-MM-DD)
 * @param {number} params.minBookings Số lần đặt tối thiểu
 * @param {number} params.maxBookings Số lần đặt tối đa
 * @param {number} params.minSpent Chi tiêu tối thiểu
 * @param {number} params.maxSpent Chi tiêu tối đa
 * @returns {Promise<Object>} Dữ liệu phân trang của khách hàng
 */
export const getCustomers = async (params = {}) => {
    try {
        const response = await apiClient.get(API_URL, { params });

        // Kiểm tra cấu trúc dữ liệu phản hồi
        let customerData;

        if (Array.isArray(response.data)) {
            // Nếu response.data đã là mảng
            customerData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            // Nếu response.data là object có thuộc tính data là mảng
            customerData = response.data.data;
        } else {
            // Nếu không phải mảng, kiểm tra xem có thể gán vào mảng không
            console.warn(
                "API response structure is not as expected:",
                response.data
            );
            customerData = [];
        }

        return {
            data: customerData,
            total: response.data.total || customerData.length || 0,
            // Trả về các thông tin phân trang khác nếu có
            page: response.data.page || 1,
            limit: response.data.limit || customerData.length,
            totalPages: response.data.totalPages || 1,
        };
    } catch (error) {
        console.error("Error in getCustomers API:", error);
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy danh sách khách hàng",
            }
        );
    }
};

// Lấy thông tin khách hàng theo ID
export const getCustomerById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy thông tin khách hàng",
            }
        );
    }
};

// Lấy thông tin khách hàng theo số điện thoại
export const getCustomerByPhone = async (phone) => {
    try {
        const response = await apiClient.get(`${API_URL}/phone/${phone}`);
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy thông tin khách hàng",
            }
        );
    }
};

// Tạo khách hàng mới
export const createCustomer = async (customerData) => {
    try {
        const response = await apiClient.post(API_URL, customerData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Lỗi khi tạo khách hàng mới" };
    }
};

// Cập nhật thông tin khách hàng
export const updateCustomer = async (id, customerData) => {
    try {
        const response = await apiClient.patch(
            `${API_URL}/${id}`,
            customerData
        );
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi cập nhật thông tin khách hàng",
            }
        );
    }
};

// Xóa khách hàng
export const deleteCustomer = async (id) => {
    try {
        const response = await apiClient.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Lỗi khi xóa khách hàng" };
    }
};

// Chuyển đổi trạng thái khách hàng (kích hoạt/khóa)
export const toggleCustomerStatus = async (id) => {
    try {
        const response = await apiClient.patch(
            `${API_URL}/${id}/toggle-status`,
            {}
        );
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi thay đổi trạng thái khách hàng",
            }
        );
    }
};

// Lấy thống kê về khách hàng
export const getCustomerStats = async () => {
    try {
        const response = await apiClient.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy thống kê khách hàng",
            }
        );
    }
};

// Cập nhật thông tin đặt phòng/bàn của khách hàng
export const updateBookingStats = async (id, amount) => {
    try {
        const response = await apiClient.patch(
            `${API_URL}/${id}/update-booking-stats`,
            { amount }
        );
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi cập nhật thông tin đặt phòng/bàn",
            }
        );
    }
};

// Fetch customers by specific status (for debugging)
export const getCustomersByStatus = async (status) => {
    try {
        const params = { status };
        const response = await apiClient.get(API_URL, { params });

        return response.data;
    } catch (error) {
        console.error("Error in getCustomersByStatus:", error);
        throw (
            error.response?.data || { message: "Lỗi khi lọc theo trạng thái" }
        );
    }
};

// Import danh sách khách hàng
export const importCustomers = async (customers) => {
    try {
        const response = await apiClient.post(`${API_URL}/import`, {
            customers,
        });
        return response.data;
    } catch (error) {
        console.error("Error in importCustomers API:", error);
        throw (
            error.response?.data || {
                message: "Lỗi khi nhập danh sách khách hàng",
            }
        );
    }
};

// Thao tác hàng loạt - Thay đổi trạng thái (kích hoạt/khóa)
export const batchToggleStatus = async (ids, status) => {
    try {
        const response = await apiClient.patch(
            `${API_URL}/batch/toggle-status`,
            {
                ids,
                status,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in batchToggleStatus API:", error);
        throw (
            error.response?.data || {
                message: "Lỗi khi thay đổi trạng thái hàng loạt khách hàng",
            }
        );
    }
};

// Thao tác hàng loạt - Thay đổi loại khách hàng (normal/vip)
export const batchUpdateType = async (ids, type) => {
    try {
        const response = await apiClient.patch(`${API_URL}/batch/update-type`, {
            ids,
            type,
        });
        return response.data;
    } catch (error) {
        console.error("Error in batchUpdateType API:", error);
        throw (
            error.response?.data || {
                message: "Lỗi khi thay đổi loại hàng loạt khách hàng",
            }
        );
    }
};

// Thao tác hàng loạt - Xóa khách hàng
export const batchDeleteCustomers = async (ids) => {
    try {
        const response = await apiClient.delete(`${API_URL}/batch`, {
            data: { ids },
        });
        return response.data;
    } catch (error) {
        console.error("Error in batchDeleteCustomers API:", error);
        throw (
            error.response?.data || {
                message: "Lỗi khi xóa hàng loạt khách hàng",
            }
        );
    }
};

// Thao tác hàng loạt - Gán chi nhánh
export const batchAssignBranch = async (ids, branchId) => {
    try {
        const response = await apiClient.patch(
            `${API_URL}/batch/assign-branch`,
            {
                ids,
                branchId,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error in batchAssignBranch API:", error);
        throw (
            error.response?.data || {
                message: "Lỗi khi gán chi nhánh hàng loạt cho khách hàng",
            }
        );
    }
};
