// src/services/ENDPOINTS_ServiceAcordos.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/acordos';

export async function fetchAcordos(params = {}) {
  return await get(BASE_URL, { params });
}

export async function fetchAcordoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createAcordo(dados) {
  return await post(BASE_URL, dados);
}

export async function updateAcordo(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deleteAcordo(id) {
  return await del(`${BASE_URL}/${id}`);
}
