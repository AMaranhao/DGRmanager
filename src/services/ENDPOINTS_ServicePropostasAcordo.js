// src/services/ENDPOINTS_ServicePropostasAcordo.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/propostas-acordo';

export async function fetchPropostasAcordo() {
  return await get(BASE_URL);
}

export async function fetchPropostaById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createProposta(data) {
  return await post(BASE_URL, data);
}

export async function updateProposta(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deleteProposta(id) {
  return await del(`${BASE_URL}/${id}`);
}
