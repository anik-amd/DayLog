package app.daylog.core.data.local

import androidx.room.Dao
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface MediaDao {

    @Query("SELECT * FROM media WHERE entryUid = :entryUid ORDER BY createdAt ASC")
    fun observeForEntry(entryUid: String): Flow<List<MediaEntity>>

    @Query("SELECT COUNT(*) FROM media")
    fun observeCount(): Flow<Int>

    @Query("DELETE FROM media WHERE entryUid = :entryUid")
    suspend fun deleteForEntry(entryUid: String)
}
