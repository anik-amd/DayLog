import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Google Project Config Placeholder
// In a real production app, these should be managed via environment variables or a config service.
const CONFIG = {
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

WebBrowser.maybeCompleteAuthSession();

export interface BackupStatus {
  lastSync: number | null;
  isConnected: boolean;
  userEmail: string | null;
}

export const useBackupEngine = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: CONFIG.iosClientId,
    androidClientId: CONFIG.androidClientId,
    webClientId: CONFIG.webClientId,
    scopes: ['https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/userinfo.email'],
  });

  const uploadBackup = async (accessToken: string) => {
    try {
      const dbPath = (FileSystem as any).documentDirectory + 'SQLite/daylog.db';
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      
      if (!fileInfo.exists) {
        throw new Error("Database file doesn't exist yet.");
      }

      // 1. Create Metadata for Google Drive (multipart upload)
      const metadata = {
        name: 'daylog_backup.db',
        parents: ['appDataFolder'], // Store in private app data folder
      };

      // 2. Perform multipart upload
      const response = await FileSystem.uploadAsync(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        dbPath,
        {
          httpMethod: 'POST',
          uploadType: (FileSystem as any).FileSystemUploadType.MULTIPART,
          fieldName: 'content',
          parameters: {
            metadata: JSON.stringify(metadata)
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status !== 200) {
        console.error("Upload failed", response.body);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Backup implementation error:", error);
      return false;
    }
  };

  return { request, response, promptAsync, uploadBackup };
};
