import axios from 'axios';

// Solo la URL base
export const API_URL = '/api';

// Instancia Axios
export const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Interceptores
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const displayMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Error desconocido';
    return Promise.reject({ ...error, displayMessage });
  }
);

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper para imágenes
export const imgUrl = (imagenNombre) => {
  if (!imagenNombre) return '/default.png';
  const safe = encodeURIComponent(imagenNombre.replace(/^.*[\\/]/, ''));
  return `/productos/img/${safe}`;
};

export default API;
