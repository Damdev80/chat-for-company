// src/middlewares/role.middleware.js
import { getRoleNameById } from '../models/role.js';

/**
 * Middleware para verificar el rol del usuario.
 * @param {string|string[]} roles - Rol o lista de roles permitidos (por ejemplo: 'admin' o ['admin', 'user'])
 */
export function checkRole(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return async (req, res, next) => {
    
    // El rol puede estar en req.user.role o req.user.role_id
    let userRole = req.user?.role;
    if (!userRole && req.user?.role_id) {
      // Si solo tienes el role_id, busca el nombre del rol
      userRole = await getRoleNameById(req.user.role_id);
    }
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Acceso denegado: permisos insuficientes' });
    }
    next();
  };
}
