import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  'http://localhost:8083/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout if token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;