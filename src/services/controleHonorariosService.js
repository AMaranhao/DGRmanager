// src/services/controleHonorariosService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/controle-honorarios';

export async function listarHonorarios(params = {}) {
  return await get(BASE_URL, { params });
}

export async function obterHonorarioPorId(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function criarHonorario(dados) {
  return await post(BASE_URL, dados);
}

export async function atualizarHonorario(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function excluirHonorario(id) {
  return await del(`${BASE_URL}/${id}`);
}
