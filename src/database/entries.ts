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
  const tags = entry.tags || '';
  const db = await getDb();
  try {
    await db.runAsync(
      'INSERT INTO entries (id, content, createdAt, updatedAt, date, time, latitude, longitude, locationFull, locationDisplay, weather, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [entry.id, entry.content, entry.createdAt, entry.updatedAt, entry.date, entry.time || null, entry.latitude || null, entry.longitude || null, entry.locationFull || null, entry.locationDisplay || null, entry.weather || null, tags || null]
    );
    
    // Update tag counts
    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const tag of tagList) {
        await updateTagCount(tag, 1);
      }
    }
  } catch (error) {
    console.error('createEntry error:', error);
    throw error;
  }
};

export const updateEntry = async (id: string, content: string, updatedAt: number, date?: string, time?: string, latitude?: number, longitude?: number, locationFull?: string, locationDisplay?: string, weather?: string, tags?: string) => {
  const db = await getDb();

  await db.runAsync(
    'UPDATE entries SET content = ?, updatedAt = ?, date = ?, time = ?, latitude = ?, longitude = ?, locationFull = ?, locationDisplay = ?, weather = ?, tags = ? WHERE id = ?',
    [content, updatedAt, date || null, time || null, latitude || null, longitude || null, locationFull || null, locationDisplay || null, weather || null, tags || null, id]
  );
};

export const deleteEntry = async (id: string) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
  await db.runAsync('DELETE FROM media WHERE entryId = ?', [id]);
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

export const getEntriesByTags = async (tags: string[]): Promise<Entry[]> => {
  if (tags.length === 0) {
    return getAllEntries();
  }
  
  const db = await getDb();
  const conditions = tags.map(() => `tags LIKE ?`).join(' AND ');
  const params = tags.map(tag => `%${tag}%`);
  
  const allRows = await db.getAllAsync<Entry>(
    `SELECT * FROM entries WHERE ${conditions} ORDER BY date DESC, createdAt DESC`,
    params
  );
  const allMedia = await db.getAllAsync<Media>('SELECT * FROM media ORDER BY createdAt ASC');
  
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
