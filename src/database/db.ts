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
      latitude REAL,
      longitude REAL,
      locationFull TEXT,
      locationDisplay TEXT,
      weather TEXT,
      tags TEXT
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
    await database.runAsync('ALTER TABLE entries ADD COLUMN latitude REAL');
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await database.runAsync('ALTER TABLE entries ADD COLUMN longitude REAL');
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await database.runAsync('ALTER TABLE entries ADD COLUMN locationFull TEXT');
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await database.runAsync('ALTER TABLE entries ADD COLUMN locationDisplay TEXT');
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await database.runAsync('ALTER TABLE entries ADD COLUMN weather TEXT');
  } catch (e) {
    // Column might already exist, ignore error
  }
  try {
    await database.runAsync('ALTER TABLE entries ADD COLUMN tags TEXT');
  } catch (e) {
    // Column might already exist, ignore error
  }

  // Initialize tags database and recalculate counts
  const { initTagsDb, recalculateAllTagCounts } = await import('./tags');
  await initTagsDb();
  await recalculateAllTagCounts();
};
