// scripts/migrate-password-reset.js
import { getConnection } from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración para campos de reset de contraseña...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../src/config/add-password-reset-fields.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir en statements individuales
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    const connection = await getConnection();
    
    for (const statement of statements) {
      if (statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX')) {
        try {
          console.log(`Ejecutando: ${statement.substring(0, 50)}...`);
          await connection.execute(statement);
          console.log('✅ Statement ejecutado correctamente');
        } catch (error) {
          if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
            console.log('⚠️  Campo ya existe, saltando...');
          } else {
            console.error('❌ Error ejecutando statement:', error.message);
          }
        }
      }
    }
    
    connection.end();
    console.log('✅ Migración completada exitosamente');
    
    // Verificar estructura de la tabla
    console.log('\n📋 Verificando estructura de la tabla users...');
    const connection2 = await getConnection();
    const [rows] = await connection2.execute('PRAGMA table_info(users)');
    console.log('Campos en la tabla users:');
    rows.forEach(row => {
      console.log(`  - ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : 'NULL'}`);
    });
    connection2.end();
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

runMigration();
