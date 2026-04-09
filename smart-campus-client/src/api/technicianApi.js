import api from './axiosInstance';

export const getTechnicianOverview = () => api.get('/technician/overview');

export const updateAssignedTicket = (ticketId, payload) =>
  api.patch(`/technician/tickets/${ticketId}`, payload);
