import { z } from 'zod'

export const roleSchema = z.object({
  name: z.string({
    required_error: 'El nombre es obligatorio',
  }).min(3, 'El nombre debe tener al menos 3 caracteres'),
  
  description: z.string().max(255, 'La descripción no puede tener más de 255 caracteres').optional()
})
