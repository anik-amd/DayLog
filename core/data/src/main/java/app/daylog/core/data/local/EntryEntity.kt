package app.daylog.core.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * The stored shape of an entry.
 *
 * [uid] is the stable identity used for sync; [id] is only a local row id. Keeping both means a
 * future cloud layer can match on a value that exists on every device without depending on local
 * row numbering.
 */
@Entity(
    tableName = "entries",
    indices = [
        Index(value = ["uid"], unique = true),
        Index(value = ["updatedAt"]),
        Index(value = ["deletedAt"]),
    ],
)
data class EntryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(name = "uid")
    val uid: String,
    @ColumnInfo(name = "content")
    val content: String,
    @ColumnInfo(name = "createdAt")
    val createdAt: Long,
    @ColumnInfo(name = "updatedAt")
    val updatedAt: Long,
    @ColumnInfo(name = "deletedAt")
    val deletedAt: Long? = null,
    @ColumnInfo(name = "placeName")
    val placeName: String? = null,
    @ColumnInfo(name = "placeLat")
    val placeLat: Double? = null,
    @ColumnInfo(name = "placeLon")
    val placeLon: Double? = null,
    @ColumnInfo(name = "weatherSummary")
    val weatherSummary: String? = null,
    @ColumnInfo(name = "weatherCode")
    val weatherCode: Int? = null,
    @ColumnInfo(name = "syncedAt")
    val syncedAt: Long? = null,
)
