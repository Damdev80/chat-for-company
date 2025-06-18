// src/routes/idea.routes.js - Rutas para muro de ideas
import { Router } from 'express'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { IdeaController } from '../controllers/idea.controller.js'
import { ideaValidation } from '../validations/idea.validation.js'

const router = Router()

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken)

// Rutas para Ideas
router.post('/create', ideaValidation.create, IdeaController.createIdea)
router.get('/group/:group_id', IdeaController.getGroupIdeas)
router.get('/stats/:group_id', IdeaController.getIdeaStats)
router.get('/:id', IdeaController.getIdeaById)
router.post('/:id/vote', ideaValidation.vote, IdeaController.voteIdea)
router.put('/:id/status', ideaValidation.updateStatus, IdeaController.updateIdeaStatus)
router.put('/:id', ideaValidation.update, IdeaController.updateIdea)
router.delete('/:id', IdeaController.deleteIdea)

export default router
