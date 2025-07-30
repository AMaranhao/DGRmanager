// src/services/ENDPOINTS_ServiceAcordoPagamento.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/acordo-pagamento';

export async function fetchPagamentosAcordo(acordoId) {
  return await get(`${BASE_URL}?acordoId=${acordoId}`);
}

export async function fetchPagamentoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createPagamentoAcordo(data) {
  return await post(BASE_URL, data);
}

export async function updatePagamentoAcordo(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deletePagamentoAcordo(id) {
  return await del(`${BASE_URL}/${id}`);
}
