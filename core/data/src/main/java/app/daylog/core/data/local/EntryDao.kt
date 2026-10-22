package app.daylog.core.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

@Dao
interface EntryDao {

    /**
     * Every live entry, newest first. Deleted entries are filtered out here rather than at the
     * call site so no screen can accidentally show a tombstone.
     */
    @Query("SELECT * FROM entries WHERE deletedAt IS NULL ORDER BY createdAt DESC")
    fun observeEntries(): Flow<List<EntryEntity>>

    @Query("SELECT * FROM entries WHERE uid = :uid AND deletedAt IS NULL")
    fun observeEntry(uid: String): Flow<EntryEntity?>

    @Query("SELECT * FROM entries WHERE uid = :uid")
    suspend fun findByUid(uid: String): EntryEntity?

    @Query("SELECT COUNT(*) FROM entries WHERE deletedAt IS NULL")
    fun observeCount(): Flow<Int>

    @Upsert
    suspend fun upsert(entry: EntryEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertAll(entries: List<EntryEntity>)

    @Query("DELETE FROM entries WHERE uid = :uid")
    suspend fun deleteHard(uid: String)

    @Query("UPDATE entries SET deletedAt = :deletedAt, updatedAt = :updatedAt WHERE uid = :uid")
    suspend fun softDelete(uid: String, deletedAt: Long, updatedAt: Long)

    @Query("SELECT * FROM entries WHERE updatedAt > :since AND deletedAt IS NOT NULL")
    suspend fun findTombstonesSince(since: Long): List<EntryEntity>

    /**
     * Puts a whole set of entries in at once, which is what an imported backup does.
     */
    @Transaction
    suspend fun insertAllWithTags(
        entries: List<EntryEntity>,
        links: List<EntryTagEntity>,
    ) {
        insertAll(entries)
        insertLinks(links)
    }

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertLinks(links: List<EntryTagEntity>)

    /**
     * The live entries with these uids, newest first.
     */
    @Query("SELECT * FROM entries WHERE uid IN (:uids) AND deletedAt IS NULL ORDER BY createdAt DESC")
    fun findByUids(uids: List<String>): Flow<List<EntryEntity>>

    /**
     * The entries carrying every one of the given tags.
     *
     * The count is what makes it an AND rather than an OR: an entry has to carry all of the tags
     * to come back, not just one of them.
     */
    @Query(
        """
        SELECT e.* FROM entries e
        INNER JOIN entry_tags et ON et.entryUid = e.uid
        WHERE e.deletedAt IS NULL AND et.tagName IN (:tags)
        GROUP BY e.uid
        HAVING COUNT(DISTINCT et.tagName) = :tagCount
        ORDER BY e.createdAt DESC
        """,
    )
    fun observeEntriesWithAllTags(tags: List<String>, tagCount: Int): Flow<List<EntryEntity>>
}
