// routes/message.routes.js
import { Router } from 'express'
import { MessageController } from '../controllers/message.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { messageLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = Router()

router.post('/', verifyToken, messageLimiter, MessageController.create)
router.get('/', verifyToken, MessageController.getAll)
router.get('/user/:senderId', verifyToken, MessageController.getBySenderId)

export default router