import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('daylog.db');
  }
  return db;
};

export const initDb = async () => {
  const database = await getDb();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY NOT NULL,
      content TEXT,
      createdAt INTEGER,
      updatedAt INTEGER,
      date TEXT,
      time TEXT,
      location TEXT,
      weather TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY NOT NULL,
      entryId TEXT,
      type TEXT,
      path TEXT,
      createdAt INTEGER
    );
  `);
  
  // Migration: add new columns if they don't exist (for existing databases)
  try {
    await database.runAsync('ALTER TABLE entries ADD COLUMN time TEXT');
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await database.runAsync('ALTER TABLE entries ADD COLUMN location TEXT');
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await database.runAsync('ALTER TABLE entries ADD COLUMN weather TEXT');
  } catch (e) {
    // Column might already exist, ignore error
  }
};
