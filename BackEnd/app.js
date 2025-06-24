// app.js
import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import { config } from './src/config/config.js'

import { configureSocket } from './src/config/socket.io.js'
import { setSocketInstance } from './src/utils/socketManager.js'
import { serverError } from './src/middlewares/error.middlewar.js' 
import { requestLogger } from './src/middlewares/logger.middleware.js'

// Importar rutas
console.log('📦 Importando rutas...');
import userRoutes from './src/routes/user.routes.js'
console.log('✅ userRoutes imported');
import roleRoutes from './src/routes/role.routes.js'
console.log('✅ roleRoutes imported');
import messageRoutes from './src/routes/message.routes.js'
console.log('✅ messageRoutes imported');
import groupRoutes from './src/routes/group.routes.js'
console.log('✅ groupRoutes imported');
import objectiveRoutes from './src/routes/objective.routes.js'
console.log('✅ objectiveRoutes imported');
import taskRoutes from './src/routes/task.routes.js'
console.log('✅ taskRoutes imported');
import uploadRoutes from './src/routes/upload.routes.js'
console.log('✅ uploadRoutes imported');
import audioRoutes from './src/routes/audio.routes.js'
console.log('✅ audioRoutes imported');
import ideaRoutes from './src/routes/idea.routes.js'
console.log('✅ ideaRoutes imported');
import eventRoutes from './src/routes/event.routes.js'
console.log('✅ eventRoutes imported');
import supportChatRoutes from './src/routes/supportChat.routes.js'
console.log('✅ supportChatRoutes imported');

// Inicializar Express
const app = express()
const server = http.createServer(app)

// CORS configuration
const corsOrigin = config.NODE_ENV === 'production' 
    ? ['https://chat-for-company.vercel.app', 'https://chat-for-company.onrender.com'] 
    : '*';

const corsOptions = {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(requestLogger) // Agregar el middleware de logging

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('uploads'))

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    port: config.PORT
  })
})

// Test API route
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    routes: {
      users: '/api/users',      roles: '/api/roles', 
      messages: '/api/messages',
      groups: '/api/groups',
      objectives: '/api/objectives',
      tasks: '/api/tasks',
      upload: '/api/upload',
      audio: '/api/audio',
      ideas: '/api/ideas', // NUEVA FUNCIONALIDAD
      events: '/api/events' // NUEVA FUNCIONALIDAD
    },
    features: {
      chat: 'enabled',
      file_upload: 'enabled',
      audio_messages: 'enabled',
      idea_wall: 'enabled', // NUEVA FUNCIONALIDAD
      event_calendar: 'enabled', // NUEVA FUNCIONALIDAD
      video_calls: 'disabled' // Deshabilitado por limitaciones de recursos
    }
  })
})

// Test Upload route specifically
app.get('/api/upload-check', (req, res) => {
  res.status(200).json({ 
    message: 'Upload routes check',
    timestamp: new Date().toISOString(),
    uploadRoutes: {
      files: '/api/upload/files',
      test: '/api/upload/test',
      testUpload: '/api/upload/test-upload'
    },
    status: 'Upload module loaded successfully'
  })
})

// Test Audio route specifically
app.get('/api/audio-check', (req, res) => {
  res.status(200).json({ 
    message: 'Audio routes check',
    timestamp: new Date().toISOString(),
    audioRoutes: {
      send: '/api/audio/send',
      test: '/api/audio/test/ping',
      file: '/api/audio/:filename'
    },
    status: 'Audio module loaded successfully'
  })
})

// Rutas
console.log('🔄 Registrando rutas...');
app.use('/api/users', userRoutes)
console.log('✅ Ruta users registrada');
app.use('/api/roles', roleRoutes)
console.log('✅ Ruta roles registrada');
app.use('/api/messages', messageRoutes)
console.log('✅ Ruta messages registrada');
app.use('/api/groups', groupRoutes)
console.log('✅ Ruta groups registrada');
app.use('/api/objectives', objectiveRoutes)
console.log('✅ Ruta objectives registrada');
app.use('/api/tasks', taskRoutes)
console.log('✅ Ruta tasks registrada');
app.use('/api/upload', uploadRoutes)
console.log('✅ Ruta upload registrada');
app.use('/api/ideas', ideaRoutes)
console.log('✅ Ruta ideas registrada');
app.use('/api/events', eventRoutes)
console.log('✅ Ruta events registrada');
app.use('/api/support', supportChatRoutes)
console.log('✅ Ruta support chat registrada');

// Registrar rutas de audio con manejo de errores específico
try {
  console.log('🎵 Intentando registrar rutas de audio...');
  app.use('/api/audio', audioRoutes)
  console.log('✅ Ruta audio registrada exitosamente');
} catch (error) {
  console.error('❌ ERROR al registrar rutas de audio:', error);
  console.error('Stack trace:', error.stack);
}

// Log para diagnóstico - rutas registradas
console.log('📋 Routes registered:', {
  users: '/api/users',
  roles: '/api/roles',
  messages: '/api/messages',
  groups: '/api/groups',
  objectives: '/api/objectives',
  tasks: '/api/tasks',
  upload: '/api/upload',
  audio: '/api/audio',
  ideas: '/api/ideas', // NUEVA RUTA
  events: '/api/events' // NUEVA RUTA
});

// Error handling middleware
app.use(serverError)

// Configurar Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: '*',  // Permitir todas las origenes para depuración
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
})

// Set Socket.IO instance in manager for access from controllers
try {
  setSocketInstance(io)
  configureSocket(io)
  console.log('✅ Socket.IO configured successfully')
} catch (error) {
  console.error('❌ Socket.IO configuration error:', error)
}

// Export app and server for use in server.js
export { app, server }