-- Database schema for objectives and tasks system
-- Compatible with SQLite/Turso and MySQL

-- Create objectives table
CREATE TABLE IF NOT EXISTS objectives (
  id TEXT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  group_id BLOB NOT NULL,
  created_by TEXT NOT NULL,
  deadline DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  objective_id TEXT NOT NULL,
  assigned_to TEXT,
  created_by TEXT NOT NULL,  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_objectives_group_id ON objectives(group_id);
CREATE INDEX IF NOT EXISTS idx_objectives_created_by ON objectives(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_objective_id ON tasks(objective_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
