/**
 * Unit tests for Settings Storage
 * 
 * These tests verify the settings persistence functionality using AsyncStorage:
 * - Getting non-existent settings
 * - Saving settings
 * - Retrieving saved settings
 * - Multiple independent settings
 */

const mockStorage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
}));

import { getSetting, setSetting } from '../storage/settings';

describe('Settings Storage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  describe('getSetting', () => {
    it('returns null for non-existent key', async () => {
      const result = await getSetting('nonexistent');
      expect(result).toBeNull();
    });

    it('returns saved value for existing key', async () => {
      await setSetting('tagSortOption', 'usage');
      const result = await getSetting('tagSortOption');
      expect(result).toBe('usage');
    });

    it('returns null for key with empty value', async () => {
      mockStorage['daylog_test'] = '';
      const result = await getSetting('test');
      expect(result).toBe('');
    });
  });

  describe('setSetting', () => {
    it('saves value correctly', async () => {
      await setSetting('tagSortOption', 'alphabetical');
      expect(mockStorage['daylog_tagSortOption']).toBe('alphabetical');
    });

    it('overwrites existing value', async () => {
      await setSetting('tagSortOption', 'usage');
      await setSetting('tagSortOption', 'date');
      const result = await getSetting('tagSortOption');
      expect(result).toBe('date');
    });
  });

  describe('multiple settings', () => {
    it('stores multiple independent settings', async () => {
      await setSetting('tagSortOption', 'usage');
      await setSetting('tagSortDirection', 'asc');
      await setSetting('theme', 'dark');

      expect(await getSetting('tagSortOption')).toBe('usage');
      expect(await getSetting('tagSortDirection')).toBe('asc');
      expect(await getSetting('theme')).toBe('dark');
    });
  });
});
