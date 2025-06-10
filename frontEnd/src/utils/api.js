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

export async function sendMessage(content, group_id, token, attachments = null) {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content, group_id, attachments }),
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

// --- OBJETIVOS ---

export async function fetchObjectives(token) {
  const res = await fetch(`${API_URL}/objectives`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener objetivos');
  return res.json();
}

export async function fetchObjectivesByGroup(groupId, token) {
  try {
    const res = await fetch(`${API_URL}/objectives/group/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[api.js] Error fetching objectives by group. Status: ${res.status}, Response: ${errorText}`);
      throw new Error(`Error al obtener objetivos del grupo: ${errorText}`);
    }

    const data = await res.json();
    
    return data;
  } catch (error) {
    console.error('[api.js] Catch block error in fetchObjectivesByGroup:', error);
    throw error; // Re-throw the error to be caught by the calling component
  }
}

export async function createObjective(objective, token) {
  try {
    const res = await fetch(`${API_URL}/objectives`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(objective),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error('Error en createObjective:', errorData);
      throw new Error(`HTTP ${res.status}: ${errorData}`);
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('Error en createObjective:', error);
    throw error;
  }
}

export async function updateObjective(id, objective, token) {
  const res = await fetch(`${API_URL}/objectives/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(objective),
  });
  if (!res.ok) throw new Error('Error al actualizar objetivo');
  return res.json();
}

export async function deleteObjective(id, token) {
  const res = await fetch(`${API_URL}/objectives/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al eliminar objetivo');
  return res.json();
}

export async function fetchObjectiveProgress(id, token) {
  const res = await fetch(`${API_URL}/objectives/${id}/progress`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener progreso del objetivo');
  return res.json();
}

// --- TAREAS ---

export async function fetchTasks(token) {
  const res = await fetch(`${API_URL}/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener tareas');
  return res.json();
}

export async function fetchTasksByObjective(objectiveId, token) {
  const res = await fetch(`${API_URL}/tasks/objective/${objectiveId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener tareas del objetivo');
  return res.json();
}

export async function fetchMyTasks(token) {
  const res = await fetch(`${API_URL}/tasks/my/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener mis tareas');
  return res.json();
}

export async function createTask(task, token) {
  try {
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error('Error en createTask:', errorData);
      throw new Error(`HTTP ${res.status}: ${errorData}`);
    }
    
    const result = await res.json();
    return result;
  } catch (error) {
    console.error('Error en createTask:', error);
    throw error;
  }
}

export async function updateTask(id, task, token) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Error al actualizar tarea');
  return res.json();
}

export async function assignTask(id, userId, token) {
  const res = await fetch(`${API_URL}/tasks/${id}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ assigned_to: userId }),
  });
  if (!res.ok) throw new Error('Error al asignar tarea');
  return res.json();
}

export async function markTaskCompleted(id, token) {
  const res = await fetch(`${API_URL}/tasks/${id}/complete`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al marcar tarea como completada');
  return res.json();
}

export async function deleteTask(id, token) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al eliminar tarea');
  return res.json();
}

export async function fetchUserTaskStats(token) {
  const res = await fetch(`${API_URL}/tasks/my/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener estadísticas de tareas');
  return res.json();
}

// --- UPLOAD DE ARCHIVOS ---

export async function uploadFiles(files, token) {
  const formData = new FormData();
  
  // Agregar archivos al FormData
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  
  const res = await fetch(`${API_URL}/upload/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al subir archivos');
  }
  
  return res.json();
}
