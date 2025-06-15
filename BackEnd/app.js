// app.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
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
import audioRoutes from './src/routes/audio.routes.simple.js'
console.log('✅ audioRoutes (simple) imported');

// Configurar variables de entorno
dotenv.config()
//hOLAS
// Inicializar Express
const app = express()
const server = http.createServer(app)

// CORS configuration
const corsOptions = {
  origin: '*',  // Permitir todas las origenes para depuración
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

// Test API route
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    routes: {
      users: '/api/users',
      roles: '/api/roles', 
      messages: '/api/messages',
      groups: '/api/groups',
      objectives: '/api/objectives',
      tasks: '/api/tasks',
      upload: '/api/upload',
      audio: '/api/audio'
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
  audio: '/api/audio'
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



// Iniciar servidor
const PORT = process.env.PORT || 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  console.log(`🌐 Server started at ${new Date().toISOString()}`)
  console.log(`✅ All routes loaded successfully`)
  console.log(`🔧 Build version: ${new Date().toISOString()}`) // Force rebuild
})