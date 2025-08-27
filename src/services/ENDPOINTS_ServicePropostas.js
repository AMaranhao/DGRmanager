// src/services/ENDPOINTS_ServicePropostas.js

import { get, post, put } from './apiService';

const BASE = "/propostas-processo";

export async function fetchPropostasProcesso(params = {}) {
  return await get(BASE, { params });
}

export async function fetchPropostaById(id) {
  return await get(`${BASE}/${id}`);
}

export async function createProposta(data) {
  return await post(BASE, data);
}

export async function updateProposta(id, data) {
  return await put(`${BASE}/${id}`, data);
}
