// src/controllers/event.controller.js - Controlador para calendario de eventos
import { Event } from '../models/event.js'

export class EventController {
  // Crear nuevo evento
  static async createEvent(req, res) {
    try {
      const { 
        group_id, 
        objective_id, 
        title, 
        description, 
        event_date, 
        event_time,
        event_type, 
        priority,
        reminder_enabled,
        reminder_minutes
      } = req.body
      const user_id = req.user.id

      if (!group_id || !title || !event_date) {
        return res.status(400).json({
          success: false,
          message: 'Group ID, título y fecha son requeridos'
        })
      }

      // Validar formato de fecha
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(event_date)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        })
      }

      const eventData = {
        group_id,
        objective_id: objective_id || null,
        user_id,
        title: title.trim(),
        description: description?.trim() || '',
        event_date,
        event_time: event_time || null,
        event_type: event_type || 'reminder',
        priority: priority || 'medium',
        reminder_enabled: reminder_enabled !== undefined ? reminder_enabled : true,
        reminder_minutes: reminder_minutes || 30
      }

      const newEvent = await Event.create(eventData)

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: newEvent
      })

    } catch (error) {
      console.error('Error in createEvent:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener eventos de un grupo
  static async getGroupEvents(req, res) {
    try {
      const { group_id } = req.params
      const { event_type, status, date_from, date_to, objective_id } = req.query

      const filters = {}
      if (event_type) filters.event_type = event_type
      if (status) filters.status = status
      if (date_from) filters.date_from = date_from
      if (date_to) filters.date_to = date_to
      if (objective_id) filters.objective_id = objective_id

      const events = await Event.findByGroupId(group_id, filters)

      res.json({
        success: true,
        data: events
      })

    } catch (error) {
      console.error('Error in getGroupEvents:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener eventos próximos
  static async getUpcomingEvents(req, res) {
    try {
      const { group_id } = req.params
      const { days = 7 } = req.query

      const events = await Event.getUpcomingEvents(group_id, parseInt(days))

      res.json({
        success: true,
        data: events
      })

    } catch (error) {
      console.error('Error in getUpcomingEvents:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener eventos de hoy
  static async getTodayEvents(req, res) {
    try {
      const { group_id } = req.params

      const events = await Event.getTodayEvents(group_id)

      res.json({
        success: true,
        data: events
      })

    } catch (error) {
      console.error('Error in getTodayEvents:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener evento específico
  static async getEventById(req, res) {
    try {
      const { id } = req.params

      const event = await Event.findById(id)

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        })
      }

      res.json({
        success: true,
        data: event
      })

    } catch (error) {
      console.error('Error in getEventById:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Actualizar estado del evento
  static async updateEventStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body

      const validStatuses = ['scheduled', 'completed', 'cancelled', 'postponed']
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        })
      }

      // Verificar que el evento existe
      const event = await Event.findById(id)
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        })
      }

      const updatedEvent = await Event.updateStatus(id, status)

      res.json({
        success: true,
        message: 'Estado del evento actualizado',
        data: updatedEvent
      })

    } catch (error) {
      console.error('Error in updateEventStatus:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Actualizar evento
  static async updateEvent(req, res) {
    try {
      const { id } = req.params
      const { 
        title, 
        description, 
        event_date, 
        event_time, 
        event_type, 
        priority,
        reminder_enabled,
        reminder_minutes
      } = req.body
      const user_id = req.user.id

      // Verificar que el evento existe
      const event = await Event.findById(id)
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        })
      }

      // Verificar que el usuario sea el creador del evento
      if (event.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar este evento'
        })
      }

      // Validar formato de fecha si se proporciona
      if (event_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(event_date)) {
          return res.status(400).json({
            success: false,
            message: 'Formato de fecha inválido. Use YYYY-MM-DD'
          })
        }
      }

      const updateData = {
        title: title?.trim() || event.title,
        description: description?.trim() || event.description,
        event_date: event_date || event.event_date,
        event_time: event_time !== undefined ? event_time : event.event_time,
        event_type: event_type || event.event_type,
        priority: priority || event.priority,
        reminder_enabled: reminder_enabled !== undefined ? reminder_enabled : event.reminder_enabled,
        reminder_minutes: reminder_minutes !== undefined ? reminder_minutes : event.reminder_minutes
      }

      const updatedEvent = await Event.update(id, updateData)

      res.json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: updatedEvent
      })

    } catch (error) {
      console.error('Error in updateEvent:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Eliminar evento
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params
      const user_id = req.user.id

      // Verificar que el evento existe
      const event = await Event.findById(id)
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        })
      }

      // Verificar que el usuario sea el creador del evento
      if (event.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar este evento'
        })
      }

      const deleted = await Event.delete(id)

      if (deleted) {
        res.json({
          success: true,
          message: 'Evento eliminado exitosamente'
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar el evento'
        })
      }

    } catch (error) {
      console.error('Error in deleteEvent:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener eventos por objetivo
  static async getEventsByObjective(req, res) {
    try {
      const { objective_id } = req.params

      const events = await Event.findByObjectiveId(objective_id)

      res.json({
        success: true,
        data: events
      })

    } catch (error) {
      console.error('Error in getEventsByObjective:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener estadísticas de eventos
  static async getEventStats(req, res) {
    try {
      const { group_id } = req.params

      const stats = await Event.getStats(group_id)

      res.json({
        success: true,
        data: stats
      })

    } catch (error) {
      console.error('Error in getEventStats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}
