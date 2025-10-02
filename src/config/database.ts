import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../data/task-planner.db');

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

type Migration = {
  id: string;
  statement: string;
};

const migrations: Migration[] = [
  {
    id: '001_create_tasks_table',
    statement: `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'pending',
        category TEXT NOT NULL DEFAULT 'general',
        due_date TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];

const ensureMigrationsTable = () => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `).run();
};

const isMigrationApplied = (id: string) => {
  const stmt = db.prepare('SELECT COUNT(1) as count FROM migrations WHERE id = ?');
  const result = stmt.get(id) as { count: number };
  return result.count > 0;
};

const markMigrationApplied = (id: string) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO migrations (id) VALUES (?)');
  stmt.run(id);
};

export const runMigrations = () => {
  ensureMigrationsTable();

  for (const migration of migrations) {
    if (!isMigrationApplied(migration.id)) {
      db.prepare(migration.statement).run();
      markMigrationApplied(migration.id);
    }
  }
};

export const resetDatabase = () => {
  db.prepare('DROP TABLE IF EXISTS tasks').run();
  db.prepare('DROP TABLE IF EXISTS migrations').run();
  runMigrations();
};
