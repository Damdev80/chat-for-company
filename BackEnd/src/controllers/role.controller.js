// controllers/role.controller.js
import { ModelsRole } from '../models/role.js'
import { roleSchema } from '../validations/role.validation.js'

export class RoleController {
  static async create(req, res) {
    try {
      // Validar datos con Zod
      const result = roleSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }

      const { name, description } = result.data

      // Verificar si el rol ya existe
      const existingRole = await ModelsRole.getByName(name)
      if (existingRole) {
        return res.status(400).json({ message: 'El nombre del rol ya está en uso' })
      }

      // Crear el rol
      await ModelsRole.create({ name, description })

      res.status(201).json({ message: 'Rol creado correctamente' })
    } catch (error) {
      console.error('Error al crear rol:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getAll(req, res) {
    try {
      const roles = await ModelsRole.getAll()
      res.json(roles)
    } catch (error) {
      console.error('Error al obtener roles:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const role = await ModelsRole.getById(id)
      
      if (!role) {
        return res.status(404).json({ message: 'Rol no encontrado' })
      }
      
      res.json(role)
    } catch (error) {
      console.error('Error al obtener rol:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}