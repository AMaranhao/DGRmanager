// src/services/colaboradoresService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/colaboradores';

export async function listarColaboradores() {
  return await get(BASE_URL);
}

export async function obterColaboradorPorId(id) {
    return await get(`${BASE_URL}/${id}`);
}

export async function criarColaborador(data) {
  return await post(BASE_URL, data);
}

export async function atualizarColaborador(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function excluirColaborador(id) {
  return await del(`${BASE_URL}/${id}`);
}


