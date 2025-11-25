import axios from 'axios';

// URL base del servidor
const BASE_URL = import.meta.env.VITE_API_URL || '';
// Sin /api aquí - las rutas ya lo incluyen
const API_URL = BASE_URL || '';

export { API_URL, BASE_URL };

// Instancia Axios - SIN baseURL
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
