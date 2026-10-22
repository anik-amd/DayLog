package app.daylog.core.data.backup

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

/**
 * The file an export writes and an import reads.
 */
class BackupArchiveTest {

    @get:Rule
    val folder = TemporaryFolder()

    @Test
    fun `the writing comes back as it went in`() {
        val bytes = write("daylog.json", emptyList())

        val archive = read(bytes)

        assertEquals("daylog.json", archive!!.json)
        assertEquals(0, archive.photos.size)
    }

    @Test
    fun `the photos come back too`() {
        val photo = folder.newFile("picture.jpg").apply { writeText("not really a photo") }
        val bytes = write(
            "daylog.json",
            listOf(BackupArchive.Photo(uid = "p1", entryUid = "e1", file = photo, thumbnail = null)),
        )

        val archive = read(bytes)

        assertEquals(1, archive!!.photos.size)
        assertEquals("p1", archive.photos.first().uid)
        assertEquals("not really a photo", archive.photos.first().file.readText())
    }

    @Test
    fun `the thumbnail comes back with the photo`() {
        val photo = folder.newFile("picture.jpg").apply { writeText("picture") }
        val thumbnail = folder.newFile("picture_thumb.jpg").apply { writeText("thumbnail") }
        val bytes = write(
            "daylog.json",
            listOf(BackupArchive.Photo(uid = "p1", entryUid = "e1", file = photo, thumbnail = thumbnail)),
        )

        val archive = read(bytes)

        assertNotNull(archive!!.photos.first().thumbnail)
        assertEquals("thumbnail", archive.photos.first().thumbnail!!.readText())
    }

    @Test
    fun `a plain json file is read as well`() {
        val bytes = """{"version":"2.0"}""".toByteArray()

        val archive = read(bytes)

        assertEquals("""{"version":"2.0"}""", archive!!.json)
        assertEquals(0, archive.photos.size)
    }

    @Test
    fun `a file with nothing in it is refused`() {
        val bytes = ByteArray(0)

        assertNull(read(bytes))
    }

    private fun write(json: String, photos: List<BackupArchive.Photo>): ByteArray {
        val output = ByteArrayOutputStream()
        BackupArchive.write(output, json, photos)
        return output.toByteArray()
    }

    private fun read(bytes: ByteArray): BackupArchive.Archive? {
        val media = folder.newFolder("media")
        val cache = folder.newFolder("cache")
        return BackupArchive.read(
            input = ByteArrayInputStream(bytes),
            mediaDirectory = media,
            cacheDirectory = cache,
        )
    }
}
