// src/services/ENDPOINTS_ServiceContratos.js
const API = import.meta.env.VITE_API_URL || "http://localhost:3001";


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


// Busca contrato por número (se existir)
export async function findContratoByNumero(numero) {
  const url = `${API}/contratos?numero=${encodeURIComponent(numero)}`;
  const res = await fetch(url);
  if (res.status === 404) return null;   // fallback configurado no Mockoon
  if (!res.ok) throw new Error("Falha ao buscar contrato");
  const data = await res.json();
  // Garante objeto válido (se algum dia vier array)
  return Array.isArray(data) ? data[0] ?? null : data;
}


// Vincula parte a contrato existente
export async function createParteContrato(payload) {
  // payload: { contrato_id, parte_adversa_id, principal (bool), lote }
  const res = await fetch(`${API}/parte-contrato`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Falha ao vincular parte ao contrato");
  return await res.json();
}

// Cria contrato + já vincula a parte
export async function createContratoComParte(payload) {
  // payload: { numero, valor, lote, parte_adversa_id, principal (bool) }
  const res = await fetch(`${API}/contrato-criacao-parte`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Falha ao criar contrato com parte");
  return await res.json(); // { contrato: {...}, parte_contrato: {...} }
}
