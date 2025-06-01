import { ModelsObjective } from '../models/objective.js'
import { objectiveSchema, updateObjectiveSchema } from '../validations/objective.validation.js'

export class ObjectiveController {
  static async create(req, res) {
    try {
      console.log('Datos recibidos en objective controller:', req.body);
      
      // Validar datos con Zod
      const result = objectiveSchema.safeParse(req.body)
      if (!result.success) {
        console.log('Errores de validación:', result.error.issues);
        return res.status(400).json({ errors: result.error.issues })
      }

      let { title, description, group_id, deadline } = result.data
      const created_by = req.user.id

      // Convertir deadline si está presente
      if (deadline && deadline !== '') {
        try {
          // Si es solo una fecha (YYYY-MM-DD), convertir a datetime
          if (deadline.match(/^\d{4}-\d{2}-\d{2}$/)) {
            deadline = new Date(deadline + 'T23:59:59.999Z').toISOString();
          }
        } catch (error) {
          console.error('Error al convertir fecha:', error);
          deadline = null;
        }
      } else {
        deadline = null;
      }

      console.log('Datos procesados:', { title, description, group_id, deadline, created_by });

      // Crear el objetivo
      const objective = await ModelsObjective.create({
        title,
        description,
        group_id,
        created_by,
        deadline
      })

      console.log('Objetivo creado:', objective);

      res.status(201).json({
        message: 'Objetivo creado correctamente',
        objective
      })
    } catch (error) {
      console.error('Error al crear objetivo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getAll(req, res) {
    try {
      const objectives = await ModelsObjective.getAll()
      
      // Obtener progreso para cada objetivo
      const objectivesWithProgress = await Promise.all(
        objectives.map(async (objective) => {
          const progress = await ModelsObjective.getProgress(objective.id)
          return {
            ...objective,
            progress
          }
        })
      )
      
      res.json(objectivesWithProgress)
    } catch (error) {
      console.error('Error al obtener objetivos:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params
      const objective = await ModelsObjective.getById(id)
      
      if (!objective) {
        return res.status(404).json({ message: 'Objetivo no encontrado' })
      }

      // Obtener progreso del objetivo
      const progress = await ModelsObjective.getProgress(id)
      
      res.json({
        ...objective,
        progress
      })
    } catch (error) {
      console.error('Error al obtener objetivo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getByGroupId(req, res) {
    try {
      const { groupId } = req.params;
      console.log(`[ObjectiveController] getByGroupId called with groupId: ${groupId}`); // Log entry

      const objectives = await ModelsObjective.getByGroupId(groupId);
      console.log(`[ObjectiveController] Objectives fetched for groupId ${groupId}:`, objectives); // Log fetched objectives

      if (!objectives) {
        console.log(`[ObjectiveController] No objectives found for groupId: ${groupId}`);
        return res.status(404).json({ message: 'No objectives found for this group' });
      }
      
      // Obtener progreso para cada objetivo
      const objectivesWithProgress = await Promise.all(
        objectives.map(async (objective) => {
          console.log(`[ObjectiveController] Getting progress for objectiveId: ${objective.id}`); // Log before getting progress
          const progress = await ModelsObjective.getProgress(objective.id);
          console.log(`[ObjectiveController] Progress for objectiveId ${objective.id}:`, progress); // Log progress result
          return {
            ...objective,
            progress
          };
        })
      );
      
      console.log(`[ObjectiveController] Objectives with progress for groupId ${groupId}:`, objectivesWithProgress); // Log final result
      res.json(objectivesWithProgress);
    } catch (error) {
      console.error(`[ObjectiveController] Error in getByGroupId for groupId ${req.params.groupId}:`, error); // Log error
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      
      // Validar datos con Zod
      const result = updateObjectiveSchema.safeParse(req.body)
      if (!result.success) {
        return res.status(400).json({ errors: result.error.issues })
      }

      // Verificar que el objetivo existe
      const existingObjective = await ModelsObjective.getById(id)
      if (!existingObjective) {
        return res.status(404).json({ message: 'Objetivo no encontrado' })
      }

      // Verificar permisos (solo el creador o admin puede actualizar)
      if (req.user.role !== 'admin' && existingObjective.created_by !== req.user.id) {
        return res.status(403).json({ message: 'No tienes permisos para actualizar este objetivo' })
      }

      await ModelsObjective.update(id, result.data)
      
      res.json({ message: 'Objetivo actualizado correctamente' })
    } catch (error) {
      console.error('Error al actualizar objetivo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params
      
      // Verificar que el objetivo existe
      const existingObjective = await ModelsObjective.getById(id)
      if (!existingObjective) {
        return res.status(404).json({ message: 'Objetivo no encontrado' })
      }

      // Verificar permisos (solo el creador o admin puede eliminar)
      if (req.user.role !== 'admin' && existingObjective.created_by !== req.user.id) {
        return res.status(403).json({ message: 'No tienes permisos para eliminar este objetivo' })
      }

      await ModelsObjective.delete(id)
      
      res.json({ message: 'Objetivo eliminado correctamente' })
    } catch (error) {
      console.error('Error al eliminar objetivo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }

  static async getProgress(req, res) {
    try {
      const { id } = req.params
      
      // Verificar que el objetivo existe
      const objective = await ModelsObjective.getById(id)
      if (!objective) {
        return res.status(404).json({ message: 'Objetivo no encontrado' })
      }

      const progress = await ModelsObjective.getProgress(id)
      
      res.json(progress)
    } catch (error) {
      console.error('Error al obtener progreso del objetivo:', error)
      res.status(500).json({ message: 'Error interno del servidor' })
    }
  }
}
