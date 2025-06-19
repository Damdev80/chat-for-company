// src/validations/idea.validation.js - Validaciones para ideas
import { body } from 'express-validator'

export const ideaValidation = {
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
    
    body('category')
      .optional()
      .isIn(['general', 'feature', 'improvement', 'bug', 'other'])
      .withMessage('Categoría inválida'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Prioridad inválida')
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
    
    body('category')
      .optional()
      .isIn(['general', 'feature', 'improvement', 'bug', 'other'])
      .withMessage('Categoría inválida'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Prioridad inválida')
  ],

  updateStatus: [
    body('status')
      .isIn(['draft', 'proposed', 'in_review', 'approved', 'rejected', 'implemented'])
      .withMessage('Estado inválido')
  ],

  vote: [
    body('vote_type')
      .isIn(['up', 'down'])
      .withMessage('Tipo de voto inválido')
  ]
}
