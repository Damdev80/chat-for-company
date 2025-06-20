// src/controllers/supportChat.controller.js - Controlador para chat de apoyo con IA
import { SupportChat, SupportMessage } from '../models/supportChat.js'
import aiService from '../services/aiService.js'
import { validationResult } from 'express-validator'

export class SupportChatController {  // Obtener o crear chat de apoyo para el usuario
  static async getOrCreateChat(req, res) {
    try {
      const userId = req.user.id
      
      // Obtener o crear chat activo para el usuario
      const chat = await SupportChat.getOrCreateActiveChat(userId)
      
      // Obtener mensajes del chat
      const messages = await SupportMessage.findByChatId(chat.id)
      
      res.json({
        success: true,
        data: {
          chat: chat,
          messages: messages
        }
      })
    } catch (error) {
      console.error('Error in getOrCreateChat:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  // Obtener historial de chats del usuario
  static async getChatHistory(req, res) {
    try {
      const userId = req.user.id
      const chats = await SupportChat.findByUserId(userId)
      
      res.json({
        success: true,
        data: chats
      })
    } catch (error) {
      console.error('Error in getChatHistory:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  // Obtener mensajes de un chat específico
  static async getChatMessages(req, res) {
    try {
      const { chatId } = req.params
      const userId = req.user.id
      
      // Verificar que el chat pertenece al usuario
      const chat = await SupportChat.findById(chatId)
      if (!chat || chat.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este chat'
        })
      }
      
      const messages = await SupportMessage.findByChatId(chatId)
      
      res.json({
        success: true,
        data: messages
      })
    } catch (error) {
      console.error('Error in getChatMessages:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  // Enviar mensaje al chat de apoyo
  static async sendMessage(req, res) {
    try {
      // Validar entrada
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        })
      }

      const { chatId } = req.params  // chatId viene de la URL
      const { message } = req.body   // message viene del body
      const userId = req.user.id
      
      // Verificar que el chat pertenece al usuario
      const chat = await SupportChat.findById(chatId)
      if (!chat || chat.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este chat'
        })
      }      // Guardar mensaje del usuario
      const userMessage = await SupportMessage.create(
        chatId,
        'user',
        message.trim()
      )

      // Generar respuesta de IA
      try {
        // Obtener contexto del chat (últimos mensajes)
        const chatHistory = await SupportMessage.findByChatId(chatId, 10)
          // Procesar mensaje con IA
        const aiResponse = await aiService.processMessage(
          message, 
          chatHistory,
          {
            userId: userId,
            chatId: chatId,
            username: req.user?.username || 'Usuario',
            role: req.user?.role || 'empleado',
            company: 'Tu Empresa'
          }
        )// Guardar respuesta de la IA
        const assistantMessage = await SupportMessage.create(
          chatId,
          'assistant',
          aiResponse,
          {
            timestamp: new Date().toISOString(),
            model: aiService.isInDemoMode() ? 'demo' : 'deepseek-chat',
            mode: aiService.isInDemoMode() ? 'demo' : 'production'
          }
        )

        // Actualizar timestamp del último mensaje en el chat
        await SupportChat.updateLastMessage(chatId)

        res.json({
          success: true,
          data: {
            userMessage: userMessage,
            assistantMessage: assistantMessage
          }
        })

      } catch (aiError) {
        console.error('Error en procesamiento de IA:', aiError)
          // Crear respuesta de error amigable
        const errorMessage = await SupportMessage.create(
          chatId,
          'assistant',
          'Lo siento, tuve un problema técnico al procesar tu mensaje. Por favor intenta de nuevo en unos momentos. 🔧',
          {
            error: aiError.message,
            timestamp: new Date().toISOString(),
            type: 'ai_error'
          }
        )

        res.json({
          success: true,
          data: {
            userMessage: userMessage,
            assistantMessage: errorMessage
          }
        })
      }

    } catch (error) {
      console.error('Error in sendMessage:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  // Cerrar chat de apoyo
  static async closeChat(req, res) {
    try {
      const { chatId } = req.params
      const userId = req.user.id
      
      // Verificar que el chat pertenece al usuario
      const chat = await SupportChat.findById(chatId)
      if (!chat || chat.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para acceder a este chat'
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
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  // Obtener estadísticas del chat de apoyo (para administradores)
  static async getStats(req, res) {
    try {
      const stats = await SupportChat.getStats()
      
      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error in getStats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}
