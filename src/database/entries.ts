import { getDb } from './db';
import { Entry } from '../types/Entry';

import { Media } from '../types/Media';

export const createEntry = async (entry: Omit<Entry, 'media'>) => {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO entries (id, content, createdAt, updatedAt, date) VALUES (?, ?, ?, ?, ?)',
    [entry.id, entry.content, entry.createdAt, entry.updatedAt, entry.date]
  );
};

export const updateEntry = async (id: string, content: string, updatedAt: number) => {
  const db = await getDb();
  await db.runAsync(
    'UPDATE entries SET content = ?, updatedAt = ? WHERE id = ?',
    [content, updatedAt, id]
  );
};

export const deleteEntry = async (id: string) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
  await db.runAsync('DELETE FROM media WHERE entryId = ?', [id]); // Cascade manually for absolute safety
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
  const allRows = await db.getAllAsync<Entry>('SELECT * FROM entries ORDER BY createdAt DESC');
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
