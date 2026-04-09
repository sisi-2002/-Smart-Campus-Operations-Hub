import api from './axiosInstance';

export const getTicketComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`);

export const createTicketComment = (ticketId, payload) =>
  api.post(`/tickets/${ticketId}/comments`, payload);

export const updateTicketComment = (ticketId, commentId, payload) =>
  api.patch(`/tickets/${ticketId}/comments/${commentId}`, payload);

export const deleteTicketComment = (ticketId, commentId) =>
  api.delete(`/tickets/${ticketId}/comments/${commentId}`);
