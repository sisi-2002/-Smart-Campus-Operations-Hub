import api from './axiosInstance';

const bookingApi = {
  // Create a new booking
  createBooking: (bookingData) => {
    return api.post('/bookings', bookingData);
  },

  // Get current user's bookings
  getMyBookings: () => {
    return api.get('/bookings/my');
  },

  // Get all bookings (Admin only)
  getAllBookings: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/bookings${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get booking by ID
  getBookingById: (id) => {
    return api.get(`/bookings/${id}`);
  },

  // Get check-in QR payload for an approved booking
  getCheckInQr: (id) => {
    return api.get(`/bookings/${id}/check-in-qr`);
  },

  // Verify and check-in via QR payload
  verifyCheckIn: (qrData) => {
    return api.post('/bookings/check-in/verify', { qrData });
  },

  // Approve/Reject booking (Admin only)
  approveBooking: (id, approved, rejectionReason = null) => {
    return api.patch(`/bookings/${id}/approval`, { approved, rejectionReason });
  },

  // Cancel booking
  cancelBooking: (id, cancellationReason = '') => {
    return api.patch(`/bookings/${id}/cancel`, { cancellationReason });
  },

  // Update booking
  updateBooking: (id, bookingData) => {
    return api.put(`/bookings/${id}`, bookingData);
  },

  // Get available time slots
  getAvailableTimeSlots: (resourceId, date) => {
    return api.get('/bookings/available-slots', {
      params: { resourceId, date: date.toISOString() }
    });
  },

  // Get booking statistics (Admin only)
  getStatistics: () => {
    return api.get('/bookings/statistics');
  }
};

export default bookingApi;