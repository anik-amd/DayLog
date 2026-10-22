package app.daylog.core.data.backup

import app.daylog.core.data.local.EntryDao
import app.daylog.core.data.local.EntryEntity
import app.daylog.core.data.local.EntryFtsDao
import app.daylog.core.data.local.EntryFtsEntity
import app.daylog.core.data.local.EntryTagEntity
import app.daylog.core.data.local.MediaDao
import app.daylog.core.data.local.MediaEntity
import app.daylog.core.data.local.TagDao
import app.daylog.core.data.local.TagEntity
import app.daylog.core.model.TagExtractor
import java.io.File

/**
 * Writes the entries out and brings them back in.
 *
 * An export never touches the entries themselves: it reads them and writes a file. An import
 * merges rather than replaces, because the reader may have written more since the file was made,
 * and losing that would be worse than a duplicate.
 *
 * When the same entry is in both places the newer one wins, which is the same rule a sync would
 * use and the one that loses the least writing.
 */
class BackupService(
    private val entryDao: EntryDao,
    private val tagDao: TagDao,
    private val mediaDao: MediaDao,
    private val entryFtsDao: EntryFtsDao,
    private val now: () -> Long = System::currentTimeMillis,
) {

    /**
     * What an export holds.
     */
    data class Exported(
        val file: BackupFile,
        val photos: List<BackupArchive.Photo>,
    )

    /**
     * What an import did.
     */
    data class Restored(
        val entriesAdded: Int,
        val entriesUpdated: Int,
        val entriesKept: Int,
        val photosRestored: Int,
        val message: String,
    )

    /**
     * Reads everything into a file to write out.
     */
    suspend fun export(): Exported {
        val links = tagDao.findAllLinks()
        val tagsByEntry = links.groupBy { it.entryUid }
        val media = mediaDao.findAll()

        val file = BackupFile(
            exportedAt = now(),
            entries = entryDao.findAll().map { entity ->
                BackupEntry(
                    uid = entity.uid,
                    content = entity.content,
                    createdAt = entity.createdAt,
                    updatedAt = entity.updatedAt,
                    deletedAt = entity.deletedAt,
                    placeName = entity.placeName,
                    placeLat = entity.placeLat,
                    placeLon = entity.placeLon,
                    weatherSummary = entity.weatherSummary,
                    weatherCode = entity.weatherCode,
                    tags = tagsByEntry[entity.uid].orEmpty().map { it.tagName },
                )
            },
            tags = tagDao.findAll().map { BackupTag(name = it.name, count = it.count) },
            media = media.map { row ->
                BackupMedia(
                    uid = row.uid,
                    entryUid = row.entryUid,
                    type = row.type,
                    path = row.path,
                    thumbnailPath = row.thumbnailPath,
                    createdAt = row.createdAt,
                )
            },
        )

        val photos = media.mapNotNull { row ->
            val picture = File(row.path)
            if (!picture.exists()) {
                null
            } else {
                BackupArchive.Photo(
                    uid = row.uid,
                    entryUid = row.entryUid,
                    file = picture,
                    thumbnail = row.thumbnailPath
                        ?.let { File(it) }
                        ?.takeIf { it.exists() },
                )
            }
        }

        return Exported(file = file, photos = photos)
    }

    /**
     * The file, written out as JSON.
     */
    suspend fun exportJson(): String = BackupCodec.encode(export().file)

    /**
     * Brings a file back in.
     *
     * @param photos the photos that came out of the archive, if it was one.
     */
    suspend fun restore(file: BackupFile, photos: List<BackupArchive.Photo> = emptyList()): Restored {
        var added = 0
        var updated = 0
        var kept = 0
        val deleted = mutableSetOf<String>()

        file.entries.forEach { backup ->
            val existing = entryDao.findByUid(backup.uid)

            if (existing == null) {
                entryDao.upsert(backup.toEntity())
                added++
            } else if (backup.updatedAt > existing.updatedAt) {
                entryDao.upsert(backup.toEntity(id = existing.id))
                updated++
            } else {
                kept++
            }

            val saved = entryDao.findByUid(backup.uid)

            if (backup.deletedAt != null || saved?.deletedAt != null) {
                // A deleted entry carries no tags and is not in the search index.
                deleted += backup.uid
                tagDao.deleteLinksForEntry(backup.uid)
                saved?.let { entryFtsDao.delete(it.id) }
            } else {
                syncTags(backup.uid, backup.tags, backup.content)
                index(backup.uid)
            }
        }

        var photosRestored = 0
        file.media.forEach { media ->
            if (media.entryUid in deleted) return@forEach

            val unpacked = photos.firstOrNull { it.uid == media.uid && it.entryUid == media.entryUid }
            val path = unpacked?.file?.absolutePath ?: media.path
            val thumbnail = unpacked?.thumbnail?.absolutePath ?: media.thumbnailPath

            // A photo that is in neither the archive nor on this device cannot be shown, so it is
            // left out rather than left as a broken reference.
            if (unpacked == null && !File(path).exists()) return@forEach

            mediaDao.insert(
                MediaEntity(
                    uid = media.uid,
                    entryUid = media.entryUid,
                    type = media.type,
                    path = path,
                    thumbnailPath = thumbnail,
                    createdAt = media.createdAt,
                ),
            )
            photosRestored++
        }

        tagDao.recountAll()
        tagDao.deleteUnusedTags()

        return Restored(
            entriesAdded = added,
            entriesUpdated = updated,
            entriesKept = kept,
            photosRestored = photosRestored,
            message = when {
                added == 0 && updated == 0 -> "Nothing new: every entry was already here."
                else -> buildString {
                    if (added > 0) append("$added entries brought in")
                    if (updated > 0) {
                        if (isNotEmpty()) append(", ")
                        append("$updated updated")
                    }
                    if (photosRestored > 0) {
                        if (isNotEmpty()) append(", ")
                        append("$photosRestored photos")
                    }
                    append(".")
                }
            },
        )
    }

    /**
     * Rewrites the tags of an entry and keeps the counts honest.
     */
    private suspend fun syncTags(entryUid: String, tags: List<String>, content: String) {
        val names = tags.ifEmpty { TagExtractor.extract(content) }

        tagDao.deleteLinksForEntry(entryUid)
        names.forEach { name -> tagDao.insertTag(TagEntity(name = name)) }
        tagDao.insertLinks(names.map { EntryTagEntity(entryUid = entryUid, tagName = it) })
    }

    /**
     * Writes an entry into the search index, so a restored entry can be found.
     */
    private suspend fun index(entryUid: String) {
        val entity = entryDao.findByUid(entryUid) ?: return
        if (entity.deletedAt != null) {
            entryFtsDao.delete(entity.id)
            return
        }

        val tags = tagDao.tagsForEntry(entryUid)
        entryFtsDao.upsert(
            EntryFtsEntity(
                rowid = entity.id,
                uid = entity.uid,
                content = entity.content,
                tags = tags.joinToString(" "),
            ),
        )
    }

    /**
     * The stored shape of an entry, as an import writes it.
     */
    private fun BackupEntry.toEntity(id: Long = 0) = EntryEntity(
        id = id,
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
    )
}
