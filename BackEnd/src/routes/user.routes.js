// routes/user.routes.js
import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { checkRole } from '../middlewares/role.middleware.js'
import { authLimiter, registerLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = Router()

router.post('/register', registerLimiter, UserController.register)
router.post('/login', authLimiter, UserController.login)
router.post('/admin', verifyToken, checkRole(['admin']), UserController.createAdmin)
router.get('/', UserController.getAll)
router.get('/:id', UserController.getById)

export default router