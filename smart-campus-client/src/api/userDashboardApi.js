import api from './axiosInstance';

export const getUserDashboardOverview = () => api.get('/dashboard/overview');

export const getIncidentTicket = (ticketId) => api.get(`/dashboard/incidents/${ticketId}`);

export const submitIncidentTicket = (payload) => api.post('/dashboard/incidents', payload);

export const updateIncidentTicket = (ticketId, payload) => api.patch(`/dashboard/incidents/${ticketId}`, payload);

export const closeIncidentTicket = (ticketId, payload) => api.patch(`/dashboard/incidents/${ticketId}/close`, payload);

export const updateUserProfile = (payload) => api.patch(`/dashboard/profile`, payload);
