// src/services/ENDPOINTS_ServiceReferencias.js

import { get, post, put, del } from './apiService'; 


export async function fetchCargos() {
    return await get('/cargos'); 
}

export async function fetchEquipes() {
    return await get('/equipes');  
}