import axios from 'axios';

const isProd = import.meta.env.PROD;
const DEFAULT_URL = isProd 
  ? "https://my-sneaker-n89g08zkm-quoc-toans-projects.vercel.app" 
  : "http://localhost:5000";

const BACKEND_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || DEFAULT_URL;

const api = axios.create({
  baseURL: BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Or handle via Context
    }
    return Promise.reject(error);
  }
);

export default api;
