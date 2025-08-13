// src/services/ENDPOINTS_ServiceAtribuicoes.js

import { get, post, put, del } from './apiService';


const BASE_URL = '/atribuicoes';
const BASE_URL_ACORDO   = '/atribuicoes-acordo';
const BASE_URL_PROCESSO = '/atribuicoes-processos';
const BASE_URL_AGENDA   = '/atribuicoes-agenda';

//---------------------------------------//
// Endpoints para get especificos        //
//---------------------------------------//

export async function fetchAtribuicoesAcordo() {
  return await get(BASE_URL_ACORDO);
}

export async function fetchAtribuicoesProcesso() {
  return await get(BASE_URL_PROCESSO);
}

export async function fetchAtribuicoesAgenda() {
  return await get(BASE_URL_AGENDA);
}

//---------------------------------------//
// Endpoints para CRUD de atribuicoes    //
//---------------------------------------//
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