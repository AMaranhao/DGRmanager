// src/services/ENDPOINTS_ServiceColaboradores.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/colaboradores';

export async function fetchColaboradores() {
  return await get(BASE_URL);
}

export async function fetchColaboradorById(id) {
    return await get(`${BASE_URL}/${id}`);
}

export async function createColaborador(data) {
  return await post(BASE_URL, data);
}

export async function updateColaborador(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function updateStatusColaborador(id, newStatus) {
  return await put(`${BASE_URL}/${id}/status`, { ativo: newStatus });
}

export async function deleteColaborador(id) {
  return await del(`${BASE_URL}/${id}`);
}

