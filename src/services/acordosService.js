// src/services/acordosService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/acordos';

export async function listarAcordos(params = {}) {
  return await get(BASE_URL, { params });
}

export async function obterAcordoPorId(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function criarAcordo(dados) {
  return await post(BASE_URL, dados);
}

export async function atualizarAcordo(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function excluirAcordo(id) {
  return await del(`${BASE_URL}/${id}`);
}
