import jwt from 'jsonwebtoken'
import { MessageController } from '../controllers/message.controller.js'
import { addOnlineUser, removeOnlineUser, updateUserActivity, getOnlineUsersList } from '../utils/socketManager.js'

export function configureSocket(io) {
  
  io.use((socket, next) => {
    
    const token = socket.handshake.auth?.token
    if (!token) {
      console.error('Conexión rechazada: Token faltante');
      return next(new Error('Token faltante'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded // Guardamos los datos del usuario en el socket
      next()
    } catch (err) {
      console.error('Conexión rechazada: Token inválido:', err.message);
      next(new Error('Token inválido'))
    }
  })
  io.on('connection', (socket) => {

    // Agregar usuario al tracking de online
    addOnlineUser(socket.user.id, socket.user.username, socket.id);

    // Track current group for this socket
    socket.currentGroup = null;    // Join group room
    socket.on('join_group', (groupId) => {
      if (socket.currentGroup) {
        socket.leave(socket.currentGroup);
      }
      socket.join(groupId);
      socket.currentGroup = groupId;
    });    socket.on('send_message', async (data) => {
      
      const messageData = {
        sender_id: socket.user.id,
        content: data.content,
        group_id: data.group_id,
        created_at: new Date(),
        // Preservar temp_id si está presente para poder identificar mensajes optimistas
        temp_id: data.temp_id,
        // Incluir attachments si están presentes
        attachments: data.attachments || null
      };
      

      try {
        // Actualizar actividad del usuario
        updateUserActivity(socket.user.id);
        
        // Ahora el resultado contiene toda la información del mensaje incluyendo id y sender_name
        const savedMessage = await MessageController.createFromSocket(messageData)

        // Emitir el mensaje completo solo al grupo correspondiente
        if (savedMessage.group_id) {
          io.to(savedMessage.group_id).emit('receive_message', savedMessage)
        } else {
          io.emit('receive_message', savedMessage)
        }
      } catch (error) {
        console.error('Error al procesar mensaje:', error)
        console.error('Stack trace:', error.stack)
        
        // Informar al cliente del error con detalles
        socket.emit('message_error', { 
          error: 'No se pudo enviar el mensaje', 
          details: error.message || 'Error desconocido',
          temp_id: data.temp_id 
        })
      }

    }); // Cierra socket.on('send_message', ...)
      // Añadir evento para debugging de conexión
    socket.on('ping_server', () => {
      
      updateUserActivity(socket.user.id); // Actualizar actividad en ping
      socket.emit('pong_client', { 
        message: 'Conexión Socket.io funcionando correctamente',
        userId: socket.user.id,
        timestamp: new Date().toISOString()
      });
    });

    // Evento para obtener lista de usuarios online
    socket.on('get_online_users', () => {
      socket.emit('online_users_list', getOnlineUsersList());
    });

    socket.on('disconnect', () => {
      // Remover usuario del tracking de online
      removeOnlineUser(socket.user.id);
    });
  }); // Cierra io.on('connection', ...)
}
