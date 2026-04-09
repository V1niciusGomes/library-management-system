import axios from 'axios';

function normalizeAuthToken(token) {
  if (!token || typeof token !== 'string') {
    return '';
  }

  const value = token.trim();
  if (!value) {
    return '';
  }

  if (value.startsWith('Basic ') || value.startsWith('Bearer ')) {
    return value;
  }

  // Backward compatibility for older sessions that stored only base64 credentials.
  return `Basic ${value}`;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = normalizeAuthToken(localStorage.getItem('authToken'));
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;
