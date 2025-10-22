import { getConnection } from '../config/db.js'
export class ModelsUser {    static async create({ username, email, password, role_id }) {
      try {
        const connection = await getConnection();
          // Para SQLite/Turso: usamos hex(randomblob(16)) en lugar de UUID()
        const query = 'INSERT INTO users (id, username, email, password, role_id) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?)';
        
        const [result] = await connection.execute(
          query,
          [username, email, password, role_id || null]
        );
        
        connection.end();
        return result;
      } catch (error) {
        console.error('Error en ModelsUser.create:', error);
        if (error.message?.includes('UNIQUE constraint failed')) {
          console.error('Violación de restricción de unicidad');
          throw new Error('El usuario o email ya existe en la base de datos');
        }
        throw error;
      }
    }
  
    static async getById(id) {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT id, username, email, role_id, created_at FROM users WHERE id = ?',
        [id]
      )
      connection.end()
      return rows[0]
    }
  
    static async getByUsername(username) {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      )
      connection.end()
      return rows[0]
    }
  
    static async getByEmail(email) {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      )
      connection.end()
      return rows[0]
    }
  
    static async getAll() {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT id, username, email, role_id, created_at FROM users'
      )
      connection.end()
      return rows
    }
  
    static async update(id, { username, email, role_id }) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'UPDATE users SET username = ?, email = ?, role_id = ? WHERE id = ?',
        [username, email, role_id, id]
      )
      connection.end()
      return result
    }
    static async delete(id) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      )
      connection.end()
      return result
    }

    // Funciones para recuperación de contraseña
    static async setPasswordResetToken(userId, token, expiry) {
      try {
        const connection = await getConnection()
        const [result] = await connection.execute(
          'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
          [token, expiry.toISOString(), userId]
        )
        connection.end()
        return result
      } catch (error) {
        console.error('❌ Error en setPasswordResetToken:', error.message)
        if (error.message?.includes('no such column') || error.message?.includes('no column named')) {
          throw new Error('Las columnas de reset de contraseña no existen en la base de datos. Ejecuta la migración: npm run migrate:password-reset')
        }
        throw error
      }
    }

    static async getByResetToken(token) {
      try {
        const connection = await getConnection()
        const [rows] = await connection.execute(
          'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
          [token, new Date().toISOString()]
        )
        connection.end()
        return rows[0]
      } catch (error) {
        console.error('❌ Error en getByResetToken:', error.message)
        if (error.message?.includes('no such column') || error.message?.includes('no column named')) {
          throw new Error('Las columnas de reset de contraseña no existen en la base de datos. Ejecuta la migración: npm run migrate:password-reset')
        }
        throw error
      }
    }

    static async updatePassword(userId, hashedPassword) {
      try {
        const connection = await getConnection()
        const [result] = await connection.execute(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, userId]
        )
        connection.end()
        return result
      } catch (error) {
        console.error('❌ Error en updatePassword:', error.message)
        throw error
      }
    }

    static async clearPasswordResetToken(userId) {
      try {
        const connection = await getConnection()
        const [result] = await connection.execute(
          'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
          [userId]
        )
        connection.end()
        return result
      } catch (error) {
        console.error('❌ Error en clearPasswordResetToken:', error.message)
        if (error.message?.includes('no such column') || error.message?.includes('no column named')) {
          throw new Error('Las columnas de reset de contraseña no existen en la base de datos. Ejecuta la migración: npm run migrate:password-reset')
        }
        throw error
      }
    }

    /**
     * 🆕 Obtener usuarios de un grupo
     * Nota: Como no existe tabla user_groups, retorna todos los usuarios
     * En el futuro, deberías agregar la tabla user_groups para la relación
     */
    static async getByGroupId(groupId) {
      try {
        const connection = await getConnection()
        
        // Intentar obtener de user_groups si existe
        try {
          const [rows] = await connection.execute(`
            SELECT u.id, u.username, u.email, u.role_id
            FROM users u
            INNER JOIN user_groups ug ON u.id = ug.user_id
            WHERE ug.group_id = ?
          `, [groupId])
          
          connection.end()
          return rows
        } catch (error) {
          // Si no existe la tabla, retornar todos los usuarios (fallback)
          const [allUsers] = await connection.execute('SELECT id, username, email, role_id FROM users LIMIT 50')
          connection.end()
          return allUsers
        }
      } catch (error) {
        console.error('❌ Error en getByGroupId:', error)
        return []
      }
    }
  }