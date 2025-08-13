// src/services/ENDPOINTS_ServiceProcessos.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/processos';

export async function createParteAoProcesso(id, parte) {
  const response = await api.post(`${BASE}/${id}/partes`, parte);
  return response.data;
}

export async function removeParteDoProcesso(id, parteId) {
  const response = await api.delete(`${BASE}/${id}/partes/${parteId}`);
  return response.data;
}

export async function fetchAndamentos(id) {
  const response = await api.get(`${BASE}/${id}/andamentos`);
  return response.data;
}


export async function fetchProcessos() {
  return await get(BASE_URL);
}

export async function fetchProcessoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createProcesso(data) {
  return await post(BASE_URL, data);
}

export async function updateProcesso(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deleteProcesso(id) {
  return await del(`${BASE_URL}/${id}`);
}