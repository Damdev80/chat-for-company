// src/routes/event.routes.js - Rutas para calendario de eventos
import { Router } from 'express'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { EventController } from '../controllers/event.controller.js'
import { eventValidation } from '../validations/event.validation.js'

const router = Router()

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken)

// Rutas para Eventos
router.post('/create', eventValidation.create, EventController.createEvent)
router.get('/group/:group_id', EventController.getGroupEvents)
router.get('/group/:group_id/upcoming', EventController.getUpcomingEvents)
router.get('/group/:group_id/today', EventController.getTodayEvents)
router.get('/group/:group_id/stats', EventController.getEventStats)
router.get('/objective/:objective_id', EventController.getEventsByObjective)
router.get('/:id', EventController.getEventById)
router.put('/:id/status', eventValidation.updateStatus, EventController.updateEventStatus)
router.put('/:id', eventValidation.update, EventController.updateEvent)
router.delete('/:id', EventController.deleteEvent)

export default router
