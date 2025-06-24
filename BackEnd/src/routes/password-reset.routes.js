// routes/password-reset.routes.js
import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'

const router = Router()

// POST /api/password-reset/request - Solicitar recuperación de contraseña
router.post('/request', UserController.requestPasswordReset)

// GET /api/password-reset/validate/:token - Validar token de recuperación
router.get('/validate/:token', UserController.validateResetToken)

// POST /api/password-reset/reset - Restablecer contraseña
router.post('/reset', UserController.resetPassword)

export default router
