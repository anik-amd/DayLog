import { getDb } from './db';
import { Media } from '../types/Media';

export const addMediaToEntry = async (media: Media) => {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO media (id, entryId, type, path, createdAt) VALUES (?, ?, ?, ?, ?)',
    [media.id, media.entryId, media.type, media.path, media.createdAt]
  );
};

export const deleteMedia = async (id: string) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM media WHERE id = ?', [id]);
};
