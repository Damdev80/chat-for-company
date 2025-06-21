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

// Endpoint de diagnóstico para verificar configuración de IA
router.get('/diagnostico', (req, res) => {
  try {
    const hasApiKey = !!process.env.DEEPSEEK_API_KEY
    const apiKeyLength = process.env.DEEPSEEK_API_KEY ? process.env.DEEPSEEK_API_KEY.length : 0
    const isDemo = !process.env.DEEPSEEK_API_KEY || 
                   process.env.DEEPSEEK_API_KEY.trim() === '' || 
                   process.env.DEEPSEEK_API_KEY === 'demo_mode'
    
    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        deepseek: {
          hasApiKey,
          apiKeyLength,
          isDemoMode: isDemo,
          firstChars: hasApiKey ? process.env.DEEPSEEK_API_KEY.substring(0, 10) + '...' : 'N/A'
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en diagnóstico',
      error: error.message
    })
  }
})

export default router
