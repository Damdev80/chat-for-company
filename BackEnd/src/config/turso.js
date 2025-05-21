import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Cargar variables de entorno según el entorno
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

// Inicializar cliente de Turso
export const tursoClient = createClient({
  url: process.env.TURSO_URL || 'libsql://[tu-db].turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

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