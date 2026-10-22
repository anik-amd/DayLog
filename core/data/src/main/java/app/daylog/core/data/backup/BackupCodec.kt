package app.daylog.core.data.backup

import app.daylog.core.model.Entry
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * The exported file.
 *
 * This is the app's interchange format: what "Export" writes and what "Import" reads. A cloud
 * backup added later would write the same file, so the format does not have to change when that
 * arrives.
 */
@Serializable
data class BackupFile(
    /** The format version. `2.0` is the native app's format. */
    val version: String = CURRENT_VERSION,
    /** When the file was written. */
    val exportedAt: Long,
    /** The entries, including the ones that were deleted, so a restore is exact. */
    val entries: List<BackupEntry>,
    /** The tags. */
    val tags: List<BackupTag> = emptyList(),
    /** The photos. The files themselves travel separately; this records where they were. */
    val media: List<BackupMedia> = emptyList(),
) {
    companion object {
        const val CURRENT_VERSION = "2.0"
    }
}

@Serializable
data class BackupEntry(
    val uid: String,
    val content: String,
    val createdAt: Long,
    val updatedAt: Long,
    val deletedAt: Long? = null,
    val placeName: String? = null,
    val placeLat: Double? = null,
    val placeLon: Double? = null,
    val weatherSummary: String? = null,
    val weatherCode: Int? = null,
    /**
     * The tags of the entry.
     *
     * They are written out rather than read back out of the text, so the tags come across exactly
     * as they were, even if a future version lets a tag be attached without a `#` in the writing.
     */
    val tags: List<String> = emptyList(),
)

@Serializable
data class BackupTag(
    val name: String,
    val count: Int = 0,
)

@Serializable
data class BackupMedia(
    val uid: String,
    val entryUid: String,
    val type: String,
    val path: String,
    val thumbnailPath: String? = null,
    val createdAt: Long,
)

/**
 * Writes and reads the exported file.
 *
 * The format is validated before anything is written to the database. A file that is not a
 * backup, or that is from a version this app does not understand, is refused rather than
 * half-imported.
 */
object BackupCodec {

    private val json = Json {
        prettyPrint = true
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    /**
     * Writes the file.
     */
    fun encode(file: BackupFile): String = json.encodeToString(BackupFile.serializer(), file)

    /**
     * Reads the file.
     *
     * @return the file, or null when it is not a backup this app understands.
     */
    fun decode(text: String): BackupFile? = runCatching {
        val file = json.decodeFromString(BackupFile.serializer(), text)
        if (!isSupported(file.version)) null else file
    }.getOrNull()

    /**
     * Whether this app can read a file of that version.
     *
     * `1.x` is the React Native app's format: it had no version field, so a file without one is
     * read as the old format and converted.
     */
    fun isSupported(version: String): Boolean = version.startsWith("2.")
}

/**
 * The entries of a backup, as the app uses them.
 */
fun BackupFile.toEntries(): List<Entry> = entries.map { entry ->
    Entry(
        uid = entry.uid,
        content = entry.content,
        createdAt = entry.createdAt,
        updatedAt = entry.updatedAt,
        deletedAt = entry.deletedAt,
        placeName = entry.placeName,
        placeLat = entry.placeLat,
        placeLon = entry.placeLon,
        weatherSummary = entry.weatherSummary,
        weatherCode = entry.weatherCode,
    )
}
