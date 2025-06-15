import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { AudioController } from '../controllers/audio.controller.js';

console.log('🎵 Loading audio routes...');

const router = express.Router();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de audio si no existe - usar path absoluto desde la raíz del proyecto
const projectRoot = path.resolve(__dirname, '../../..');
const audioDir = path.join(projectRoot, 'BackEnd', 'uploads', 'audio');

console.log('🎵 Audio directory path:', audioDir);

try {
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log('✅ Audio directory created:', audioDir);
  } else {
    console.log('✅ Audio directory already exists:', audioDir);
  }
} catch (error) {
  console.error('❌ Error creating audio directory:', error);
}

// Configuración específica de multer para audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para audio
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.webm'; // Default para WebM (común en grabaciones web)
    cb(null, `audio-${uniqueSuffix}${ext}`);
  }
});

// Filtro para solo permitir archivos de audio
const audioFilter = (req, file, cb) => {
  console.log('🎵 Validando archivo de audio:', {
    mimetype: file.mimetype,
    originalname: file.originalname
  });
  
  // Tipos de audio permitidos
  const allowedTypes = [
    'audio/mpeg',      // MP3
    'audio/wav',       // WAV
    'audio/webm',      // WebM (común en grabaciones de navegador)
    'audio/ogg',       // OGG
    'audio/mp4',       // M4A
    'audio/aac',       // AAC
    'audio/x-m4a',     // M4A alternativo
    'audio/mp3'        // MP3 alternativo
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten archivos de audio.`), false);
  }
};

// Configurar multer para audio con límites
const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo para audio
    files: 1 // Solo un archivo por request
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'El archivo de audio es demasiado grande. Máximo 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Solo se permite un archivo de audio por mensaje.'
      });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      message: error.message
    });
  }
  
  next(error);
};

// ============= RUTAS DE AUDIO =============

/**
 * @route POST /api/audio/send
 * @desc Enviar mensaje de audio
 * @access Private
 */
router.post('/send', 
  verifyToken, 
  uploadAudio.single('audio'),
  handleMulterError,
  AudioController.sendAudioMessage
);

/**
 * @route GET /api/audio/:filename
 * @desc Servir archivo de audio (con soporte para streaming)
 * @access Private
 */
router.get('/:filename', 
  verifyToken, 
  AudioController.serveAudio
);

/**
 * @route GET /api/audio/:filename/metadata
 * @desc Obtener metadatos de archivo de audio
 * @access Private
 */
router.get('/:filename/metadata', 
  verifyToken, 
  AudioController.getAudioMetadata
);

/**
 * @route DELETE /api/audio/message/:messageId
 * @desc Eliminar mensaje de audio
 * @access Private
 */
router.delete('/message/:messageId', 
  verifyToken, 
  AudioController.deleteAudioMessage
);

// Ruta de test para verificar que el endpoint funciona
router.get('/test/ping', (req, res) => {
  res.json({ 
    message: 'Audio routes working!', 
    timestamp: new Date().toISOString() 
  });
});

console.log('🎵 Rutas de audio configuradas correctamente');

export default router;
