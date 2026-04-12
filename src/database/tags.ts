export { initDb, updateTagCount, getAllTags, deleteTag, recalculateAllTagCounts } from './unifiedDb';
export type { TagEntry, SortOption, SortDirection } from './unifiedDb';

export const initTagsDb = async () => {
  // No-op for unified db, init happens in initDb
};
