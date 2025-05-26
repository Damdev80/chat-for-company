import { ModelsGroup } from '../models/group.js'
import { ModelsMessage } from '../models/message.js' // Importar modelo de mensajes

export class GroupController {
  static async create(req, res) {
    try {
      console.log('🏗️ Creando nuevo grupo - Datos recibidos:', req.body);
      console.log('👤 Usuario que intenta crear grupo:', req.user);
      
      const { name } = req.body
      if (!name || name.trim() === '') {
        console.log('❌ Validación fallida: nombre de grupo vacío');
        return res.status(400).json({ message: 'El nombre es requerido' })
      }
        console.log('✅ Validación pasada, procediendo a crear grupo:', name.trim());
      const result = await ModelsGroup.create({ name: name.trim() })
      
      console.log('✅ Grupo creado exitosamente:', result);
      res.status(201).json({ 
        message: 'Grupo creado correctamente', 
        group: { 
          id: result.id || result.insertId || 'nuevo-grupo',
          name: name.trim()
        }
      })
    } catch (error) {
      console.error('❌ Error completo al crear grupo:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        sql: error.sql
      })
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  static async getAll(req, res) {
    try {
      const groups = await ModelsGroup.getAll()
      res.json(groups)
    } catch (error) {
      console.error('Error al obtener grupos:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const { name } = req.body
      await ModelsGroup.update(id, { name })
      res.json({ message: 'Grupo actualizado correctamente' })
    } catch (error) {
      console.error('Error al actualizar grupo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
  static async delete(req, res) {
    try {
      const { id } = req.params

      // First delete all messages in the group
      await ModelsMessage.deleteByGroupId(id)
      
      // Then delete the group itself
      await ModelsGroup.delete(id)
      
      res.json({ message: 'Grupo eliminado correctamente' })
    } catch (error) {
      console.error('Error al eliminar grupo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  // Nuevo endpoint: Eliminar todos los mensajes de un grupo
  static async deleteMessages(req, res) {
    try {
      const { id } = req.params
      await ModelsMessage.deleteByGroupId(id)
      res.json({ message: 'Mensajes eliminados correctamente' })
    } catch (error) {
      console.error('Error al eliminar mensajes del grupo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
