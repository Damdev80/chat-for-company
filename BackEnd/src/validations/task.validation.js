import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string({
    required_error: 'El título es obligatorio',
  }).min(1, 'El título no puede estar vacío').max(200, 'El título es demasiado largo'),

  description: z.string().max(1000, 'La descripción es demasiado larga').optional(),
  objective_id: z.string({
    required_error: 'El objetivo es obligatorio',
  }).min(1, 'El objetivo es obligatorio'),

  assigned_to: z.string().regex(/^[a-f0-9]{32}$/, 'ID de usuario inválido').optional(),

  priority: z.enum(['low', 'medium', 'high', 'critical'], 'Prioridad inválida').optional().default('medium')
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'El título no puede estar vacío').max(200, 'El título es demasiado largo').optional(),
  description: z.string().max(1000, 'La descripción es demasiado larga').optional(),
  assigned_to: z.string().regex(/^[a-f0-9]{32}$/, 'ID de usuario inválido').optional(),
  status: z.enum(['pending', 'in_review', 'completed', 'returned'], 'Estado inválido').optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical'], 'Prioridad inválida').optional()
})

export const reviewTaskSchema = z.object({
  comments: z.string().max(1000, 'Los comentarios son demasiado largos').optional()
})

export const returnTaskSchema = z.object({
  comments: z.string({
    required_error: 'Los comentarios son obligatorios al devolver una tarea',
  }).min(1, 'Los comentarios no pueden estar vacíos').max(1000, 'Los comentarios son demasiado largos')
})

export const assignTaskSchema = z.object({
  assigned_to: z.string({
    required_error: 'El usuario es obligatorio',
  }).regex(/^[a-f0-9]{32}$/, 'ID de usuario inválido')
})
