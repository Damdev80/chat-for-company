import { ModelsObjective } from '../models/objective.js'
import { ModelsTask } from '../models/task.js'
import { objectiveSchema, updateObjectiveSchema } from '../validations/objective.validation.js'

export class ObjectiveController {
  static async create(req, res) {
    try {
      // Log para diagnóstico en producción
      console.error('Objective create - Request body:', JSON.stringify(req.body, null, 2));
      console.error('Objective create - User:', JSON.stringify(req.user, null, 2));
      
      // Validar datos con Zod
      const result = objectiveSchema.safeParse(req.body)
      if (!result.success) {
        console.error('Objective create - Validation error:', JSON.stringify(result.error.issues, null, 2));
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
      }      // Crear el objetivo
      console.error('Objective create - About to call ModelsObjective.create with:', { title, description, group_id, created_by, deadline });
      
      const objective = await ModelsObjective.create({
        title,
        description,
        group_id,
        created_by,
        deadline
      })

      console.error('Objective create - Success:', JSON.stringify(objective, null, 2));

      res.status(201).json({
        message: 'Objetivo creado correctamente',
        objective
      })    } catch (error) {
      console.error('Objective create - Error:', error);
      console.error('Objective create - Error message:', error.message);
      console.error('Objective create - Error stack:', error.stack);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      })
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

      const objectives = await ModelsObjective.getByGroupId(groupId);

      if (!objectives) {
        return res.status(404).json({ message: 'No objectives found for this group' });
      }        // Obtener progreso para cada objetivo
      const objectivesWithProgress = await Promise.all(
        objectives.map(async (objective) => {
          const progress = await ModelsObjective.getProgress(objective.id);
          
          // Get ALL tasks, not just pending ones
          const allTasks = await ModelsTask.getByObjectiveId(objective.id);
          
          
          return {
            ...objective,
            progress,
            tasks: allTasks // Include ALL tasks so frontend can calculate correctly
          };
        })
      );
      
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
