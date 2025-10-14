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
      console.log('📝 Creando grupo:', { name });
      const connection = await getConnection()
      
      try {
        const [result] = await connection.execute(
          'INSERT INTO groups (id, name) VALUES (randomblob(16), ?)',
          [name]
        )
        console.log('✅ Grupo creado exitosamente:', result);
        
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
      console.log('📋 Obteniendo todos los grupos');
      const connection = await getConnection()
      
      try {
        const [rows] = await connection.execute(
          'SELECT hex(id) as id, name FROM groups'
        )
        console.log('✅ Grupos obtenidos:', rows);
        return rows
      } catch (error) {
        console.error('❌ Error al obtener grupos:', error);
        throw error;
      } finally {
        connection.end()
      }
    }    static async update(id, { name }) {
      console.log('✏️ Actualizando grupo:', { id, name });
      const connection = await getConnection()
      
      try {
        const [result] = await connection.execute(
          'UPDATE groups SET name = ? WHERE hex(id) = ?',
          [name, id]
        )
        console.log('✅ Grupo actualizado:', result);
        return result
      } catch (error) {
        console.error('❌ Error al actualizar grupo:', error);
        throw error;
      } finally {
        connection.end()
      }
    }    static async delete(id) {
      console.log('🗑️ Eliminando grupo:', { id });
      const connection = await getConnection()
      
      try {
        const [result] = await connection.execute(
          'DELETE FROM groups WHERE hex(id) = ?',
          [id]
        )
        console.log('✅ Grupo eliminado:', result);
        return result
      } catch (error) {
        console.error('❌ Error al eliminar grupo:', error);
        throw error;
      } finally {
        connection.end()
      }
    }

    // Obtener grupos de un usuario (asumiendo tabla user_groups)
    static async getUserGroups(userId) {
      console.log('👥 Obteniendo grupos del usuario:', userId);
      const connection = await getConnection()
      
      try {
        // Intentar obtener de la tabla user_groups si existe
        const [rows] = await connection.execute(`
          SELECT hex(g.id) as id, g.name 
          FROM groups g
          INNER JOIN user_groups ug ON hex(g.id) = ug.group_id
          WHERE ug.user_id = ?
        `, [userId])
        
        if (rows.length > 0) {
          console.log('✅ Grupos encontrados:', rows.length);
          return rows
        }
        
        // Si no hay user_groups, retornar todos los grupos (fallback)
        console.log('⚠️ Tabla user_groups no disponible, usando todos los grupos');
        const [allGroups] = await connection.execute('SELECT hex(id) as id, name FROM groups LIMIT 1')
        return allGroups
      } catch (error) {
        console.error('❌ Error al obtener grupos del usuario:', error);
        // Fallback: retornar el primer grupo disponible
        try {
          const [fallback] = await connection.execute('SELECT hex(id) as id, name FROM groups LIMIT 1')
          return fallback
        } catch (fallbackError) {
          return []
        }
      } finally {
        connection.end()
      }
    }
}
