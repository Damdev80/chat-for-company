// routes/user.routes.js
import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { checkRole } from '../middlewares/role.middleware.js'

const router = Router()

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/admin', verifyToken, checkRole(['admin']), UserController.createAdmin) // Nuevo endpoint para crear admin
router.get('/', UserController.getAll)
router.get('/:id', UserController.getById)

export default router