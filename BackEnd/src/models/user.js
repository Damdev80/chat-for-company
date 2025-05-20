import { getConnection } from '../config/db.js'
export class ModelsUser {
    static async create({ username, email, password, role_id }) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'INSERT INTO users (id, username, email, password, role_id) VALUES (UUID(), ?, ?, ?, ?)',
        [username, email, password, role_id || null]
      )
      connection.end()
      return result
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
  }