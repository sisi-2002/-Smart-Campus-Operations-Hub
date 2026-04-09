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

// Global response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 🔴 401 → Not authenticated
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?error=session_expired';
      return Promise.reject(error);
    }

    // 🔴 403 → Forbidden (NO logout)
    if (status === 403) {
      window.location.href = '/unauthorized';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;