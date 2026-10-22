package app.daylog.core.data.repository

import app.daylog.core.common.toLocalDateTime
import app.daylog.core.data.local.EntryDao
import app.daylog.core.data.local.EntryEntity
import app.daylog.core.data.local.EntryFtsDao
import app.daylog.core.data.local.EntryFtsEntity
import app.daylog.core.data.local.EntryTagEntity
import app.daylog.core.data.local.MediaDao
import app.daylog.core.data.local.MediaEntity
import app.daylog.core.data.local.TagDao
import app.daylog.core.data.local.TagEntity
import app.daylog.core.model.Entry
import app.daylog.core.model.Media
import app.daylog.core.model.MediaType
import app.daylog.core.model.Tag
import app.daylog.core.model.TagExtractor
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.map
import java.util.UUID

/**
 * Reads and writes entries.
 *
 * This is the only place that knows the difference between the stored shape of an entry and the
 * shape the rest of the app uses. Everything above it works with [Entry] and never with a Room
 * entity.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class EntryRepository(
    private val entryDao: EntryDao,
    private val tagDao: TagDao,
    private val mediaDao: MediaDao,
    private val entryFtsDao: EntryFtsDao,
    private val now: () -> Long = System::currentTimeMillis,
) {

    /**
     * Every live entry, newest first.
     */
    fun observeEntries(): Flow<List<Entry>> =
        entryDao.observeEntries().map { entities -> entities.map { it.toEntry() } }

    /**
     * The entries matching a search, newest first.
     *
     * The words are matched as words, and a prefix matches the start of one, so typing "read"
     * finds "reading" but "rea" does not find "read" in the middle of a word.
     */
    fun search(query: String): Flow<List<Entry>> {
        val match = query.trim()
        if (match.isEmpty()) return flowOf(emptyList())

        // Every word must be present, and each may be a prefix. A plain word is written bare with a
        // trailing star, because that is the form SQLite's index understands; a word with
        // punctuation in it is quoted, because a bare one would be read as an operator.
        val expression = match
            .split(Regex("\\s+"))
            .filter { it.isNotEmpty() }
            .joinToString(" AND ") { word ->
                if (SIMPLE_WORD.matches(word)) {
                    "$word*"
                } else {
                    "\"${word.replace("\"", "\"\"")}\""
                }
            }

        if (expression.isEmpty()) return flowOf(emptyList())

        return flow {
            val uids = entryFtsDao.search(expression)
            emitAll(entryDao.findByUids(uids).map { list -> list.map { it.toEntry() } })
        }
    }

    /**
     * The entries carrying every one of the given tags, newest first.
     *
     * Selecting two tags shows the entries that carry both, not the entries that carry either.
     * An empty selection shows everything.
     */
    fun observeEntriesWithAllTags(tags: List<String>): Flow<List<Entry>> {
        if (tags.isEmpty()) return observeEntries()

        return tagDao.observeEntriesWithAllTags(tags, tags.size)
            .flatMapLatest { uids -> entryDao.findByUids(uids) }
            .map { entities -> entities.map { it.toEntry() } }
    }

    /**
     * One entry, or null if it has been deleted.
     */
    fun observeEntry(uid: String): Flow<Entry?> =
        entryDao.observeEntry(uid).map { it?.toEntry() }

    /**
     * How many entries there are.
     */
    fun observeCount(): Flow<Int> = entryDao.observeCount()

    /**
     * The tags in use, most used first.
     */
    fun observeTags(): Flow<List<Tag>> =
        tagDao.observeTagsInUse().map { entities -> entities.map { Tag(it.name, it.count) } }

    /**
     * Saves an entry.
     *
     * A new entry is created when [uid] is null, otherwise the existing one is updated. The tags
     * are read out of the text every time, so a tag that is deleted from an entry goes away with
     * it — the tag list is never a second, stale copy of what the entries say.
     *
     * @param createdAt the moment the entry happened at, when the writer has chosen one. Left
     * null, the entry keeps the moment it already has, or receives the current time.
     *
     * @return the uid of the saved entry.
     */
    suspend fun save(
        content: String,
        uid: String? = null,
        createdAt: Long? = null,
        placeName: String? = null,
        placeLat: Double? = null,
        placeLon: Double? = null,
        weatherSummary: String? = null,
        weatherCode: Int? = null,
    ): String {
        val timestamp = now()
        val resolvedUid = uid ?: UUID.randomUUID().toString()

        val existing = entryDao.findByUid(resolvedUid)
        val entity = EntryEntity(
            id = existing?.id ?: 0,
            uid = resolvedUid,
            content = content,
            createdAt = createdAt ?: existing?.createdAt ?: timestamp,
            updatedAt = timestamp,
            deletedAt = null,
            placeName = placeName ?: existing?.placeName,
            placeLat = placeLat ?: existing?.placeLat,
            placeLon = placeLon ?: existing?.placeLon,
            weatherSummary = weatherSummary ?: existing?.weatherSummary,
            weatherCode = weatherCode ?: existing?.weatherCode,
            syncedAt = existing?.syncedAt,
        )

        entryDao.upsert(entity)

        // The row id is assigned by the database when the entry is new, so the entry is read back
        // before it is indexed. Indexing the id the caller had would point every new entry at the
        // same row.
        val saved = entryDao.findByUid(resolvedUid) ?: entity
        val tags = TagExtractor.extract(content)
        syncTags(resolvedUid, tags)
        indexFor(saved, tags)
        return resolvedUid
    }

    /**
     * Deletes an entry.
     *
     * The entry is not removed but tombstoned, so a future sync can replicate the deletion
     * instead of the entry coming back on the next merge.
     */
    suspend fun delete(uid: String) {
        val timestamp = now()
        entryDao.softDelete(uid, deletedAt = timestamp, updatedAt = timestamp)
        tagDao.deleteLinksForEntry(uid)

        // The index is dropped as well, so a deleted entry cannot be found by searching for it.
        entryDao.findByUid(uid)?.let { entryFtsDao.delete(it.id) }
    }

    /**
     * The photos of an entry.
     */
    fun observeMedia(uid: String): Flow<List<Media>> =
        mediaDao.observeForEntry(uid).map { entities -> entities.map { it.toMedia() } }

    /**
     * Every photo, grouped by the entry it belongs to.
     *
     * The timeline shows a thumbnail on the entries that have one, and that is a question about all
     * the photos rather than about one entry.
     */
    fun observeMediaByEntry(): Flow<Map<String, List<Media>>> =
        mediaDao.observeAll().map { entities ->
            entities.groupBy { it.entryUid }
                .mapValues { (_, rows) -> rows.map { it.toMedia() } }
        }

    /**
     * Adds a photo to an entry.
     */
    suspend fun addMedia(entryUid: String, path: String, thumbnailPath: String? = null): String {
        val uid = UUID.randomUUID().toString()
        mediaDao.insert(
            MediaEntity(
                uid = uid,
                entryUid = entryUid,
                type = MediaType.Image.name,
                path = path,
                thumbnailPath = thumbnailPath,
                createdAt = now(),
            ),
        )
        return uid
    }

    /**
     * Removes a photo.
     */
    suspend fun removeMedia(uid: String) {
        mediaDao.deleteByUid(uid)
    }

    /**
     * Rewrites the tags of an entry and keeps the counts honest.
     */
    private suspend fun syncTags(entryUid: String, tags: List<String>) {
        tagDao.deleteLinksForEntry(entryUid)

        tags.forEach { name ->
            tagDao.insertTag(TagEntity(name = name))
        }
        tagDao.insertLinks(tags.map { name -> EntryTagEntity(entryUid = entryUid, tagName = name) })

        tagDao.recountAll()
        tagDao.deleteUnusedTags()
    }

    /**
     * Writes an entry into the search index.
     */
    private suspend fun indexFor(entity: EntryEntity, tags: List<String>) {
        entryFtsDao.upsert(
            EntryFtsEntity(
                rowid = entity.id,
                uid = entity.uid,
                content = entity.content,
                tags = tags.joinToString(" "),
            ),
        )
    }

    companion object {
        /**
         * A word the index can take bare, with a trailing star to match the start of a word.
         */
        private val SIMPLE_WORD = Regex("[\\p{L}\\p{N}_]+")
    }
}

/**
 * The stored shape of an entry, as the app uses it.
 */
private fun EntryEntity.toEntry(): Entry = Entry(
    uid = uid,
    content = content,
    createdAt = createdAt,
    updatedAt = updatedAt,
    deletedAt = deletedAt,
    placeName = placeName,
    placeLat = placeLat,
    placeLon = placeLon,
    weatherSummary = weatherSummary,
    weatherCode = weatherCode,
    syncedAt = syncedAt,
)

/**
 * The stored shape of a photo, as the app uses it.
 */
private fun MediaEntity.toMedia(): Media = Media(
    uid = uid,
    entryUid = entryUid,
    type = runCatching { MediaType.valueOf(type) }.getOrDefault(MediaType.Image),
    path = path,
    thumbnailPath = thumbnailPath,
    createdAt = createdAt,
)
