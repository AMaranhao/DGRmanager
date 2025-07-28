import axios from 'axios';
import { refreshAccessToken } from './authService';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

// Intercepta requisições: adiciona token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Intercepta respostas: tenta refresh automático se token expirou
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se for erro 401 e ainda não tentamos renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest); // Reenvia a requisição original
        }
      } catch (refreshError) {
        console.error('Erro ao tentar renovar token:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
