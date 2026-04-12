import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Entry } from '../types/Entry';
import { Media } from '../types/Media';

const PREFIX = 'daylog_';
const ENTRIES_KEY = `${PREFIX}entries`;
const MEDIA_KEY = `${PREFIX}media`;
const TAGS_KEY = `${PREFIX}tags`;

export interface TagEntry {
  name: string;
  count: number;
  createdAt?: number;
}

interface WebDbData {
  entries: Entry[];
  media: Media[];
  tags: TagEntry[];
  lastUpdated: number;
}

let memoryCache: WebDbData | null = null;

export const initWebDb = async (): Promise<void> => {
  if (Platform.OS !== 'web') return;
  
  try {
    const data = await AsyncStorage.getItem(`${PREFIX}database`);
    if (data) {
      memoryCache = JSON.parse(data);
    } else {
      memoryCache = { entries: [], media: [], tags: [], lastUpdated: Date.now() };
    }
  } catch (e) {
    console.error('Failed to load web database:', e);
    memoryCache = { entries: [], media: [], tags: [], lastUpdated: Date.now() };
  }
};

const saveWebDb = async (): Promise<void> => {
  if (Platform.OS !== 'web' || !memoryCache) return;
  
  try {
    memoryCache.lastUpdated = Date.now();
    await AsyncStorage.setItem(`${PREFIX}database`, JSON.stringify(memoryCache));
  } catch (e) {
    console.error('Failed to save web database:', e);
  }
};

export const getWebEntries = (): Entry[] => {
  return memoryCache?.entries || [];
};

export const setWebEntries = async (entries: Entry[]): Promise<void> => {
  if (!memoryCache) memoryCache = { entries: [], media: [], tags: [], lastUpdated: Date.now() };
  memoryCache.entries = entries;
  await saveWebDb();
};

export const getWebMedia = (): Media[] => {
  return memoryCache?.media || [];
};

export const setWebMedia = async (media: Media[]): Promise<void> => {
  if (!memoryCache) memoryCache = { entries: [], media: [], tags: [], lastUpdated: Date.now() };
  memoryCache.media = media;
  await saveWebDb();
};

export const getWebTags = (): TagEntry[] => {
  return memoryCache?.tags || [];
};

export const setWebTags = async (tags: TagEntry[]): Promise<void> => {
  if (!memoryCache) memoryCache = { entries: [], media: [], tags: [], lastUpdated: Date.now() };
  memoryCache.tags = tags;
  await saveWebDb();
};

export const getLastUpdated = (): number => {
  return memoryCache?.lastUpdated || Date.now();
};

export const isWebDbReady = (): boolean => {
  return memoryCache !== null;
};

export const webDbFullExport = (): WebDbData | null => {
  return memoryCache;
};

export const webDbFullImport = async (data: WebDbData): Promise<void> => {
  memoryCache = data;
  await saveWebDb();
};

export const clearWebDb = async (): Promise<void> => {
  memoryCache = { entries: [], media: [], tags: [], lastUpdated: Date.now() };
  await saveWebDb();
};
