// src/utils/auth.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function loginUser({ username, password }) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Error al iniciar sesión');
  }
  return res.json();
}

export async function registerUser({ username, email, password }) {
  try {
    console.log('Enviando petición de registro a:', `${API_URL}/users/register`);
    console.log('Con datos:', { username, email, password: '***' });
    
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    console.log('Respuesta recibida. Status:', res.status);
    
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
        console.log('Error del servidor:', errorData);
      } catch (jsonError) {
        console.error('Error al parsear respuesta de error:', jsonError);
        throw new Error(`Error ${res.status}: No se pudo procesar la respuesta del servidor`);
      }
      
      // Check if the backend sent Zod validation errors
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(err => err.message).join(', ');
        throw new Error(errorMessages || 'Error al registrar usuario');
      }
      throw new Error(errorData.message || `Error ${res.status} al registrar usuario`);
    }
      const data = await res.json();
    console.log('Registro exitoso:', data);
    return data;
  } catch (error) {
    console.error('Error en función registerUser:', error);
    throw error;
  }
}

// Función para obtener el token del localStorage
export function getToken() {
  return localStorage.getItem('token');
}

// Función para obtener el rol del usuario
export function getUserRole() {
  return localStorage.getItem('userRole');
}

// Función para verificar si el usuario es admin
export function isAdmin(userRole = null) {
  const role = userRole || getUserRole();
  return role === 'admin';
}

// Función para verificar si el usuario es admin o supervisor
export function canReviewTasks() {
  const role = getUserRole();
  return role === 'admin' || role === 'supervisor';
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated() {
  return !!getToken();
}

// Función para cerrar sesión
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('userRole');
}
