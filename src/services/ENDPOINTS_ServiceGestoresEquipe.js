// src/services/ENDPOINTS_ServiceGestoresEquipe.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/gestores-equipe';

export async function fetchGestoresEquipe() {
  return await get(BASE_URL);
}

export async function fetchGestorEquipeById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createGestorEquipe(data) {
  return await post(BASE_URL, data);
}

export async function updateGestorEquipe(id, data) {
  return await put(`${BASE_URL}/${id}`, data);
}

export async function deleteGestorEquipe(id) {
  return await del(`${BASE_URL}/${id}`);
}
