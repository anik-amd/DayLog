package app.daylog.core.testing

import app.daylog.core.data.local.EntryDao
import app.daylog.core.data.local.EntryEntity
import app.daylog.core.data.local.EntryFtsDao
import app.daylog.core.data.local.EntryFtsEntity
import app.daylog.core.data.local.EntryTagEntity
import app.daylog.core.data.local.MediaDao
import app.daylog.core.data.local.MediaEntity
import app.daylog.core.data.local.TagDao
import app.daylog.core.data.local.TagEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

/**
 * The DAOs, answered from memory.
 *
 * The real ones are Room, which needs a device or Robolectric. These keep a test on the JVM and
 * let a test set up exactly the state it is about, including the awkward cases: an entry that was
 * deleted, a tag that no entry carries any more.
 */
class FakeEntryDao : EntryDao {

    private val entries = MutableStateFlow<List<EntryEntity>>(emptyList())

    /** The entries as they are stored, including the deleted ones. */
    val stored: List<EntryEntity> get() = entries.value

    override fun observeEntries(): Flow<List<EntryEntity>> =
        entries.map { list -> list.filter { it.deletedAt == null }.sortedByDescending { it.createdAt } }

    override fun observeEntry(uid: String): Flow<EntryEntity?> =
        entries.map { list -> list.firstOrNull { it.uid == uid && it.deletedAt == null } }

    override suspend fun findByUid(uid: String): EntryEntity? =
        entries.value.firstOrNull { it.uid == uid }

    override fun observeCount(): Flow<Int> = entries.map { list -> list.count { it.deletedAt == null } }

    override suspend fun upsert(entry: EntryEntity) {
        val existing = entries.value.indexOfFirst { it.uid == entry.uid }
        entries.value = if (existing >= 0) {
            // The row keeps the id it was given, the way a real table does.
            entries.value.toMutableList().apply { this[existing] = entry.copy(id = this[existing].id) }
        } else {
            entries.value + entry.copy(id = (entries.value.maxOfOrNull { it.id } ?: 0L) + 1)
        }
    }

    override suspend fun insertAll(entries: List<EntryEntity>) {
        this.entries.value = this.entries.value + entries
    }

    override suspend fun deleteHard(uid: String) {
        entries.value = entries.value.filterNot { it.uid == uid }
    }

    override suspend fun softDelete(uid: String, deletedAt: Long, updatedAt: Long) {
        entries.value = entries.value.map {
            if (it.uid == uid) it.copy(deletedAt = deletedAt, updatedAt = updatedAt) else it
        }
    }

    override suspend fun findTombstonesSince(since: Long): List<EntryEntity> =
        entries.value.filter { it.updatedAt > since && it.deletedAt != null }

    override suspend fun insertAllWithTags(entries: List<EntryEntity>, links: List<EntryTagEntity>) {
        insertAll(entries)
        insertLinks(links)
    }

    override suspend fun insertLinks(links: List<EntryTagEntity>) = Unit

    override suspend fun findByUids(uids: List<String>): Flow<List<EntryEntity>> =
        entries.map { list ->
            list.filter { it.uid in uids && it.deletedAt == null }
                .sortedByDescending { it.createdAt }
        }
}

/**
 * The tag DAO, answered from memory.
 */
class FakeTagDao : TagDao {

    private val tags = MutableStateFlow<List<TagEntity>>(emptyList())
    private val links = MutableStateFlow<List<EntryTagEntity>>(emptyList())

    override fun observeTags(): Flow<List<TagEntity>> =
        tags.map { list -> list.sortedWith(compareByDescending<TagEntity> { it.count }.thenBy { it.name }) }

    override fun observeTagCount(): Flow<Int> = tags.map { it.size }

    override suspend fun tagsForEntry(entryUid: String): List<String> =
        links.value.filter { it.entryUid == entryUid }.map { it.tagName }

    override fun observeTagsInUse(): Flow<List<TagEntity>> =
        tags.map { list -> list.sortedWith(compareByDescending<TagEntity> { it.count }.thenBy { it.name }) }

    override fun observeEntriesWithAllTags(tags: List<String>, tagCount: Int): Flow<List<EntryEntity>> =
        links.map { list ->
            list.groupBy { it.entryUid }
                .filter { (_, entryLinks) ->
                    entryLinks.map { it.tagName }.toSet().containsAll(tags)
                }
                .keys
                .toList()
        }

    override suspend fun insertTag(tag: TagEntity) {
        if (tags.value.none { it.name == tag.name }) {
            tags.value = tags.value + tag
        }
    }

    override suspend fun insertLinks(links: List<EntryTagEntity>) {
        val existing = this.links.value.map { it.entryUid to it.tagName }.toSet()
        this.links.value = this.links.value +
            links.filterNot { (it.entryUid to it.tagName) in existing }
    }

    override suspend fun deleteLinksForEntry(entryUid: String) {
        links.value = links.value.filterNot { it.entryUid == entryUid }
    }

    override suspend fun deleteAllLinks() {
        links.value = emptyList()
    }

    override suspend fun deleteAllTags() {
        tags.value = emptyList()
    }

    override suspend fun recountAll() {
        tags.value = tags.value.map { tag ->
            tag.copy(count = links.value.count { it.tagName == tag.name })
        }
    }

    override suspend fun deleteUnusedTags() {
        val used = links.value.map { it.tagName }.toSet()
        tags.value = tags.value.filter { it.name in used }
    }

    override suspend fun replaceAll(tags: List<TagEntity>, links: List<EntryTagEntity>) {
        deleteAllLinks()
        deleteAllTags()
        tags.forEach { insertTag(it) }
        insertLinks(links)
    }
}

/**
 * The search index, answered from memory.
 *
 * The real one is an FTS4 table, which SQLite does for us. This one matches on the words of the
 * content and the tags, so a test can ask the same question the app asks.
 */
class FakeEntryFtsDao : EntryFtsDao {

    private val rows = MutableStateFlow<List<EntryFtsEntity>>(emptyList())

    val indexed: List<EntryFtsEntity> get() = rows.value

    override suspend fun upsert(entity: EntryFtsEntity) {
        rows.value = rows.value.filterNot { it.rowid == entity.rowid } + entity
    }

    override suspend fun delete(rowid: Long) {
        rows.value = rows.value.filterNot { it.rowid == rowid }
    }

    override suspend fun clear() {
        rows.value = emptyList()
    }

    override suspend fun count(): Int = rows.value.size

    /**
     * The uids matching a search, the way the real index would.
     *
     * The query is an FTS4 match expression: words joined by AND, each quoted and each with a
     * trailing star so it matches the start of a word.
     */
    override suspend fun search(query: String): List<String> {
        val words = query
            .split(" AND ")
            .map { it.trim().removeSuffix("*").trim('"') }
            .filter { it.isNotEmpty() }

        if (words.isEmpty()) return emptyList()

        return rows.value.filter { row ->
            val tokens = "${row.content} ${row.tags}"
                .lowercase()
                .split(Regex("[^\\p{L}\\p{N}_]+"))
                .filter { it.isNotEmpty() }

            words.all { word -> tokens.any { it.startsWith(word.lowercase()) } }
        }.map { it.uid }
    }
}

/**
 * The media DAO, answered from memory.
 */
class FakeMediaDao : MediaDao {
    private val media = MutableStateFlow<List<MediaEntity>>(emptyList())

    override fun observeForEntry(entryUid: String): Flow<List<MediaEntity>> =
        media.map { list -> list.filter { it.entryUid == entryUid }.sortedBy { it.createdAt } }

    override fun observeCount(): Flow<Int> = media.map { it.size }

    override suspend fun insert(media: MediaEntity) {
        this.media.value = this.media.value + media
    }

    override suspend fun deleteByUid(uid: String) {
        media.value = media.value.filterNot { it.uid == uid }
    }

    override suspend fun deleteForEntry(entryUid: String) {
        media.value = media.value.filterNot { it.entryUid == entryUid }
    }
}
