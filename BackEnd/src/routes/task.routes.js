import { Router } from 'express'
import { TaskController } from '../controllers/task.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { checkRole } from '../middlewares/role.middleware.js'
import { createContentLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = Router()

// Obtener todas las tareas
router.get('/', verifyToken, TaskController.getAll)

// Obtener tarea por ID
router.get('/:id', verifyToken, TaskController.getById)

// Obtener tareas por objetivo
router.get('/objective/:objectiveId', verifyToken, TaskController.getByObjectiveId)

// Obtener tareas asignadas a un usuario
router.get('/user/:userId', verifyToken, TaskController.getByUserId)

// Obtener mis tareas (usuario autenticado)
router.get('/my/tasks', verifyToken, TaskController.getMyTasks)

// Obtener estadísticas de usuario
router.get('/user/:userId/stats', verifyToken, TaskController.getUserStats)

// Obtener mis estadísticas
router.get('/my/stats', verifyToken, TaskController.getMyStats)

// Obtener tareas en revisión (solo admins/supervisores)
router.get('/review/pending', verifyToken, TaskController.getTasksInReview)

// Crear nueva tarea (solo admins o creadores de objetivos)
router.post('/', verifyToken, createContentLimiter, TaskController.create)

// Actualizar tarea (creador, asignado o admin)
router.put('/:id', verifyToken, TaskController.update)

// Asignar tarea a usuario (solo creador o admin)
router.patch('/:id/assign', verifyToken, TaskController.assignTask)

// Marcar tarea como completada (solo usuario asignado)
router.patch('/:id/complete', verifyToken, TaskController.markAsCompleted)

// Enviar tarea a revisión (solo usuario asignado)
router.patch('/:id/submit-review', verifyToken, TaskController.submitForReview)

// Aprobar tarea (solo admins/supervisores)
router.patch('/:id/approve', verifyToken, TaskController.approveTask)

// Devolver tarea con comentarios (solo admins/supervisores)
router.patch('/:id/return', verifyToken, TaskController.returnTask)

// Eliminar tarea (solo creador o admin)
router.delete('/:id', verifyToken, TaskController.delete)

export default router
