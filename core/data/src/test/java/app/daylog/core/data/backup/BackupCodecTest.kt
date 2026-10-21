package app.daylog.core.data.backup

import app.daylog.core.testing.TestData
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class BackupCodecTest {

    @Test
    fun `a file survives a round trip`() {
        val original = BackupFile(
            exportedAt = 1_700_000_000_000,
            entries = listOf(
                BackupEntry(
                    uid = "entry-1",
                    content = "A thought #work",
                    createdAt = 1_700_000_000_000,
                    updatedAt = 1_700_000_000_500,
                    placeName = "Bologna",
                    placeLat = 44.49,
                    placeLon = 11.34,
                    weatherSummary = "Clear",
                    weatherCode = 0,
                ),
            ),
            tags = listOf(BackupTag("work", count = 1)),
        )

        val restored = BackupCodec.decode(BackupCodec.encode(original))

        assertEquals(original.entries, restored?.entries)
        assertEquals(original.tags, restored?.tags)
        assertEquals(BackupFile.CURRENT_VERSION, restored?.version)
    }

    @Test
    fun `a deleted entry keeps its tombstone`() {
        val original = BackupFile(
            exportedAt = 0,
            entries = listOf(
                BackupEntry(
                    uid = "entry-1",
                    content = "gone",
                    createdAt = 1,
                    updatedAt = 2,
                    deletedAt = 2,
                ),
            ),
        )

        val restored = BackupCodec.decode(BackupCodec.encode(original))

        assertEquals(2L, restored?.entries?.first()?.deletedAt)
    }

    @Test
    fun `a file from a version this app does not know is refused`() {
        val file = BackupFile(exportedAt = 0, entries = emptyList())
        val text = BackupCodec.encode(file).replace("\"2.0\"", "\"9.0\"")

        assertNull(BackupCodec.decode(text))
    }

    @Test
    fun `something that is not a backup is refused`() {
        assertNull(BackupCodec.decode("this is not a backup"))
        assertNull(BackupCodec.decode(""))
        assertNull(BackupCodec.decode("{\"version\":\"2.0\"}"))
    }

    @Test
    fun `the entries of a file read as the app's own`() {
        val file = BackupFile(
            exportedAt = 0,
            entries = listOf(
                BackupEntry(
                    uid = "entry-1",
                    content = "A thought",
                    createdAt = 1,
                    updatedAt = 2,
                ),
            ),
        )

        val entries = file.toEntries()

        assertEquals(1, entries.size)
        assertEquals("A thought", entries.first().content)
        assertTrue(entries.first().deletedAt == null)
    }

    @Test
    fun `the test data builds a valid entry`() {
        val entry = TestData.entry(content = "hello")
        assertEquals("hello", entry.content)
        assertEquals("entry-1", entry.uid)
    }
}
