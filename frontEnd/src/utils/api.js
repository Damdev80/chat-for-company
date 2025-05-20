// src/utils/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchMessages(token) {
  const res = await fetch(`${API_URL}/messages`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener mensajes');
  return res.json();
}

export async function sendMessage(content, group_id, token) {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, group_id }),
  });
  if (!res.ok) throw new Error('Error al enviar mensaje');
  return res.json();
}

// --- GRUPOS ---

export async function fetchGroups(token) {
  const res = await fetch(`${API_URL}/groups`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener grupos');
  return res.json();
}

export async function createGroup(name, token) {
  const res = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Error al crear grupo');
  return res.json();
}

export async function updateGroup(id, name, token) {
  const res = await fetch(`${API_URL}/groups/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Error al actualizar grupo');
  return res.json();
}

export async function deleteGroup(id, token) {
  const res = await fetch(`${API_URL}/groups/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al eliminar grupo');
  return res.json();
}

// Vaciar todos los mensajes de un grupo
export async function deleteGroupMessages(id, token) {
  const res = await fetch(`${API_URL}/groups/${id}/messages`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al borrar mensajes del grupo');
  return res.json();
}

// --- USUARIOS ---

export async function fetchUsers(token) {
  const res = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}
