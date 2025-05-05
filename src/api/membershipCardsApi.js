import apiClient from "../configs/apiClient";

const API_URL = `/membership-cards`;

/**
 * Lấy danh sách thẻ thành viên với các tùy chọn lọc
 * @param {Object} params Các tham số lọc
 * @param {number} params.page Số trang
 * @param {number} params.limit Số lượng mỗi trang
 * @param {string} params.search Tìm kiếm theo mã thẻ hoặc tên khách hàng
 * @param {string} params.type Lọc theo hạng thẻ (silver/gold/platinum)
 * @param {string} params.status Lọc theo trạng thái (active/expired/blocked)
 * @param {number} params.customerId ID của khách hàng
 * @returns {Promise<Object>} Dữ liệu phân trang của thẻ thành viên
 */
export const getMembershipCards = async (params = {}) => {
    try {
        console.log("API Request params:", params);
        const response = await apiClient.get(API_URL, { params });

        // Đảm bảo dữ liệu trả về có định dạng phù hợp với frontend
        if (response.data && response.data.data) {
            // Chuyển đổi dữ liệu nếu cần
            const transformedData = response.data.data.map((card) => ({
                ...card,
                customerName:
                    card.customerName ||
                    (card.customer ? card.customer.name : "N/A"),
                customer: {
                    ...card.customer,
                    customer_code: card.customer?.customer_code || "N/A",
                },
            }));

            console.log("Transformed data:", transformedData);

            return {
                ...response.data,
                data: transformedData,
            };
        }

        return response.data;
    } catch (error) {
        console.error("Error in getMembershipCards API:", error);
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy danh sách thẻ thành viên",
            }
        );
    }
};

/**
 * Lấy thông tin thẻ thành viên theo ID
 * @param {string} id ID của thẻ thành viên
 * @returns {Promise<Object>} Thông tin chi tiết của thẻ thành viên
 */
export const getMembershipCardById = async (id) => {
    try {
        const response = await apiClient.get(`${API_URL}/${id}`);

        // Đảm bảo dữ liệu trả về có định dạng phù hợp với frontend
        if (response.data) {
            return {
                ...response.data,
                customerName:
                    response.data.customerName ||
                    (response.data.customer
                        ? response.data.customer.name
                        : "N/A"),
                customer: {
                    ...response.data.customer,
                    customer_code:
                        response.data.customer?.customer_code || "N/A",
                },
            };
        }

        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy thông tin thẻ thành viên",
            }
        );
    }
};

/**
 * Lấy thẻ thành viên của khách hàng theo ID khách hàng
 * @param {string} customerId ID của khách hàng
 * @returns {Promise<Object>} Thông tin chi tiết của thẻ thành viên
 */
export const getMembershipCardByCustomerId = async (customerId) => {
    try {
        const response = await apiClient.get(
            `${API_URL}/customer/${customerId}`
        );

        // Đảm bảo dữ liệu trả về có định dạng phù hợp với frontend
        if (response.data) {
            return {
                ...response.data,
                customerName:
                    response.data.customerName ||
                    (response.data.customer
                        ? response.data.customer.name
                        : "N/A"),
                customer: {
                    ...response.data.customer,
                    customer_code:
                        response.data.customer?.customer_code || "N/A",
                },
            };
        }

        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy thông tin thẻ thành viên của khách hàng",
            }
        );
    }
};

/**
 * Tạo thẻ thành viên mới
 * @param {Object} cardData Dữ liệu thẻ thành viên mới
 * @returns {Promise<Object>} Thẻ thành viên đã được tạo
 */
export const createMembershipCard = async (cardData) => {
    try {
        // Kiểm tra dữ liệu trước khi gửi
        if (!cardData.customerId) {
            throw new Error("customerId không được để trống");
        }

        // Không chuyển đổi customerId thành số nữa, vì đây là UUID
        console.log("Sending membership card data to API:", cardData);
        const response = await apiClient.post(API_URL, cardData);
        return response.data;
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        throw (
            error.response?.data || {
                message: "Lỗi khi tạo thẻ thành viên mới",
            }
        );
    }
};

/**
 * Cập nhật thông tin thẻ thành viên
 * @param {string} id ID của thẻ thành viên
 * @param {Object} cardData Dữ liệu cập nhật
 * @returns {Promise<Object>} Thông tin thẻ thành viên đã cập nhật
 */
export const updateMembershipCard = async (id, cardData) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}`, cardData);
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi cập nhật thông tin thẻ thành viên",
            }
        );
    }
};

/**
 * Thay đổi trạng thái thẻ thành viên
 * @param {string} id ID của thẻ thành viên
 * @param {string} status Trạng thái mới (active/expired/blocked)
 * @returns {Promise<Object>} Kết quả cập nhật trạng thái
 */
export const updateCardStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(`${API_URL}/${id}/status`, {
            status,
        });
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi cập nhật trạng thái thẻ thành viên",
            }
        );
    }
};

/**
 * Lấy lịch sử điểm thưởng của thẻ thành viên
 * @param {string} cardId ID của thẻ thành viên
 * @param {Object} params Tham số truy vấn
 * @returns {Promise<Object>} Dữ liệu lịch sử điểm
 */
export const getPointHistory = async (cardId, params = {}) => {
    try {
        const response = await apiClient.get(
            `${API_URL}/${cardId}/points/history`,
            { params }
        );
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy lịch sử điểm thưởng",
            }
        );
    }
};

/**
 * Cộng điểm cho thẻ thành viên
 * @param {string} cardId ID của thẻ thành viên
 * @param {Object} data Dữ liệu cộng điểm
 * @param {number} data.points Số điểm cộng
 * @param {number} data.amount Số tiền giao dịch
 * @param {string} data.description Mô tả
 * @returns {Promise<Object>} Kết quả cộng điểm
 */
export const addPoints = async (cardId, data) => {
    try {
        const response = await apiClient.post(
            `${API_URL}/${cardId}/points/add`,
            data
        );
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi cộng điểm thẻ thành viên",
            }
        );
    }
};

/**
 * Đổi điểm thưởng lấy phần thưởng
 * @param {string} cardId ID của thẻ thành viên
 * @param {Object} data Dữ liệu đổi điểm
 * @param {number} data.points Số điểm đổi
 * @param {string} data.rewardId ID của phần thưởng
 * @param {string} data.description Mô tả
 * @returns {Promise<Object>} Kết quả đổi điểm
 */
export const redeemPoints = async (cardId, data) => {
    try {
        const response = await apiClient.post(
            `${API_URL}/${cardId}/points/redeem`,
            data
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Lỗi khi đổi điểm thưởng" };
    }
};

/**
 * Lấy danh sách phần thưởng có thể đổi điểm
 * @returns {Promise<Array>} Danh sách phần thưởng
 */
export const getRewards = async () => {
    try {
        const response = await apiClient.get(`${API_URL}/rewards`);
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy danh sách phần thưởng",
            }
        );
    }
};

/**
 * Lấy thống kê về thẻ thành viên
 * @returns {Promise<Object>} Dữ liệu thống kê
 */
export const getMembershipCardStats = async () => {
    try {
        const response = await apiClient.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi lấy thống kê thẻ thành viên",
            }
        );
    }
};

/**
 * Xóa thẻ thành viên
 * @param {string} id ID của thẻ thành viên
 * @returns {Promise<Object>} Kết quả xóa thẻ
 */
export const deleteMembershipCard = async (id) => {
    try {
        const response = await apiClient.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        throw (
            error.response?.data || {
                message: "Lỗi khi xóa thẻ thành viên",
            }
        );
    }
};
