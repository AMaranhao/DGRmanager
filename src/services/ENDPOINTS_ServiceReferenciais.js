// src/services/ENDPOINTS_ServiceReferencias.js

import { get, post, put, del } from './apiService'; 


export async function fetchCargos() {
    const res = await get('/cargos');
    return res.data;
}
  
export async function fetchEquipes() {
const res = await get('/equipes');
return res.data;
}