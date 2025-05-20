import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' })
} else {
  dotenv.config()
}

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_app',
    port: parseInt(process.env.DB_PORT || '3026'),
    // Additional connection settings for production
    ...(process.env.NODE_ENV === 'production' ? { 
      ssl: {
        rejectUnauthorized: true
      } 
    } : {})
}

export const getConnection = async () => {
    try {
      const connection = await mysql.createConnection(config)
      console.log('✅ Base de datos conectada correctamente')
      return connection 
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error.message)
      throw error
    }
  }