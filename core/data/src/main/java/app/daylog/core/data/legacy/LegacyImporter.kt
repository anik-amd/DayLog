package app.daylog.core.data.legacy

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import app.daylog.core.data.local.EntryDao
import app.daylog.core.data.local.EntryEntity
import app.daylog.core.data.local.EntryTagEntity
import app.daylog.core.data.local.MediaDao
import app.daylog.core.data.local.MediaEntity
import app.daylog.core.data.local.TagDao
import app.daylog.core.data.local.TagEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/**
 * What an import found.
 */
data class LegacyImportResult(
    val entriesImported: Int,
    val photosImported: Int,
    val skipped: Boolean = false,
    val message: String = "",
)

/**
 * Brings the entries across from the previous version of the app.
 *
 * The old app kept its database in the app's files directory, under `SQLite`, and the new one
 * keeps its database under `databases`. They do not meet, so the old file is still sitting there
 * with everything in it, and the import is a read of that file rather than a migration.
 *
 * The old database is copied before it is read, because it may still have a write-ahead log beside
 * it and opening it in place could change a file the reader might still want.
 */
class LegacyImporter(
    private val context: Context,
    private val entryDao: EntryDao,
    private val tagDao: TagDao,
    private val mediaDao: MediaDao,
) {

    /**
     * Where the old app kept its database.
     */
    fun legacyDatabase(): File = File(File(context.filesDir, "SQLite"), LEGACY_DATABASE_NAME)

    /**
     * Whether there is anything to import.
     */
    fun hasLegacyData(): Boolean = legacyDatabase().exists()

    /**
     * Imports the entries, the tags and the photos.
     */
    suspend fun import(): LegacyImportResult = withContext(Dispatchers.IO) {
        val source = legacyDatabase()
        if (!source.exists()) {
            return@withContext LegacyImportResult(
                entriesImported = 0,
                photosImported = 0,
                skipped = true,
                message = "No entries from the previous version were found.",
            )
        }

        val copy = copyDatabase(source)
        if (copy == null) {
            return@withContext LegacyImportResult(
                entriesImported = 0,
                photosImported = 0,
                skipped = true,
                message = "The previous version's entries could not be opened.",
            )
        }

        var entries = 0
        var photos = 0

        try {
            val database = SQLiteDatabase.openDatabase(copy.absolutePath, null, SQLiteDatabase.OPEN_READONLY)

            database.rawQuery(
                "SELECT id, content, createdAt, updatedAt, latitude, longitude, " +
                    "locationFull, locationDisplay, weather, tags FROM entries",
                null,
            ).use { cursor ->
                val idIndex = cursor.getColumnIndexOrThrow("id")
                val contentIndex = cursor.getColumnIndexOrThrow("content")
                val createdIndex = cursor.getColumnIndexOrThrow("createdAt")
                val updatedIndex = cursor.getColumnIndexOrThrow("updatedAt")
                val latIndex = cursor.getColumnIndexOrThrow("latitude")
                val lonIndex = cursor.getColumnIndexOrThrow("longitude")
                val locationFullIndex = cursor.getColumnIndexOrThrow("locationFull")
                val locationDisplayIndex = cursor.getColumnIndexOrThrow("locationDisplay")
                val weatherIndex = cursor.getColumnIndexOrThrow("weather")
                val tagsIndex = cursor.getColumnIndexOrThrow("tags")

                while (cursor.moveToNext()) {
                    val uid = cursor.getString(idIndex) ?: continue
                    val content = cursor.getString(contentIndex) ?: ""
                    val createdAt = cursor.getLong(createdIndex)
                    val updatedAt = cursor.getLong(updatedIndex)

                    entryDao.upsert(
                        EntryEntity(
                            uid = uid,
                            content = content,
                            createdAt = createdAt,
                            updatedAt = updatedAt,
                            placeName = cursor.getString(locationDisplayIndex)
                                ?: cursor.getString(locationFullIndex),
                            placeLat = if (cursor.isNull(latIndex)) null else cursor.getDouble(latIndex),
                            placeLon = if (cursor.isNull(lonIndex)) null else cursor.getDouble(lonIndex),
                            weatherSummary = cursor.getString(weatherIndex),
                        ),
                    )

                    val tags = cursor.getString(tagsIndex)
                        ?.split(',')
                        ?.map { it.trim() }
                        ?.filter { it.isNotEmpty() }
                        .orEmpty()

                    tags.forEach { name ->
                        tagDao.insertTag(TagEntity(name = name))
                    }
                    tagDao.insertLinks(
                        tags.map { name -> EntryTagEntity(entryUid = uid, tagName = name) },
                    )

                    entries++
                }
            }

            database.rawQuery(
                "SELECT id, entryId, type, path, createdAt FROM media",
                null,
            ).use { cursor ->
                val idIndex = cursor.getColumnIndexOrThrow("id")
                val entryIndex = cursor.getColumnIndexOrThrow("entryId")
                val typeIndex = cursor.getColumnIndexOrThrow("type")
                val pathIndex = cursor.getColumnIndexOrThrow("path")
                val createdIndex = cursor.getColumnIndexOrThrow("createdAt")

                while (cursor.moveToNext()) {
                    val path = cursor.getString(pathIndex) ?: continue
                    mediaDao.insert(
                        MediaEntity(
                            uid = cursor.getString(idIndex) ?: continue,
                            entryUid = cursor.getString(entryIndex) ?: continue,
                            type = cursor.getString(typeIndex) ?: "image",
                            // The old paths were absolute and the package is the same, so the files
                            // are still where they were left.
                            path = path.removePrefix("file://"),
                            thumbnailPath = null,
                            createdAt = cursor.getLong(createdIndex),
                        ),
                    )
                    photos++
                }
            }

            database.close()
        } finally {
            copy.delete()
        }

        tagDao.recountAll()
        tagDao.deleteUnusedTags()

        LegacyImportResult(
            entriesImported = entries,
            photosImported = photos,
            message = if (entries == 0) {
                "The previous version's entries were already here."
            } else {
                "$entries entries imported" +
                    if (photos > 0) " and $photos photos." else "."
            },
        )
    }

    /**
     * A copy of the old database, with its write-ahead log beside it.
     */
    private fun copyDatabase(source: File): File? = runCatching {
        val directory = File(context.cacheDir, "legacy-import").apply { mkdirs() }
        val copy = File(directory, "daylog.db")
        source.copyTo(copy, overwrite = true)
        File(source.absolutePath + "-wal").takeIf { it.exists() }
            ?.copyTo(File(directory, "daylog.db-wal"), overwrite = true)
        File(source.absolutePath + "-shm").takeIf { it.exists() }
            ?.copyTo(File(directory, "daylog.db-shm"), overwrite = true)
        copy
    }.getOrNull()

    private companion object {
        const val LEGACY_DATABASE_NAME = "daylog.db"
    }
}
