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
  const res = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    // Check if the backend sent Zod validation errors
    if (data.errors && Array.isArray(data.errors)) {
      const errorMessages = data.errors.map(err => err.message).join(', ');
      throw new Error(errorMessages || 'Error al registrar usuario');
    }
    throw new Error(data.message || 'Error al registrar usuario');
  }
  return res.json();
}
