import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'daylog_';

const memoryCache: Record<string, string> = {};

export const getSetting = async (key: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(`${PREFIX}${key}`);
    if (value !== null) {
      memoryCache[key] = value;
    }
    return value;
  } catch (e) {
    // Fall back to memory cache if AsyncStorage fails
    return memoryCache[key] ?? null;
  }
};

export const setSetting = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(`${PREFIX}${key}`, value);
    memoryCache[key] = value;
  } catch (e) {
    // Store in memory if AsyncStorage fails
    memoryCache[key] = value;
  }
};

export const getTemperatureUnit = async (): Promise<'c' | 'f'> => {
  const unit = await getSetting('temperatureUnit');
  return (unit as 'c' | 'f') || 'c';
};

export const setTemperatureUnit = async (unit: 'c' | 'f') => {
  await setSetting('temperatureUnit', unit);
};
