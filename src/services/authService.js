// src/services/authService.js

import api from './api';


// Serviço de login (caso queira reaproveitar)
export async function loginRequest(login, senha) {
  const response = await api.post('/login', { login, senha });
  return response.data;
}

// ✅ Refresh token automático
export async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('Refresh token ausente');

    const response = await api.post('/refresh', { refreshToken });
    const { token: newAccessToken, refreshToken: newRefreshToken } = response;

    if (newAccessToken) {
      localStorage.setItem('token', newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return newAccessToken;
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    // Em caso de erro grave, pode limpar localStorage e forçar logout se necessário
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw error;
  }
}
