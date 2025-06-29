// server.js
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development'

// Load appropriate env file based on environment
if (NODE_ENV === 'production') {
  console.log('Loading production environment variables')
  dotenv.config({ path: '.env.production' })
} else {
  console.log('Loading development environment variables')
  dotenv.config()
}

// Import app after env vars are loaded
import { app, server } from './app.js'
import { config } from './src/config/config.js'

// Start the server
const PORT = config.PORT
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
  console.log(`🌍 Entorno: ${config.NODE_ENV}`)
  console.log(`🔑 JWT Secret configured: ${config.JWT_SECRET ? 'Yes' : 'No'}`)
  console.log(`📊 Database URL: ${config.TURSO_DATABASE_URL ? 'Configured' : 'Not configured'}`)
})

console.log(`Server running in ${NODE_ENV} mode`)