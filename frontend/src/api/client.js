import axios from 'axios';

// In dev, Vite proxies /api to the Laravel backend (see vite.config.js).
// In production, set VITE_API_URL to your deployed Laravel API base URL.
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the auth token (if the user is signed in) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('amdal_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
