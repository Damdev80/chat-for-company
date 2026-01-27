// src/middlewares/rateLimiter.middleware.js
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

// Rate limiter general para todas las rutas
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana por IP
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Rate limiter estricto para autenticación
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana por IP
  message: {
    error: 'Demasiados intentos de login. Intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Incrementar tiempo de bloqueo en intentos repetidos
  skipSuccessfulRequests: true, // No contar requests exitosos
})

// Rate limiter para registro de usuarios
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros por hora por IP
  message: {
    error: 'Demasiados registros desde esta IP. Intenta nuevamente en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para envío de mensajes
export const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 mensajes por minuto por IP
  message: {
    error: 'Demasiados mensajes enviados. Intenta nuevamente en 1 minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para IA/Chat de soporte
export const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // máximo 10 consultas a IA por 5 minutos por IP
  message: {
    error: 'Demasiadas consultas a la IA. Intenta nuevamente en 5 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para uploads de archivos
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10, // máximo 10 uploads por 10 minutos por IP
  message: {
    error: 'Demasiados archivos subidos. Intenta nuevamente en 10 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Slow down middleware para ralentizar requests progresivamente
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // permitir 50 requests a velocidad normal
  delayMs: (used) => (used - 50) * 100, // añadir 100ms de delay por cada request extra
  maxDelayMs: 3000, // máximo delay de 3 segundos
})

// Rate limiter para password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // máximo 3 intentos de reset por 15 minutos por IP
  message: {
    error: 'Demasiados intentos de recuperación de contraseña. Intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limiter para creación de contenido (ideas, objetivos, tareas)
export const createContentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 20, // máximo 20 creaciones por 10 minutos por IP
  message: {
    error: 'Demasiados elementos creados. Intenta nuevamente en 10 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})