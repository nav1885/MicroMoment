import * as SQLite from 'expo-sqlite'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db
  db = await SQLite.openDatabaseAsync('micromoment.db')
  await initialiseDatabase(db)
  return db
}

export async function initialiseDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      time_estimate_min INTEGER NOT NULL CHECK(time_estimate_min BETWEEN 1 AND 5),
      time_of_day TEXT NOT NULL CHECK(time_of_day IN ('morning','afternoon','evening')),
      sort_order INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      completed_date TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      note TEXT,
      grace_used INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_completions_habit_id ON completions(habit_id);
    CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(completed_date);
    CREATE INDEX IF NOT EXISTS idx_habits_active ON habits(is_active);
  `)
}

export function closeDatabase(): void {
  db = null
}
