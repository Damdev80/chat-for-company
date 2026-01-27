import { Router } from 'express'
import { ObjectiveController } from '../controllers/objective.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { checkRole } from '../middlewares/role.middleware.js'
import { createContentLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = Router()

// Obtener todos los objetivos
router.get('/', verifyToken, ObjectiveController.getAll)

// Obtener objetivos por grupo
router.get('/group/:groupId', verifyToken, ObjectiveController.getByGroupId)

// Obtener objetivo por ID
router.get('/:id', verifyToken, ObjectiveController.getById)

// Obtener progreso de un objetivo
router.get('/:id/progress', verifyToken, ObjectiveController.getProgress)

// Crear nuevo objetivo (solo admins pueden crear)
router.post('/', verifyToken, checkRole(['admin']), createContentLimiter, ObjectiveController.create)

// Actualizar objetivo (solo el creador o admin)
router.put('/:id', verifyToken, ObjectiveController.update)

// Eliminar objetivo (solo el creador o admin)
router.delete('/:id', verifyToken, ObjectiveController.delete)

export default router
