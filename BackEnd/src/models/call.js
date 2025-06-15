import { getConnection } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

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

export class ModelsCall {  /**
   * Crear una nueva llamada (individual o grupal)
   */
  static async create({ caller_id, receiver_id = null, call_type = 'audio', group_id = null, status = 'initiated' }) {
    try {
      console.log('ModelsCall.create - Iniciando creación de llamada:', { 
        caller_id, receiver_id, call_type, group_id, status 
      });
      
      // Generar UUID para la llamada
      const callId = uuidv4();
      
      const connection = await getConnection();
      
      const [result] = await connection.execute(
        'INSERT INTO calls (id, caller_id, receiver_id, call_type, status, group_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [callId, caller_id, receiver_id, call_type, status, group_id, new Date().toISOString()]
      );
      
      console.log('Llamada insertada, obteniendo detalles completos');
        
      // Obtener la llamada recién creada
      const [insertedCall] = await connection.execute(
        `SELECT c.*, 
                u_caller.username as caller_name,
                u_receiver.username as receiver_name,
                g.name as group_name
         FROM calls c 
         LEFT JOIN users u_caller ON c.caller_id = u_caller.id
         LEFT JOIN users u_receiver ON c.receiver_id = u_receiver.id
         LEFT JOIN groups g ON c.group_id = g.id
         WHERE c.id = ?`,
        [callId]
      );
      
      connection.end();
      
      if (insertedCall && insertedCall[0]) {
        const finalCall = {
          ...insertedCall[0],
          group_id: insertedCall[0].group_id ? bufferToUuid(insertedCall[0].group_id) : insertedCall[0].group_id,
        };
        console.log('Llamada creada con éxito:', finalCall);
        return finalCall;
      } else {
        console.log('No se pudo obtener la llamada insertada');
        return result;
      }
    } catch (error) {
      console.error('Error en ModelsCall.create:', error);
      throw error;
    }
  }

  /**
   * Actualizar el estado de una llamada
   */
  static async updateStatus(id, status, ended_at = null) {
    try {
      const connection = await getConnection();
      
      const updateData = [status];
      let query = 'UPDATE calls SET status = ?';
      
      if (ended_at) {
        query += ', ended_at = ?';
        updateData.push(ended_at);
      }
      
      query += ' WHERE id = ?';
      updateData.push(id);
      
      const [result] = await connection.execute(query, updateData);
      
      connection.end();
      return result;
    } catch (error) {
      console.error('Error en ModelsCall.updateStatus:', error);
      throw error;
    }
  }

  /**
   * Obtener una llamada por ID
   */
  static async getById(id) {
    try {
      const connection = await getConnection();
      
      const [rows] = await connection.execute(
        `SELECT c.*, 
                u_caller.username as caller_name,
                u_receiver.username as receiver_name
         FROM calls c 
         LEFT JOIN users u_caller ON c.caller_id = u_caller.id
         LEFT JOIN users u_receiver ON c.receiver_id = u_receiver.id
         WHERE c.id = ?`,
        [id]
      );
      
      connection.end();
      
      if (rows[0]) {
        return {
          ...rows[0],
          group_id: rows[0].group_id ? bufferToUuid(rows[0].group_id) : rows[0].group_id,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error en ModelsCall.getById:', error);
      throw error;
    }
  }

  /**
   * Obtener llamadas por usuario
   */
  static async getByUserId(userId, limit = 50) {
    try {
      const connection = await getConnection();
      
      const [rows] = await connection.execute(
        `SELECT c.*, 
                u_caller.username as caller_name,
                u_receiver.username as receiver_name
         FROM calls c 
         LEFT JOIN users u_caller ON c.caller_id = u_caller.id
         LEFT JOIN users u_receiver ON c.receiver_id = u_receiver.id
         WHERE c.caller_id = ? OR c.receiver_id = ?
         ORDER BY c.created_at DESC
         LIMIT ?`,
        [userId, userId, limit]
      );
      
      connection.end();
      
      return rows.map(row => ({
        ...row,
        group_id: row.group_id ? bufferToUuid(row.group_id) : row.group_id,
      }));
    } catch (error) {
      console.error('Error en ModelsCall.getByUserId:', error);
      throw error;
    }
  }

  /**
   * Obtener llamadas activas de un usuario
   */
  static async getActiveCalls(userId) {
    try {
      const connection = await getConnection();
      
      const [rows] = await connection.execute(
        `SELECT c.*, 
                u_caller.username as caller_name,
                u_receiver.username as receiver_name
         FROM calls c 
         LEFT JOIN users u_caller ON c.caller_id = u_caller.id
         LEFT JOIN users u_receiver ON c.receiver_id = u_receiver.id
         WHERE (c.caller_id = ? OR c.receiver_id = ?) 
         AND c.status IN ('initiated', 'ringing', 'accepted')
         ORDER BY c.created_at DESC`,
        [userId, userId]
      );
      
      connection.end();
      
      return rows.map(row => ({
        ...row,
        group_id: row.group_id ? bufferToUuid(row.group_id) : row.group_id,
      }));
    } catch (error) {
      console.error('Error en ModelsCall.getActiveCalls:', error);
      throw error;
    }
  }

  /**
   * Finalizar llamadas activas de un usuario
   */
  static async endActiveCalls(userId) {
    try {
      const connection = await getConnection();
      
      const [result] = await connection.execute(
        `UPDATE calls 
         SET status = 'ended', ended_at = ?
         WHERE (caller_id = ? OR receiver_id = ?) 
         AND status IN ('initiated', 'ringing', 'accepted')`,
        [new Date().toISOString(), userId, userId]
      );
      
      connection.end();
      return result;
    } catch (error) {
      console.error('Error en ModelsCall.endActiveCalls:', error);
      throw error;
    }
  }

  /**
   * Crear una llamada grupal
   */
  static async createGroupCall({ group_id, created_by, call_type = 'audio' }) {
    try {
      console.log('📞 ModelsCall.createGroupCall - Iniciando llamada grupal:', { group_id, created_by, call_type });
      
      // Verificar si ya hay una llamada activa en el grupo
      const activeCall = await this.getActiveGroupCall(group_id);
      if (activeCall) {
        console.log('📞 Ya existe una llamada activa en el grupo:', activeCall.id);
        return activeCall;
      }
      
      // Crear nueva llamada grupal
      return await this.create({
        caller_id: created_by,
        receiver_id: null, // Para llamadas grupales
        call_type,
        group_id
      });
    } catch (error) {
      console.error('❌ Error en ModelsCall.createGroupCall:', error);
      throw error;
    }
  }

  /**
   * Obtener llamada activa de un grupo
   */
  static async getActiveGroupCall(group_id) {
    try {
      const connection = await getConnection();
      
      const [rows] = await connection.execute(
        `SELECT c.*, 
                u_caller.username as caller_name,
                g.name as group_name,
                COUNT(cp.id) as participant_count
         FROM calls c 
         LEFT JOIN users u_caller ON c.caller_id = u_caller.id
         LEFT JOIN groups g ON c.group_id = g.id
         LEFT JOIN call_participants cp ON c.id = cp.call_id AND cp.left_at IS NULL
         WHERE c.group_id = ? AND c.status IN ('initiated', 'active') 
         GROUP BY c.id
         ORDER BY c.created_at DESC 
         LIMIT 1`,
        [group_id]
      );
      
      connection.end();
      
      if (rows[0]) {
        return {
          ...rows[0],
          group_id: rows[0].group_id ? bufferToUuid(rows[0].group_id) : rows[0].group_id
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error en ModelsCall.getActiveGroupCall:', error);
      throw error;
    }
  }

  /**
   * Unirse a una llamada grupal
   */
  static async joinGroupCall(call_id, user_id) {
    try {
      const connection = await getConnection();
      
      // Verificar si el usuario ya está en la llamada
      const [existing] = await connection.execute(
        `SELECT id FROM call_participants WHERE call_id = ? AND user_id = ? AND left_at IS NULL`,
        [call_id, user_id]
      );
      
      if (existing.length > 0) {
        connection.end();
        console.log('📞 Usuario ya está en la llamada:', { call_id, user_id });
        return { success: true, message: 'Usuario ya está en la llamada' };
      }
      
      // Agregar participante
      const participantId = uuidv4();
      const [result] = await connection.execute(
        `INSERT INTO call_participants (id, call_id, user_id, joined_at) 
         VALUES (?, ?, ?, ?)`,
        [participantId, call_id, user_id, new Date().toISOString()]
      );
      
      // Actualizar estado de la llamada a 'active' si es el primer join
      await connection.execute(
        `UPDATE calls SET status = 'active' WHERE id = ? AND status = 'initiated'`,
        [call_id]
      );
      
      connection.end();
      console.log('📞 Usuario se unió a la llamada:', { call_id, user_id, participantId });
      return { success: true, participant_id: participantId };
    } catch (error) {
      console.error('❌ Error en ModelsCall.joinGroupCall:', error);
      throw error;
    }
  }

  /**
   * Salir de una llamada grupal
   */
  static async leaveGroupCall(call_id, user_id) {
    try {
      const connection = await getConnection();
      
      // Marcar como que el usuario salió
      const [result] = await connection.execute(
        `UPDATE call_participants 
         SET left_at = ? 
         WHERE call_id = ? AND user_id = ? AND left_at IS NULL`,
        [new Date().toISOString(), call_id, user_id]
      );
      
      // Verificar si quedan participantes activos
      const [activeParticipants] = await connection.execute(
        `SELECT COUNT(*) as count FROM call_participants 
         WHERE call_id = ? AND left_at IS NULL`,
        [call_id]
      );
      
      // Si no quedan participantes, finalizar la llamada
      if (activeParticipants[0].count === 0) {
        await connection.execute(
          `UPDATE calls 
           SET status = 'ended', ended_at = ? 
           WHERE id = ?`,
          [new Date().toISOString(), call_id]
        );
        console.log('📞 Llamada finalizada automáticamente - sin participantes:', call_id);
      }
      
      connection.end();
      console.log('📞 Usuario salió de la llamada:', { call_id, user_id });
      return { success: true };
    } catch (error) {
      console.error('❌ Error en ModelsCall.leaveGroupCall:', error);
      throw error;
    }
  }

  /**
   * Obtener participantes activos de una llamada
   */
  static async getCallParticipants(call_id) {
    try {
      const connection = await getConnection();
      
      const [rows] = await connection.execute(
        `SELECT cp.*, u.username, u.email 
         FROM call_participants cp 
         LEFT JOIN users u ON cp.user_id = u.id 
         WHERE cp.call_id = ? AND cp.left_at IS NULL 
         ORDER BY cp.joined_at ASC`,
        [call_id]
      );
      
      connection.end();
      return rows;
    } catch (error) {
      console.error('❌ Error en ModelsCall.getCallParticipants:', error);
      throw error;
    }
  }

  /**
   * Finalizar una llamada grupal
   */
  static async endGroupCall(call_id, ended_by) {
    try {
      const connection = await getConnection();
      
      // Marcar todos los participantes como que salieron
      await connection.execute(
        `UPDATE call_participants 
         SET left_at = ? 
         WHERE call_id = ? AND left_at IS NULL`,
        [new Date().toISOString(), call_id]
      );
      
      // Finalizar la llamada
      const [result] = await connection.execute(
        `UPDATE calls 
         SET status = 'ended', ended_at = ?, ended_by = ? 
         WHERE id = ?`,
        [new Date().toISOString(), ended_by, call_id]
      );
      
      connection.end();
      console.log('📞 Llamada grupal finalizada:', { call_id, ended_by });
      return { success: true };
    } catch (error) {
      console.error('❌ Error en ModelsCall.endGroupCall:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de llamadas grupales
   */
  static async getGroupCallHistory(group_id, limit = 20) {
    try {
      const connection = await getConnection();
      
      const [rows] = await connection.execute(
        `SELECT c.*, 
                u_caller.username as caller_name,
                g.name as group_name,
                COUNT(cp.id) as total_participants,
                CASE 
                  WHEN c.ended_at IS NOT NULL 
                  THEN TIMESTAMPDIFF(SECOND, c.created_at, c.ended_at)
                  ELSE NULL 
                END as duration_seconds
         FROM calls c 
         LEFT JOIN users u_caller ON c.caller_id = u_caller.id
         LEFT JOIN groups g ON c.group_id = g.id
         LEFT JOIN call_participants cp ON c.id = cp.call_id
         WHERE c.group_id = ? AND c.receiver_id IS NULL
         GROUP BY c.id
         ORDER BY c.created_at DESC 
         LIMIT ?`,
        [group_id, limit]
      );
      
      connection.end();
      
      return rows.map(row => ({
        ...row,
        group_id: row.group_id ? bufferToUuid(row.group_id) : row.group_id
      }));
    } catch (error) {
      console.error('❌ Error en ModelsCall.getGroupCallHistory:', error);
      throw error;
    }
  }
}
