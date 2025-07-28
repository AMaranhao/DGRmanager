// src/services/authService.js
import { post } from './apiService';

/**
 * Envia os dados de login para a API e retorna o token e informações do usuário.
 * @param {Object} credentials - Objeto com email/usuario e senha.
 * @returns {Promise<Object>} - Dados do usuário e token JWT.
 */
export async function login(credentials) {
  return await post('/login', credentials);
}
