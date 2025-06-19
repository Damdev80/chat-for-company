// src/models/supportChat.js - Modelo para chat de apoyo con IA
import { executeQuery } from '../config/turso.js'
import { v4 as uuidv4 } from 'uuid'

export class SupportChat {
  constructor(data) {
    this.id = data.id
    this.user_id = data.user_id
    this.title = data.title
    this.status = data.status
    this.created_at = data.created_at
    this.updated_at = data.updated_at
    this.last_message_at = data.last_message_at
  }

  // Crear nuevo chat de apoyo
  static async create(userId, title = 'Chat de Apoyo') {
    try {
      const id = uuidv4()
      const query = `
        INSERT INTO support_chats (id, user_id, title, status, created_at, updated_at, last_message_at)
        VALUES (?, ?, ?, 'active', datetime('now'), datetime('now'), datetime('now'))
      `
      
      await executeQuery(query, [id, userId, title])
      return await this.findById(id)
    } catch (error) {
      console.error('Error in SupportChat.create:', error)
      throw error
    }
  }

  // Buscar chat por ID
  static async findById(id) {
    try {
      const query = `
        SELECT sc.*, u.username, u.email
        FROM support_chats sc
        LEFT JOIN users u ON sc.user_id = u.id
        WHERE sc.id = ?
      `
      
      const result = await executeQuery(query, [id])
      return result.length > 0 ? new SupportChat(result[0]) : null
    } catch (error) {
      console.error('Error in SupportChat.findById:', error)
      throw error
    }
  }

  // Obtener chats de un usuario
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT * FROM support_chats 
        WHERE user_id = ? 
        ORDER BY last_message_at DESC
      `
      
      const result = await executeQuery(query, [userId])
      return result.map(row => new SupportChat(row))
    } catch (error) {
      console.error('Error in SupportChat.findByUserId:', error)
      throw error
    }
  }

  // Obtener o crear chat activo para un usuario
  static async getOrCreateActiveChat(userId) {
    try {
      // Buscar chat activo existente
      const activeQuery = `
        SELECT * FROM support_chats 
        WHERE user_id = ? AND status = 'active' 
        ORDER BY last_message_at DESC 
        LIMIT 1
      `
      
      const activeResult = await executeQuery(activeQuery, [userId])
      
      if (activeResult.length > 0) {
        return new SupportChat(activeResult[0])
      }
      
      // Si no hay chat activo, crear uno nuevo
      return await this.create(userId)
    } catch (error) {
      console.error('Error in SupportChat.getOrCreateActiveChat:', error)
      throw error
    }
  }

  // Actualizar última actividad del chat
  static async updateLastMessage(chatId) {
    try {
      const query = `
        UPDATE support_chats 
        SET last_message_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `
      
      await executeQuery(query, [chatId])
    } catch (error) {
      console.error('Error in SupportChat.updateLastMessage:', error)
      throw error
    }
  }

  // Cambiar status del chat
  static async updateStatus(chatId, status) {
    try {
      const query = `
        UPDATE support_chats 
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
      `
      
      await executeQuery(query, [status, chatId])
    } catch (error) {
      console.error('Error in SupportChat.updateStatus:', error)
      throw error
    }
  }

  // Eliminar chat
  static async delete(chatId) {
    try {
      // Los mensajes se eliminan en cascada
      const query = 'DELETE FROM support_chats WHERE id = ?'
      await executeQuery(query, [chatId])
    } catch (error) {
      console.error('Error in SupportChat.delete:', error)
      throw error
    }
  }
}

export class SupportMessage {
  constructor(data) {
    this.id = data.id
    this.chat_id = data.chat_id
    this.role = data.role
    this.content = data.content
    this.metadata = data.metadata ? JSON.parse(data.metadata) : null
    this.created_at = data.created_at
  }

  // Crear nuevo mensaje
  static async create(chatId, role, content, metadata = null) {
    try {
      const id = uuidv4()
      const query = `
        INSERT INTO support_messages (id, chat_id, role, content, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `
      
      const metadataJson = metadata ? JSON.stringify(metadata) : null
      await executeQuery(query, [id, chatId, role, content, metadataJson])
      
      // Actualizar última actividad del chat
      await SupportChat.updateLastMessage(chatId)
      
      return await this.findById(id)
    } catch (error) {
      console.error('Error in SupportMessage.create:', error)
      throw error
    }
  }

  // Buscar mensaje por ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM support_messages WHERE id = ?'
      const result = await executeQuery(query, [id])
      return result.length > 0 ? new SupportMessage(result[0]) : null
    } catch (error) {
      console.error('Error in SupportMessage.findById:', error)
      throw error
    }
  }

  // Obtener mensajes de un chat
  static async findByChatId(chatId, limit = 50) {
    try {
      const query = `
        SELECT * FROM support_messages 
        WHERE chat_id = ? 
        ORDER BY created_at ASC 
        LIMIT ?
      `
      
      const result = await executeQuery(query, [chatId, limit])
      return result.map(row => new SupportMessage(row))
    } catch (error) {
      console.error('Error in SupportMessage.findByChatId:', error)
      throw error
    }
  }

  // Obtener últimos mensajes para contexto
  static async getRecentMessages(chatId, limit = 10) {
    try {
      const query = `
        SELECT * FROM support_messages 
        WHERE chat_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `
      
      const result = await executeQuery(query, [chatId, limit])
      return result.reverse().map(row => new SupportMessage(row))
    } catch (error) {
      console.error('Error in SupportMessage.getRecentMessages:', error)
      throw error
    }
  }

  // Eliminar mensaje
  static async delete(messageId) {
    try {
      const query = 'DELETE FROM support_messages WHERE id = ?'
      await executeQuery(query, [messageId])
    } catch (error) {
      console.error('Error in SupportMessage.delete:', error)
      throw error
    }
  }
}
