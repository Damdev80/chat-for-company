import { ModelsTask } from '../models/task.js'
import { ModelsObjective } from '../models/objective.js'
import { taskSchema, updateTaskSchema, assignTaskSchema, reviewTaskSchema, returnTaskSchema } from '../validations/task.validation.js'
import { emitTaskCompleted, emitProgressUpdate, emitObjectiveCompleted } from '../utils/socketManager.js'

export class TaskController {
  static async create(req, res) {
    try {
      
      // Validar datos con Zod
      const result = taskSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }      const { title, description, objective_id, assigned_to, priority } = result.data
      const created_by = req.user.id


      // Verificar que el objetivo existe
      const objective = await ModelsObjective.getById(objective_id)
      if (!objective) {
        return res.status(404).json({ message: 'Objetivo no encontrado' })
      }

      const task = await ModelsTask.create({
        title,
        description,
        objective_id,
        assigned_to,
        priority,
        created_by
      })


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
      res.json({ tasks })
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
      res.json({ tasks })
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

      // Get the completed task with full details
      const completedTask = await ModelsTask.getById(id)

      // Get the objective details
      const objective = await ModelsObjective.getById(completedTask.objective_id)

      if (objective) {
        // Emit task completion event
        await emitTaskCompleted(completedTask, objective)

        // Calculate and emit progress update
        const progress = await ModelsObjective.getProgress(objective.id)
        
        await emitProgressUpdate(objective, progress)

        // Check if objective is now completed (100% progress)
        if (progress.progress >= 100) {
          await emitObjectiveCompleted(objective)
        }
      }
      
      res.json({ 
        message: 'Tarea marcada como completada',
        progress: objective ? await ModelsObjective.getProgress(objective.id) : null
      })
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

  static async submitForReview(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id


      // Enviar tarea a revisión (verificará permisos internamente)
      await ModelsTask.submitForReview(id, userId)

      // Obtener la tarea actualizada
      const task = await ModelsTask.getById(id)
      
      res.json({ 
        message: 'Tarea enviada a revisión',
        task
      })
    } catch (error) {
      console.error('Error al enviar tarea a revisión:', error)
      
      if (error.message === 'Tarea no encontrada') {
        return res.status(404).json({ message: error.message })
      }
      
      if (error.message === 'No tienes permisos para enviar esta tarea a revisión') {
        return res.status(403).json({ message: error.message })
      }
      
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
  static async approveTask(req, res) {
    try {
      const { id } = req.params
      const reviewerId = req.user.id

      // Validar datos con Zod
      const result = reviewTaskSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }

      const { comments } = result.data


      // Verificar que el usuario tiene permisos de admin/supervisor
      if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return res.status(403).json({ message: 'No tienes permisos para aprobar tareas' })
      }

      // Aprobar tarea
      await ModelsTask.approveTask(id, reviewerId, comments)

      // Obtener la tarea completada con detalles completos
      const completedTask = await ModelsTask.getById(id)

      // Obtener los detalles del objetivo
      const objective = await ModelsObjective.getById(completedTask.objective_id)

      if (objective) {
        // Emitir evento de tarea completada
        await emitTaskCompleted(completedTask, objective)

        // Calcular y emitir actualización de progreso
        const progress = await ModelsObjective.getProgress(objective.id)
        
        await emitProgressUpdate(objective, progress)

        // Verificar si el objetivo está ahora completo (100% progreso)
        if (progress.progress >= 100) {
          await emitObjectiveCompleted(objective)
        }
      }
      
      res.json({ 
        message: 'Tarea aprobada y marcada como completada',
        task: completedTask,
        progress: objective ? await ModelsObjective.getProgress(objective.id) : null
      })
    } catch (error) {
      console.error('Error al aprobar tarea:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
  static async returnTask(req, res) {
    try {
      const { id } = req.params
      const reviewerId = req.user.id

      // Validar datos con Zod
      const result = returnTaskSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }

      const { comments } = result.data

      if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return res.status(403).json({ message: 'No tienes permisos para revisar tareas' })
      }

      // Devolver tarea
      await ModelsTask.returnTask(id, reviewerId, comments)

      // Obtener la tarea actualizada
      const task = await ModelsTask.getById(id)
      
      res.json({ 
        message: 'Tarea devuelta con comentarios',
        task
      })
    } catch (error) {
      console.error('Error al devolver tarea:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getTasksInReview(req, res) {
    try {
      // Verificar que el usuario tiene permisos de admin/supervisor
      if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
        return res.status(403).json({ message: 'No tienes permisos para ver tareas en revisión' })
      }

      const tasks = await ModelsTask.getTasksInReview()
      res.json(tasks)
    } catch (error) {
      console.error('Error al obtener tareas en revisión:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
