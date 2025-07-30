// src/services/ENDPOINTS_ServiceEnderecoParte.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/enderecos-parte';

export async function fetchEnderecosParte(parteId) {
  return await get(`${BASE_URL}?parte_adversa_id=${parteId}`);
}

export async function createEnderecoParte(data) {
  return await post(BASE_URL, data);
}

export async function updateEnderecoParte(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deleteEnderecoParte(id) {
  return await del(`${BASE_URL}/${id}`);
}
