import api from './axiosInstance';

export const getUserDashboardOverview = () => api.get('/dashboard/overview');

export const submitIncidentTicket = (payload) => api.post('/dashboard/incidents', payload);
