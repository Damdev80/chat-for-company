-- schema.sql para Turso (SQLite)
-- Este archivo contiene el esquema para crear las tablas en Turso adaptado de MySQL

-- Tabla de roles (adaptado de MySQL)
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
-- Crear índice UNIQUE para name en roles
CREATE UNIQUE INDEX IF NOT EXISTS idx_roles_name ON roles (name);

-- Tabla de grupos (adaptado de MySQL binary(16) a TEXT para SQLite)
CREATE TABLE IF NOT EXISTS `groups` (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
-- Crear índice UNIQUE para name en groups
CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_name ON `groups` (name);

-- Tabla de usuarios (adaptado de MySQL)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  role_id TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET NULL
);
-- Crear índices UNIQUE para username y email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
-- Crear índice para role_id
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role_id);

-- Tabla de mensajes (adaptado de MySQL)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id TEXT,
  group_id TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE SET NULL
  -- No incluimos FK para group_id ya que en MySQL usa varchar(350) y no tiene restricción
);
-- Crear índice para sender_id
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);
-- Crear índice para group_id aunque no tenga FK
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages (group_id);

-- Datos iniciales
INSERT OR IGNORE INTO roles (id, name, description) VALUES ('admin', 'admin', 'Administrador del sistema');
INSERT OR IGNORE INTO roles (id, name, description) VALUES ('user', 'user', 'Usuario regular');
INSERT OR IGNORE INTO `groups` (id, name) VALUES ('global', 'Global');
