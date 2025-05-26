import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { tursoClient, executeQuery, formatResults } from './turso.js'

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' })
} else {
  dotenv.config()
}

// Configuración para MySQL (desarrollo)
const mysqlConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chat_app',
    port: parseInt(process.env.DB_PORT || '3306'),
}

export const getConnection = async () => {
    try {
      // Si Turso está disponible (producción o desarrollo), usarlo
      if (tursoClient !== null) {
        console.log('✅ Usando base de datos Turso')
        
        return {
          execute: async (query, params = []) => {
            const result = await executeQuery(query, params);
            return [formatResults(result), result];
          },
          end: () => Promise.resolve()
        };
      }
      
      // Para desarrollo sin Turso, usar MySQL
      const connection = await mysql.createConnection(mysqlConfig)
      console.log('✅ Base de datos MySQL conectada correctamente')
      return connection 
      
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error.message)
      throw error
    }
  }