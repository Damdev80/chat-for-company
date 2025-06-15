// app.js - REPARADO con imports dinámicos
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import { serverError } from './src/middlewares/error.middlewar.js' 
import { requestLogger } from './src/middlewares/logger.middleware.js'

// Configurar variables de entorno
dotenv.config()

console.log('🚀 Iniciando aplicación backend...');

// Inicializar Express
const app = express()
const server = http.createServer(app)

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',      // Desarrollo local (Vite)
    'http://localhost:3000',      // Desarrollo local alternativo
    'https://chat-for-company.vercel.app',  // Producción Vercel
    'https://chat-for-company-git-main-damdev80.vercel.app', // Branch previews
    'https://*.vercel.app'        // Cualquier subdominio de Vercel
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

app.use(cors(corsOptions))

// CORS headers adicionales para casos edge
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())

// Middlewares de logging (opcional, comentado para debugging)
// app.use(requestLogger)

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'))

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🩺 Health check request from:', req.headers.origin);
  res.json({ 
    status: 'ok', 
    message: 'Backend funcionando correctamente',
    cors: 'enabled',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// API test endpoint
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
      audio: '/api/audio',
      calls: '/api/calls'
    }
  })
})

// Función async para configurar rutas con imports dinámicos
async function configureRoutes() {
  console.log('📦 Configurando rutas con imports dinámicos...');
  
  try {
    // Import dinámico de userRoutes
    console.log('📦 Importando userRoutes...');
    const userRoutes = await import('./src/routes/user.routes.js')
    app.use('/api/users', userRoutes.default)
    console.log('✅ Ruta users registrada');
    
    // Import dinámico de roleRoutes
    console.log('📦 Importando roleRoutes...');
    const roleRoutes = await import('./src/routes/role.routes.js')
    app.use('/api/roles', roleRoutes.default)
    console.log('✅ Ruta roles registrada');
    
    // Import dinámico de messageRoutes
    console.log('📦 Importando messageRoutes...');
    const messageRoutes = await import('./src/routes/message.routes.js')
    app.use('/api/messages', messageRoutes.default)
    console.log('✅ Ruta messages registrada');
    
    // Import dinámico de groupRoutes
    console.log('📦 Importando groupRoutes...');
    const groupRoutes = await import('./src/routes/group.routes.js')
    app.use('/api/groups', groupRoutes.default)
    console.log('✅ Ruta groups registrada');
    
    // Import dinámico de objectiveRoutes
    console.log('📦 Importando objectiveRoutes...');
    const objectiveRoutes = await import('./src/routes/objective.routes.js')
    app.use('/api/objectives', objectiveRoutes.default)
    console.log('✅ Ruta objectives registrada');
    
    // Import dinámico de taskRoutes
    console.log('📦 Importando taskRoutes...');
    const taskRoutes = await import('./src/routes/task.routes.js')
    app.use('/api/tasks', taskRoutes.default)
    console.log('✅ Ruta tasks registrada');
    
    // Import dinámico de uploadRoutes
    console.log('📦 Importando uploadRoutes...');
    const uploadRoutes = await import('./src/routes/upload.routes.js')
    app.use('/api/upload', uploadRoutes.default)
    console.log('✅ Ruta upload registrada');
    
    // Import dinámico de audioRoutes (con manejo de errores)
    try {
      console.log('📦 Importando audioRoutes...');
      const audioRoutes = await import('./src/routes/audio.routes.js')
      app.use('/api/audio', audioRoutes.default)
      console.log('✅ Ruta audio registrada');
    } catch (error) {
      console.log('⚠️ Audio routes no disponibles:', error.message);
    }
    
    // Import dinámico de callRoutes (con manejo de errores)
    try {
      console.log('📦 Importando callRoutes...');
      const callRoutes = await import('./src/routes/call.routes.js')
      app.use('/api/calls', callRoutes.default)
      console.log('✅ Ruta calls registrada');
    } catch (error) {
      console.log('⚠️ Call routes no disponibles:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error configurando rutas:', error)
    throw error
  }
}

// Ejecutar configuración de rutas
await configureRoutes()
console.log('✅ Configuración de rutas completada');

// Configurar Socket.io
console.log('🔧 Configurando Socket.IO...');
const io = new SocketServer(server, {
  cors: corsOptions,
  methods: ['GET', 'POST'],
  transports: ['websocket', 'polling']
})

// Configuración avanzada de Socket.IO
try {
  // Importar configuración de Socket.IO
  const { configureSocket } = await import('./src/config/socket.io.js')
  const { setSocketInstance } = await import('./src/utils/socketManager.js')
  
  // Configurar instancia global y eventos
  setSocketInstance(io)
  configureSocket(io)
  
  console.log('✅ Socket.IO configurado correctamente')
} catch (error) {
  console.error('❌ Error configurando Socket.IO:', error)
}

// Manejo de errores 404 (ARREGLADO - sin patrón '*' problemático)
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// Middleware de manejo de errores
app.use(serverError)

// Exportar para uso en server.js
export default app
export { server }

console.log('✅ Aplicación configurada correctamente');

// Iniciar servidor
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`)
  console.log(`🌐 http://localhost:${PORT}`)
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`)
})
