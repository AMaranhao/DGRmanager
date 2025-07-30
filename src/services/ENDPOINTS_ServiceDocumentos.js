// src/services/ENDPOINTS_ServiceDocumentos.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/documentos';

export async function fetchDocumentos() {
  return await get(BASE_URL);
}

export async function fetchDocumentoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createDocumento(dados) {
  return await post(BASE_URL, dados);
}

export async function updateDocumento(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deleteDocumento(id) {
  return await del(`${BASE_URL}/${id}`);
}
