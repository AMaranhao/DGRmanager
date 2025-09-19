// src/services/ENDPOINTS_ServiceAgenda.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/agenda';

// GET /agenda → lista completa
export async function getAgenda(params = {}) {
  return await get(BASE_URL, { params });
}

// GET /agenda-definicao → dados auxiliares para renderizar a agenda (status, tipos, cores, etc)
export async function getAgendaDefinicao() {
  return await get(`${BASE_URL}-definicao`);
}

// GET /agenda/:colaborador_id → compromissos filtrados por colaborador
export async function getAgendaByColaborador(colaborador_id) {
  return await get(`${BASE_URL}/${colaborador_id}`);
}


// GET /agenda/:id → detalhe de um compromisso
export async function getCompromissoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

// POST /agenda
export async function createCompromisso(dados) {
  return await post(BASE_URL, dados);
}

// PUT /agenda/:id
export async function updateCompromisso(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

// DELETE /agenda/:id
export async function deleteCompromisso(id) {
  return await del(`${BASE_URL}/${id}`);
}
