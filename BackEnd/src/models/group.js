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

export class ModelsGroup {
    static async create({ name }) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'INSERT INTO `groups` (id, name) VALUES (UUID_TO_BIN(UUID()), ?)', // Cambié 'groups' por `groups`
        [name]
      )
      connection.end()
      return result
    }

    static async getAll() {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT id, name FROM `groups`' // Cambié 'groups' por `groups`
      )
      connection.end()
      return rows.map(row => ({
        ...row,
        id: row.id ? bufferToUuid(row.id) : row.id
      }))
    }

    static async update(id, { name }) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'UPDATE `groups` SET name = ? WHERE id = ?',
        [name, id]
      )
      connection.end()
      return result
    }

    static async delete(id) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'DELETE FROM `groups` WHERE id = ?',
        [id]
      )
      connection.end()
      return result
    }
}
