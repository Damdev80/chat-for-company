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

// Nuevas funciones para el flujo de revisión de tareas
export async function submitTaskForReview(id, token) {
  const res = await fetch(`${API_URL}/tasks/${id}/submit-review`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al enviar tarea a revisión');
  return res.json();
}

export async function fetchTasksInReview(token) {
  console.log('🔍 [API] Fetching tasks in review...');
  console.log('🔍 [API] URL:', `${API_URL}/tasks/review/pending`);
  console.log('🔍 [API] Token:', token?.substring(0, 20) + '...');
  
  try {
    const res = await fetch(`${API_URL}/tasks/review/pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('🔍 [API] Response status:', res.status);
    console.log('🔍 [API] Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('🔍 [API] Error response:', errorText);
      throw new Error('Error al obtener tareas en revisión');
    }
    
    const data = await res.json();
    console.log('🔍 [API] Response data:', data);
    
    return data;
  } catch (error) {
    console.error('🔍 [API] Fetch error:', error);
    throw error;
  }
}

export async function approveTask(id, comments, token) {
  console.log('🔍 [API] Approving task:', { id, comments });
  
  const res = await fetch(`${API_URL}/tasks/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ comments }),
  });
  
  console.log('🔍 [API] Approve response status:', res.status);
  console.log('🔍 [API] Approve response ok:', res.ok);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('🔍 [API] Approve error response:', errorData);
    throw new Error(`Error al aprobar tarea: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('🔍 [API] Approve success:', result);
  return result;
}

export async function returnTask(id, comments, token) {
  console.log('🔍 [API] Returning task:', { id, comments });
  
  const res = await fetch(`${API_URL}/tasks/${id}/return`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ comments }),
  });
  
  console.log('🔍 [API] Return response status:', res.status);
  console.log('🔍 [API] Return response ok:', res.ok);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('🔍 [API] Return error response:', errorData);
    throw new Error(`Error al retornar tarea: ${errorData.message || 'Error desconocido'}`);
  }
    const result = await res.json();
  console.log('🔍 [API] Return success:', result);
  return result;
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

// --- AUDIO MESSAGES ---

export async function uploadAudioMessage(audioBlob, groupId, token, duration = 0, tempId = null) {
  console.log('🎵 [API] Uploading audio message:', { groupId, blobSize: audioBlob.size, duration, tempId });
  
  const formData = new FormData();
  formData.append('audio', audioBlob, `audio-${Date.now()}.webm`);
  formData.append('group_id', groupId);
  formData.append('duration', duration.toString());
  if (tempId) {
    formData.append('temp_id', tempId);
  }
  
  const res = await fetch(`${API_URL}/audio/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  console.log('🎵 [API] Audio upload response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('🎵 [API] Audio upload error:', errorData);
    throw new Error(`Error al subir audio: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('🎵 [API] Audio upload success:', result);
  return { success: true, data: result.data, message: result.message };
}

export async function getAudioMessages(groupId, token) {
  console.log('🎵 [API] Fetching audio messages for group:', groupId);
  
  const res = await fetch(`${API_URL}/audio/messages/${groupId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('🎵 [API] Audio messages response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('🎵 [API] Audio messages error:', errorData);
    throw new Error(`Error al obtener mensajes de audio: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('🎵 [API] Audio messages success:', result);
  return result;
}

// --- LLAMADAS GRUPALES ---

export async function initiateGroupCall(groupId, callType = 'audio', participants = [], token) {
  console.log('📞 [API] Initiating group call:', { groupId, callType, participants });
  
  const res = await fetch(`${API_URL}/calls/group/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      group_id: groupId,
      call_type: callType,
      participants: participants
    }),
  });
  
  console.log('📞 [API] Group call initiate response status:', res.status);
    if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('📞 [API] Group call initiate error:', errorData);
    
    // Si hay una llamada activa, devolver la información para manejarla
    if (res.status === 409 && errorData.activeCall) {
      return { 
        success: false, 
        hasActiveCall: true, 
        activeCall: errorData.activeCall,
        message: errorData.message 
      };
    }
    
    throw new Error(`Error al iniciar llamada grupal: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('📞 [API] Group call initiate success:', result);
  return { success: true, data: result.call, message: result.message };
}

export async function joinGroupCall(callId, token) {
  console.log('📞 [API] Joining group call:', callId);
  
  const res = await fetch(`${API_URL}/calls/${callId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('📞 [API] Join group call response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('📞 [API] Join group call error:', errorData);
    throw new Error(`Error al unirse a llamada: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('📞 [API] Join group call success:', result);
  return { success: true, data: result.call, message: result.message };
}

export async function leaveGroupCall(callId, token) {
  console.log('📞 [API] Leaving group call:', callId);
  
  const res = await fetch(`${API_URL}/calls/${callId}/leave`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('📞 [API] Leave group call response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('📞 [API] Leave group call error:', errorData);
    throw new Error(`Error al abandonar llamada: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('📞 [API] Leave group call success:', result);
  return { success: true, callEnded: result.callEnded, message: result.message };
}

export async function getActiveGroupCalls(groupId, token) {
  console.log('📞 [API] Getting active group calls for:', groupId);
  
  const res = await fetch(`${API_URL}/calls/group/${groupId}/active`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('📞 [API] Active group calls response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('📞 [API] Active group calls error:', errorData);
    throw new Error(`Error al obtener llamadas activas: ${errorData.message || 'Error desconocido'}`);
  }
    const result = await res.json();
  console.log('📞 [API] Active group calls success:', result);
  return result.activeCalls || [];
}

// Alias para mantener compatibilidad con el contexto
export async function joinCall(callId, token) {
  return await joinGroupCall(callId, token);
}

export async function leaveCall(callId, token) {
  return await leaveGroupCall(callId, token);
}

export async function getCallParticipants(callId, token) {
  console.log('📞 [API] Getting call participants for callId:', callId);
  
  const res = await fetch(`${API_URL}/calls/${callId}/participants`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('📞 [API] Call participants response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('📞 [API] Call participants error:', errorData);
    throw new Error(`Error al obtener participantes: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('📞 [API] Call participants success:', result);
  return { success: true, data: result.participants || [] };
}

export async function endCall(callId, token) {
  console.log('📞 [API] Ending call:', callId);
  
  const res = await fetch(`${API_URL}/calls/${callId}/end`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('📞 [API] End call response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('📞 [API] End call error:', errorData);
    throw new Error(`Error al finalizar llamada: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('📞 [API] End call success:', result);
  return { success: true, message: result.message };
}

// --- ADMIN ---

export async function forceCleanupAllCalls(token) {
  console.log('🧹 [API] Forzando limpieza de todas las llamadas...');
  
  const res = await fetch(`${API_URL}/calls/admin/force-cleanup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  console.log('🧹 [API] Force cleanup response status:', res.status);
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    console.log('🧹 [API] Force cleanup error:', errorData);
    throw new Error(`Error al forzar limpieza: ${errorData.message || 'Error desconocido'}`);
  }
  
  const result = await res.json();
  console.log('🧹 [API] Force cleanup success:', result);
  return { success: true, data: result };
}
