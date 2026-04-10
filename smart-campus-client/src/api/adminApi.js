import api from './axiosInstance';

export const getAllUsers  = ()              => api.get('/admin/users');
export const getStats     = ()              => api.get('/admin/stats');
export const getIncidentTickets = ()        => api.get('/admin/tickets');
export const updateIncidentTicket = async (ticketId, payload) => {
	try {
		return await api.patch(`/admin/tickets/${ticketId}`, payload);
	} catch (err) {
		const status = err.response?.status;
		const shouldRetry = status === 404 || status === 405;
		if (shouldRetry) {
			const body = {
				...payload,
				id: ticketId,
			};

			try {
				return await api.put(`/admin/tickets/${ticketId}`, payload);
			} catch (errPutPath) {
				if (![404, 405].includes(errPutPath.response?.status)) {
					throw errPutPath;
				}
			}

			try {
				return await api.post(`/admin/tickets/${ticketId}`, payload);
			} catch (errPostPath) {
				if (![404, 405].includes(errPostPath.response?.status)) {
					throw errPostPath;
				}
			}

			try {
				return await api.put('/admin/tickets', body);
			} catch (errPutBody) {
				if (![404, 405].includes(errPutBody.response?.status)) {
					throw errPutBody;
				}
			}

			return api.post('/admin/tickets', body);
		}
		throw err;
	}
};
export const updateRole   = (userId, role)  => api.patch(`/admin/users/${userId}/role`, { role });
export const toggleStatus = (userId)        => api.patch(`/admin/users/${userId}/toggle`);
export const deleteUser   = (userId)        => api.delete(`/admin/users/${userId}`);