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
        console.log("API Request params:", params);

        // Specifically log status param for debugging
        if (params.status) {
            console.log(`Status filter being sent to API: ${params.status}`);
        }

        const response = await apiClient.get(API_URL, { params });
        console.log("API Response status:", response.status);
        console.log("API Response total items:", response.data.total);
        return response.data;
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
        console.log(`Directly testing status filter with: ${status}`);
        const params = { status };
        const response = await apiClient.get(API_URL, { params });
        console.log(
            `Status filter test - found ${response.data.total} customers with status: ${status}`
        );
        return response.data;
    } catch (error) {
        console.error("Error in getCustomersByStatus:", error);
        throw (
            error.response?.data || { message: "Lỗi khi lọc theo trạng thái" }
        );
    }
};
