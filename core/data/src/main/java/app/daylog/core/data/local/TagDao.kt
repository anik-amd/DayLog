package app.daylog.core.data.local

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface TagDao {

    @Query("SELECT * FROM tags ORDER BY count DESC, name ASC")
    fun observeTags(): Flow<List<TagEntity>>

    @Query("SELECT COUNT(*) FROM tags")
    fun observeTagCount(): Flow<Int>

    @Query("SELECT tagName FROM entry_tags WHERE entryUid = :entryUid")
    suspend fun tagsForEntry(entryUid: String): List<String>

    @Query(
        """
        SELECT t.* FROM tags t
        INNER JOIN entry_tags et ON et.tagName = t.name
        INNER JOIN entries e ON e.uid = et.entryUid
        WHERE e.deletedAt IS NULL
        GROUP BY t.name
        ORDER BY t.count DESC, t.name ASC
        """,
    )
    fun observeTagsInUse(): Flow<List<TagEntity>>

    @Query(
        """
        SELECT e.uid FROM entries e
        INNER JOIN entry_tags et ON et.entryUid = e.uid
        WHERE e.deletedAt IS NULL AND et.tagName IN (:tags)
        GROUP BY e.uid
        HAVING COUNT(DISTINCT et.tagName) = :tagCount
        ORDER BY e.createdAt DESC
        """,
    )
    fun observeEntriesWithAllTags(tags: List<String>, tagCount: Int): Flow<List<String>>

    @Transaction
    suspend fun clearLinksForEntry(entryUid: String) {
        deleteLinksForEntry(entryUid)
    }

    @Query("DELETE FROM entry_tags WHERE entryUid = :entryUid")
    suspend fun deleteLinksForEntry(entryUid: String)

    @Query("DELETE FROM entry_tags")
    suspend fun deleteAllLinks()

    @Query("DELETE FROM tags")
    suspend fun deleteAllTags()
}
