// src/services/relatoriosService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/relatorios';

export async function listarRelatorios() {
  return await get(BASE_URL);
}

export async function obterRelatorioPorId(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function criarRelatorio(dados) {
  return await post(BASE_URL, dados);
}

export async function atualizarRelatorio(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function excluirRelatorio(id) {
  return await del(`${BASE_URL}/${id}`);
}
