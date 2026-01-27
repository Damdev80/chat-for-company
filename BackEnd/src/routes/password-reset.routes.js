// routes/password-reset.routes.js
import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'
import { passwordResetLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = Router()

// POST /api/password-reset/request - Solicitar recuperación de contraseña
router.post('/request', passwordResetLimiter, UserController.requestPasswordReset)

// GET /api/password-reset/validate/:token - Validar token de recuperación
router.get('/validate/:token', passwordResetLimiter, UserController.validateResetToken)

// POST /api/password-reset/reset - Restablecer contraseña
router.post('/reset', passwordResetLimiter, UserController.resetPassword)

export default router
