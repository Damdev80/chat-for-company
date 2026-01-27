import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { uploadLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Aplicar rate limiting a todas las rutas de upload
router.use(uploadLimiter);

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subDir = 'others';
    
    // Organizar archivos por tipo
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    } else if (file.mimetype.startsWith('audio/')) {
      subDir = 'audio';
    }
    
    const targetDir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único con timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedTypes = [
    // Imágenes
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
    // Audio
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    // Documentos
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    // Archivos comprimidos
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configurar multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB máximo
    files: 5 // Máximo 5 archivos por vez
  }
});

// Ruta para subir archivos
router.post('/files', verifyToken, upload.array('files', 5), (req, res) => {
  console.log('📤 POST /files - Upload request received');
  try {
    if (!req.files || req.files.length === 0) {
      console.log('❌ No files provided');
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    console.log(`📁 Processing ${req.files.length} files`);
    // Procesar archivos subidos
    const uploadedFiles = req.files.map(file => {
      const relativePath = path.relative(path.join(__dirname, '../../'), file.path);
      
      return {
        originalName: file.originalname,
        filename: file.filename,
        path: relativePath.replace(/\\/g, '/'), // Normalizar separadores de path
        size: file.size,
        mimetype: file.mimetype,
        url: `/${relativePath.replace(/\\/g, '/')}`
      };
    });

    res.json({
      message: 'Archivos subidos exitosamente',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Upload endpoint funcionando correctamente',
    timestamp: new Date().toISOString(),
    uploadsDir: path.join(__dirname, '../../uploads')
  });
});

// Ruta de prueba para upload sin autenticación (solo para testing)
router.post('/test-upload', upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    // Procesar archivos subidos
    const uploadedFiles = req.files.map(file => {
      const relativePath = path.relative(path.join(__dirname, '../../'), file.path);
      
      return {
        originalName: file.originalname,
        filename: file.filename,
        path: relativePath.replace(/\\/g, '/'),
        size: file.size,
        mimetype: file.mimetype,
        url: `/${relativePath.replace(/\\/g, '/')}`
      };
    });

    res.json({
      message: 'Archivos subidos exitosamente (modo test)',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Manejo de errores de multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 50MB)' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Demasiados archivos (máximo 5)' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Campo de archivo inesperado' });
    }
  }
  
  if (error.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

console.log('✅ Upload routes configured and ready');

export default router;
