import axios from 'axios';

// Cambia esta IP por la Dirección IPv4 de tu PC (ipconfig).
export const IP_SERVIDOR = '192.168.100.17';
export const PUERTO = 8000;
export const BASE_URL = `http://${IP_SERVIDOR}:${PUERTO}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    // Sin "Accept: application/json", Laravel redirige en vez de devolver los errores 422 en JSON.
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;