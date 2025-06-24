// src/config/api.js - Configuración central de API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// URLs específicas
export const API_ENDPOINTS = {
  // Auth
  auth: `${API_BASE_URL}`,
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  
  // Password Reset
  passwordReset: {
    request: `${API_BASE_URL}/password-reset/request`,
    validate: `${API_BASE_URL}/password-reset/validate`,
    reset: `${API_BASE_URL}/password-reset/reset`
  },
  
  // Users
  users: `${API_BASE_URL}/users`,
  
  // Groups
  groups: `${API_BASE_URL}/groups`,
  
  // Messages
  messages: `${API_BASE_URL}/messages`,
  
  // Ideas
  ideas: `${API_BASE_URL}/ideas`,
  
  // Events
  events: `${API_BASE_URL}/events`,
  
  // Objectives
  objectives: `${API_BASE_URL}/objectives`,
  
  // Support
  support: `${API_BASE_URL}/support`,
  
  // Upload
  upload: `${API_BASE_URL}/upload`
};

// Helper function para construir URLs de API
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Agregar parámetros de query si existen
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  return url;
};

// Helper function para hacer requests con headers comunes
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};
