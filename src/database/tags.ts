import { getDb } from './db';

export interface TagEntry {
  name: string;
  count: number;
  createdAt?: number;
}

export type SortOption = 'mostUsed' | 'leastUsed' | 'az' | 'za' | 'newToOld' | 'oldToNew';

export const initTagsDb = async () => {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tags (
      name TEXT PRIMARY KEY NOT NULL,
      count INTEGER DEFAULT 0,
      createdAt INTEGER
    );
  `);
  
  // Migration: Add createdAt column if it doesn't exist
  try {
    await db.execAsync(`ALTER TABLE tags ADD COLUMN createdAt INTEGER`);
  } catch (e) {
    // Column already exists, ignore error
  }
};

export const updateTagCount = async (tagName: string, delta: number) => {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO tags (name, count, createdAt) VALUES (?, 1, ?)
     ON CONFLICT(name) DO UPDATE SET count = count + ?, createdAt = COALESCE(createdAt, ?)`,
    [tagName, now, delta, now]
  );
};

export const getAllTags = async (sortBy: SortOption = 'mostUsed'): Promise<TagEntry[]> => {
  const db = await getDb();
  
  let orderBy: string;
  switch (sortBy) {
    case 'mostUsed':
      orderBy = 'count DESC';
      break;
    case 'leastUsed':
      orderBy = 'count ASC';
      break;
    case 'az':
      orderBy = 'name ASC';
      break;
    case 'za':
      orderBy = 'name DESC';
      break;
    case 'newToOld':
      orderBy = 'CASE WHEN createdAt IS NULL THEN 1 ELSE 0 END, createdAt DESC';
      break;
    case 'oldToNew':
      orderBy = 'CASE WHEN createdAt IS NULL THEN 1 ELSE 0 END, createdAt ASC';
      break;
    default:
      orderBy = 'count DESC';
  }
  
  const result = await db.getAllAsync<TagEntry>(
    `SELECT name, count, createdAt FROM tags ORDER BY ${orderBy}`
  );
  return result;
};

export const deleteTag = async (tagName: string) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM tags WHERE name = ?', [tagName]);
};

export const recalculateAllTagCounts = async () => {
  const db = await getDb();
  
  const existingTags = await db.getAllAsync<{ name: string; createdAt: number | null }>(
    'SELECT name, createdAt FROM tags'
  );
  const existingCreatedAt: Record<string, number> = {};
  for (const tag of existingTags) {
    if (tag.createdAt) {
      existingCreatedAt[tag.name] = tag.createdAt;
    }
  }
  
  const entries = await db.getAllAsync<{ id: string; tags: string | null }>(
    "SELECT id, tags FROM entries WHERE tags IS NOT NULL AND length(tags) > 0"
  );

  await db.runAsync('DELETE FROM tags');

  const counts: Record<string, number> = {};
  for (const entry of entries) {
    if (entry.tags && entry.tags.trim().length > 0) {
      const parts = entry.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      for (const tag of parts) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
  }

  for (const [name, count] of Object.entries(counts)) {
    const createdAt = existingCreatedAt[name] || Date.now();
    await db.runAsync('INSERT OR REPLACE INTO tags (name, count, createdAt) VALUES (?, ?, ?)', [name, count, createdAt]);
  }
};
