import apiClient from "../configs/apiClient";

// Payment method constants (matching backend)
export const PaymentMethodType = {
    CASH: "cash",
    BANK_TRANSFER: "bank_transfer",
    ZALO_PAY: "zalo_pay",
};

// Lấy danh sách các phương thức thanh toán
export const getPaymentMethods = async () => {
    try {
        const response = await apiClient.get("/payments/methods");
        return response.data;
    } catch (error) {
        console.error("Error fetching payment methods:", error);
        throw error;
    }
};

// Tạo phương thức thanh toán mới
export const createPaymentMethod = async (methodData) => {
    try {
        const response = await apiClient.post("/payments/methods", methodData);
        return response.data;
    } catch (error) {
        console.error("Error creating payment method:", error);
        throw error;
    }
};

// Cập nhật phương thức thanh toán
export const updatePaymentMethod = async (id, methodData) => {
    try {
        const response = await apiClient.patch(
            `/payments/methods/${id}`,
            methodData
        );
        return response.data;
    } catch (error) {
        console.error("Error updating payment method:", error);
        throw error;
    }
};

// Xóa phương thức thanh toán
export const deletePaymentMethod = async (id) => {
    try {
        const response = await apiClient.delete(`/payments/methods/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting payment method:", error);
        throw error;
    }
};

// Lấy chi tiết phương thức thanh toán
export const getPaymentMethodById = async (id) => {
    try {
        const response = await apiClient.get(`/payments/methods/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching payment method details:", error);
        throw error;
    }
};

// Lấy hotelInvoice theo bookingId
export async function getHotelInvoiceByBookingId(bookingId) {
    console.log(
        "[LOG][paymentsApi.js] Gọi API getHotelInvoiceByBookingId với bookingId:",
        bookingId
    );
    const res = await apiClient.get(
        `/payments/hotel-invoices?bookingId=${bookingId}`
    );
    console.log(
        "[LOG][paymentsApi.js] Kết quả trả về từ API hotel-invoices:",
        res.data
    );
    if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data[0];
    }
    return null;
}

// Tạo hotelInvoice từ booking nếu chưa có
export const createHotelInvoice = async (invoiceData) => {
    console.log(
        "[LOG][paymentsApi.js] Gọi API createHotelInvoice với dữ liệu:",
        invoiceData
    );
    try {
        const response = await apiClient.post(
            "/payments/hotel-invoices",
            invoiceData
        );
        console.log(
            "[LOG][paymentsApi.js] Kết quả trả về từ API createHotelInvoice:",
            response.data
        );
        return response.data;
    } catch (error) {
        console.error(
            "[LOG][paymentsApi.js] Lỗi khi gọi API createHotelInvoice:",
            error
        );
        throw error;
    }
};

// Tạo thanh toán mới (dùng hotelInvoiceId)
export const createPayment = async (paymentData) => {
    try {
        // Chỉ giữ lại các trường hợp lệ cho backend mới
        const formattedPaymentData = { ...paymentData };
        delete formattedPaymentData.bookingId;
        delete formattedPaymentData.target;
        // Đảm bảo có hotelInvoiceId hoặc restaurantInvoiceId
        if (
            !formattedPaymentData.hotelInvoiceId &&
            !formattedPaymentData.restaurantInvoiceId
        ) {
            throw new Error(
                "hotelInvoiceId or restaurantInvoiceId is required for payment"
            );
        }
        if (
            formattedPaymentData.hotelInvoiceId &&
            formattedPaymentData.restaurantInvoiceId
        ) {
            throw new Error(
                "Cannot provide both hotelInvoiceId and restaurantInvoiceId"
            );
        }
        const response = await apiClient.post(
            "/payments",
            formattedPaymentData
        );
        return response.data;
    } catch (error) {
        console.error("Error creating payment:", error);
        throw error;
    }
};

// Lấy payments theo hotelInvoiceId
export const getPaymentsByHotelInvoiceId = async (hotelInvoiceId) => {
    try {
        const response = await apiClient.get(
            `/payments?hotelInvoiceId=${hotelInvoiceId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching payments for hotel invoice:", error);
        throw error;
    }
};

// Gửi hóa đơn qua email (hotel)
export const sendHotelInvoiceByEmail = async (hotelInvoiceId, email) => {
    try {
        const response = await apiClient.post(
            `/payments/hotel-invoices/${hotelInvoiceId}/send-email`,
            { email }
        );
        return response.data;
    } catch (error) {
        console.error("Error sending hotel invoice by email:", error);
        throw error;
    }
};

// Lấy lịch sử thanh toán của một booking
export const getPaymentsByBookingId = async (bookingId) => {
    try {
        const response = await apiClient.get(`/payments/booking/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching payments for booking:", error);
        throw error;
    }
};

// Xử lý hoàn tiền
export const processRefund = async (paymentId, refundData) => {
    try {
        const response = await apiClient.post(
            `/payments/${paymentId}/refund`,
            refundData
        );
        return response.data;
    } catch (error) {
        console.error("Error processing refund:", error);
        throw error;
    }
};

// Xác nhận thanh toán (cho các phương thức thanh toán offline)
export const confirmPayment = async (paymentId) => {
    try {
        const response = await apiClient.patch(
            `/payments/${paymentId}/confirm`,
            {}
        );
        return response.data;
    } catch (error) {
        console.error("Error confirming payment:", error);
        throw error;
    }
};

// Tạo thanh toán đặt cọc
export const createDepositPayment = async (bookingId, depositData) => {
    try {
        const response = await apiClient.post(
            `/payments/deposit/${bookingId}`,
            depositData
        );
        return response.data;
    } catch (error) {
        console.error("Error creating deposit payment:", error);
        throw error;
    }
};

// Tạo hóa đơn và gửi cho khách hàng
export const generateAndSendInvoice = async (bookingId) => {
    try {
        const response = await apiClient.post(
            `/payments/invoice/${bookingId}`,
            {}
        );
        return response.data;
    } catch (error) {
        console.error("Error generating invoice:", error);
        throw error;
    }
};

// Lấy danh sách tài khoản ngân hàng
export const getBankAccounts = async () => {
    try {
        const response = await apiClient.get("/payments/bank-accounts");
        return response.data;
    } catch (error) {
        console.error("Error fetching bank accounts:", error);
        throw error;
    }
};

// Lấy danh sách tài khoản ngân hàng đang hoạt động
export const getActiveBankAccounts = async () => {
    try {
        const response = await apiClient.get("/payments/bank-accounts/active");
        return response.data;
    } catch (error) {
        console.error("Error fetching active bank accounts:", error);
        throw error;
    }
};

// Lấy chi tiết tài khoản ngân hàng theo ID
export const getBankAccountById = async (id) => {
    try {
        const response = await apiClient.get(`/payments/bank-accounts/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching bank account details:", error);
        throw error;
    }
};

// Tạo tài khoản ngân hàng mới
export const createBankAccount = async (bankAccountData) => {
    try {
        const response = await apiClient.post(
            "/payments/bank-accounts",
            bankAccountData
        );
        return response.data;
    } catch (error) {
        console.error("Error creating bank account:", error);
        throw error;
    }
};

// Cập nhật tài khoản ngân hàng
export const updateBankAccount = async (id, bankAccountData) => {
    try {
        const response = await apiClient.patch(
            `/payments/bank-accounts/${id}`,
            bankAccountData
        );
        return response.data;
    } catch (error) {
        console.error("Error updating bank account:", error);
        throw error;
    }
};

// Xóa tài khoản ngân hàng
export const deleteBankAccount = async (id) => {
    try {
        const response = await apiClient.delete(
            `/payments/bank-accounts/${id}`
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting bank account:", error);
        throw error;
    }
};

// Helper function to get payment data based on method type
export const getPaymentDataByType = async (methodType) => {
    try {
        // Default empty result
        const result = { accounts: [] };

        // For bank transfer, load active bank accounts
        if (methodType === PaymentMethodType.BANK_TRANSFER) {
            result.accounts = await getActiveBankAccounts();
        }

        return result;
    } catch (error) {
        console.error("Error getting payment data by type:", error);
        return { accounts: [] };
    }
};

// Gửi hóa đơn qua email
export const sendInvoiceByEmail = async (bookingId, email) => {
    try {
        const response = await apiClient.post(
            `/payments/invoice/${bookingId}/send-email`,
            { email }
        );
        return response.data;
    } catch (error) {
        console.error("Error sending invoice by email:", error);
        throw error;
    }
};

// Tải xuống hóa đơn dạng PDF
export const downloadInvoicePdf = async (bookingId) => {
    try {
        // Use raw fetch to get the binary PDF data
        const apiBaseUrl =
            import.meta.env.VITE_API_URL || "http://localhost:3000";
        const downloadUrl = `${apiBaseUrl}/payments/invoice/${bookingId}/download`;

        console.log("Attempting to download PDF from:", downloadUrl);

        const response = await fetch(downloadUrl, {
            method: "GET",
            headers: {
                Accept: "application/pdf",
            },
            credentials: "include", // Include cookies if your API requires authentication
        });

        console.log("PDF download response status:", response.status);
        console.log(
            "PDF download response headers:",
            Object.fromEntries([...response.headers.entries()])
        );

        if (!response.ok) {
            console.error(
                "Error response from server:",
                response.status,
                response.statusText
            );
            // Try to get error details
            try {
                const errorData = await response.text();
                console.error("Error response body:", errorData);
            } catch (e) {
                console.error("Could not read error response body");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        console.log(
            "PDF blob received:",
            blob.size,
            "bytes,",
            "type:",
            blob.type
        );

        if (blob.size === 0) {
            throw new Error("Downloaded PDF has zero size");
        }

        return blob;
    } catch (error) {
        console.error("Error downloading invoice PDF:", error);
        throw error;
    }
};

// Lấy danh sách tất cả hóa đơn với phân trang và lọc
export const getAllInvoices = async (params = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate,
            branchId,
            searchText,
        } = params;

        // Build query string
        const queryParams = new URLSearchParams();
        queryParams.append("page", page);
        queryParams.append("limit", limit);

        if (status) queryParams.append("status", status);
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);
        if (branchId) queryParams.append("branchId", branchId);
        if (searchText) queryParams.append("searchText", searchText);

        const response = await apiClient.get(
            `/payments/invoices?${queryParams.toString()}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching invoices:", error);
        throw error;
    }
};

// Lấy chi tiết hóa đơn theo ID đặt phòng
export const getInvoiceByBookingId = async (bookingId) => {
    try {
        const response = await apiClient.get(`/payments/invoice/${bookingId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching invoice details:", error);
        throw error;
    }
};

// Update payment status
export const updatePaymentStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(`/payments/${id}/status`, {
            status,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating payment status:", error);
        throw error;
    }
};

// Restaurant Payment APIs
export const getRestaurantInvoiceById = async (invoiceId) => {
    try {
        const response = await apiClient.get(
            `/payments/restaurant-invoices/${invoiceId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error getting restaurant invoice:", error);
        throw error;
    }
};

export const createRestaurantInvoice = async (data) => {
    try {
        const response = await apiClient.post(
            "/payments/restaurant-invoices",
            data
        );
        return response.data;
    } catch (error) {
        console.error("Error creating restaurant invoice:", error);
        throw error;
    }
};

export const getPaymentsByRestaurantInvoiceId = async (invoiceId) => {
    try {
        const response = await apiClient.get(
            `/payments/restaurant-invoice/${invoiceId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error getting payments:", error);
        throw error;
    }
};

// Restaurant Invoice Management APIs
export const getAllRestaurantInvoices = async (params = {}) => {
    try {
        const response = await apiClient.get("/payments/restaurant-invoices", {
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurant invoices:", error);
        throw error;
    }
};

export const updateRestaurantInvoiceStatus = async (invoiceId, status) => {
    try {
        const response = await apiClient.patch(
            `/payments/restaurant-invoices/${invoiceId}/status`,
            { status }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating restaurant invoice status:", error);
        throw error;
    }
};

// Gửi hóa đơn nhà hàng qua email
export const sendRestaurantInvoiceByEmail = async (invoiceId, email) => {
    try {
        const response = await apiClient.post(
            `/payments/restaurant-invoices/${invoiceId}/send-email`,
            { email }
        );
        return response.data;
    } catch (error) {
        console.error("Error sending restaurant invoice by email:", error);
        throw error;
    }
};
