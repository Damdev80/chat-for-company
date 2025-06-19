// src/controllers/supportChat.controller.js - Controlador para chat de apoyo con IA
import { SupportChat, SupportMessage } from '../models/supportChat.js'
import { AIService } from '../services/aiService.js'

export class SupportChatController {
  // Obtener o crear chat activo del usuario
  static async getOrCreateChat(req, res) {
    try {
      const userId = req.user.id
      
      const chat = await SupportChat.getOrCreateActiveChat(userId)
      
      res.json({
        success: true,
        data: chat
      })
    } catch (error) {
      console.error('Error in getOrCreateChat:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener mensajes de un chat
  static async getChatMessages(req, res) {
    try {
      const { chatId } = req.params
      const userId = req.user.id
      const { limit = 50 } = req.query

      // Verificar que el chat pertenece al usuario
      const chat = await SupportChat.findById(chatId)
      if (!chat || chat.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        })
      }

      const messages = await SupportMessage.findByChatId(chatId, parseInt(limit))
      
      res.json({
        success: true,
        data: {
          chat,
          messages
        }
      })
    } catch (error) {
      console.error('Error in getChatMessages:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Enviar mensaje y obtener respuesta de IA
  static async sendMessage(req, res) {
    try {
      const { chatId } = req.params
      const { message } = req.body
      const userId = req.user.id

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El mensaje no puede estar vacío'
        })
      }

      // Verificar que el chat pertenece al usuario
      const chat = await SupportChat.findById(chatId)
      if (!chat || chat.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        })
      }

      // Guardar mensaje del usuario
      const userMessage = await SupportMessage.create(
        chatId, 
        'user', 
        message.trim()
      )

      // Obtener historial reciente para contexto
      const recentMessages = await SupportMessage.getRecentMessages(chatId, 10)
      
      // Preparar contexto del usuario
      const userContext = {
        user_id: userId,
        username: req.user.username,
        role: req.user.role,
        // Aquí podrías agregar más contexto como el grupo actual del usuario
        current_group: req.user.current_group || 'global'
      }

      // Preparar historial de conversación para la IA
      const conversationHistory = recentMessages
        .slice(0, -1) // Excluir el último mensaje que acabamos de agregar
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))

      // Obtener respuesta de la IA
      const aiService = new AIService()
      const aiResponse = await aiService.processMessage(
        message.trim(),
        userContext,
        conversationHistory
      )

      // Guardar respuesta de la IA
      const assistantMessage = await SupportMessage.create(
        chatId,
        'assistant',
        aiResponse.response,
        aiResponse.metadata
      )

      res.json({
        success: true,
        data: {
          userMessage,
          assistantMessage
        }
      })

    } catch (error) {
      console.error('Error in sendMessage:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener todos los chats del usuario
  static async getUserChats(req, res) {
    try {
      const userId = req.user.id
      const chats = await SupportChat.findByUserId(userId)
      
      res.json({
        success: true,
        data: chats
      })
    } catch (error) {
      console.error('Error in getUserChats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Cerrar chat
  static async closeChat(req, res) {
    try {
      const { chatId } = req.params
      const userId = req.user.id

      // Verificar que el chat pertenece al usuario
      const chat = await SupportChat.findById(chatId)
      if (!chat || chat.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        })
      }

      await SupportChat.updateStatus(chatId, 'closed')
      
      res.json({
        success: true,
        message: 'Chat cerrado exitosamente'
      })
    } catch (error) {
      console.error('Error in closeChat:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Marcar chat como resuelto
  static async resolveChat(req, res) {
    try {
      const { chatId } = req.params
      const userId = req.user.id

      // Verificar que el chat pertenece al usuario
      const chat = await SupportChat.findById(chatId)
      if (!chat || chat.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        })
      }

      await SupportChat.updateStatus(chatId, 'resolved')
      
      res.json({
        success: true,
        message: 'Chat marcado como resuelto'
      })
    } catch (error) {
      console.error('Error in resolveChat:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Eliminar chat (solo si está cerrado)
  static async deleteChat(req, res) {
    try {
      const { chatId } = req.params
      const userId = req.user.id

      // Verificar que el chat pertenece al usuario
      const chat = await SupportChat.findById(chatId)
      if (!chat || chat.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Chat no encontrado'
        })
      }

      // Solo permitir eliminar chats cerrados o resueltos
      if (chat.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminar un chat activo. Primero debes cerrarlo.'
        })
      }

      await SupportChat.delete(chatId)
      
      res.json({
        success: true,
        message: 'Chat eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error in deleteChat:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Crear nuevo chat con título personalizado
  static async createNewChat(req, res) {
    try {
      const userId = req.user.id
      const { title = 'Nuevo Chat de Apoyo' } = req.body

      const chat = await SupportChat.create(userId, title)
      
      res.status(201).json({
        success: true,
        data: chat,
        message: 'Nuevo chat creado exitosamente'
      })
    } catch (error) {
      console.error('Error in createNewChat:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}
