import { z } from 'zod'

export const messageSchema = z.object({
  content: z.string({
    required_error: 'El mensaje no puede estar vacío',
  }).min(1, 'El contenido no puede estar vacío'),

  group_id: z.string().min(1, 'El grupo es obligatorio'),

  sender_id: z.string().uuid('El ID del remitente debe ser un UUID').optional()
})
