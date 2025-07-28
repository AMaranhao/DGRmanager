// src/services/agendaService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/agenda';

export async function listarCompromissos(params = {}) {
  return await get(BASE_URL, { params });
}

export async function obterCompromissoPorId(id) {
    return await get(`${BASE_URL}/${id}`);
}

export async function criarCompromisso(dados) {
  return await post(BASE_URL, dados);
}

export async function atualizarCompromisso(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function excluirCompromisso(id) {
  return await del(`${BASE_URL}/${id}`);
}


