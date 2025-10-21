// src/controllers/supportChat.controller.js - Controlador para chat de apoyo con IA
import { SupportChat, SupportMessage } from '../models/supportChat.js'
import aiService from '../services/aiService.js'
import nlpActionService from '../services/nlpActionService.js'
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

      console.log('\n💬 SOPORTE CHAT: Mensaje recibido')
      console.log('   Chat ID:', chatId)
      console.log('   User ID:', userId)
      console.log('   Mensaje:', message)

      // 🔍 VERIFICAR SI HAY UNA ACCIÓN PENDIENTE (esperando selección de grupo)
      const recentMessages = await SupportMessage.getRecentMessages(chatId, 5)
      const lastAssistantMessage = recentMessages.reverse().find(msg => msg.role === 'assistant')
      
      if (lastAssistantMessage?.metadata?.pendingAction) {
        console.log('\n⏳ HAY UNA ACCIÓN PENDIENTE')
        console.log('   Acción:', lastAssistantMessage.metadata.pendingAction.actionType)
        console.log('   Mensaje original:', lastAssistantMessage.metadata.pendingAction.originalMessage)
        
        const { ModelsGroup } = await import('../models/group.js')
        const userGroups = lastAssistantMessage.metadata.pendingAction.userGroups
        
        // Verificar si el usuario respondió con un número válido
        const selectedIndex = parseInt(message.trim())
        
        if (isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > userGroups.length) {
          const errorMessage = await SupportMessage.create(
            chatId,
            'assistant',
            `❌ Por favor, responde con un número válido entre 1 y ${userGroups.length}.\n\n` +
            userGroups.map((g, i) => `${i + 1}. **${g.name}**`).join('\n') +
            '\n\nEscribe el número del grupo donde quieres crear.',
            {
              timestamp: new Date().toISOString(),
              pendingAction: lastAssistantMessage.metadata.pendingAction
            }
          )
          
          return res.json({
            success: true,
            data: {
              userMessage: userMessage,
              assistantMessage: errorMessage
            }
          })
        }
        
        // Grupo seleccionado válido
        const selectedGroup = userGroups[selectedIndex - 1]
        console.log('   ✅ Grupo seleccionado:', selectedGroup.name)
        
        // Ejecutar la acción pendiente
        const actionResult = await nlpActionService.executeAction(
          lastAssistantMessage.metadata.pendingAction.actionType,
          lastAssistantMessage.metadata.pendingAction.originalMessage,
          userId,
          selectedGroup.id
        )
        
        const assistantMessage = await SupportMessage.create(
          chatId,
          'assistant',
          `✅ Creado en **${selectedGroup.name}**\n\n${actionResult.message}`,
          {
            timestamp: new Date().toISOString(),
            action: actionResult.action,
            actionData: actionResult.data,
            selectedGroup: selectedGroup,
            model: 'nlp-action-service'
          }
        )
        
        await SupportChat.updateLastMessage(chatId)
        
        return res.json({
          success: true,
          data: {
            userMessage: userMessage,
            assistantMessage: assistantMessage
          }
        })
      }

      // 🆕 DETECTAR SI ES UNA SOLICITUD DE ACCIÓN (crear tarea, objetivo, evento)
      console.log('\n🔍 Detectando acción NLP...')
      const actionType = nlpActionService.detectAction(message)
      console.log('   Tipo de acción:', actionType || 'ninguna')
      
      if (actionType) {
        console.log('\n✅ ACCIÓN DETECTADA:', actionType)
        
        const { ModelsGroup } = await import('../models/group.js')
        console.log('   🔍 Buscando grupos del usuario:', userId)
        const userGroups = await ModelsGroup.getUserGroups(userId)
        
        console.log('   📋 Grupos encontrados:', userGroups ? userGroups.length : 0)
        if (userGroups && userGroups.length > 0) {
          userGroups.forEach((group, index) => {
            console.log(`      ${index + 1}. ${group.name || 'Sin nombre'} (ID: ${group.id})`)
          })
        }
        
        if (!userGroups || userGroups.length === 0) {
          console.log('   ⚠️ Usuario no tiene grupos')
          const errorMessage = await SupportMessage.create(
            chatId,
            'assistant',
            '⚠️ Para crear tareas, objetivos o eventos, primero debes pertenecer a un grupo. Por favor, únete a un grupo o solicita a un administrador que te agregue a uno.',
            {
              timestamp: new Date().toISOString(),
              error: 'no_group_membership'
            }
          )
          
          return res.json({
            success: true,
            data: {
              userMessage: userMessage,
              assistantMessage: errorMessage
            }
          })
        }
        
        // 🆕 SI TIENE MÚLTIPLES GRUPOS, PREGUNTAR EN CUÁL CREAR
        if (userGroups.length > 1) {
          console.log('   🤔 Usuario tiene múltiples grupos, preguntando...')
          
          const groupsList = userGroups.map((group, index) => 
            `${index + 1}. **${group.name}**`
          ).join('\n')
          
          const questionMessage = await SupportMessage.create(
            chatId,
            'assistant',
            `🏢 Tienes ${userGroups.length} grupos. ¿En cuál quieres crear?\n\n${groupsList}\n\n👉 Responde con el número del grupo.`,
            {
              timestamp: new Date().toISOString(),
              pendingAction: {
                actionType: actionType,
                originalMessage: message,
                userGroups: userGroups.map(g => ({ id: g.id, name: g.name }))
              }
            }
          )
          
          await SupportChat.updateLastMessage(chatId)
          
          return res.json({
            success: true,
            data: {
              userMessage: userMessage,
              assistantMessage: questionMessage
            }
          })
        }
        
        // Un solo grupo, ejecutar directamente
        const groupId = userGroups[0].id
        console.log('   🏢 Usuario tiene un solo grupo:', userGroups[0].name || 'Sin nombre')
        console.log('   🆔 Group ID:', groupId)
        console.log('   🔍 Tipo de groupId:', typeof groupId)
        
        // Ejecutar la acción
        console.log('   ⚡ Ejecutando acción en grupo:', groupId)
        const actionResult = await nlpActionService.executeAction(
          actionType,
          message,
          userId,
          groupId
        )
        
        // Guardar respuesta de confirmación
        const assistantMessage = await SupportMessage.create(
          chatId,
          'assistant',
          actionResult.message,
          {
            timestamp: new Date().toISOString(),
            action: actionResult.action,
            actionData: actionResult.data,
            model: 'nlp-action-service'
          }
        )
        
        await SupportChat.updateLastMessage(chatId)
        
        return res.json({
          success: true,
          data: {
            userMessage: userMessage,
            assistantMessage: assistantMessage,
            actionExecuted: true,
            actionType: actionResult.action
          }
        })
      }

      // Si no es una acción, procesar con IA normal
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
