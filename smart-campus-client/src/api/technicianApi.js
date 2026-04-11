import api from './axiosInstance';

export const getTechnicianOverview = () => api.get('/technician/overview');

// Technician ticket endpoint for updating assigned incident tickets.
export const updateAssignedTicket = (ticketId, payload) =>
  api.patch(`/technician/tickets/${ticketId}`, payload);
