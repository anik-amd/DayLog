package app.daylog.core.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * A photo attached to an entry.
 */
@Entity(
    tableName = "media",
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["uid"],
            childColumns = ["entryUid"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index(value = ["entryUid"])],
)
data class MediaEntity(
    @PrimaryKey
    @ColumnInfo(name = "uid")
    val uid: String,
    @ColumnInfo(name = "entryUid")
    val entryUid: String,
    @ColumnInfo(name = "type")
    val type: String,
    @ColumnInfo(name = "path")
    val path: String,
    @ColumnInfo(name = "thumbnailPath")
    val thumbnailPath: String? = null,
    @ColumnInfo(name = "createdAt")
    val createdAt: Long,
)
