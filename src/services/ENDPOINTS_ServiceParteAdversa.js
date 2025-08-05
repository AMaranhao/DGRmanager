// src/services/ENDPOINTS_ServiceParteAdversa.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/parte-adversa';

export async function fetchParteAdversa() {
  return await get(BASE_URL);
}

export async function fetchParteAdversaById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createParteAdversa(dados) {
  return await post(BASE_URL, dados);
}

export async function updateParteAdversa(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deleteParteAdversa(id) {
  return await del(`${BASE_URL}/${id}`);
}
