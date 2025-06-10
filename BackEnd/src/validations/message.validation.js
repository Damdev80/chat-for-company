import { z } from 'zod'

export const messageSchema = z.object({
  content: z.string({
    required_error: 'El mensaje no puede estar vacío',
  }).optional(),

  group_id: z.string().min(1, 'El grupo es obligatorio'),

  sender_id: z.string().uuid('El ID del remitente debe ser un UUID').optional(),
  
  attachments: z.array(z.object({
    originalName: z.string(),
    filename: z.string(),
    path: z.string(),
    size: z.number(),
    mimetype: z.string(),
    url: z.string()
  })).optional()
}).refine((data) => {
  // Require either content or attachments
  return (data.content && data.content.trim().length > 0) || (data.attachments && data.attachments.length > 0);
}, {
  message: "El mensaje debe tener contenido o archivos adjuntos",
});
