import { ModelsCall } from '../models/call.js';
import { getSocketInstance } from '../utils/socketManager.js';

export class CallController {  /**
   * Iniciar una nueva llamada grupal
   */  static async initiateGroupCall(req, res) {
    try {
      console.log('📞 CallController: Iniciando llamada grupal...');
      console.log('📞 Request user:', req.user);
      console.log('📞 Request body:', req.body);
      
      const { group_id, call_type = 'audio', participants = [] } = req.body;
      const caller_id = req.user.id;

      // Validaciones
      if (!group_id) {
        return res.status(400).json({ 
          message: 'Se requiere el ID del grupo' 
        });
      }

      if (!['audio', 'video'].includes(call_type)) {
        return res.status(400).json({ 
          message: 'Tipo de llamada inválido. Debe ser "audio" o "video"' 
        });
      }      // Verificar si ya hay una llamada activa en el grupo
      const activeGroupCall = await ModelsCall.getActiveGroupCall(group_id);
      if (activeGroupCall) {
        return res.status(409).json({ 
          message: 'Ya hay una llamada activa en este grupo',
          activeCall: activeGroupCall
        });
      }// Crear la llamada grupal
      const callData = {
        caller_id,
        group_id,
        call_type,
        status: 'initiated'
      };      console.log('📞 Creando llamada grupal:', callData);
      const newCall = await ModelsCall.create(callData);

      // Agregar al caller como participante automáticamente
      await ModelsCall.joinGroupCall(newCall.id, caller_id);

      // Agregar participantes especificados
      if (participants.length > 0) {
        for (const participantId of participants) {
          if (participantId !== caller_id) {
            await ModelsCall.joinGroupCall(newCall.id, participantId);
          }
        }
      }

      // Emitir la llamada grupal por Socket.IO
      const io = getSocketInstance();
      if (io) {
        console.log('📡 Emitiendo llamada grupal por Socket.IO');
        
        // Notificar a todos los miembros del grupo
        io.emit('incoming_group_call', {
          ...newCall,
          caller_name: req.user.username || req.user.name || 'Usuario',
          participants: participants
        });
      }

      res.status(201).json({ 
        message: 'Llamada grupal iniciada correctamente',
        call: newCall
      });

    } catch (error) {
      console.error('❌ Error al iniciar llamada grupal:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Unirse a una llamada grupal
   */
  static async joinGroupCall(req, res) {
    try {
      const { callId } = req.params;
      const user_id = req.user.id;

      console.log(`📞 Usuario ${user_id} intentando unirse a llamada ${callId}`);

      // Verificar que la llamada existe y está activa
      const call = await ModelsCall.getById(callId);
      if (!call) {
        return res.status(404).json({ 
          message: 'Llamada no encontrada' 
        });
      }

      if (!call.is_group_call) {
        return res.status(400).json({ 
          message: 'Esta no es una llamada grupal' 
        });
      }

      if (!['ringing', 'active'].includes(call.status)) {
        return res.status(409).json({ 
          message: 'La llamada no está disponible para unirse' 
        });
      }

      // Verificar si el usuario ya es participante
      const isParticipant = await ModelsCall.isParticipant(callId, user_id);
      if (isParticipant) {
        return res.status(409).json({ 
          message: 'Ya eres participante de esta llamada' 
        });
      }

      // Agregar como participante
      await ModelsCall.addParticipant(callId, user_id, 'joined');

      // Si es el primer participante que se une, cambiar status a 'active'
      if (call.status === 'ringing') {
        await ModelsCall.updateStatus(callId, 'active');
      }

      // Obtener la llamada actualizada con participantes
      const updatedCall = await ModelsCall.getCallWithParticipants(callId);

      // Emitir por Socket.IO que alguien se unió
      const io = getSocketInstance();
      if (io) {
        io.emit('user_joined_group_call', {
          callId,
          user_id,
          userName: req.user.username || req.user.name || 'Usuario',
          participants: updatedCall.participants
        });
      }

      res.json({ 
        message: 'Te has unido a la llamada grupal',
        call: updatedCall
      });

    } catch (error) {
      console.error('❌ Error al unirse a llamada grupal:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Abandonar una llamada grupal
   */
  static async leaveGroupCall(req, res) {
    try {
      const { callId } = req.params;
      const user_id = req.user.id;

      console.log(`📞 Usuario ${user_id} abandonando llamada grupal ${callId}`);

      // Verificar que el usuario es participante
      const isParticipant = await ModelsCall.isParticipant(callId, user_id);
      if (!isParticipant) {
        return res.status(404).json({ 
          message: 'No eres participante de esta llamada' 
        });
      }

      // Remover al participante
      await ModelsCall.removeParticipant(callId, user_id);

      // Verificar cuántos participantes quedan
      const remainingParticipants = await ModelsCall.getCallParticipants(callId);
      
      // Si no quedan participantes, finalizar la llamada
      if (remainingParticipants.length === 0) {
        await ModelsCall.updateStatus(callId, 'ended');
        await ModelsCall.updateEndTime(callId);
      }

      // Emitir por Socket.IO que alguien se fue
      const io = getSocketInstance();
      if (io) {
        io.emit('user_left_group_call', {
          callId,
          user_id,
          userName: req.user.username || req.user.name || 'Usuario',
          remainingParticipants: remainingParticipants.length,
          callEnded: remainingParticipants.length === 0
        });
      }

      res.json({ 
        message: 'Has abandonado la llamada grupal',
        callEnded: remainingParticipants.length === 0
      });

    } catch (error) {
      console.error('❌ Error al abandonar llamada grupal:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener llamadas activas en un grupo
   */
  static async getActiveGroupCalls(req, res) {
    try {
      const { groupId } = req.params;
      
      console.log(`📞 Obteniendo llamadas activas para grupo ${groupId}`);
      
      const activeCalls = await ModelsCall.getActiveGroupCalls(groupId);
      
      res.json({ 
        activeCalls: activeCalls
      });

    } catch (error) {
      console.error('❌ Error al obtener llamadas activas del grupo:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Iniciar una nueva llamada (método original actualizado)
   */
  static async initiateCall(req, res) {
    try {
      console.log('📞 CallController: Iniciando llamada...');
      
      const { receiver_id, call_type = 'audio', group_id = null } = req.body;
      const caller_id = req.user.id;

      // Validaciones
      if (!receiver_id) {
        return res.status(400).json({ 
          message: 'Se requiere el ID del receptor' 
        });
      }

      if (caller_id === receiver_id) {
        return res.status(400).json({ 
          message: 'No puedes llamarte a ti mismo' 
        });
      }

      if (!['audio', 'video'].includes(call_type)) {
        return res.status(400).json({ 
          message: 'Tipo de llamada inválido. Debe ser "audio" o "video"' 
        });
      }

      // Verificar si el usuario ya tiene llamadas activas
      const activeCalls = await ModelsCall.getActiveCalls(caller_id);
      if (activeCalls.length > 0) {
        return res.status(409).json({ 
          message: 'Ya tienes una llamada activa',
          activeCall: activeCalls[0]
        });
      }

      // Verificar si el receptor tiene llamadas activas
      const receiverActiveCalls = await ModelsCall.getActiveCalls(receiver_id);
      if (receiverActiveCalls.length > 0) {
        return res.status(409).json({ 
          message: 'El usuario está ocupado en otra llamada'
        });
      }

      // Crear la llamada
      const callData = {
        caller_id,
        receiver_id,
        call_type,
        group_id
      };

      console.log('📞 Creando llamada:', callData);
      const newCall = await ModelsCall.create(callData);

      // Emitir evento de llamada entrante por Socket.IO
      const io = getSocketInstance();
      if (io) {
        console.log('📡 Emitiendo evento de llamada entrante');
        
        // Notificar al receptor sobre la llamada entrante
        io.emit('incoming_call', {
          ...newCall,
          type: 'incoming_call'
        });

        // Notificar al caller que la llamada fue iniciada
        io.emit('call_initiated', {
          ...newCall,
          type: 'call_initiated'
        });
      } else {
        console.warn('⚠️ Socket.IO no disponible para emitir evento de llamada');
      }

      res.status(201).json({ 
        message: 'Llamada iniciada correctamente',
        data: newCall
      });

    } catch (error) {
      console.error('❌ Error al iniciar llamada:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Responder a una llamada (aceptar/rechazar)
   */
  static async respondToCall(req, res) {
    try {
      console.log('📞 CallController: Respondiendo a llamada...');
      
      const { callId } = req.params;
      const { action } = req.body; // 'accept' o 'reject'
      const userId = req.user.id;

      if (!['accept', 'reject'].includes(action)) {
        return res.status(400).json({ 
          message: 'Acción inválida. Debe ser "accept" o "reject"' 
        });
      }

      // Obtener la llamada
      const call = await ModelsCall.getById(callId);
      if (!call) {
        return res.status(404).json({ 
          message: 'Llamada no encontrada' 
        });
      }

      // Verificar que el usuario es el receptor
      if (call.receiver_id !== userId) {
        return res.status(403).json({ 
          message: 'No tienes permisos para responder esta llamada' 
        });
      }

      // Verificar que la llamada está en estado válido
      if (!['initiated', 'ringing'].includes(call.status)) {
        return res.status(400).json({ 
          message: 'La llamada no está en un estado válido para responder' 
        });
      }

      // Actualizar el estado de la llamada
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      const endedAt = action === 'reject' ? new Date().toISOString() : null;
      
      await ModelsCall.updateStatus(callId, newStatus, endedAt);

      // Obtener la llamada actualizada
      const updatedCall = await ModelsCall.getById(callId);

      // Emitir evento por Socket.IO
      const io = getSocketInstance();
      if (io) {
        console.log(`📡 Emitiendo evento de llamada ${action === 'accept' ? 'aceptada' : 'rechazada'}`);
        
        const eventType = action === 'accept' ? 'call_accepted' : 'call_rejected';
        io.emit(eventType, {
          ...updatedCall,
          type: eventType
        });
      }

      res.json({ 
        message: `Llamada ${action === 'accept' ? 'aceptada' : 'rechazada'} correctamente`,
        data: updatedCall
      });

    } catch (error) {
      console.error('❌ Error al responder llamada:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Finalizar una llamada
   */
  static async endCall(req, res) {
    try {
      console.log('📞 CallController: Finalizando llamada...');
      
      const { callId } = req.params;
      const userId = req.user.id;

      // Obtener la llamada
      const call = await ModelsCall.getById(callId);
      if (!call) {
        return res.status(404).json({ 
          message: 'Llamada no encontrada' 
        });
      }

      // Verificar que el usuario es parte de la llamada
      if (call.caller_id !== userId && call.receiver_id !== userId) {
        return res.status(403).json({ 
          message: 'No tienes permisos para finalizar esta llamada' 
        });
      }

      // Verificar que la llamada está activa
      if (!['initiated', 'ringing', 'accepted'].includes(call.status)) {
        return res.status(400).json({ 
          message: 'La llamada ya ha finalizado' 
        });
      }

      // Finalizar la llamada
      await ModelsCall.updateStatus(callId, 'ended', new Date().toISOString());

      // Obtener la llamada actualizada
      const updatedCall = await ModelsCall.getById(callId);

      // Emitir evento por Socket.IO
      const io = getSocketInstance();
      if (io) {
        console.log('📡 Emitiendo evento de llamada finalizada');
        io.emit('call_ended', {
          ...updatedCall,
          type: 'call_ended'
        });
      }

      res.json({ 
        message: 'Llamada finalizada correctamente',
        data: updatedCall
      });

    } catch (error) {
      console.error('❌ Error al finalizar llamada:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener llamadas del usuario
   */
  static async getUserCalls(req, res) {
    try {
      console.log('📞 CallController: Obteniendo llamadas del usuario...');
      
      const userId = req.user.id;
      const { limit = 50 } = req.query;

      const calls = await ModelsCall.getByUserId(userId, parseInt(limit));

      res.json({ 
        message: 'Llamadas obtenidas correctamente',
        data: calls
      });

    } catch (error) {
      console.error('❌ Error al obtener llamadas:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener llamadas activas del usuario
   */
  static async getActiveCalls(req, res) {
    try {
      console.log('📞 CallController: Obteniendo llamadas activas...');
      
      const userId = req.user.id;

      const activeCalls = await ModelsCall.getActiveCalls(userId);

      res.json({ 
        message: 'Llamadas activas obtenidas correctamente',
        data: activeCalls
      });

    } catch (error) {
      console.error('❌ Error al obtener llamadas activas:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Manejar señalización WebRTC
   */
  static async handleWebRTCSignaling(req, res) {
    try {
      console.log('📞 CallController: Manejando señalización WebRTC...');
      
      const { callId } = req.params;
      const { type, data } = req.body;
      const userId = req.user.id;

      // Obtener la llamada
      const call = await ModelsCall.getById(callId);
      if (!call) {
        return res.status(404).json({ 
          message: 'Llamada no encontrada' 
        });
      }

      // Verificar que el usuario es parte de la llamada
      if (call.caller_id !== userId && call.receiver_id !== userId) {
        return res.status(403).json({ 
          message: 'No tienes permisos para esta llamada' 
        });
      }

      // Emitir señal WebRTC al otro participante
      const io = getSocketInstance();
      if (io) {
        console.log(`📡 Enviando señal WebRTC: ${type}`);
        
        const targetUserId = call.caller_id === userId ? call.receiver_id : call.caller_id;
        
        io.emit('webrtc_signal', {
          callId,
          type,
          data,
          fromUserId: userId,
          toUserId: targetUserId
        });
      }      res.json({ 
        message: 'Señal WebRTC enviada correctamente'
      });

    } catch (error) {
      console.error('❌ Error en señalización WebRTC:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener participantes de una llamada
   */
  static async getCallParticipants(req, res) {
    try {
      console.log('📞 CallController: Obteniendo participantes de llamada...');
      
      const { callId } = req.params;
      const userId = req.user.id;

      // Validaciones
      if (!callId) {
        return res.status(400).json({ 
          message: 'Se requiere el ID de la llamada' 
        });
      }

      // Verificar que la llamada existe
      const call = await ModelsCall.getById(callId);
      if (!call) {
        return res.status(404).json({ 
          message: 'Llamada no encontrada' 
        });
      }

      // Obtener participantes
      const participants = await ModelsCall.getCallParticipants(callId);

      console.log('📞 Participantes obtenidos:', participants);

      res.json({ 
        message: 'Participantes obtenidos correctamente',
        participants
      });

    } catch (error) {
      console.error('❌ Error al obtener participantes:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}
