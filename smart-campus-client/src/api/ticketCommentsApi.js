import api from './axiosInstance';

// Shared ticket comment APIs used by user, admin, and technician workflows.
export const getTicketComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`);

// Retry on dashboard-scoped comment routes for backward-compatible deployments.
const shouldRetryWithDashboardPath = (error) => [404, 405].includes(error?.response?.status);

export const createTicketComment = async (ticketId, payload) => {
  try {
    return await api.post(`/tickets/${ticketId}/comments`, payload);
  } catch (error) {
    if (!shouldRetryWithDashboardPath(error)) {
      throw error;
    }
    return api.post(`/dashboard/tickets/${ticketId}/comments`, payload);
  }
};

export const updateTicketComment = async (ticketId, commentId, payload) => {
  try {
    return await api.patch(`/tickets/${ticketId}/comments/${commentId}`, payload);
  } catch (error) {
    if (!shouldRetryWithDashboardPath(error)) {
      throw error;
    }
    return api.patch(`/dashboard/tickets/${ticketId}/comments/${commentId}`, payload);
  }
};

export const deleteTicketComment = async (ticketId, commentId) => {
  try {
    return await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
  } catch (error) {
    if (!shouldRetryWithDashboardPath(error)) {
      throw error;
    }
    return api.delete(`/dashboard/tickets/${ticketId}/comments/${commentId}`);
  }
};
