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

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
