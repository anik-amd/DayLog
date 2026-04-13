import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Entry } from '../types/Entry';
import { Media } from '../types/Media';
import {
  initWebDb,
  getWebEntries,
  setWebEntries,
  getWebMedia,
  setWebMedia,
  getWebTags,
  setWebTags,
  webDbFullExport,
  webDbFullImport,
  clearWebDb,
  TagEntry,
} from '../storage/WebDatabase';
export type { TagEntry } from '../storage/WebDatabase';

let db: SQLite.SQLiteDatabase | null = null;
let isWeb = Platform.OS === 'web';
let webDbInitialized = false;

export const initDb = async () => {
  isWeb = Platform.OS === 'web';
  
  if (isWeb) {
    if (!webDbInitialized) {
      await initWebDb();
      webDbInitialized = true;
    }
  } else {
    if (!db) {
      db = await SQLite.openDatabaseAsync('daylog.db');
      await db.execAsync(`
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
        CREATE TABLE IF NOT EXISTS tags (
          name TEXT PRIMARY KEY NOT NULL,
          count INTEGER DEFAULT 0,
          createdAt INTEGER
        );
      `);
      
      await migrateDb(db);
    }
  }
};

const migrateDb = async (database: SQLite.SQLiteDatabase) => {
  const columns = ['time', 'latitude', 'longitude', 'locationFull', 'locationDisplay', 'weather', 'tags'];
  
  for (const col of columns) {
    try {
      await database.runAsync(`ALTER TABLE entries ADD COLUMN ${col} TEXT`);
    } catch (e) {}
  }
  
  try {
    await database.runAsync(`ALTER TABLE tags ADD COLUMN createdAt INTEGER`);
  } catch (e) {}
};

export const createEntry = async (entry: Omit<Entry, 'media'>) => {
  if (isWeb) {
    const entries = getWebEntries();
    entries.push({ ...entry, media: [] });
    await setWebEntries(entries);
  } else {
    if (!db) await initDb();
    await db!.runAsync(
      'INSERT INTO entries (id, content, createdAt, updatedAt, date, time, latitude, longitude, locationFull, locationDisplay, weather, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [entry.id, entry.content, entry.createdAt, entry.updatedAt, entry.date, entry.time || null, entry.latitude || null, entry.longitude || null, entry.locationFull || null, entry.locationDisplay || null, entry.weather || null, entry.tags || null]
    );
  }
};

export const updateEntry = async (id: string, content: string, updatedAt: number, date?: string, time?: string, latitude?: number, longitude?: number, locationFull?: string, locationDisplay?: string, weather?: string, tags?: string) => {
  if (isWeb) {
    const entries = getWebEntries();
    const idx = entries.findIndex(e => e.id === id);
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], content, updatedAt, date: date || entries[idx].date, time, latitude, longitude, locationFull, locationDisplay, weather, tags };
      await setWebEntries(entries);
    }
  } else {
    if (!db) await initDb();
    await db!.runAsync(
      'UPDATE entries SET content = ?, updatedAt = ?, date = ?, time = ?, latitude = ?, longitude = ?, locationFull = ?, locationDisplay = ?, weather = ?, tags = ? WHERE id = ?',
      [content, updatedAt, date || null, time || null, latitude || null, longitude || null, locationFull || null, locationDisplay || null, weather || null, tags || null, id]
    );
  }
};

export const deleteEntry = async (id: string) => {
  if (isWeb) {
    const entries = getWebEntries().filter(e => e.id !== id);
    await setWebEntries(entries);
    const media = getWebMedia().filter(m => m.entryId !== id);
    await setWebMedia(media);
  } else {
    if (!db) await initDb();
    await db!.runAsync('DELETE FROM entries WHERE id = ?', [id]);
    await db!.runAsync('DELETE FROM media WHERE entryId = ?', [id]);
  }
};

export const getEntry = async (id: string): Promise<Entry | null> => {
  if (isWeb) {
    const entries = getWebEntries();
    const entry = entries.find(e => e.id === id);
    if (!entry) return null;
    const media = getWebMedia().filter(m => m.entryId === id);
    return { ...entry, media };
  } else {
    if (!db) await initDb();
    const entry = await db!.getFirstAsync<Entry>('SELECT * FROM entries WHERE id = ?', [id]);
    if (!entry) return null;
    const mediaItems = await db!.getAllAsync<Media>('SELECT * FROM media WHERE entryId = ?', [id]);
    return { ...entry, media: mediaItems };
  }
};

export const getAllEntries = async (): Promise<Entry[]> => {
  if (isWeb) {
    const entries = getWebEntries();
    const media = getWebMedia();
    const mediaMap: Record<string, Media[]> = {};
    for (const m of media) {
      if (!mediaMap[m.entryId]) mediaMap[m.entryId] = [];
      mediaMap[m.entryId].push(m);
    }
    return entries.map(e => ({
      ...e,
      media: mediaMap[e.id] || []
    })).sort((a, b) => {
      const dateCompare = (b.date || '').localeCompare(a.date || '');
      if (dateCompare !== 0) return dateCompare;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  } else {
    if (!db) await initDb();
    const allRows = await db!.getAllAsync<Entry>('SELECT * FROM entries ORDER BY date DESC, createdAt DESC');
    const allMedia = await db!.getAllAsync<Media>('SELECT * FROM media ORDER BY createdAt ASC');
    const mediaMap: Record<string, Media[]> = {};
    for (const m of allMedia) {
      if (!mediaMap[m.entryId]) mediaMap[m.entryId] = [];
      mediaMap[m.entryId].push(m);
    }
    return allRows.map(e => ({
      ...e,
      media: mediaMap[e.id] || []
    }));
  }
};

export const getEntriesByTags = async (tags: string[]): Promise<Entry[]> => {
  const all = await getAllEntries();
  if (tags.length === 0) return all;
  return all.filter(entry => {
    if (!entry.tags) return false;
    const entryTags = entry.tags.split(',').map(t => t.trim().toLowerCase());
    return tags.every(tag => entryTags.includes(tag.toLowerCase()));
  });
};

export const addMediaToEntry = async (media: Media) => {
  if (isWeb) {
    const allMedia = getWebMedia();
    allMedia.push(media);
    await setWebMedia(allMedia);
  } else {
    if (!db) await initDb();
    await db!.runAsync(
      'INSERT INTO media (id, entryId, type, path, createdAt) VALUES (?, ?, ?, ?, ?)',
      [media.id, media.entryId, media.type, media.path, media.createdAt]
    );
  }
};

export const deleteMedia = async (id: string) => {
  if (isWeb) {
    const allMedia = getWebMedia().filter(m => m.id !== id);
    await setWebMedia(allMedia);
  } else {
    if (!db) await initDb();
    await db!.runAsync('DELETE FROM media WHERE id = ?', [id]);
  }
};

export const updateTagCount = async (tagName: string, delta: number) => {
  if (isWeb) {
    const tags = getWebTags();
    const idx = tags.findIndex(t => t.name.toLowerCase() === tagName.toLowerCase());
    if (idx >= 0) {
      tags[idx].count += delta;
      if (tags[idx].count <= 0) {
        tags.splice(idx, 1);
      }
    } else if (delta > 0) {
      tags.push({ name: tagName.toLowerCase(), count: delta, createdAt: Date.now() });
    }
    await setWebTags(tags);
  } else {
    if (!db) await initDb();
    const now = Date.now();
    await db!.runAsync(
      `INSERT INTO tags (name, count, createdAt) VALUES (?, 1, ?)
       ON CONFLICT(name) DO UPDATE SET count = count + ?, createdAt = COALESCE(createdAt, ?)`,
      [tagName.toLowerCase(), now, delta, now]
    );
  }
};

export const getAllTags = async (sortBy: 'usage' | 'alphabetical' | 'date' = 'usage', direction: 'asc' | 'desc' = 'desc'): Promise<TagEntry[]> => {
  if (isWeb) {
    const tags = getWebTags();
    const dir = direction === 'asc' ? 1 : -1;
    return [...tags].sort((a, b) => {
      switch (sortBy) {
        case 'usage': return (b.count - a.count) * dir;
        case 'alphabetical': return a.name.localeCompare(b.name) * dir;
        case 'date': return ((b.createdAt || 0) - (a.createdAt || 0)) * dir;
        default: return 0;
      }
    });
  } else {
    if (!db) await initDb();
    const dir = direction === 'asc' ? 'ASC' : 'DESC';
    let orderBy: string;
    switch (sortBy) {
      case 'usage': orderBy = `count ${dir}`; break;
      case 'alphabetical': orderBy = `name ${dir}`; break;
      case 'date': orderBy = `CASE WHEN createdAt IS NULL THEN 1 ELSE 0 END, createdAt ${dir}`; break;
      default: orderBy = `count ${dir}`;
    }
    return await db!.getAllAsync<TagEntry>(`SELECT name, count, createdAt FROM tags ORDER BY ${orderBy}`);
  }
};

export const deleteTag = async (tagName: string) => {
  if (isWeb) {
    const tags = getWebTags().filter(t => t.name !== tagName.toLowerCase());
    await setWebTags(tags);
  } else {
    if (!db) await initDb();
    await db!.runAsync('DELETE FROM tags WHERE name = ?', [tagName.toLowerCase()]);
  }
};

export const recalculateAllTagCounts = async () => {
  if (isWeb) {
    const entries = getWebEntries();
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      if (entry.tags && entry.tags.trim().length > 0) {
        const parts = entry.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
        for (const tag of parts) {
          counts[tag] = (counts[tag] || 0) + 1;
        }
      }
    }
    const tags: TagEntry[] = Object.entries(counts).map(([name, count]) => ({ name, count, createdAt: Date.now() }));
    await setWebTags(tags);
  } else {
    if (!db) await initDb();
    const existingTags = await db!.getAllAsync<{ name: string; createdAt: number | null }>('SELECT name, createdAt FROM tags');
    const existingCreatedAt: Record<string, number> = {};
    for (const tag of existingTags) {
      if (tag.createdAt) existingCreatedAt[tag.name] = tag.createdAt;
    }
    const entries = await db!.getAllAsync<{ id: string; tags: string | null }>("SELECT id, tags FROM entries WHERE tags IS NOT NULL AND length(tags) > 0");
    await db!.runAsync('DELETE FROM tags');
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
      await db!.runAsync('INSERT OR REPLACE INTO tags (name, count, createdAt) VALUES (?, ?, ?)', [name, count, createdAt]);
    }
  }
};

export const getAppStats = async () => {
  if (isWeb) {
    const entries = getWebEntries();
    const media = getWebMedia();
    return {
      entries: entries.length,
      photos: media.length,
    };
  } else {
    if (!db) await initDb();
    const entryCount = await db!.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM entries');
    const mediaCount = await db!.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM media');
    return {
      entries: entryCount?.count || 0,
      photos: mediaCount?.count || 0,
    };
  }
};

export const getEntriesGroupedByLocation = async (precision: number = 3) => {
  const entries = await getAllEntries();
  const groups: Record<string, { latitude: number; longitude: number; entryCount: number; tags: { name: string; count: number }[]; locationFull?: string }> = {};
  
  for (const entry of entries) {
    if (entry.latitude == null || entry.longitude == null) continue;
    const latKey = Number(entry.latitude.toFixed(precision));
    const lngKey = Number(entry.longitude.toFixed(precision));
    const key = `${latKey},${lngKey}`;
    
    if (!groups[key]) {
      groups[key] = { latitude: latKey, longitude: lngKey, entryCount: 0, tags: [], locationFull: entry.locationFull };
    }
    groups[key].entryCount++;
    
    if (entry.tags) {
      const entryTags = entry.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      for (const tag of entryTags) {
        const existingTag = groups[key].tags.find(t => t.name === tag);
        if (existingTag) {
          existingTag.count++;
        } else {
          groups[key].tags.push({ name: tag, count: 1 });
        }
      }
    }
  }
  
  for (const key of Object.keys(groups)) {
    groups[key].tags.sort((a, b) => b.count - a.count);
  }
  
  return Object.values(groups).sort((a, b) => b.entryCount - a.entryCount);
};

export const exportAllData = async () => {
  if (isWeb) {
    return webDbFullExport();
  } else {
    if (!db) await initDb();
    const entries = await db!.getAllAsync<Entry>('SELECT * FROM entries ORDER BY date DESC, createdAt DESC');
    const media = await db!.getAllAsync<Media>('SELECT * FROM media ORDER BY createdAt ASC');
    const tags = await db!.getAllAsync<TagEntry>('SELECT * FROM tags ORDER BY count DESC');
    return { entries, media, tags, lastUpdated: Date.now() };
  }
};

export const importAllData = async (data: { entries: Entry[]; media: Media[]; tags: TagEntry[] }) => {
  if (isWeb) {
    await webDbFullImport({ ...data, lastUpdated: Date.now() });
  } else {
    if (!db) await initDb();
    await db!.runAsync('DELETE FROM entries');
    await db!.runAsync('DELETE FROM media');
    await db!.runAsync('DELETE FROM tags');
    
    for (const entry of data.entries) {
      await db!.runAsync(
        'INSERT INTO entries (id, content, createdAt, updatedAt, date, time, latitude, longitude, locationFull, locationDisplay, weather, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [entry.id, entry.content, entry.createdAt, entry.updatedAt, entry.date, entry.time || null, entry.latitude || null, entry.longitude || null, entry.locationFull || null, entry.locationDisplay || null, entry.weather || null, entry.tags || null]
      );
    }
    for (const m of data.media) {
      await db!.runAsync(
        'INSERT INTO media (id, entryId, type, path, createdAt) VALUES (?, ?, ?, ?, ?)',
        [m.id, m.entryId, m.type, m.path, m.createdAt]
      );
    }
    for (const tag of data.tags) {
      await db!.runAsync(
        'INSERT INTO tags (name, count, createdAt) VALUES (?, ?, ?)',
        [tag.name, tag.count, tag.createdAt || Date.now()]
      );
    }
  }
};

export const clearAllData = async () => {
  if (isWeb) {
    await clearWebDb();
  } else {
    if (!db) await initDb();
    await db!.runAsync('DELETE FROM entries');
    await db!.runAsync('DELETE FROM media');
    await db!.runAsync('DELETE FROM tags');
  }
};

export interface LocationGroup {
  latitude: number;
  longitude: number;
  entryCount: number;
  tags: { name: string; count: number }[];
  locationFull?: string;
}

export const getEntriesAtLocation = async (
  latitude: number,
  longitude: number,
  precision: number = 3
): Promise<Entry[]> => {
  const entries = await getAllEntries();
  const roundedLat = Number(latitude.toFixed(precision));
  const roundedLon = Number(longitude.toFixed(precision));
  
  return entries
    .filter(e => {
      if (!e.latitude || !e.longitude) return false;
      return (
        Number(e.latitude.toFixed(precision)) === roundedLat &&
        Number(e.longitude.toFixed(precision)) === roundedLon
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50);
};

export type SortOption = 'usage' | 'alphabetical' | 'date';
export type SortDirection = 'asc' | 'desc';
