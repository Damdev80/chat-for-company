import { getConnection } from './src/config/db.js';

async function createTables() {
  try {
    console.log('🔄 Iniciando creación de tablas...');
    const connection = await getConnection();
    console.log('✅ Conexión a la base de datos establecida');
    
    console.log('📋 Creando tabla objectives...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS objectives (
        id TEXT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        group_id BLOB NOT NULL,
        created_by TEXT NOT NULL,
        deadline DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla objectives creada/verificada');    
    console.log('📋 Creando tabla tasks...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        objective_id TEXT NOT NULL,
        assigned_to TEXT,
        created_by TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla tasks creada/verificada');
    
    console.log('🔗 Creando índices...');    await connection.execute('CREATE INDEX IF NOT EXISTS idx_objectives_group_id ON objectives(group_id)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_objectives_created_by ON objectives(created_by)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_tasks_objective_id ON tasks(objective_id)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by)');
    await connection.execute('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)');
    console.log('✅ Índices creados/verificados');
    
    await connection.end();
    console.log('🎉 ¡Tablas e índices creados exitosamente!');
  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

createTables();
