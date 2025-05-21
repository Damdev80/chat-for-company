import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import { executeQuery, formatResults } from './turso.js'

// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' })
} else {
  dotenv.config()
}

// Configuración para MySQL (desarrollo)
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

// Determinar si usar Turso (producción) o MySQL (desarrollo)
const useTurso = process.env.NODE_ENV === 'production' && process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN;

export const getConnection = async () => {
    try {
      // Si estamos en producción, usar Turso
      if (useTurso) {
        console.log('✅ Usando base de datos Turso en producción')
        
        // Objeto compatible con la API que usamos de mysql2
        return {
          execute: async (query, params = []) => {
            const result = await executeQuery(query, params);
            // Devolvemos un array con los resultados y los metadata como hace mysql2
            return [formatResults(result), result];
          },
          end: () => {
            // No es necesario con Turso, pero lo mantenemos para compatibilidad
            return Promise.resolve();
          }
        };
      }
      
      // Si no, usar MySQL como antes (desarrollo)
      const connection = await mysql.createConnection(config)
      console.log('✅ Base de datos MySQL conectada correctamente')
      return connection 
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error.message)
      throw error
    }
  }