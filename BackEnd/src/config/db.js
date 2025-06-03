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
        console.error('Using Turso database connection')
        
        return {
          execute: async (query, params = []) => {
            console.error('Turso query:', query, 'params:', params);
            const result = await executeQuery(query, params);
            console.error('Turso result:', result);
            return [formatResults(result), result];
          },
          end: () => Promise.resolve()
        };
      }
        // Para desarrollo sin Turso, usar MySQL
      const connection = await mysql.createConnection(mysqlConfig)
      console.error('Using MySQL database connection')
      return connection 
      
    } catch (error) {
      console.error('Database connection error:', error.message)
      throw error
    }
  }