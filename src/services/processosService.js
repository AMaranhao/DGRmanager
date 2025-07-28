// src/services/processosService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/processos';

export async function listarProcessos() {
  return await get(BASE_URL);
}

export async function obterProcessoPorId(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function criarProcesso(data) {
  return await post(BASE_URL, data);
}

export async function atualizarProcesso(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function excluirProcesso(id) {
  return await del(`${BASE_URL}/${id}`);
}