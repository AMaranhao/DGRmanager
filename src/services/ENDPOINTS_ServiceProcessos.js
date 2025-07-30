// src/services/ENDPOINTS_ServiceProcessos.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/processos';

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