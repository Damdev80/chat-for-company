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
import userRoutes from './src/routes/user.routes.js'
import roleRoutes from './src/routes/role.routes.js'
import messageRoutes from './src/routes/message.routes.js'
import groupRoutes from './src/routes/group.routes.js'
import objectiveRoutes from './src/routes/objective.routes.js'
import taskRoutes from './src/routes/task.routes.js'
import uploadRoutes from './src/routes/upload.routes.js'

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

// Rutas
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/objectives', objectiveRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/upload', uploadRoutes)

// Log para diagnóstico - rutas registradas
console.error('Routes registered:', {
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