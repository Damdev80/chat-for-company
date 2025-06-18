import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Cargar variables de entorno según el entorno
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

// Inicializar cliente de Turso solo si las credenciales están disponibles
let tursoClient = null;

try {
  console.error('Turso configuration check:', {
    hasUrl: !!process.env.TURSO_URL,
    hasToken: !!process.env.TURSO_AUTH_TOKEN,
    url: process.env.TURSO_URL,
    nodeEnv: process.env.NODE_ENV
  });
  
  if (process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN && process.env.TURSO_URL !== 'libsql://[tu-db].turso.io') {
    tursoClient = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    console.error('Turso client initialized successfully');
  } else {// Configuración de Turso no encontrada, usando base de datos local
  }
} catch (error) {
  console.error('Error al inicializar Turso:', error.message);
}

export { tursoClient };

// Funciones auxiliares para ejecutar consultas
export async function executeQuery(query, params = []) {
  try {
    if (!tursoClient) {
      throw new Error('Turso client not initialized. Check your TURSO_URL and TURSO_AUTH_TOKEN environment variables.');
    }
    
    const result = await tursoClient.execute({ sql: query, args: params });
    
    // Convertir el resultado a formato compatible
    if (result.rows && Array.isArray(result.rows)) {
      // Para consultas SELECT
      return result.rows.map(row => {
        const formattedRow = {};
        // Convertir el objeto row a formato clave-valor
        Object.keys(row).forEach(key => {
          formattedRow[key] = row[key];
        });
        return formattedRow;
      });
    } else {
      // Para consultas INSERT/UPDATE/DELETE
      return {
        lastID: result.lastInsertRowid,
        changes: result.rowsAffected
      };
    }
  } catch (error) {
    console.error('Error ejecutando consulta en Turso:', error);
    throw error;
  }
}

// Función para convertir resultados al formato esperado por la aplicación
export function formatResults(result) {
  // Si result ya es un array, devolverlo directamente
  if (Array.isArray(result)) {
    return result;
  }
  
  if (!result || !result.rows) {
    return [];
  }
  
  return result.rows.map(row => {
    const formattedRow = {};
    for (const [key, value] of Object.entries(row)) {
      formattedRow[key] = value;
    }
    return formattedRow;
  });
}