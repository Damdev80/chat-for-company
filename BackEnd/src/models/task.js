import { getConnection } from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'

function bufferToUuid(buffer) {
  if (!buffer || buffer.length !== 16) return null
  const hex = Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('')
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32)
  ].join('-')
}

export class ModelsTask {
  static async create({ title, description, objective_id, assigned_to, created_by }) {
    try {
      const connection = await getConnection()
      const taskId = uuidv4()
      
      const [result] = await connection.execute(
        'INSERT INTO tasks (id, title, description, objective_id, assigned_to, created_by, status) VALUES (?, ?, ?, ?, ?, ?, "pending")',
        [taskId, title, description || null, objective_id, assigned_to || null, created_by]
      )
      
      // Obtener la tarea recién creada con información de usuario
      const [rows] = await connection.execute(
        `SELECT t.*, 
                u_assigned.username as assigned_to_name,
                u_created.username as created_by_name
         FROM tasks t 
         LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
         LEFT JOIN users u_created ON t.created_by = u_created.id
         WHERE t.id = ?`,
        [taskId]
      )
      
      connection.end()
      return rows[0]
    } catch (error) {
      console.error('Error en ModelsTask.create:', error)
      throw error
    }
  }

  static async getById(id) {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      `SELECT t.*, 
              u_assigned.username as assigned_to_name,
              u_created.username as created_by_name
       FROM tasks t 
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_created ON t.created_by = u_created.id
       WHERE t.id = ?`,
      [id]
    )
    connection.end()
    return rows[0]
  }

  static async getByObjectiveId(objective_id) {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      `SELECT t.*, 
              u_assigned.username as assigned_to_name,
              u_created.username as created_by_name
       FROM tasks t 
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_created ON t.created_by = u_created.id
       WHERE t.objective_id = ?
       ORDER BY t.created_at ASC`,
      [objective_id]
    )
    connection.end()
    return rows
  }

  static async getByUserId(user_id) {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      `SELECT t.*, 
              o.title as objective_title,
              o.group_id,
              u_assigned.username as assigned_to_name,
              u_created.username as created_by_name
       FROM tasks t 
       LEFT JOIN objectives o ON t.objective_id = o.id
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_created ON t.created_by = u_created.id
       WHERE t.assigned_to = ?
       ORDER BY t.created_at DESC`,
      [user_id]
    )
    connection.end()
    
    return rows.map(row => ({
      ...row,
      group_id: row.group_id ? bufferToUuid(row.group_id) : row.group_id
    }))
  }

  static async getAll() {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      `SELECT t.*, 
              o.title as objective_title,
              o.group_id,
              u_assigned.username as assigned_to_name,
              u_created.username as created_by_name
       FROM tasks t 
       LEFT JOIN objectives o ON t.objective_id = o.id
       LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
       LEFT JOIN users u_created ON t.created_by = u_created.id
       ORDER BY t.created_at DESC`
    )
    connection.end()
    
    return rows.map(row => ({
      ...row,
      group_id: row.group_id ? bufferToUuid(row.group_id) : row.group_id
    }))
  }

  static async update(id, { title, description, assigned_to, status }) {
    const connection = await getConnection()
    
    // Preparar los campos a actualizar
    const updates = []
    const values = []
    
    if (title !== undefined) {
      updates.push('title = ?')
      values.push(title)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      values.push(description)
    }
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?')
      values.push(assigned_to)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
      
      // Si se completa la tarea, actualizar completed_at
      if (status === 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP')
      } else if (status === 'pending') {
        updates.push('completed_at = NULL')
      }
    }
    
    values.push(id)
    
    const [result] = await connection.execute(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    )
    
    connection.end()
    return result
  }

  static async delete(id) {
    const connection = await getConnection()
    const [result] = await connection.execute('DELETE FROM tasks WHERE id = ?', [id])
    connection.end()
    return result
  }

  static async markAsCompleted(id, user_id) {
    const connection = await getConnection()
    
    // Verificar que el usuario puede completar esta tarea
    const [taskRows] = await connection.execute(
      'SELECT assigned_to FROM tasks WHERE id = ?',
      [id]
    )
    
    if (!taskRows[0]) {
      connection.end()
      throw new Error('Tarea no encontrada')
    }
    
    if (taskRows[0].assigned_to !== user_id) {
      connection.end()
      throw new Error('No tienes permisos para completar esta tarea')
    }
    
    const [result] = await connection.execute(
      'UPDATE tasks SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    )
    
    connection.end()
    return result
  }

  static async getStatsByUser(user_id) {
    const connection = await getConnection()
    
    const [totalRows] = await connection.execute(
      'SELECT COUNT(*) as total FROM tasks WHERE assigned_to = ?',
      [user_id]
    )
    
    const [completedRows] = await connection.execute(
      'SELECT COUNT(*) as completed FROM tasks WHERE assigned_to = ? AND status = "completed"',
      [user_id]
    )
    
    const [pendingRows] = await connection.execute(
      'SELECT COUNT(*) as pending FROM tasks WHERE assigned_to = ? AND status = "pending"',
      [user_id]
    )
    
    connection.end()
    
    const total = totalRows[0].total
    const completed = completedRows[0].completed
    const pending = pendingRows[0].pending
    
    return {
      total,
      completed,
      pending,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }
}
