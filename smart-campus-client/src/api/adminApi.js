import api from './axiosInstance';

export const getAllUsers  = ()              => api.get('/admin/users');
export const getStats     = ()              => api.get('/admin/stats');
export const updateRole   = (userId, role)  => api.patch(`/admin/users/${userId}/role`, { role });
export const toggleStatus = (userId)        => api.patch(`/admin/users/${userId}/toggle`);
export const deleteUser   = (userId)        => api.delete(`/admin/users/${userId}`);