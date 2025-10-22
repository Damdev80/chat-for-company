import { getConnection } from '../config/db.js'

function bufferToUuid(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length !== 16) return buffer;
  return [
    buffer.toString('hex', 0, 4),
    buffer.toString('hex', 4, 6),
    buffer.toString('hex', 6, 8),
    buffer.toString('hex', 8, 10),
    buffer.toString('hex', 10, 16)
  ].join('-');
}

export class ModelsGroup {    static async create({ name }) {
      const connection = await getConnection()
      
      try {
        const [result] = await connection.execute(
          'INSERT INTO groups (id, name) VALUES (randomblob(16), ?)',
          [name]
        )
        
        // Retornar un objeto consistente independientemente de la base de datos
        return {
          id: result.insertId || result.lastInsertRowid || Date.now().toString(),
          name: name
        }
      } catch (error) {
        console.error('❌ Error al crear grupo en la base de datos:', error);
        throw error;
      } finally {
        connection.end()
      }
    }static async getAll() {
      const connection = await getConnection()
      
      try {
        const [rows] = await connection.execute(
          'SELECT hex(id) as id, name FROM groups'
        )
        return rows
      } catch (error) {
        console.error('❌ Error al obtener grupos:', error);
        throw error;
      } finally {
        connection.end()
      }
    }    static async update(id, { name }) {
      const connection = await getConnection()
      
      try {
        const [result] = await connection.execute(
          'UPDATE groups SET name = ? WHERE hex(id) = ?',
          [name, id]
        )
        return result
      } catch (error) {
        console.error('❌ Error al actualizar grupo:', error);
        throw error;
      } finally {
        connection.end()
      }
    }    static async delete(id) {
      const connection = await getConnection()
      
      try {
        const [result] = await connection.execute(
          'DELETE FROM groups WHERE hex(id) = ?',
          [id]
        )
        return result
      } catch (error) {
        console.error('❌ Error al eliminar grupo:', error);
        throw error;
      } finally {
        connection.end()
      }
    }

    // Obtener grupos de un usuario
    static async getUserGroups(userId) {
      const connection = await getConnection()
      
      try {
        // Primero verificar si la tabla user_groups existe
        const [tables] = await connection.execute(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name='user_groups'
        `)
        
        if (tables.length > 0) {
          // La tabla existe, usarla
          const [rows] = await connection.execute(`
            SELECT hex(g.id) as id, g.name 
            FROM groups g
            INNER JOIN user_groups ug ON hex(g.id) = ug.group_id
            WHERE ug.user_id = ?
          `, [userId])
          
          if (rows.length > 0) {
            return rows
          }
        }
        
        // Si no existe la tabla o no hay resultados, retornar todos los grupos
        const [allGroups] = await connection.execute('SELECT hex(id) as id, name FROM groups')
        return allGroups
      } catch (error) {
        console.error('❌ Error al obtener grupos del usuario:', error);
        // Fallback final: retornar todos los grupos
        try {
          const [fallback] = await connection.execute('SELECT hex(id) as id, name FROM groups')
          return fallback
        } catch (fallbackError) {
          return []
        }
      } finally {
        connection.end()
      }
    }
}
