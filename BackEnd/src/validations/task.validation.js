import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string({
    required_error: 'El título es obligatorio',
  }).min(1, 'El título no puede estar vacío').max(200, 'El título es demasiado largo'),

  description: z.string().max(1000, 'La descripción es demasiado larga').optional(),

  objective_id: z.string({
    required_error: 'El objetivo es obligatorio',
  }).min(1, 'El objetivo es obligatorio'),

  assigned_to: z.string().uuid('ID de usuario inválido').optional()
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'El título no puede estar vacío').max(200, 'El título es demasiado largo').optional(),
  description: z.string().max(1000, 'La descripción es demasiado larga').optional(),
  assigned_to: z.string().uuid('ID de usuario inválido').optional(),
  status: z.enum(['pending', 'completed'], 'Estado inválido').optional()
})

export const assignTaskSchema = z.object({
  assigned_to: z.string({
    required_error: 'El usuario es obligatorio',
  }).uuid('ID de usuario inválido')
})
