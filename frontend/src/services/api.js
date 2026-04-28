import axios from 'axios';
import { supabase } from './supabase';

export const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar token JWT
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros padronizado
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = new Error(
      error.response?.data?.error || 'Erro de conexão com o servidor'
    );
    customError.details = error.response?.data?.details;
    customError.status = error.response?.status;
    return Promise.reject(customError);
  }
);
