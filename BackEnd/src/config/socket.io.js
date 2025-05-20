import jwt from 'jsonwebtoken'
import { MessageController } from '../controllers/message.controller.js'

export function configureSocket(io) {
  console.log(`Socket.IO configurado en modo: ${process.env.NODE_ENV || 'development'}`)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Token faltante'))

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded // Guardamos los datos del usuario en el socket
      next()
    } catch (err) {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Usuario conectado: ${socket.user.id}`)

    // Track current group for this socket
    socket.currentGroup = null;    // Join group room
    socket.on('join_group', (groupId) => {
      if (socket.currentGroup) {
        socket.leave(socket.currentGroup);
      }
      socket.join(groupId);
      socket.currentGroup = groupId;
    });
      socket.on('send_message', async (data) => {
      const messageData = {
        sender_id: socket.user.id,
        content: data.content,
        group_id: data.group_id,
        created_at: new Date(),
        // Preservar temp_id si está presente para poder identificar mensajes optimistas
        temp_id: data.temp_id
      }

      try {
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
        // Informar al cliente del error
        socket.emit('message_error', { 
          error: 'No se pudo enviar el mensaje', 
          temp_id: data.temp_id 
        })
      }

    }); // Cierra socket.on('send_message', ...)

    socket.on('disconnect', () => {
      console.log(`👋 Usuario desconectado: ${socket.user.id}`)
    });
  }); // Cierra io.on('connection', ...)
}
