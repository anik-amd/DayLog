import { getDb } from './db';

export interface TagEntry {
  name: string;
  count: number;
}

export const initTagsDb = async () => {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tags (
      name TEXT PRIMARY KEY NOT NULL,
      count INTEGER DEFAULT 0
    );
  `);
};

export const updateTagCount = async (tagName: string, delta: number) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO tags (name, count) VALUES (?, 1)
     ON CONFLICT(name) DO UPDATE SET count = count + ?`,
    [tagName, delta]
  );
};

export const getAllTags = async (): Promise<TagEntry[]> => {
  const db = await getDb();
  const result = await db.getAllAsync<TagEntry>(
    'SELECT name, count FROM tags ORDER BY count DESC'
  );
  return result;
};

export const deleteTag = async (tagName: string) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM tags WHERE name = ?', [tagName]);
};

export const recalculateAllTagCounts = async () => {
  const db = await getDb();
  
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
    await db.runAsync('INSERT OR REPLACE INTO tags (name, count) VALUES (?, ?)', [name, count]);
  }
};
