// src/services/apiService.js

import api from './api';


export async function get(url, config = {}) {
  try {
    const response = await api.get(url, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function post(url, data, config = {}) {
  try {
    const response = await api.post(url, data, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function put(url, data, config = {}) {
  try {
    const response = await api.put(url, data, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function del(url, config = {}) {
  try {
    const response = await api.delete(url, config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  console.error('API error:', error);
  throw error;
}
