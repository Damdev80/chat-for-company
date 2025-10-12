// scripts/migrate-password-reset-turso.js
// Script para agregar columnas de reset de contraseña en Turso (producción)
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env.production') });

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración de password reset en Turso (PRODUCCIÓN)...\n');
    
    // Validar que las variables de entorno estén configuradas
    if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.error('❌ Error: Variables de entorno TURSO_URL y TURSO_AUTH_TOKEN no configuradas');
      console.error('   Verifica tu archivo .env.production');
      process.exit(1);
    }

    console.log('📡 Conectando a Turso...');
    console.log('   URL:', process.env.TURSO_URL.substring(0, 50) + '...');
    
    // Crear cliente de Turso
    const client = createClient({
      url: process.env.TURSO_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('✅ Conectado a Turso\n');

    // Verificar estructura actual de la tabla
    console.log('🔍 Verificando estructura actual de la tabla users...');
    const tableInfo = await client.execute('PRAGMA table_info(users)');
    
    console.log('📋 Columnas actuales:');
    const columns = tableInfo.rows.map(row => row.name);
    columns.forEach(col => console.log(`   - ${col}`));
    console.log('');

    // Verificar si las columnas ya existen
    const hasResetToken = columns.includes('reset_token');
    const hasResetTokenExpiry = columns.includes('reset_token_expiry');

    if (hasResetToken && hasResetTokenExpiry) {
      console.log('✅ Las columnas de reset ya existen. No se requiere migración.');
      process.exit(0);
    }

    // Agregar columnas si no existen
    console.log('🔧 Agregando columnas de reset de contraseña...\n');

    if (!hasResetToken) {
      console.log('   Agregando columna reset_token...');
      await client.execute('ALTER TABLE users ADD COLUMN reset_token TEXT');
      console.log('   ✅ Columna reset_token agregada');
    } else {
      console.log('   ⏭️  Columna reset_token ya existe');
    }

    if (!hasResetTokenExpiry) {
      console.log('   Agregando columna reset_token_expiry...');
      await client.execute('ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME');
      console.log('   ✅ Columna reset_token_expiry agregada');
    } else {
      console.log('   ⏭️  Columna reset_token_expiry ya existe');
    }

    // Crear índice
    console.log('\n📑 Creando índice para reset_token...');
    try {
      await client.execute('CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)');
      console.log('   ✅ Índice creado');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('   ⏭️  Índice ya existe');
      } else {
        throw error;
      }
    }

    // Verificar resultado
    console.log('\n🔍 Verificando estructura actualizada...');
    const updatedTableInfo = await client.execute('PRAGMA table_info(users)');
    
    console.log('📋 Columnas finales:');
    updatedTableInfo.rows.forEach(row => {
      const marker = (row.name === 'reset_token' || row.name === 'reset_token_expiry') ? '🆕' : '  ';
      console.log(`${marker} - ${row.name} (${row.type})`);
    });

    console.log('\n✅ Migración completada exitosamente!');
    console.log('   La funcionalidad de recuperación de contraseña está lista en producción.\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar migración
runMigration();
