import express from 'express';

const router = express.Router();

// Ruta simple de test
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Audio routes working!', 
    timestamp: new Date().toISOString() 
  });
});

//Hola
// Ruta simple de send
router.post('/send', (req, res) => {
  res.status(501).json({ 
    message: 'Audio upload temporalmente deshabilitado para debug',
    timestamp: new Date().toISOString() 
  });
});

console.log('🎵 Rutas de audio simples configuradas');

export default router;
