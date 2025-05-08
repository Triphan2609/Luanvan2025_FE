import apiClient from "../configs/apiClient";
// Get all bookings with optional filters
export const getBookings = async (params = {}) => {
    try {
        const response = await apiClient.get(`/bookings`, { params });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error.response?.data || error.message;
    }
};

// Get booking by ID
export const getBookingById = async (id) => {
    try {
        const response = await apiClient.get(`/bookings/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Get booking by code
export const getBookingByCode = async (code) => {
    try {
        const response = await apiClient.get(`/bookings/code/${code}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching booking with code ${code}:`, error);
        throw error.response?.data || error.message;
    }
};

// Create a new booking
export const createBooking = async (bookingData) => {
    try {
        const response = await apiClient.post(`/bookings`, bookingData);
        return response.data;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error.response?.data || error.message;
    }
};

// Update a booking
export const updateBooking = async (id, bookingData) => {
    try {
        const response = await apiClient.patch(`/bookings/${id}`, bookingData);
        return response.data;
    } catch (error) {
        console.error(`Error updating booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Delete a booking
export const deleteBooking = async (id) => {
    try {
        await apiClient.delete(`/bookings/${id}`);
        return true;
    } catch (error) {
        console.error(`Error deleting booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Check-in a booking
export const checkInBooking = async (id) => {
    try {
        const response = await apiClient.patch(`/bookings/${id}/check-in`, {
            includeRelations: true,
        });
        return response.data;
    } catch (error) {
        console.error(`Error checking in booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Check-out a booking
export const checkOutBooking = async (id) => {
    try {
        const response = await apiClient.patch(`/bookings/${id}/check-out`, {
            includeRelations: true,
        });
        return response.data;
    } catch (error) {
        console.error(`Error checking out booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Check-out a booking and set room to Available directly (skipping Cleaning status)
export const checkOutAndSetAvailable = async (id) => {
    try {
        // First, perform the normal checkout
        const response = await apiClient.patch(`/bookings/${id}/check-out`, {
            includeRelations: true,
        });

        // Get the room ID from the booking response
        const roomId = response.data?.room?.id;

        if (roomId) {
            // Set the room status directly to Available, skipping Cleaning status
            await apiClient.patch(`/rooms/${roomId}/status`, {
                status: "Available",
            });
        }

        return response.data;
    } catch (error) {
        console.error(`Error checking out booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Confirm a booking
export const confirmBooking = async (id) => {
    try {
        const response = await apiClient.patch(`/bookings/${id}/confirm`, {
            includeRelations: true,
        });
        return response.data;
    } catch (error) {
        console.error(`Error confirming booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Cancel a booking
export const cancelBooking = async (id, reason) => {
    try {
        const response = await apiClient.patch(`/bookings/${id}/cancel`, {
            reason,
            includeRelations: true,
        });
        return response.data;
    } catch (error) {
        console.error(`Error cancelling booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Reject a booking
export const rejectBooking = async (id, reason) => {
    try {
        const response = await apiClient.patch(`/bookings/${id}/reject`, {
            reason,
            includeRelations: true,
        });
        return response.data;
    } catch (error) {
        console.error(`Error rejecting booking ${id}:`, error);
        throw error.response?.data || error.message;
    }
};

// Get room availability calendar
export const getRoomAvailabilityCalendar = async (params) => {
    try {
        const response = await apiClient.get(`/bookings/calendar`, {
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching room availability calendar:", error);
        throw error.response?.data || error.message;
    }
};

// Update booking payment status
export const updateBookingPaymentStatus = async (id, status) => {
    try {
        const response = await apiClient.patch(
            `/bookings/${id}/payment-status`,
            {
                paymentStatus: status,
            }
        );
        return response.data;
    } catch (error) {
        console.error(
            `Error updating payment status for booking ${id}:`,
            error
        );
        throw error.response?.data || error.message;
    }
};

// Update booking payment status and set room to Available immediately (skip cleaning step)
export const updatePaymentStatusAndSetAvailable = async (id, status) => {
    try {
        // First update the payment status
        const response = await apiClient.patch(
            `/bookings/${id}/payment-status`,
            {
                paymentStatus: status,
            }
        );

        // If the payment status is 'paid' and the booking is checked-out, set room to Available
        const booking = response.data;
        if (status === "paid" && booking.status === "checkedOut") {
            // Get the room ID from the booking
            const roomId = booking.room?.id;

            if (roomId) {
                // Set the room status directly to Available
                await apiClient.patch(`/rooms/${roomId}/status`, {
                    status: "Available",
                });
            }
        }

        return booking;
    } catch (error) {
        console.error(
            `Error updating payment status for booking ${id}:`,
            error
        );
        throw error.response?.data || error.message;
    }
};
