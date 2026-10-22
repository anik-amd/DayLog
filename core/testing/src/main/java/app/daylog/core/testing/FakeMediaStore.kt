package app.daylog.core.testing

import android.net.Uri
import app.daylog.core.data.repository.MediaStore
import app.daylog.core.model.Media
import app.daylog.core.model.MediaType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map

/**
 * A media store with nothing behind it.
 *
 * The photos it holds live in a list, so a test can ask what a photo became attached to without
 * there being a device to pick one from.
 */
class FakeMediaStore : MediaStore {

    val stored = MutableStateFlow<List<Media>>(emptyList())

    override fun observeMedia(entryUid: String): Flow<List<Media>> =
        stored.map { all -> all.filter { it.entryUid == entryUid } }

    override suspend fun addMedia(entryUid: String, uri: Uri): String {
        val uid = "media-${stored.value.size + 1}"
        stored.value = stored.value + Media(
            uid = uid,
            entryUid = entryUid,
            type = MediaType.Image,
            // A Uri stub on the JVM may answer nothing when asked for its text; the store is
            // only interested in having something to name the photo by.
            path = runCatching { uri.toString() }.getOrDefault("photo"),
            createdAt = 0L,
        )
        return uid
    }

    override suspend fun removeMedia(mediaUid: String) {
        stored.value = stored.value.filterNot { it.uid == mediaUid }
    }

    override suspend fun removeMediaForEntry(entryUid: String) {
        stored.value = stored.value.filterNot { it.entryUid == entryUid }
    }
}
