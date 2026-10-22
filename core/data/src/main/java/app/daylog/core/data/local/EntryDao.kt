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
     * The entries whose content or tags match a search.
     *
     * The query is an FTS4 match expression, so the words are matched as words rather than as
     * fragments, and a prefix matches the start of a word.
     */
    @Query(
        """
        SELECT e.* FROM entries e
        INNER JOIN entries_fts f ON f.rowid = e.id
        WHERE entries_fts MATCH :query AND e.deletedAt IS NULL
        ORDER BY e.createdAt DESC
        """,
    )
    fun search(query: String): Flow<List<EntryEntity>>
}
