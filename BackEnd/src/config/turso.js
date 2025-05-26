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
  if (process.env.TURSO_URL && process.env.TURSO_AUTH_TOKEN && process.env.TURSO_URL !== 'libsql://[tu-db].turso.io') {
    tursoClient = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    console.log('✅ Cliente Turso inicializado correctamente');
  } else {
    console.log('⚠️ Configuración de Turso no encontrada, usando base de datos local');
  }
} catch (error) {
  console.log('⚠️ Error al inicializar Turso, usando base de datos local:', error.message);
}

export { tursoClient };

// Funciones auxiliares para ejecutar consultas
export async function executeQuery(query, params = []) {
  try {
    const result = await tursoClient.execute({ sql: query, args: params });
    return result;
  } catch (error) {
    console.error('Error ejecutando consulta en Turso:', error);
    throw error;
  }
}

// Función para convertir resultados al formato esperado por la aplicación
export function formatResults(result) {
  if (!result || !result.rows) return [];
  return result.rows.map(row => {
    const formattedRow = {};
    for (const [key, value] of Object.entries(row)) {
      formattedRow[key] = value;
    }
    return formattedRow;
  });
}