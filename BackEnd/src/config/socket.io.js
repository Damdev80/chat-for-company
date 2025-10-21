import jwt from 'jsonwebtoken'
import { MessageController } from '../controllers/message.controller.js'
import { addOnlineUser, removeOnlineUser, updateUserActivity, getOnlineUsersList } from '../utils/socketManager.js'

export function configureSocket(io) {
  console.log(`Socket.IO configurado en modo: ${process.env.NODE_ENV || 'development'}`)  // Log de todos los intentos de conexión
  console.log('Socket.IO esperando conexiones en URL base:', process.env.CORS_ORIGIN || '*');
  
  io.use((socket, next) => {
    console.log('Intento de conexión a Socket.io desde:', socket.handshake.headers.origin);
    console.log('Headers de conexión:', JSON.stringify(socket.handshake.headers));
    
    const token = socket.handshake.auth?.token
    if (!token) {
      console.error('Conexión rechazada: Token faltante');
      return next(new Error('Token faltante'))
    }

    try {
      console.log('Verificando token JWT...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      console.log('Token válido para usuario:', decoded.username);
      socket.user = decoded // Guardamos los datos del usuario en el socket
      next()
    } catch (err) {
      console.error('Conexión rechazada: Token inválido:', err.message);
      next(new Error('Token inválido'))
    }
  })
  io.on('connection', (socket) => {
    console.log(`🔌 Usuario conectado: ${socket.user.id}`)

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
      console.log('\n📨 SOCKET: Mensaje recibido')
      console.log('   📦 Data completa:', JSON.stringify(data, null, 2))
      console.log('   🏢 Group ID del frontend:', data.group_id)
      console.log('   👤 User ID:', socket.user.id)
      
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
      
      console.log('   📋 MessageData preparado:', JSON.stringify(messageData, null, 2))

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
    socket.on('ping_server', (data) => {
      console.log('Cliente envió ping:', data);
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
      console.log(`👋 Usuario desconectado: ${socket.user.id}`)
      // Remover usuario del tracking de online
      removeOnlineUser(socket.user.id);
    });
  }); // Cierra io.on('connection', ...)
}
