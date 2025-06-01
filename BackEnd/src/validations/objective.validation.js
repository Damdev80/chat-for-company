import { z } from 'zod'

export const objectiveSchema = z.object({
  title: z.string({
    required_error: 'El título es obligatorio',
  }).min(1, 'El título no puede estar vacío').max(200, 'El título es demasiado largo'),

  description: z.string().max(1000, 'La descripción es demasiado larga').optional(),

  group_id: z.string({
    required_error: 'El grupo es obligatorio',
  }).min(1, 'El grupo es obligatorio'),

  deadline: z.string().nullable().optional().or(z.literal(''))
})

export const updateObjectiveSchema = z.object({
  title: z.string().min(1, 'El título no puede estar vacío').max(200, 'El título es demasiado largo').optional(),
  description: z.string().max(1000, 'La descripción es demasiado larga').optional(),
  deadline: z.string().datetime('Fecha inválida').optional()
})
