package app.daylog.core.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
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

    /**
     * The tags that are actually in use, with their counts.
     *
     * A tag that no entry carries any more is not shown, so the list is always a truthful summary
     * of the entries rather than a history of what was once typed.
     */
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

    /**
     * The entries carrying every one of the given tags.
     */
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

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertTag(tag: TagEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun link(entryUid: String, tagName: String)

    @Query("DELETE FROM entry_tags WHERE entryUid = :entryUid")
    suspend fun deleteLinksForEntry(entryUid: String)

    @Query("DELETE FROM entry_tags")
    suspend fun deleteAllLinks()

    @Query("DELETE FROM tags")
    suspend fun deleteAllTags()

    /**
     * Recounts every tag from the entries that carry it.
     *
     * Counting from the join table rather than incrementing as tags are written means the counts
     * cannot drift out of step with the entries, whatever order things happened in.
     */
    @Query(
        """
        UPDATE tags SET count = (
            SELECT COUNT(*) FROM entry_tags et
            INNER JOIN entries e ON e.uid = et.entryUid
            WHERE et.tagName = tags.name AND e.deletedAt IS NULL
        )
        """,
    )
    suspend fun recountAll()

    /**
     * Removes the tags no entry carries any more.
     */
    @Query(
        """
        DELETE FROM tags WHERE name NOT IN (
            SELECT DISTINCT et.tagName FROM entry_tags et
            INNER JOIN entries e ON e.uid = et.entryUid
            WHERE e.deletedAt IS NULL
        )
        """,
    )
    suspend fun deleteUnusedTags()

    @Transaction
    suspend fun replaceAll(tags: List<TagEntity>, links: List<EntryTagEntity>) {
        deleteAllLinks()
        deleteAllTags()
        tags.forEach { insertTag(it) }
        links.forEach { link(it.entryUid, it.tagName) }
    }
}
