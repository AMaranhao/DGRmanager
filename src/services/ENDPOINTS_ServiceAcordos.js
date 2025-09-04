import { get, post, put, del } from './apiService';

const BASE_URL = '/acordos';

// CRUD padrão
export async function fetchAcordos(params = {}) {
  return await get(BASE_URL, { params });
}

export async function fetchAcordoById(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function createAcordo(dados) {
  return await post(BASE_URL, dados);
}

export async function updateAcordo(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function deleteAcordo(id) {
  return await del(`${BASE_URL}/${id}`);
}

// 📌 NOVOS ENDPOINTS DO MÓDULO ACORDOS

// Lista todos os acordos em andamento, já com dados consolidados (tabela principal)
export async function fetchAcordosUnificados() {
  return await get("/dados-unificados-acordos");
}

// Busca os dados detalhados de um acordo específico (para o modal)
export async function fetchAcordoUnificadoById(id) {
  return await get(`/dados-unificados-acordos/${id}`);
}
