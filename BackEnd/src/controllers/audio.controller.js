import { ModelsMessage } from '../models/message.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getSocketInstance } from '../utils/socketManager.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegurar que el directorio de audio existe
const audioDir = path.join(__dirname, '../../uploads/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

export class AudioController {
  /**
   * Enviar mensaje de audio
   */
  static async sendAudioMessage(req, res) {
    try {
      
      if (!req.file) {
        return res.status(400).json({ 
          message: 'No se proporcionó archivo de audio' 
        });
      }      const { group_id, duration, temp_id } = req.body;
      const sender_id = req.user.id;

      // Validar que es un archivo de audio
      if (!req.file.mimetype.startsWith('audio/')) {
        // Eliminar archivo si no es audio
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          message: 'El archivo debe ser de audio' 
        });
      }      // Crear información del attachment para audio
      const audioAttachment = {
        type: 'audio',
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        duration: duration ? parseFloat(duration) : null,
        url: `/uploads/audio/${req.file.filename}`,
        path: `/uploads/audio/${req.file.filename}`
      };      // Crear el mensaje con el attachment de audio
      const messageData = {
        content: '', // Los mensajes de audio no tienen contenido de texto
        sender_id,
        group_id,
        temp_id,
        attachments: [audioAttachment]
      };
      const newMessage = await ModelsMessage.create(messageData);

      // Obtener el nombre del usuario para el Socket.IO
      const userName = req.user.username || req.user.name || 'Usuario';

      // Emitir el mensaje por Socket.IO
      const io = getSocketInstance();
      if (io) {
        io.emit('receive_message', {
          ...newMessage,
          sender_name: userName,
          temp_id,
          type: 'audio_message'
        });
      } else {
        console.warn('⚠️ Socket.IO no disponible para emitir mensaje de audio');
      }

      res.status(201).json({ 
        message: 'Mensaje de audio enviado correctamente',
        data: newMessage
      });

    } catch (error) {
      console.error('❌ Error al enviar mensaje de audio:', error);
      
      // Limpiar archivo en caso de error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener metadatos de audio
   */  static async getAudioMetadata(req, res) {
    try {
      const { filename } = req.params;
      const projectRoot = path.resolve(__dirname, '../../..');
      const audioPath = path.join(projectRoot, 'BackEnd', 'uploads', 'audio', filename);

      if (!fs.existsSync(audioPath)) {
        return res.status(404).json({ 
          message: 'Archivo de audio no encontrado' 
        });
      }

      const stats = fs.statSync(audioPath);
      
      res.json({
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });

    } catch (error) {
      console.error('❌ Error al obtener metadatos de audio:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor' 
      });
    }
  }
  /**
   * Servir archivo de audio
   */  static async serveAudio(req, res) {
    try {
      const { filename } = req.params;
      const projectRoot = path.resolve(__dirname, '../../..');
      const audioPath = path.join(projectRoot, 'BackEnd', 'uploads', 'audio', filename);

      if (!fs.existsSync(audioPath)) {
        return res.status(404).json({ 
          message: 'Archivo de audio no encontrado' 
        });
      }

      // Determinar el tipo MIME correcto basado en la extensión
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'audio/webm'; // Default for WebM
      
      switch (ext) {
        case '.mp3':
          contentType = 'audio/mpeg';
          break;
        case '.wav':
          contentType = 'audio/wav';
          break;
        case '.webm':
          contentType = 'audio/webm';
          break;
        case '.ogg':
          contentType = 'audio/ogg';
          break;
        case '.m4a':
          contentType = 'audio/mp4';
          break;
        default:
          contentType = 'audio/webm';
      }

      // Configurar headers para streaming de audio
      const stat = fs.statSync(audioPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Soporte para streaming parcial (importante para audio)
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(audioPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
        };
        res.writeHead(200, head);
        fs.createReadStream(audioPath).pipe(res);
      }

    } catch (error) {
      console.error('❌ Error al servir audio:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor' 
      });
    }
  }

  /**
   * Eliminar mensaje de audio
   */
  static async deleteAudioMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      // Aquí deberías implementar la lógica para eliminar el mensaje
      // Por ahora, solo eliminamos el archivo si existe
      
      res.json({ 
        message: 'Funcionalidad de eliminación pendiente de implementar' 
      });

    } catch (error) {
      console.error('❌ Error al eliminar mensaje de audio:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor' 
      });
    }
  }
}
