package app.daylog.core.data.local

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Fts4
import androidx.room.FtsOptions

/**
 * The full-text index over the entries.
 *
 * The index is kept by the repository rather than by Room's external-content tables, because the
 * rows it points at are the entries and the mapping between them is the repository's business.
 *
 * The row id is the entry's local row id, so a search result is a row id and the entries come
 * back with the same query that reads them. The uid is carried in the index as well, so a search
 * result can be matched to an entry even if the row ids are ever renumbered.
 */
@Fts4(tokenizer = FtsOptions.TOKENIZER_UNICODE61)
@Entity(tableName = "entries_fts")
data class EntryFtsEntity(
    @ColumnInfo(name = "rowid") val rowid: Long,
    @ColumnInfo(name = "uid") val uid: String,
    @ColumnInfo(name = "content") val content: String,
    @ColumnInfo(name = "tags") val tags: String,
)
