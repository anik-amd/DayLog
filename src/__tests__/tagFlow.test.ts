/**
 * Integration tests for tag counting flow
 * Tests the complete flow from entry creation to tag count display
 */

import {
  recalculateAllTagCounts,
} from '../database/tags';

// Mock database state
let mockEntriesTable: Array<{ id: string; tags: string | null }> = [];
let mockTagsTable: Array<{ name: string; count: number }> = [];

// Mock the database
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockImplementation((sql: string, params?: any[]) => {
      // Simulate DELETE FROM tags
      if (sql.includes('DELETE FROM tags') && !sql.includes('WHERE')) {
        mockTagsTable = [];
        return Promise.resolve(undefined);
      }
      
      // Simulate INSERT OR REPLACE INTO tags
      if (sql.includes('INSERT')) {
        const [name, count] = params!;
        const existing = mockTagsTable.find(t => t.name === name);
        if (existing) {
          existing.count = count;
        } else {
          mockTagsTable.push({ name, count });
        }
        return Promise.resolve(undefined);
      }
      
      return Promise.resolve(undefined);
    }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockImplementation((sql: string) => {
      // Return entries with tags
      if (sql.includes('SELECT id, tags FROM entries')) {
        return Promise.resolve(mockEntriesTable.filter(e => e.tags !== null && e.tags !== ''));
      }
      
      // Return tags ordered by count desc
      if (sql.includes('SELECT name, count FROM tags')) {
        return Promise.resolve([...mockTagsTable].sort((a, b) => b.count - a.count));
      }
      
      return Promise.resolve([]);
    }),
  }),
}));

describe('Tag Counting Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEntriesTable = [];
    mockTagsTable = [];
  });

  describe('Full Flow: Create Entry → Recalculate → Display', () => {
    it('should calculate correct count for single entry with tag', async () => {
      // Add entry with #work
      mockEntriesTable.push({ id: '1', tags: 'work' });
      
      // Recalculate
      await recalculateAllTagCounts();
      
      // Verify tag was inserted
      expect(mockTagsTable).toContainEqual({ name: 'work', count: 1 });
    });

    it('should calculate correct count for multiple entries with same tag', async () => {
      mockEntriesTable.push({ id: '1', tags: 'work' });
      mockEntriesTable.push({ id: '2', tags: 'work' });
      mockEntriesTable.push({ id: '3', tags: 'work' });

      await recalculateAllTagCounts();
      
      expect(mockTagsTable).toContainEqual({ name: 'work', count: 3 });
    });

    it('should calculate correct count for different tags', async () => {
      mockEntriesTable.push({ id: '1', tags: 'work' });
      mockEntriesTable.push({ id: '2', tags: 'react' });
      mockEntriesTable.push({ id: '3', tags: 'home' });

      await recalculateAllTagCounts();
      
      expect(mockTagsTable).toHaveLength(3);
      expect(mockTagsTable).toContainEqual({ name: 'work', count: 1 });
      expect(mockTagsTable).toContainEqual({ name: 'react', count: 1 });
      expect(mockTagsTable).toContainEqual({ name: 'home', count: 1 });
    });

    it('should handle entry with multiple tags', async () => {
      mockEntriesTable.push({ id: '1', tags: 'work,react,home' });

      await recalculateAllTagCounts();
      
      expect(mockTagsTable).toHaveLength(3);
      expect(mockTagsTable.every(t => t.count === 1)).toBe(true);
    });

    it('should handle whitespace in tags', async () => {
      mockEntriesTable.push({ id: '1', tags: ' work , react , home ' });

      await recalculateAllTagCounts();
      
      expect(mockTagsTable).toHaveLength(3);
      expect(mockTagsTable.map(t => t.name).sort()).toEqual(['home', 'react', 'work']);
    });

    it('should normalize case', async () => {
      mockEntriesTable.push({ id: '1', tags: 'WORK' });
      mockEntriesTable.push({ id: '2', tags: 'Work' });
      mockEntriesTable.push({ id: '3', tags: 'wOrK' });

      await recalculateAllTagCounts();
      
      expect(mockTagsTable).toHaveLength(1);
      expect(mockTagsTable[0]).toEqual({ name: 'work', count: 3 });
    });

    it('should filter empty tags', async () => {
      mockEntriesTable.push({ id: '1', tags: 'work,,home,' });

      await recalculateAllTagCounts();
      
      expect(mockTagsTable).toHaveLength(2);
      expect(mockTagsTable.map(t => t.name).sort()).toEqual(['home', 'work']);
    });
  });

  describe('Realistic User Flows', () => {
    it('should handle typical blog post creation flow', async () => {
      // User creates entry with #react
      mockEntriesTable.push({ id: '1', tags: 'react' });
      await recalculateAllTagCounts();
      expect(mockTagsTable).toContainEqual({ name: 'react', count: 1 });
      
      // User creates another entry with #react
      mockEntriesTable.push({ id: '2', tags: 'react' });
      await recalculateAllTagCounts();
      expect(mockTagsTable).toContainEqual({ name: 'react', count: 2 });
      
      // User creates entry with #typescript
      mockEntriesTable.push({ id: '3', tags: 'typescript' });
      await recalculateAllTagCounts();
      expect(mockTagsTable).toContainEqual({ name: 'react', count: 2 });
      expect(mockTagsTable).toContainEqual({ name: 'typescript', count: 1 });
    });

    it('should handle clearing all tags from an entry', async () => {
      mockEntriesTable.push({ id: '1', tags: 'work,react' });
      await recalculateAllTagCounts();
      expect(mockTagsTable).toHaveLength(2);
      
      // User edits entry to remove tags (simulated by updating entry)
      mockEntriesTable = [{ id: '1', tags: '' }];
      await recalculateAllTagCounts();
      expect(mockTagsTable).toHaveLength(0);
    });
  });
});
