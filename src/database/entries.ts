import { getDb } from './db';
import { Entry } from '../types/Entry';

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
};

export const getEntry = async (id: string): Promise<Entry | null> => {
  const db = await getDb();
  const entry = await db.getFirstAsync<Entry>('SELECT * FROM entries WHERE id = ?', [id]);
  return entry || null;
};

export const getAllEntries = async (): Promise<Entry[]> => {
  const db = await getDb();
  const allRows = await db.getAllAsync<Entry>('SELECT * FROM entries ORDER BY createdAt DESC');
  return allRows;
};
