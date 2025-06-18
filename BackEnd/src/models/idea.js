// src/models/idea.js - Modelo para el muro de ideas
import { executeQuery } from '../config/turso.js'

export class Idea {
  constructor(data) {
    this.id = data.id
    this.group_id = data.group_id
    this.user_id = data.user_id
    this.title = data.title
    this.description = data.description
    this.category = data.category // 'general', 'feature', 'improvement', 'bug', 'other'
    this.priority = data.priority // 'low', 'medium', 'high', 'urgent'
    this.status = data.status // 'draft', 'proposed', 'in_review', 'approved', 'rejected', 'implemented'
    this.votes = data.votes || 0
    this.created_at = data.created_at
    this.updated_at = data.updated_at
    this.created_by_username = data.created_by_username
  }

  // Crear nueva idea
  static async create(ideaData) {
    try {
      const { group_id, user_id, title, description, category = 'general', priority = 'medium' } = ideaData
      
      const query = `
        INSERT INTO ideas (group_id, user_id, title, description, category, priority, status, votes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'proposed', 0, datetime('now'), datetime('now'))
      `
      
      const result = await executeQuery(query, [group_id, user_id, title, description, category, priority])
      
      if (result.lastID) {
        return await this.findById(result.lastID)
      }
      
      throw new Error('Error creating idea')
    } catch (error) {
      console.error('Error in Idea.create:', error)
      throw error
    }
  }

  // Obtener idea por ID
  static async findById(id) {
    try {
      const query = `
        SELECT i.*, u.username as created_by_username
        FROM ideas i
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
      `
      
      const result = await executeQuery(query, [id])
      return result.length > 0 ? new Idea(result[0]) : null
    } catch (error) {
      console.error('Error in Idea.findById:', error)
      throw error
    }
  }

  // Obtener todas las ideas de un grupo
  static async findByGroupId(group_id, filters = {}) {
    try {
      let query = `
        SELECT i.*, u.username as created_by_username
        FROM ideas i
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.group_id = ?
      `
      let params = [group_id]

      // Filtros opcionales
      if (filters.category) {
        query += ' AND i.category = ?'
        params.push(filters.category)
      }

      if (filters.status) {
        query += ' AND i.status = ?'
        params.push(filters.status)
      }

      if (filters.priority) {
        query += ' AND i.priority = ?'
        params.push(filters.priority)
      }

      // Ordenar por votos desc, luego por fecha
      query += ' ORDER BY i.votes DESC, i.created_at DESC'

      const result = await executeQuery(query, params)
      return result.map(row => new Idea(row))
    } catch (error) {
      console.error('Error in Idea.findByGroupId:', error)
      throw error
    }
  }

  // Votar por una idea
  static async vote(ideaId, userId, voteType = 'up') {
    try {
      // Verificar si el usuario ya votó
      const existingVote = await executeQuery(
        'SELECT * FROM idea_votes WHERE idea_id = ? AND user_id = ?',
        [ideaId, userId]
      )

      if (existingVote.length > 0) {
        // Usuario ya votó, actualizar voto
        await executeQuery(
          'UPDATE idea_votes SET vote_type = ?, created_at = datetime("now") WHERE idea_id = ? AND user_id = ?',
          [voteType, ideaId, userId]
        )
      } else {
        // Nuevo voto
        await executeQuery(
          'INSERT INTO idea_votes (idea_id, user_id, vote_type, created_at) VALUES (?, ?, ?, datetime("now"))',
          [ideaId, userId, voteType]
        )
      }

      // Recalcular votos totales
      const voteCount = await executeQuery(`
        SELECT 
          SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END) - 
          SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END) as total_votes
        FROM idea_votes WHERE idea_id = ?
      `, [ideaId])

      const totalVotes = voteCount[0]?.total_votes || 0

      // Actualizar contador de votos en la idea
      await executeQuery(
        'UPDATE ideas SET votes = ?, updated_at = datetime("now") WHERE id = ?',
        [totalVotes, ideaId]
      )

      return await this.findById(ideaId)
    } catch (error) {
      console.error('Error in Idea.vote:', error)
      throw error
    }
  }

  // Actualizar estado de la idea
  static async updateStatus(ideaId, newStatus, userId) {
    try {
      await executeQuery(
        'UPDATE ideas SET status = ?, updated_at = datetime("now") WHERE id = ?',
        [newStatus, ideaId]
      )

      return await this.findById(ideaId)
    } catch (error) {
      console.error('Error in Idea.updateStatus:', error)
      throw error
    }
  }

  // Actualizar idea
  static async update(ideaId, updateData) {
    try {
      const { title, description, category, priority } = updateData
      
      await executeQuery(`
        UPDATE ideas 
        SET title = ?, description = ?, category = ?, priority = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [title, description, category, priority, ideaId])

      return await this.findById(ideaId)
    } catch (error) {
      console.error('Error in Idea.update:', error)
      throw error
    }
  }

  // Eliminar idea
  static async delete(ideaId) {
    try {
      // Eliminar votos relacionados
      await executeQuery('DELETE FROM idea_votes WHERE idea_id = ?', [ideaId])
      
      // Eliminar idea
      const result = await executeQuery('DELETE FROM ideas WHERE id = ?', [ideaId])
      return result.changes > 0
    } catch (error) {
      console.error('Error in Idea.delete:', error)
      throw error
    }
  }

  // Obtener estadísticas de ideas por grupo
  static async getStats(group_id) {
    try {
      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_ideas,
          SUM(CASE WHEN status = 'proposed' THEN 1 ELSE 0 END) as proposed,
          SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END) as in_review,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'implemented' THEN 1 ELSE 0 END) as implemented,
          AVG(votes) as avg_votes
        FROM ideas WHERE group_id = ?
      `, [group_id])

      return stats[0] || {
        total_ideas: 0,
        proposed: 0,
        in_review: 0,
        approved: 0,
        implemented: 0,
        avg_votes: 0
      }
    } catch (error) {
      console.error('Error in Idea.getStats:', error)
      throw error
    }
  }
}
