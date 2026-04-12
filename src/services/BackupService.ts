import { Paths, File } from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform, Share } from 'react-native';
import { exportAllData } from '../database/unifiedDb';
import { Entry } from '../types/Entry';
import { Media } from '../types/Media';
import { TagEntry } from '../storage/WebDatabase';

const CONFIG = {
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

WebBrowser.maybeCompleteAuthSession();

export interface BackupData {
  version: string;
  createdAt: number;
  platform: string;
  entries: Entry[];
  media: Media[];
  tags: TagEntry[];
  settings?: Record<string, string>;
}

export interface BackupInfo {
  size: number;
  entryCount: number;
  mediaCount: number;
  createdAt: number;
}

export const createBackupJson = async (): Promise<BackupData> => {
  const data = await exportAllData();
  return {
    version: '1.0',
    createdAt: Date.now(),
    platform: Platform.OS,
    entries: data?.entries || [],
    media: data?.media || [],
    tags: data?.tags || [],
  };
};

export const getBackupInfo = async (): Promise<BackupInfo> => {
  const backup = await createBackupJson();
  const jsonString = JSON.stringify(backup);
  return {
    size: new Blob([jsonString]).size,
    entryCount: backup.entries.length,
    mediaCount: backup.media.length,
    createdAt: backup.createdAt,
  };
};

export const shareBackupFile = async (): Promise<boolean> => {
  try {
    const backup = await createBackupJson();
    const jsonString = JSON.stringify(backup, null, 2);
    
    if (Platform.OS === 'web') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daylog_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } else {
      const file = new File(Paths.cache, 'daylog_backup.json');
      await file.write(jsonString);
      
      await Share.share({
        url: file.uri,
        message: 'DayLog Backup',
      });
      return true;
    }
  } catch (error) {
    console.error('Failed to share backup:', error);
    return false;
  }
};

export const getGoogleAuthRequest = () => {
  return Google.useAuthRequest({
    iosClientId: CONFIG.iosClientId,
    androidClientId: CONFIG.androidClientId,
    webClientId: CONFIG.webClientId,
    scopes: ['https://www.googleapis.com/auth/drive.appdata'],
  });
};

export const uploadBackupToDrive = async (accessToken: string): Promise<boolean> => {
  try {
    const backup = await createBackupJson();
    const jsonString = JSON.stringify(backup);
    const metadata = {
      name: `daylog_backup_${new Date().toISOString().split('T')[0]}.json`,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    };

    const boundary = 'boundary_' + Math.random().toString(36).substring(2);
    const body = [
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      JSON.stringify(metadata),
      '',
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      jsonString,
      '',
      `--${boundary}--`,
    ].join('\n');

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to upload backup:', error);
    return false;
  }
};

export const downloadBackupFromDrive = async (accessToken: string, fileId: string): Promise<BackupData | null> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) return null;

    const text = await response.text();
    const data = JSON.parse(text) as BackupData;
    return data;
  } catch (error) {
    console.error('Failed to download backup from drive:', error);
    return null;
  }
};

export const listBackupsOnDrive = async (accessToken: string): Promise<{ id: string; name: string; modifiedTime: string }[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='appDataFolder'+in+parents+and+name+contains+'daylog_backup'&orderBy=modifiedTime+desc&fields=files(id,name,modifiedTime)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to list backups:', error);
    return [];
  }
};
