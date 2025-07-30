// src/services/ENDPOINTS_ServiceAtribuicaoEvento.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/atribuicoes-evento';

export async function fetchAtribuicoesEvento(params = {}) {
  return await get(BASE_URL, { params });
}

export async function fetchAtribuicaoEventoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createAtribuicaoEvento(data) {
  return await post(BASE_URL, data);
}

export async function updateAtribuicaoEvento(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deleteAtribuicaoEvento(id) {
  return await del(`${BASE_URL}/${id}`);
}
