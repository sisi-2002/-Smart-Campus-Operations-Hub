import api from './axiosInstance';

export const getNotifications  = ()     => api.get('/notifications');
export const getUnreadCount    = ()     => api.get('/notifications/unread-count');
export const markAsRead        = (id)   => api.patch(`/notifications/${id}/read`);
export const markAllAsRead     = ()     => api.patch('/notifications/read-all');
export const deleteNotification= (id)   => api.delete(`/notifications/${id}`);
export const clearAll          = ()     => api.delete('/notifications/clear-all');
export const createClientNotification = (data) => api.post('/notifications/client', data);
export const sendManagerBroadcastNotice = (data) => api.post('/notifications/manager-broadcast', data);