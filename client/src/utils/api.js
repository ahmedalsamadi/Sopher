import axios from 'axios';

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const getAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  return `${SERVER_BASE_URL}${assetPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auto-logout on expired/invalid token
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on an auth page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    if (err.response && err.response.data) {
      if (typeof err.response.data === 'string') {
        const msg = err.response.data;
        err.response.data = { msg, errors: [{ msg }] };
      } else {
        if (err.response.data.msg && !err.response.data.errors) {
          err.response.data.errors = [{ msg: err.response.data.msg }];
        } else if (err.response.data.errors && err.response.data.errors.length > 0 && !err.response.data.msg) {
          err.response.data.msg = err.response.data.errors[0].msg;
        }
      }
    } else if (!err.response) {
      err.response = {
        data: { msg: 'Network error', errors: [{ msg: 'Network error' }] }
      };
    }
    return Promise.reject(err);
  }
);

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
