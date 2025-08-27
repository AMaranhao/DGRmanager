// src/services/ENDPOINTS_ServiceParcelasAcordo.js

import { get, post, put } from './apiService';

const BASE = "/acordo-parcelas";

export async function fetchParcelasAcordo(params = {}) {
  return await get(BASE, { params });
}

export async function fetchParcelaById(id) {
  return await get(`${BASE}/${id}`);
}

export async function createParcela(data) {
  return await post(BASE, data);
}

export async function updateParcela(id, data) {
  return await put(`${BASE}/${id}`, data);
}
