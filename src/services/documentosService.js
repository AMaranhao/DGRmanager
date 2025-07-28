// src/services/documentosService.js
import { get, post, put, del } from './apiService';

const BASE_URL = '/documentos';

export async function listarDocumentos() {
  return await get(BASE_URL);
}

export async function obterDocumentoPorId(id) {
  return await get(`${BASE_URL}/${id}`);
}

export async function criarDocumento(dados) {
  return await post(BASE_URL, dados);
}

export async function atualizarDocumento(id, dados) {
  return await put(`${BASE_URL}/${id}`, dados);
}

export async function excluirDocumento(id) {
  return await del(`${BASE_URL}/${id}`);
}
