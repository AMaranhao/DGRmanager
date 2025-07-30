// src/services/ENDPOINTS_ServiceAgenda.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/agenda';

export async function fetchCompromissos(params = {}) {
  return await get(BASE_URL, { params });
}

export async function fetchCompromissoById(id) {
    return await get(`${BASE_URL}/${id}`);
}

export async function createCompromisso(dados) {
  return await post(BASE_URL, dados);
}

export async function updateCompromisso(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deleteCompromisso(id) {
  return await del(`${BASE_URL}/${id}`);
}


