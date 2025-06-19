// src/validations/event.validation.js - Validaciones para eventos
import { body } from 'express-validator'

export const eventValidation = {
  create: [
    body('group_id')
      .notEmpty()
      .withMessage('Group ID es requerido'),
    
    body('title')
      .isLength({ min: 3, max: 200 })
      .withMessage('El título debe tener entre 3 y 200 caracteres')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede exceder 1000 caracteres')
      .trim(),
    
    body('event_date')
      .isISO8601({ strict: false })
      .withMessage('Formato de fecha inválido (YYYY-MM-DD)')
      .custom((value) => {
        const today = new Date()
        const eventDate = new Date(value)
        if (eventDate < today.setHours(0, 0, 0, 0)) {
          throw new Error('La fecha del evento no puede ser en el pasado')
        }
        return true
      }),
    
    body('event_time')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Formato de hora inválido (HH:MM)'),
    
    body('event_type')
      .optional()
      .isIn(['deadline', 'meeting', 'milestone', 'reminder', 'celebration'])
      .withMessage('Tipo de evento inválido'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Prioridad inválida'),
    
    body('objective_id')
      .optional()
      .isString()
      .withMessage('ID de objetivo inválido'),
    
    body('reminder_enabled')
      .optional()
      .isBoolean()
      .withMessage('Valor de recordatorio inválido'),
    
    body('reminder_minutes')
      .optional()
      .isInt({ min: 0, max: 10080 }) // Máximo 7 días en minutos
      .withMessage('Minutos de recordatorio inválidos (0-10080)')
  ],

  update: [
    body('title')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('El título debe tener entre 3 y 200 caracteres')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede exceder 1000 caracteres')
      .trim(),
    
    body('event_date')
      .optional()
      .isISO8601({ strict: false })
      .withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
    
    body('event_time')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Formato de hora inválido (HH:MM)'),
    
    body('event_type')
      .optional()
      .isIn(['deadline', 'meeting', 'milestone', 'reminder', 'celebration'])
      .withMessage('Tipo de evento inválido'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Prioridad inválida'),
    
    body('reminder_enabled')
      .optional()
      .isBoolean()
      .withMessage('Valor de recordatorio inválido'),
    
    body('reminder_minutes')
      .optional()
      .isInt({ min: 0, max: 10080 })
      .withMessage('Minutos de recordatorio inválidos (0-10080)')
  ],

  updateStatus: [
    body('status')
      .isIn(['scheduled', 'completed', 'cancelled', 'postponed'])
      .withMessage('Estado inválido')
  ]
}
