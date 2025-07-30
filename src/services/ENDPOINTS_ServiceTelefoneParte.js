// src/services/ENDPOINTS_ServiceTelefoneParte.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/telefones-parte';

export async function fetchTelefonesParte(parteId) {
  return await get(`${BASE_URL}?parte_adversa_id=${parteId}`);
}

export async function createTelefoneParte(data) {
  return await post(BASE_URL, data);
}

export async function updateTelefoneParte(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deleteTelefoneParte(id) {
  return await del(`${BASE_URL}/${id}`);
}
