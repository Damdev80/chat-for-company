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

export class ModelsMessage {    static async create({ content, sender_id, group_id, temp_id }) {
      try {
        console.log('ModelsMessage.create - Iniciando creación de mensaje:', { content, sender_id, group_id, temp_id });
        
        // Si group_id es un buffer, conviértelo a string
        if (typeof group_id === 'object' && group_id !== null && group_id.type === 'Buffer') {
          group_id = bufferToUuid(Buffer.from(group_id.data));
        }
        
        // Para SQLite/Turso: Si no existe la función UUID(), usamos un id aleatorio generado de otra forma
        const query = process.env.NODE_ENV === 'production' 
          ? 'INSERT INTO messages (id, content, sender_id, group_id) VALUES (lower(hex(randomblob(16))), ?, ?, ?)'
          : 'INSERT INTO messages (id, content, sender_id, group_id) VALUES (UUID(), ?, ?, ?)';
          
        console.log('Ejecutando query:', query);
        const connection = await getConnection();
        const [result] = await connection.execute(
          query,
          [content, sender_id, group_id]
        );
        
        console.log('Mensaje insertado, obteniendo detalles completos');
        
        // Obtener el ID del mensaje recién creado
        const [insertedMessage] = await connection.execute(
          'SELECT id, content, sender_id, group_id, created_at FROM messages WHERE sender_id = ? ORDER BY created_at DESC LIMIT 1',
          [sender_id]
        );
        
        connection.end();
        
        // Procesar el resultado para devolverlo
        if (insertedMessage && insertedMessage[0]) {
          const finalMessage = {
            ...insertedMessage[0],
            group_id: insertedMessage[0].group_id ? bufferToUuid(insertedMessage[0].group_id) : insertedMessage[0].group_id,
            temp_id
          };
          console.log('Mensaje creado con éxito:', finalMessage);
          return finalMessage;
        } else {
          console.log('No se pudo obtener el mensaje insertado, devolviendo result:', result);
          return result;
        }
      } catch (error) {
        console.error('Error en ModelsMessage.create:', error);
        throw error;
      }
    }
  
    static async getById(id) {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT id, content, sender_id, group_id, created_at FROM messages WHERE id = ?',
        [id]
      )
      connection.end()
      if (rows[0] && rows[0].group_id) {
        rows[0].group_id = bufferToUuid(rows[0].group_id)
      }
      return rows[0]
    }
    
  
    static async getBySenderId(sender_id) {
      const connection = await getConnection()
      const [rows] = await connection.execute(
        'SELECT * FROM messages WHERE sender_id = ? ORDER BY created_at DESC',
        [sender_id]
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
        'SELECT m.id, m.content, m.created_at, m.group_id, u.username as sender_name FROM messages m LEFT JOIN users u ON m.sender_id = u.id ORDER BY m.created_at DESC'
      )
      connection.end()
      return rows.map(row => ({
        ...row,
        group_id: row.group_id ? bufferToUuid(row.group_id) : row.group_id
      }))
    }
  
    static async update(id, { content }) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'UPDATE messages SET content = ? WHERE id = ?',
        [content, id]
      )
      connection.end()
      return result
    }
  
    static async delete(id) {
      const connection = await getConnection()
      const [result] = await connection.execute(
        'DELETE FROM messages WHERE id = ?',
        [id]
      )
      connection.end()
      return result
    }

    static async deleteByGroupId(group_id) {
      // Make sure we're using the correct format for the group_id
      // If group_id is a UUID string, convert it to the format expected by the database
      const connection = await getConnection();
      const [result] = await connection.execute(
        'DELETE FROM messages WHERE group_id = ?',
        [group_id]
      );
      connection.end();
      return result;
    }
  }