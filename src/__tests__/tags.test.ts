/**
 * Unit tests for Tag Database Operations
 * 
 * These tests verify the tag tracking functionality including:
 * - Creating and initializing the tags table
 * - Updating tag counts (increment/decrement)
 * - Getting all tags with their counts
 * - Recalculating all tag counts from entries
 * - Deleting tags
 */

import * as SQLite from 'expo-sqlite';

// Mock the expo-sqlite module
const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue(undefined),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
}));

// Import after mocking
import {
  initTagsDb,
  updateTagCount,
  getAllTags,
  deleteTag,
  recalculateAllTagCounts,
  TagEntry,
} from '../database/tags';

describe('Tags Database', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Reset mock implementations
    mockDb.execAsync.mockResolvedValue(undefined);
    mockDb.runAsync.mockResolvedValue(undefined);
    mockDb.getFirstAsync.mockResolvedValue(null);
    mockDb.getAllAsync.mockResolvedValue([]);
  });

  describe('initTagsDb', () => {
    it('should create the tags table', async () => {
      await initTagsDb();
      
      expect(mockDb.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS tags'));
    });

    it('should create tags table with correct schema', async () => {
      await initTagsDb();
      
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('name TEXT PRIMARY KEY NOT NULL')
      );
      expect(mockDb.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('count INTEGER DEFAULT 0')
      );
    });
  });

  describe('updateTagCount', () => {
    it('should insert a new tag with count 1 when it does not exist', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await updateTagCount('work', 1);
      
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tags'),
        ['work', 1]
      );
    });

    it('should update existing tag count', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await updateTagCount('work', 1);
      
      // Uses ON CONFLICT to update existing row
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT'),
        ['work', 1]
      );
    });

    it('should handle negative delta (decrement)', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await updateTagCount('work', -1);
      
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tags'),
        ['work', -1]
      );
    });

    it('should handle case insensitivity', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await updateTagCount('WORK', 1);
      
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        ['WORK', 1]
      );
    });
  });

  describe('getAllTags', () => {
    it('should return all tags ordered by count descending', async () => {
      const mockTags: TagEntry[] = [
        { name: 'work', count: 5 },
        { name: 'react', count: 3 },
        { name: 'home', count: 2 },
      ];
      
      mockDb.getAllAsync.mockResolvedValue(mockTags);
      
      const result = await getAllTags();
      
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY count DESC')
      );
      expect(result).toEqual(mockTags);
    });

    it('should return empty array when no tags exist', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);
      
      const result = await getAllTags();
      
      expect(result).toEqual([]);
    });

    it('should return tags with correct structure', async () => {
      const mockTags: TagEntry[] = [
        { name: 'typescript', count: 10 },
      ];
      
      mockDb.getAllAsync.mockResolvedValue(mockTags);
      
      const result = await getAllTags();
      
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('count');
      expect(typeof result[0].name).toBe('string');
      expect(typeof result[0].count).toBe('number');
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag by name', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await deleteTag('work');
      
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM tags'),
        ['work']
      );
    });

    it('should handle deleting non-existent tag', async () => {
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await expect(deleteTag('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('recalculateAllTagCounts', () => {
    it('should delete all existing tags first', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);
      
      await recalculateAllTagCounts();
      
      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM tags');
    });

    it('should query all entries with tags', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);
      
      await recalculateAllTagCounts();
      
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, tags FROM entries')
      );
    });

    it('should count tags correctly for single entry', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', tags: 'work,home' },
      ]);
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await recalculateAllTagCounts();
      
      // Should insert work and home tags
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['work', 1]
      );
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['home', 1]
      );
    });

    it('should count multiple occurrences of same tag', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', tags: 'work' },
        { id: '2', tags: 'work' },
        { id: '3', tags: 'work' },
      ]);
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await recalculateAllTagCounts();
      
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['work', 3]
      );
    });

    it('should handle entries with no tags', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', tags: 'work' },
        { id: '2', tags: null },
        { id: '3', tags: '' },
      ]);
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await recalculateAllTagCounts();
      
      // Should only insert 'work' tag
      const insertCalls = mockDb.runAsync.mock.calls.filter(
        call => call[0].includes('INSERT')
      );
      expect(insertCalls).toHaveLength(1);
      expect(insertCalls[0][1]).toEqual(['work', 1]);
    });

    it('should normalize tags to lowercase', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', tags: 'WORK' },
        { id: '2', tags: 'Work' },
        { id: '3', tags: 'wOrK' },
      ]);
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await recalculateAllTagCounts();
      
      // Should count 3 as lowercase 'work'
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT'),
        ['work', 3]
      );
    });

    it('should trim whitespace from tags', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', tags: ' work , home , react ' },
      ]);
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await recalculateAllTagCounts();
      
      // Should normalize to work, home, react
      const insertCalls = mockDb.runAsync.mock.calls.filter(
        call => call[0].includes('INSERT')
      );
      expect(insertCalls).toHaveLength(3);
    });

    it('should filter empty tags', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', tags: 'work,,home,' },
      ]);
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await recalculateAllTagCounts();
      
      // Should only insert work and home, not empty strings
      const insertCalls = mockDb.runAsync.mock.calls.filter(
        call => call[0].includes('INSERT')
      );
      expect(insertCalls).toHaveLength(2);
    });

    it('should handle multiple tags per entry', async () => {
      mockDb.getAllAsync.mockResolvedValue([
        { id: '1', tags: 'work,react,typescript' },
        { id: '2', tags: 'work,testing' },
      ]);
      mockDb.runAsync.mockResolvedValue(undefined);
      
      await recalculateAllTagCounts();
      
      const insertCalls = mockDb.runAsync.mock.calls.filter(
        call => call[0].includes('INSERT')
      );
      
      // Should have: work=2, react=1, typescript=1, testing=1
      expect(insertCalls).toHaveLength(4);
    });
  });
});
