import api from './axiosInstance';

const resourceApi = {
  // Get all resources
  getAllResources: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/resources${queryParams ? `?${queryParams}` : ''}`);
  },

  // Get resource by ID
  getResourceById: (id) => {
    return api.get(`/resources/${id}`);
  },

  // Get resources by type
  getResourcesByType: (type) => {
    return api.get(`/resources/type/${type}`);
  },

  // Get available resources
  getAvailableResources: () => {
    return api.get('/resources/available');
  },

  // Search resources
  searchResources: (query) => {
    return api.get('/resources/search', { params: { q: query } });
  },

  // Create resource (Admin only)
  createResource: (resourceData) => {
    return api.post('/resources', resourceData);
  },

  // Update resource (Admin only)
  updateResource: (id, resourceData) => {
    return api.put(`/resources/${id}`, resourceData);
  },

  // Delete resource (Admin only)
  deleteResource: (id) => {
    return api.delete(`/resources/${id}`);
  }
};

export default resourceApi;