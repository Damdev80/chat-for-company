import { getConnection } from '../config/db.js'
import { v4 as uuidv4 } from 'uuid'

function bufferToUuid(buffer) {
  if (!buffer) return null
  
  // Si es ArrayBuffer (Turso), convertir a Uint8Array
  let bytes
  if (buffer instanceof ArrayBuffer) {
    bytes = new Uint8Array(buffer)
  } else if (buffer instanceof Uint8Array) {
    bytes = buffer
  } else if (Buffer.isBuffer(buffer)) {
    bytes = new Uint8Array(buffer)
  } else {
    return null
  }
  
  if (bytes.length !== 16) return null
  
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32)
  ].join('-')
}

export class ModelsObjective {  static async create({ title, description, group_id, created_by, deadline }) {
    try {
      console.error('ModelsObjective.create - Input params:', { title, description, group_id, created_by, deadline });
      
      const connection = await getConnection()
      console.error('ModelsObjective.create - Got database connection');
      
      const objectiveId = uuidv4()
      console.error('ModelsObjective.create - Generated ID:', objectiveId);
      
      // Convert group_id hex string to Buffer for BLOB storage
      const bufferGroupId = Buffer.from(group_id.replace(/-/g, ''), 'hex')
      console.error('ModelsObjective.create - Converted group_id to buffer:', bufferGroupId);
      
      const [result] = await connection.execute(
        'INSERT INTO objectives (id, title, description, group_id, created_by, deadline) VALUES (?, ?, ?, ?, ?, ?)',
        [objectiveId, title, description || null, bufferGroupId, created_by, deadline || null]
      )
      
      console.error('ModelsObjective.create - Insert result:', result);
      
      // Obtener el objetivo recién creado
      const [rows] = await connection.execute(
        'SELECT * FROM objectives WHERE id = ?',
        [objectiveId]
      )
      
      console.error('ModelsObjective.create - Retrieved objective:', rows[0]);
      
      connection.end()
      
      const objective = rows[0]
      if (objective && objective.group_id) {
        objective.group_id = bufferToUuid(objective.group_id)
      }
      
      console.error('ModelsObjective.create - Final objective:', objective);
      
      return objective
    } catch (error) {
      console.error('Error en ModelsObjective.create:', error)
      throw error
    }
  }

  static async getById(id) {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      'SELECT * FROM objectives WHERE id = ?',
      [id]
    )
    connection.end()
    
    const objective = rows[0]
    if (objective && objective.group_id) {
      objective.group_id = bufferToUuid(objective.group_id)
    }
    
    return objective
  }

  static async getByGroupId(group_id) {
    const connection = await getConnection()

    // Prepare both buffer and hex string for matching
    const cleanedGroupId = group_id.replace(/-/g, '')
    const bufferGroupId = Buffer.from(cleanedGroupId, 'hex')
    const [rows] = await connection.execute(
      // Match BLOB column by buffer or by hex representation (for existing string data)
      'SELECT o.*, u.username as created_by_name FROM objectives o LEFT JOIN users u ON o.created_by = u.id\n       WHERE o.group_id = ? OR hex(o.group_id) = ? ORDER BY o.created_at DESC',
      [bufferGroupId, cleanedGroupId]
    )
    connection.end()
    
    return rows.map(row => ({
      ...row,
      group_id: bufferToUuid(row.group_id)
    }))
  }

  static async getAll() {
    const connection = await getConnection()
    const [rows] = await connection.execute(
      'SELECT o.*, u.username as created_by_name FROM objectives o LEFT JOIN users u ON o.created_by = u.id ORDER BY o.created_at DESC'
    )
    connection.end()
    
    return rows.map(row => ({
      ...row,
      group_id: row.group_id ? bufferToUuid(row.group_id) : row.group_id
    }))
  }

  static async update(id, { title, description, deadline }) {
    const connection = await getConnection()
    const [result] = await connection.execute(
      'UPDATE objectives SET title = ?, description = ?, deadline = ? WHERE id = ?',
      [title, description, deadline, id]
    )
    connection.end()
    return result
  }

  static async delete(id) {
    const connection = await getConnection()
    
    // Primero eliminar todas las tareas relacionadas
    await connection.execute('DELETE FROM tasks WHERE objective_id = ?', [id])
    
    // Luego eliminar el objetivo
    const [result] = await connection.execute('DELETE FROM objectives WHERE id = ?', [id])
    
    connection.end()
    return result
  }
  static async getProgress(id) {
    const connection = await getConnection();
    
    let total = 0;
    let completed = 0;

    try {
      const totalResult = await connection.execute(
        'SELECT COUNT(id) as total FROM tasks WHERE objective_id = ?',
        [id]
      );
      if (totalResult.rows && totalResult.rows.length > 0) {
        total = totalResult.rows[0].total;
      }

      const completedResult = await connection.execute(
        'SELECT COUNT(id) as completed FROM tasks WHERE objective_id = ? AND status = "completed"',
        [id]
      );
      if (completedResult.rows && completedResult.rows.length > 0) {
        completed = completedResult.rows[0].completed;
      }
    } catch (error) {
      console.error(`[ModelsObjective.getProgress] Error executing COUNT queries for id ${id}:`, error);
      // Re-throw or handle as appropriate, for now, will proceed with total/completed as 0
      // which might lead to 0% progress if queries fail.
      // Depending on desired behavior, you might want to throw the error here.
    }
    
    // No connection.end(); - Removed as it's not applicable for the libsql client instance
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      percentage,
      is_complete: total > 0 && percentage === 100 // Ensure total > 0 for is_complete to be true
    };
  }
}
