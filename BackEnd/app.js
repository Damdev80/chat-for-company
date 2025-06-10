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
      upload: '/api/upload'
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

// Log para diagnóstico - rutas registradas
console.error('📋 Routes registered:', {
  users: '/api/users',
  roles: '/api/roles',
  messages: '/api/messages',
  groups: '/api/groups',
  objectives: '/api/objectives',
  tasks: '/api/tasks',
  upload: '/api/upload'
});

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
setSocketInstance(io)
configureSocket(io)



// Iniciar servidor
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto http://localhost:${PORT}`)
})