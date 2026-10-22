package app.daylog.core.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface MediaDao {

    @Query("SELECT * FROM media WHERE entryUid = :entryUid ORDER BY createdAt ASC")
    fun observeForEntry(entryUid: String): Flow<List<MediaEntity>>

    @Query("SELECT COUNT(*) FROM media")
    fun observeCount(): Flow<Int>

    /** Every photo, so the timeline can show a thumbnail on the entries that have one. */
    @Query("SELECT * FROM media ORDER BY createdAt ASC")
    fun observeAll(): Flow<List<MediaEntity>>

    /** Every photo, for an export. */
    @Query("SELECT * FROM media ORDER BY createdAt ASC")
    suspend fun findAll(): List<MediaEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(media: MediaEntity)

    @Query("SELECT * FROM media WHERE uid = :uid")
    suspend fun findByUid(uid: String): MediaEntity?

    @Query("DELETE FROM media WHERE uid = :uid")
    suspend fun deleteByUid(uid: String)

    @Query("DELETE FROM media WHERE entryUid = :entryUid")
    suspend fun deleteForEntry(entryUid: String)
}
