import { getConnection } from '../config/db.js'
export class ModelsRole {
    static async create({ name, description }) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'INSERT INTO roles (id, name, description) VALUES (UUID(), ?, ?)',
        [name, description || null]
      )
      connection.end()
      return result
    }
  
    static async getById(id) {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT id, name, description, created_at FROM roles WHERE id = ?',
        [id]
      )
      connection.end()
      return rows[0]
    }
  
    static async getByName(name) {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT * FROM roles WHERE name = ?',
        [name]
      )
      connection.end()
      return rows[0]
    }
  
    static async getAll() {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT id, name, description, created_at FROM roles'
      )
      connection.end()
      return rows
    }
  
    static async update(id, { name, description }) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'UPDATE roles SET name = ?, description = ? WHERE id = ?',
        [name, description, id]
      )
      connection.end()
      return result
    }
  
    static async delete(id) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'DELETE FROM roles WHERE id = ?',
        [id]
      )
      connection.end()
      return result
    }
  }
// Devuelve el nombre del rol dado su id
export async function getRoleNameById(roleId) {
  const connection = await getConnection();
  const [rows] = await connection.execute('SELECT name FROM roles WHERE id = ?', [roleId]);
  connection.end();
  if (rows.length > 0) {
    return rows[0].name;
  }
  return null;
}