// src/services/parteAdversaService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/parte-adversa';

export async function listarPartesAdversas() {
  return await get(BASE_URL);
}

export async function obterParteAdversaPorId(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function criarParteAdversa(dados) {
  return await post(BASE_URL, dados);
}

export async function atualizarParteAdversa(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function excluirParteAdversa(id) {
  return await del(`${BASE_URL}/${id}`);
}
