// src/models/event.js - Modelo para calendario de fechas especiales
import { executeQuery } from '../config/turso.js'

export class Event {
  constructor(data) {
    this.id = data.id
    this.group_id = data.group_id
    this.objective_id = data.objective_id
    this.user_id = data.user_id
    this.title = data.title
    this.description = data.description
    this.event_date = data.event_date
    this.event_time = data.event_time
    this.event_type = data.event_type // 'deadline', 'meeting', 'milestone', 'reminder', 'celebration'
    this.priority = data.priority // 'low', 'medium', 'high', 'urgent'
    this.status = data.status // 'scheduled', 'completed', 'cancelled', 'postponed'
    this.reminder_enabled = data.reminder_enabled
    this.reminder_minutes = data.reminder_minutes
    this.created_at = data.created_at
    this.updated_at = data.updated_at
    this.created_by_username = data.created_by_username
    this.objective_title = data.objective_title
  }

  // Crear nuevo evento
  static async create(eventData) {
    try {
      const { 
        group_id, 
        objective_id = null, 
        user_id, 
        title, 
        description, 
        event_date, 
        event_time = null,
        event_type = 'reminder', 
        priority = 'medium',
        reminder_enabled = true,
        reminder_minutes = 30
      } = eventData
      
      const query = `
        INSERT INTO events 
        (group_id, objective_id, user_id, title, description, event_date, event_time, 
         event_type, priority, status, reminder_enabled, reminder_minutes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, datetime('now'), datetime('now'))
      `
      
      const result = await executeQuery(query, [
        group_id, objective_id, user_id, title, description, event_date, event_time,
        event_type, priority, reminder_enabled, reminder_minutes
      ])
      
      if (result.lastID) {
        return await this.findById(result.lastID)
      }
      
      throw new Error('Error creating event')
    } catch (error) {
      console.error('Error in Event.create:', error)
      throw error
    }
  }

  // Obtener evento por ID
  static async findById(id) {
    try {
      const query = `
        SELECT e.*, u.username as created_by_username, o.title as objective_title
        FROM events e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN objectives o ON e.objective_id = o.id
        WHERE e.id = ?
      `
      
      const result = await executeQuery(query, [id])
      return result.length > 0 ? new Event(result[0]) : null
    } catch (error) {
      console.error('Error in Event.findById:', error)
      throw error
    }
  }

  // Obtener eventos de un grupo
  static async findByGroupId(group_id, filters = {}) {
    try {
      let query = `
        SELECT e.*, u.username as created_by_username, o.title as objective_title
        FROM events e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN objectives o ON e.objective_id = o.id
        WHERE e.group_id = ?
      `
      let params = [group_id]

      // Filtros opcionales
      if (filters.event_type) {
        query += ' AND e.event_type = ?'
        params.push(filters.event_type)
      }

      if (filters.status) {
        query += ' AND e.status = ?'
        params.push(filters.status)
      }

      if (filters.date_from) {
        query += ' AND e.event_date >= ?'
        params.push(filters.date_from)
      }

      if (filters.date_to) {
        query += ' AND e.event_date <= ?'
        params.push(filters.date_to)
      }

      if (filters.objective_id) {
        query += ' AND e.objective_id = ?'
        params.push(filters.objective_id)
      }

      // Ordenar por fecha y hora
      query += ' ORDER BY e.event_date ASC, e.event_time ASC'

      const result = await executeQuery(query, params)
      return result.map(row => new Event(row))
    } catch (error) {
      console.error('Error in Event.findByGroupId:', error)
      throw error
    }
  }

  // Obtener eventos próximos (siguientes 7 días)
  static async getUpcomingEvents(group_id, days = 7) {
    try {
      const query = `
        SELECT e.*, u.username as created_by_username, o.title as objective_title
        FROM events e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN objectives o ON e.objective_id = o.id
        WHERE e.group_id = ? 
          AND e.status = 'scheduled'
          AND e.event_date >= date('now')
          AND e.event_date <= date('now', '+${days} days')
        ORDER BY e.event_date ASC, e.event_time ASC
      `
      
      const result = await executeQuery(query, [group_id])
      return result.map(row => new Event(row))
    } catch (error) {
      console.error('Error in Event.getUpcomingEvents:', error)
      throw error
    }
  }

  // Obtener eventos de hoy
  static async getTodayEvents(group_id) {
    try {
      const query = `
        SELECT e.*, u.username as created_by_username, o.title as objective_title
        FROM events e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN objectives o ON e.objective_id = o.id
        WHERE e.group_id = ? 
          AND e.status = 'scheduled'
          AND e.event_date = date('now')
        ORDER BY e.event_time ASC
      `
      
      const result = await executeQuery(query, [group_id])
      return result.map(row => new Event(row))
    } catch (error) {
      console.error('Error in Event.getTodayEvents:', error)
      throw error
    }
  }

  // Actualizar estado del evento
  static async updateStatus(eventId, newStatus) {
    try {
      await executeQuery(
        'UPDATE events SET status = ?, updated_at = datetime("now") WHERE id = ?',
        [newStatus, eventId]
      )

      return await this.findById(eventId)
    } catch (error) {
      console.error('Error in Event.updateStatus:', error)
      throw error
    }
  }

  // Actualizar evento
  static async update(eventId, updateData) {
    try {
      const { 
        title, 
        description, 
        event_date, 
        event_time, 
        event_type, 
        priority, 
        reminder_enabled, 
        reminder_minutes 
      } = updateData
      
      await executeQuery(`
        UPDATE events 
        SET title = ?, description = ?, event_date = ?, event_time = ?, 
            event_type = ?, priority = ?, reminder_enabled = ?, 
            reminder_minutes = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [title, description, event_date, event_time, event_type, priority, 
          reminder_enabled, reminder_minutes, eventId])

      return await this.findById(eventId)
    } catch (error) {
      console.error('Error in Event.update:', error)
      throw error
    }
  }

  // Eliminar evento
  static async delete(eventId) {
    try {
      const result = await executeQuery('DELETE FROM events WHERE id = ?', [eventId])
      return result.changes > 0
    } catch (error) {
      console.error('Error in Event.delete:', error)
      throw error
    }
  }

  // Obtener eventos por objetivo
  static async findByObjectiveId(objective_id) {
    try {
      const query = `
        SELECT e.*, u.username as created_by_username, o.title as objective_title
        FROM events e
        LEFT JOIN users u ON e.user_id = u.id
        LEFT JOIN objectives o ON e.objective_id = o.id
        WHERE e.objective_id = ?
        ORDER BY e.event_date ASC, e.event_time ASC
      `
      
      const result = await executeQuery(query, [objective_id])
      return result.map(row => new Event(row))
    } catch (error) {
      console.error('Error in Event.findByObjectiveId:', error)
      throw error
    }
  }

  // Obtener estadísticas de eventos
  static async getStats(group_id) {
    try {
      const stats = await executeQuery(`
        SELECT 
          COUNT(*) as total_events,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN event_date = date('now') THEN 1 ELSE 0 END) as today,
          SUM(CASE WHEN event_date >= date('now') AND event_date <= date('now', '+7 days') THEN 1 ELSE 0 END) as upcoming_week
        FROM events WHERE group_id = ?
      `, [group_id])

      return stats[0] || {
        total_events: 0,
        scheduled: 0,
        completed: 0,
        today: 0,
        upcoming_week: 0
      }
    } catch (error) {
      console.error('Error in Event.getStats:', error)
      throw error
    }
  }
}
