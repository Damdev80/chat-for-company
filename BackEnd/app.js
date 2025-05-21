// app.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import { configureSocket } from './src/config/socket.io.js'
import { serverError } from './src/middlewares/error.middlewar.js' 
import { requestLogger } from './src/middlewares/logger.middleware.js'

// Importar rutas
import userRoutes from './src/routes/user.routes.js'
import roleRoutes from './src/routes/role.routes.js'
import messageRoutes from './src/routes/message.routes.js'
import groupRoutes from './src/routes/group.routes.js'

// Configurar variables de entorno
dotenv.config()
//hOLAS
// Inicializar Express
const app = express()
const server = http.createServer(app)

// CORS configuration
const corsOptions = {
  origin: '*',  // Permitir todas las origenes para depuración
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(requestLogger) // Agregar el middleware de logging

// Rutas
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/groups', groupRoutes)

app.use(serverError)

// Configurar Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: '*',  // Permitir todas las origenes para depuración
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
})

configureSocket(io)



// Iniciar servidor
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto http://localhost:${PORT}`)
})