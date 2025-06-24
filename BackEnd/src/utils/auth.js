// src/utils/auth.js - Utilidades de autenticación
export const isAdmin = (userRole) => {
  return userRole === 'admin'
}

export const isSupervisor = (userRole) => {
  return userRole === 'supervisor'
}

export const canReviewTasks = (userRole) => {
  return userRole === 'admin' || userRole === 'supervisor'
}

export const canDeleteIdea = (userRole, ideaUserId, currentUserId) => {
  // Los admins pueden eliminar cualquier idea
  if (isAdmin(userRole)) {
    return true
  }
  
  // Los usuarios solo pueden eliminar sus propias ideas
  return ideaUserId === currentUserId
}
