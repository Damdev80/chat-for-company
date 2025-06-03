// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  console.log('🔐 Auth middleware - Headers:', req.headers.authorization ? 'Token present' : 'No token');
  
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Auth middleware - Token no proporcionado');
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]
  console.log('🔑 Auth middleware - Token extracted');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('✅ Auth middleware - Token verified, user:', decoded.id);
    req.user = decoded // Agrega los datos del user al request
    next()
  } catch (error) {
    console.log('❌ Auth middleware - Token inválido:', error.message);
    return res.status(403).json({ error: 'Token inválido' })
  }
}
