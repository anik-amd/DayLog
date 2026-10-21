package app.daylog.core.testing

import app.daylog.core.model.Entry
import app.daylog.core.model.Media
import app.daylog.core.model.MediaType
import app.daylog.core.model.Tag
import java.util.UUID

/**
 * Test data.
 *
 * The builders take the values a test cares about and fill in the rest, so a test reads as the
 * one thing it is about rather than a wall of constructor arguments.
 */
object TestData {

    /**
     * An entry.
     *
     * The uid is fixed unless the test needs a different one, so a test that writes an entry and
     * reads it back can rely on the value.
     */
    fun entry(
        content: String = "A plain entry",
        uid: String = "entry-1",
        createdAt: Long = 1_700_000_000_000,
        updatedAt: Long = createdAt,
        deletedAt: Long? = null,
        placeName: String? = null,
        placeLat: Double? = null,
        placeLon: Double? = null,
        weatherSummary: String? = null,
        weatherCode: Int? = null,
    ): Entry = Entry(
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

    /**
     * A photo.
     */
    fun media(
        entryUid: String = "entry-1",
        uid: String = "media-1",
        path: String = "/data/media/photo.jpg",
        createdAt: Long = 1_700_000_000_000,
    ): Media = Media(
        uid = uid,
        entryUid = entryUid,
        type = MediaType.Image,
        path = path,
        thumbnailPath = null,
        createdAt = createdAt,
    )

    /**
     * A tag.
     */
    fun tag(name: String = "work", count: Int = 1): Tag = Tag(name = name, count = count)

    /**
     * A uid that is different every time, for tests that need more than one entry.
     */
    fun newUid(): String = UUID.randomUUID().toString()
}
