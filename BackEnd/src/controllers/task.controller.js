import { ModelsTask } from '../models/task.js'
import { ModelsObjective } from '../models/objective.js'
import { taskSchema, updateTaskSchema, assignTaskSchema } from '../validations/task.validation.js'

export class TaskController {
  static async create(req, res) {
    try {
      console.log('=== TASK CREATION REQUEST ===');
      console.log('Request body:', req.body);
      console.log('User:', req.user);
      
      // Validar datos con Zod
      const result = taskSchema.safeParse(req.body)
      if (!result.success) {
        console.log('Validation failed:', result.error.issues);
        return res.status(400).json({ errors: result.error.issues })
      }

      const { title, description, objective_id, assigned_to } = result.data
      const created_by = req.user.id

      console.log('Parsed data:', { title, description, objective_id, assigned_to, created_by });

      // Verificar que el objetivo existe
      const objective = await ModelsObjective.getById(objective_id)
      if (!objective) {
        console.log('Objective not found:', objective_id);
        return res.status(404).json({ message: 'Objetivo no encontrado' })
      }

      console.log('Objective found:', objective);

      // Crear la tarea
      const task = await ModelsTask.create({
        title,
        description,
        objective_id,
        assigned_to,
        created_by
      })

      console.log('Task created successfully:', task);

      res.status(201).json({
        message: 'Tarea creada correctamente',
        task
      })
    } catch (error) {
      console.error('Error al crear tarea:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getAll(req, res) {
    try {
      const tasks = await ModelsTask.getAll()
      res.json(tasks)
    } catch (error) {
      console.error('Error al obtener tareas:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const task = await ModelsTask.getById(id)
      
      if (!task) {
        return res.status(404).json({ message: 'Tarea no encontrada' })
      }
      
      res.json(task)
    } catch (error) {
      console.error('Error al obtener tarea:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getByObjectiveId(req, res) {
    try {
      const { objectiveId } = req.params
      const tasks = await ModelsTask.getByObjectiveId(objectiveId)
      res.json(tasks)
    } catch (error) {
      console.error('Error al obtener tareas del objetivo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getByUserId(req, res) {
    try {
      const { userId } = req.params
      const tasks = await ModelsTask.getByUserId(userId)
      res.json(tasks)
    } catch (error) {
      console.error('Error al obtener tareas del usuario:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getMyTasks(req, res) {
    try {
      const userId = req.user.id
      const tasks = await ModelsTask.getByUserId(userId)
      res.json(tasks)
    } catch (error) {
      console.error('Error al obtener mis tareas:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      
      // Validar datos con Zod
      const result = updateTaskSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }

      // Verificar que la tarea existe
      const existingTask = await ModelsTask.getById(id)
      if (!existingTask) {
        return res.status(404).json({ message: 'Tarea no encontrada' })
      }

      // Verificar permisos (solo el creador, asignado o admin puede actualizar)
      const canUpdate = req.user.role === 'admin' || 
                       existingTask.created_by === req.user.id || 
                       existingTask.assigned_to === req.user.id
      
      if (!canUpdate) {
        return res.status(403).json({ message: 'No tienes permisos para actualizar esta tarea' })
      }

      await ModelsTask.update(id, result.data)
      
      res.json({ message: 'Tarea actualizada correctamente' })
    } catch (error) {
      console.error('Error al actualizar tarea:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      
      // Verificar que la tarea existe
      const existingTask = await ModelsTask.getById(id)
      if (!existingTask) {
        return res.status(404).json({ message: 'Tarea no encontrada' })
      }

      // Verificar permisos (solo el creador o admin puede eliminar)
      if (req.user.role !== 'admin' && existingTask.created_by !== req.user.id) {
        return res.status(403).json({ message: 'No tienes permisos para eliminar esta tarea' })
      }

      await ModelsTask.delete(id)
      
      res.json({ message: 'Tarea eliminada correctamente' })
    } catch (error) {
      console.error('Error al eliminar tarea:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async assignTask(req, res) {
    try {
      const { id } = req.params
      
      // Validar datos con Zod
      const result = assignTaskSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }

      // Verificar que la tarea existe
      const existingTask = await ModelsTask.getById(id)
      if (!existingTask) {
        return res.status(404).json({ message: 'Tarea no encontrada' })
      }

      // Verificar permisos (solo el creador o admin puede asignar)
      if (req.user.role !== 'admin' && existingTask.created_by !== req.user.id) {
        return res.status(403).json({ message: 'No tienes permisos para asignar esta tarea' })
      }

      const { assigned_to } = result.data
      await ModelsTask.update(id, { assigned_to })
      
      res.json({ message: 'Tarea asignada correctamente' })
    } catch (error) {
      console.error('Error al asignar tarea:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async markAsCompleted(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      // Marcar como completada (verificará permisos internamente)
      await ModelsTask.markAsCompleted(id, userId)
      
      res.json({ message: 'Tarea marcada como completada' })
    } catch (error) {
      console.error('Error al completar tarea:', error)
      
      if (error.message === 'Tarea no encontrada') {
        return res.status(404).json({ message: error.message })
      }
      
      if (error.message === 'No tienes permisos para completar esta tarea') {
        return res.status(403).json({ message: error.message })
      }
      
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getUserStats(req, res) {
    try {
      const { userId } = req.params
      const stats = await ModelsTask.getStatsByUser(userId)
      res.json(stats)
    } catch (error) {
      console.error('Error al obtener estadísticas del usuario:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getMyStats(req, res) {
    try {
      const userId = req.user.id
      const stats = await ModelsTask.getStatsByUser(userId)
      res.json(stats)
    } catch (error) {
      console.error('Error al obtener mis estadísticas:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
