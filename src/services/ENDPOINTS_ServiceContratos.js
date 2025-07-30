// src/services/ENDPOINTS_ServiceContratos.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/contratos';

export async function fetchContratos(params = {}) {
  return await get(BASE_URL, { params });
}

export async function fetchContratoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createContrato(data) {
  return await post(BASE_URL, data);
}

export async function updateContrato(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deleteContrato(id) {
  return await del(`${BASE_URL}/${id}`);
}
