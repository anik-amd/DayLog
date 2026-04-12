import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Paths, File } from 'expo-file-system';
import { importAllData, clearAllData } from '../database/unifiedDb';
import { Entry } from '../types/Entry';
import { Media } from '../types/Media';
import { TagEntry } from '../storage/WebDatabase';

export interface BackupData {
  version: string;
  createdAt: number;
  platform: string;
  entries: Entry[];
  media: Media[];
  tags: TagEntry[];
  settings?: Record<string, string>;
}

export interface RestoreResult {
  success: boolean;
  entriesRestored: number;
  mediaRestored: number;
  tagsRestored: number;
  error?: string;
}

export const validateBackup = (data: any): data is BackupData => {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.version !== 'string') return false;
  if (typeof data.createdAt !== 'number') return false;
  if (!Array.isArray(data.entries)) return false;
  if (!Array.isArray(data.media)) return false;
  if (!Array.isArray(data.tags)) return false;
  return true;
};

export const parseBackupFile = async (uri: string): Promise<BackupData | null> => {
  try {
    if (Platform.OS === 'web') {
      return null;
    }
    
    const file = new File(uri);
    const content = await file.text();
    const data = JSON.parse(content);
    
    if (!validateBackup(data)) {
      console.error('Invalid backup format');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to parse backup file:', error);
    return null;
  }
};

export const restoreFromJson = async (data: BackupData, clearExisting: boolean = true): Promise<RestoreResult> => {
  try {
    if (clearExisting) {
      await clearAllData();
    }
    
    await importAllData({
      entries: data.entries,
      media: data.media,
      tags: data.tags,
    });
    
    return {
      success: true,
      entriesRestored: data.entries.length,
      mediaRestored: data.media.length,
      tagsRestored: data.tags.length,
    };
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return {
      success: false,
      entriesRestored: 0,
      mediaRestored: 0,
      tagsRestored: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const restoreFromUri = async (uri: string, clearExisting: boolean = true): Promise<RestoreResult> => {
  const data = await parseBackupFile(uri);
  if (!data) {
    return {
      success: false,
      entriesRestored: 0,
      mediaRestored: 0,
      tagsRestored: 0,
      error: 'Failed to parse backup file',
    };
  }
  
  return restoreFromJson(data, clearExisting);
};

export const restoreFromString = async (jsonString: string, clearExisting: boolean = true): Promise<RestoreResult> => {
  try {
    const data = JSON.parse(jsonString) as BackupData;
    
    if (!validateBackup(data)) {
      return {
        success: false,
        entriesRestored: 0,
        mediaRestored: 0,
        tagsRestored: 0,
        error: 'Invalid backup format',
      };
    }
    
    return restoreFromJson(data, clearExisting);
  } catch (error) {
    return {
      success: false,
      entriesRestored: 0,
      mediaRestored: 0,
      tagsRestored: 0,
      error: error instanceof Error ? error.message : 'Failed to parse JSON',
    };
  }
};
