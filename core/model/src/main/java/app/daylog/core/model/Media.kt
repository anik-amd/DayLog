package app.daylog.core.model

/**
 * A photo attached to an entry.
 */
data class Media(
    val uid: String,
    val entryUid: String,
    val type: MediaType,
    val path: String,
    val thumbnailPath: String? = null,
    val createdAt: Long,
)

enum class MediaType {
    Image,
    Video,
    Audio,
    File,
}
