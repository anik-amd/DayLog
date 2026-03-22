import { getDb } from './db';
import { Entry } from '../types/Entry';
import { Media } from '../types/Media';
import { updateTagCount } from './tags';

const extractTags = (content: string): string[] => {
  const matches = content.match(/#(\w+)/g);
  if (!matches) return [];
  return [...new Set(matches.map(t => t.substring(1).toLowerCase()))];
};

export const createEntry = async (entry: Omit<Entry, 'media'>) => {
  console.log('createEntry called with:', entry);
  const db = await getDb();
  try {
    await db.runAsync(
      'INSERT INTO entries (id, content, createdAt, updatedAt, date, time, location, weather, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [entry.id, entry.content, entry.createdAt, entry.updatedAt, entry.date, entry.time || null, entry.location || null, entry.weather || null, entry.tags || null]
    );
    console.log('createEntry completed');

    // Sync tag counts
    const tags = extractTags(entry.content);
    for (const tag of tags) {
      updateTagCount(tag, 1).catch(() => {});
    }
  } catch (error) {
    console.error('createEntry error:', error);
    throw error;
  }
};

export const updateEntry = async (id: string, content: string, updatedAt: number, date?: string, time?: string, location?: string, weather?: string, tags?: string) => {
  const db = await getDb();

  // Get old tags before updating
  const old = await db.getFirstAsync<{ tags: string | null }>('SELECT tags FROM entries WHERE id = ?', [id]);
  const oldTags = old?.tags ? extractTags(old.tags) : [];
  const newTags = extractTags(content);

  // Calculate tag differences
  const added = newTags.filter(t => !oldTags.includes(t));
  const removed = oldTags.filter(t => !newTags.includes(t));

  await db.runAsync(
    'UPDATE entries SET content = ?, updatedAt = ?, date = ?, time = ?, location = ?, weather = ?, tags = ? WHERE id = ?',
    [content, updatedAt, date || null, time || null, location || null, weather || null, tags || null, id]
  );

  // Sync tag counts
  for (const tag of added) updateTagCount(tag, 1).catch(() => {});
  for (const tag of removed) updateTagCount(tag, -1).catch(() => {});
};

export const deleteEntry = async (id: string) => {
  const db = await getDb();
  
  // Get tags before deleting
  const entry = await db.getFirstAsync<{ tags: string | null }>('SELECT tags FROM entries WHERE id = ?', [id]);
  const tags = entry?.tags ? extractTags(entry.tags) : [];

  await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
  await db.runAsync('DELETE FROM media WHERE entryId = ?', [id]); // Cascade manually for absolute safety

  // Sync tag counts
  for (const tag of tags) updateTagCount(tag, -1).catch(() => {});
};

export const getEntry = async (id: string): Promise<Entry | null> => {
  const db = await getDb();
  const entry = await db.getFirstAsync<Entry>('SELECT * FROM entries WHERE id = ?', [id]);
  if (!entry) return null;
  const mediaItems = await db.getAllAsync<Media>('SELECT * FROM media WHERE entryId = ?', [id]);
  return { ...entry, media: mediaItems };
};

export const getAllEntries = async (): Promise<Entry[]> => {
  const db = await getDb();
  const allRows = await db.getAllAsync<Entry>('SELECT * FROM entries ORDER BY date DESC, createdAt DESC');
  const allMedia = await db.getAllAsync<Media>('SELECT * FROM media ORDER BY createdAt ASC');

  // Performantly group array relationships in raw client memory rather than complex SQL mapping
  const mediaMap = allMedia.reduce((acc, mediaItem) => {
    if (!acc[mediaItem.entryId]) acc[mediaItem.entryId] = [];
    acc[mediaItem.entryId].push(mediaItem);
    return acc;
  }, {} as Record<string, Media[]>);

  return allRows.map(entry => ({
    ...entry,
    media: mediaMap[entry.id] || []
  }));
};

export const getAppStats = async () => {
    const db = await getDb();
    const entryCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM entries');
    const mediaCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM media');
    return {
        entries: entryCount?.count || 0,
        photos: mediaCount?.count || 0
    };
};
