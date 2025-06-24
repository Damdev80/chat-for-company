import { getConnection } from '../config/db.js'
export class ModelsUser {    static async create({ username, email, password, role_id }) {
      try {
        console.log('Creando usuario en la base de datos:', { username, email, role_id });
        const connection = await getConnection();
          // Para SQLite/Turso: usamos hex(randomblob(16)) en lugar de UUID()
        const query = 'INSERT INTO users (id, username, email, password, role_id) VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?)';
        
        console.log('Ejecutando query:', query);
        const [result] = await connection.execute(
          query,
          [username, email, password, role_id || null]
        );
        
        connection.end();
        console.log('Usuario creado con éxito:', result);
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
      const connection = await getConnection()
      const [result] = await connection.execute(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [token, expiry.toISOString(), userId]
      )
      connection.end()
      return result
    }

    static async getByResetToken(token) {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
        [token, new Date().toISOString()]
      )
      connection.end()
      return rows[0]
    }

    static async updatePassword(userId, hashedPassword) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      )
      connection.end()
      return result
    }

    static async clearPasswordResetToken(userId) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [userId]
      )
      connection.end()
      return result
    }
  }