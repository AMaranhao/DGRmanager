// src/services/ENDPOINTS_ServicePublicacoes.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/publicacoes';

export async function fetchPublicacoes() {
  return await get(BASE_URL);
}

export async function fetchPublicacaoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createPublicacao(dados) {
  return await post(BASE_URL, dados);
}

export async function updatePublicacao(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deletePublicacao(id) {
  return await del(`${BASE_URL}/${id}`);
}
