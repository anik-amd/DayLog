import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'daylog_';

export const getSetting = async (key: string): Promise<string | null> => {
  return await AsyncStorage.getItem(`${PREFIX}${key}`);
};

export const setSetting = async (key: string, value: string) => {
  await AsyncStorage.setItem(`${PREFIX}${key}`, value);
};
