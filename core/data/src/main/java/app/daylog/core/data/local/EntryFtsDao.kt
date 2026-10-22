package app.daylog.core.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

/**
 * Keeps the full-text index in step with the entries.
 *
 * The index is written whenever an entry is written, so a search never shows an entry that has
 * been edited away, and never misses one that has just been written.
 */
@Dao
interface EntryFtsDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: EntryFtsEntity)

    @Query("DELETE FROM entries_fts WHERE rowid = :rowid")
    suspend fun delete(rowid: Long)

    @Query("DELETE FROM entries_fts")
    suspend fun clear()

    @Query("SELECT COUNT(*) FROM entries_fts")
    suspend fun count(): Int
}
