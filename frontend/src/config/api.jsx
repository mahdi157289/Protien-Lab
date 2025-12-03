import axios from 'axios';

// Ensure baseURL includes /api if not already present
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  // If URL doesn't end with /api, add it
  if (envUrl && !envUrl.endsWith('/api')) {
    // Remove trailing slash if present, then add /api
    return envUrl.replace(/\/$/, '') + '/api';
  }
  return envUrl || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't modify Content-Type if it's a multipart form
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;