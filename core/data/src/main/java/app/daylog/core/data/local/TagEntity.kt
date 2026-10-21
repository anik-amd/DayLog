package app.daylog.core.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * A tag and how many entries use it.
 */
@Entity(tableName = "tags")
data class TagEntity(
    @PrimaryKey
    @ColumnInfo(name = "name")
    val name: String,
    @ColumnInfo(name = "count", defaultValue = "0")
    val count: Int = 0,
)

/**
 * Links entries to tags.
 *
 * A join table rather than a comma-separated column, so filtering by several tags is a plain query
 * and counts stay correct without scanning entry text.
 */
@Entity(
    tableName = "entry_tags",
    primaryKeys = ["entryUid", "tagName"],
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["uid"],
            childColumns = ["entryUid"],
            onDelete = ForeignKey.CASCADE,
        ),
        ForeignKey(
            entity = TagEntity::class,
            parentColumns = ["name"],
            childColumns = ["tagName"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index(value = ["tagName"])],
)
data class EntryTagEntity(
    @ColumnInfo(name = "entryUid")
    val entryUid: String,
    @ColumnInfo(name = "tagName")
    val tagName: String,
)
