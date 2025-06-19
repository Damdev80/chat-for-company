// src/routes/supportChat.routes.js - Rutas para chat de apoyo con IA
import { Router } from 'express'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { SupportChatController } from '../controllers/supportChat.controller.js'
import { body, param } from 'express-validator'
import { validate } from '../middlewares/validation.middleware.js'

const router = Router()

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken)

// Validaciones
const sendMessageValidation = [
  param('chatId').isUUID().withMessage('ID de chat inválido'),
  body('message')
    .notEmpty()
    .withMessage('El mensaje es requerido')
    .isLength({ min: 1, max: 2000 })
    .withMessage('El mensaje debe tener entre 1 y 2000 caracteres'),
  validate
]

const chatIdValidation = [
  param('chatId').isUUID().withMessage('ID de chat inválido'),
  validate
]

const createChatValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('El título debe tener entre 1 y 200 caracteres'),
  validate
]

// Rutas del chat de apoyo
router.get('/active', SupportChatController.getOrCreateChat)
router.get('/all', SupportChatController.getChatHistory)
router.post('/new', createChatValidation, SupportChatController.getOrCreateChat)
router.get('/:chatId/messages', chatIdValidation, SupportChatController.getChatMessages)
router.post('/:chatId/message', sendMessageValidation, SupportChatController.sendMessage)
router.patch('/:chatId/close', chatIdValidation, SupportChatController.closeChat)
router.get('/stats', SupportChatController.getStats)

export default router
