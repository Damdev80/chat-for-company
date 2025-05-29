// controllers/message.controller.js
import { ModelsMessage } from '../models/message.js'
import { messageSchema } from '../validations/message.validation.js'
import { getConnection } from '../config/db.js'

export class MessageController {
  static async create(req, res) {
    try {
      // Validar datos con Zod
      const result = messageSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }

      const { content, group_id } = result.data
      const sender_id = req.user.id // ← Tomar el id del usuario autenticado

      // Crear el mensaje
      await ModelsMessage.create({ content, sender_id, group_id })

      res.status(201).json({ message: 'Mensaje enviado correctamente' })
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getAll(req, res) {
    try {
      const messages = await ModelsMessage.getAll()
      res.json(messages)
    } catch (error) {
      console.error('Error al obtener mensajes:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }  static async createFromSocket(data) {
    try {
      // Log para depuración
      console.log('Mensaje recibido desde socket:', JSON.stringify(data))
      
      // Validación manual extra
      if (data.group_id && (typeof data.group_id !== 'string' || data.group_id.length > 350)) {
        console.error('group_id inválido:', data.group_id);
        throw new Error('group_id inválido: ' + data.group_id);
      }
      
      // Si no hay content o está vacío, rechazar
      if (!data.content || !data.content.trim()) {
        console.error('content inválido o vacío');
        throw new Error('El contenido del mensaje no puede estar vacío');
      }
      
      // Si no hay sender_id, rechazar
      if (!data.sender_id) {
        console.error('sender_id faltante');
        throw new Error('ID de remitente requerido');
      }
      
      console.log('MessageController.createFromSocket - Validaciones pasadas, creando mensaje');
      console.log('Contenido original recibido:', JSON.stringify(data.content));
      
      // Crear el mensaje y obtener sus datos
      const message = await ModelsMessage.create(data);
      console.log('Mensaje creado en la base de datos:', message);
      console.log('Contenido después de la base de datos:', JSON.stringify(message.content));
      
      // Obtener el nombre de usuario para la respuesta (simulamos un join con users)
      // En una implementación real, esto debería ser una consulta JOIN adecuada
      const connection = await getConnection()
      const [userRows] = await connection.execute(
        'SELECT username FROM users WHERE id = ?',
        [data.sender_id]
      )
      connection.end()
      
      // Construir respuesta enriquecida con todos los datos necesarios
      const enrichedMessage = {
        ...message,
        sender_name: userRows[0]?.username || 'Unknown',
        temp_id: data.temp_id
      }
      
      return enrichedMessage
    } catch (error) {
      console.error('Error guardando mensaje desde socket:', error)
      throw error
    }
  }

  static async getBySenderId(req, res) {
    try {
      const { senderId } = req.params
      const messages = await ModelsMessage.getBySenderId(senderId)
      res.json(messages)
    } catch (error) {
      console.error('Error al obtener mensajes del usuario:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}