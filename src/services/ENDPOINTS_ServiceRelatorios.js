// src/services/ENDPOINTS_ServiceRelatorios.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/relatorios';

export async function fetchRelatorios() {
  return await get(BASE_URL);
}

export async function fetchRelatorioById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createRelatorio(dados) {
  return await post(BASE_URL, dados);
}

export async function updateRelatorio(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deleteRelatorio(id) {
  return await del(`${BASE_URL}/${id}`);
}
