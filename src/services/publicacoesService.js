// src/services/publicacoesService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/publicacoes';

export async function listarPublicacoes() {
  return await get(BASE_URL);
}

export async function obterPublicacaoPorId(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function criarPublicacao(dados) {
  return await post(BASE_URL, dados);
}

export async function atualizarPublicacao(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function excluirPublicacao(id) {
  return await del(`${BASE_URL}/${id}`);
}
