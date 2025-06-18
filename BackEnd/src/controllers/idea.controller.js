// src/controllers/idea.controller.js - Controlador para muro de ideas
import { Idea } from '../models/idea.js'

export class IdeaController {
  // Crear nueva idea
  static async createIdea(req, res) {
    try {
      const { group_id, title, description, category, priority } = req.body
      const user_id = req.user.id

      if (!group_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'Group ID y título son requeridos'
        })
      }

      const ideaData = {
        group_id,
        user_id,
        title: title.trim(),
        description: description?.trim() || '',
        category: category || 'general',
        priority: priority || 'medium'
      }

      const newIdea = await Idea.create(ideaData)

      res.status(201).json({
        success: true,
        message: 'Idea creada exitosamente',
        data: newIdea
      })

    } catch (error) {
      console.error('Error in createIdea:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener ideas de un grupo
  static async getGroupIdeas(req, res) {
    try {
      const { group_id } = req.params
      const { category, status, priority } = req.query

      const filters = {}
      if (category) filters.category = category
      if (status) filters.status = status
      if (priority) filters.priority = priority

      const ideas = await Idea.findByGroupId(group_id, filters)

      res.json({
        success: true,
        data: ideas
      })

    } catch (error) {
      console.error('Error in getGroupIdeas:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener idea específica
  static async getIdeaById(req, res) {
    try {
      const { id } = req.params

      const idea = await Idea.findById(id)

      if (!idea) {
        return res.status(404).json({
          success: false,
          message: 'Idea no encontrada'
        })
      }

      res.json({
        success: true,
        data: idea
      })

    } catch (error) {
      console.error('Error in getIdeaById:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Votar por una idea
  static async voteIdea(req, res) {
    try {
      const { id } = req.params
      const { vote_type } = req.body // 'up' o 'down'
      const user_id = req.user.id

      if (!vote_type || !['up', 'down'].includes(vote_type)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de voto inválido. Debe ser "up" o "down"'
        })
      }

      // Verificar que la idea existe
      const idea = await Idea.findById(id)
      if (!idea) {
        return res.status(404).json({
          success: false,
          message: 'Idea no encontrada'
        })
      }

      const updatedIdea = await Idea.vote(id, user_id, vote_type)

      res.json({
        success: true,
        message: `Voto ${vote_type === 'up' ? 'positivo' : 'negativo'} registrado`,
        data: updatedIdea
      })

    } catch (error) {
      console.error('Error in voteIdea:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Actualizar estado de idea
  static async updateIdeaStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body
      const user_id = req.user.id

      const validStatuses = ['draft', 'proposed', 'in_review', 'approved', 'rejected', 'implemented']
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido'
        })
      }

      // Verificar que la idea existe
      const idea = await Idea.findById(id)
      if (!idea) {
        return res.status(404).json({
          success: false,
          message: 'Idea no encontrada'
        })
      }

      const updatedIdea = await Idea.updateStatus(id, status, user_id)

      res.json({
        success: true,
        message: 'Estado de idea actualizado',
        data: updatedIdea
      })

    } catch (error) {
      console.error('Error in updateIdeaStatus:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Actualizar idea
  static async updateIdea(req, res) {
    try {
      const { id } = req.params
      const { title, description, category, priority } = req.body
      const user_id = req.user.id

      // Verificar que la idea existe
      const idea = await Idea.findById(id)
      if (!idea) {
        return res.status(404).json({
          success: false,
          message: 'Idea no encontrada'
        })
      }

      // Verificar que el usuario sea el creador de la idea
      if (idea.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para editar esta idea'
        })
      }

      const updateData = {
        title: title?.trim() || idea.title,
        description: description?.trim() || idea.description,
        category: category || idea.category,
        priority: priority || idea.priority
      }

      const updatedIdea = await Idea.update(id, updateData)

      res.json({
        success: true,
        message: 'Idea actualizada exitosamente',
        data: updatedIdea
      })

    } catch (error) {
      console.error('Error in updateIdea:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Eliminar idea
  static async deleteIdea(req, res) {
    try {
      const { id } = req.params
      const user_id = req.user.id

      // Verificar que la idea existe
      const idea = await Idea.findById(id)
      if (!idea) {
        return res.status(404).json({
          success: false,
          message: 'Idea no encontrada'
        })
      }

      // Verificar que el usuario sea el creador de la idea
      if (idea.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta idea'
        })
      }

      const deleted = await Idea.delete(id)

      if (deleted) {
        res.json({
          success: true,
          message: 'Idea eliminada exitosamente'
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar la idea'
        })
      }

    } catch (error) {
      console.error('Error in deleteIdea:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener estadísticas de ideas
  static async getIdeaStats(req, res) {
    try {
      const { group_id } = req.params

      const stats = await Idea.getStats(group_id)

      res.json({
        success: true,
        data: stats
      })

    } catch (error) {
      console.error('Error in getIdeaStats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}
