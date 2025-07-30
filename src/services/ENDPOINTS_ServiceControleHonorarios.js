// src/services/ENDPOINTS_ServiceControleHonorarios.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/controle-honorarios';

export async function fetchHonorarios(params = {}) {
  return await get(BASE_URL, { params });
}

export async function fetchHonorarioById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createHonorario(dados) {
  return await post(BASE_URL, dados);
}

export async function updateHonorario(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deleteHonorario(id) {
  return await del(`${BASE_URL}/${id}`);
}
