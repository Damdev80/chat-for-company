// validations/user.validation.js
import { z } from 'zod'

export const userSchema = z.object({
  username: z.string({
    required_error: 'El nombre de usuario es obligatorio',
  }).min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),

  email: z.string({
    required_error: 'El email es obligatorio',
  }).email('Debe ser un email válido'),

  password: z.string({
    required_error: 'La contraseña es obligatoria',
  }).min(8, 'La contraseña debe tener al menos 8 caracteres')
})
