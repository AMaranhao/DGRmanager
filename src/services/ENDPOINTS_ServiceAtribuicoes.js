// src/services/ENDPOINTS_ServiceAtribuicoes.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/atribuicoes';

export async function fetchAtribuicoes() {
  return await get(BASE_URL);
}

export async function fetchAtribuicaoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createAtribuicao(dados) {
  return await post(BASE_URL, dados);
}

export async function updateAtribuicao(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deleteAtribuicao(id) {
  return await del(`${BASE_URL}/${id}`);
}