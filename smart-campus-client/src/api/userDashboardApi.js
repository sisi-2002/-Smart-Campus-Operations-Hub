import api from './axiosInstance';

export const getUserDashboardOverview = () => api.get('/dashboard/overview');
