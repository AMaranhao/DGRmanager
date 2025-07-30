// src/services/ENDPOINTS_ServicePartesContrato.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/partes-contrato';

export async function fetchPartesContrato(params = {}) {
  return await get(BASE_URL, { params });
}

export async function fetchParteContratoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createParteContrato(data) {
  return await post(BASE_URL, data);
}

export async function updateParteContrato(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deleteParteContrato(id) {
  return await del(`${BASE_URL}/${id}`);
}
