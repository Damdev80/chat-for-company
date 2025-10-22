// src/middlewares/logger.middleware.js

/**
 * Middleware para registrar en la consola todas las solicitudes HTTP recibidas
 */
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, url, headers, body } = req;
  
  
  // No loguear contraseñas u otra información sensible
  const sanitizedBody = { ...body };
  if (sanitizedBody.password) {
    sanitizedBody.password = '[REDACTED]';
  }
  
  // Capturar la respuesta
  const originalSend = res.send;
  res.send = function(body) {
    const responseBody = typeof body === 'string' ? 
      (body.length > 500 ? body.substring(0, 500) + '...' : body) : 
      '[object]';
    
    originalSend.apply(res, arguments);
  };
  
  next();
};
