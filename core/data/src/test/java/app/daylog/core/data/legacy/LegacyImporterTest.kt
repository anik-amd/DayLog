package app.daylog.core.data.legacy

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import app.daylog.core.testing.FakeEntryDao
import app.daylog.core.testing.FakeMediaDao
import app.daylog.core.testing.FakeTagDao
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config
import java.io.File

/**
 * Bringing the entries across from the previous version.
 *
 * This is the one piece of work that touches what the reader already has, so it is tested
 * against a database in the shape the old app actually wrote.
 */
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34])
class LegacyImporterTest {

    private lateinit var context: Context
    private lateinit var entryDao: FakeEntryDao
    private lateinit var tagDao: FakeTagDao
    private lateinit var mediaDao: FakeMediaDao
    private lateinit var importer: LegacyImporter

    @Before
    fun setUp() {
        context = ApplicationProvider.getApplicationContext()
        entryDao = FakeEntryDao()
        tagDao = FakeTagDao()
        mediaDao = FakeMediaDao()
        importer = LegacyImporter(context, entryDao, tagDao, mediaDao)

        writeLegacyDatabase()
    }

    private fun writeLegacyDatabase() {
        val directory = File(context.filesDir, "SQLite").apply { mkdirs() }
        val file = File(directory, "daylog.db")
        file.delete()

        val database = SQLiteDatabase.openOrCreateDatabase(file, null)
        database.execSQL(
            """
            CREATE TABLE IF NOT EXISTS entries (
              id TEXT PRIMARY KEY NOT NULL,
              content TEXT,
              createdAt INTEGER,
              updatedAt INTEGER,
              date TEXT,
              time TEXT,
              latitude REAL,
              longitude REAL,
              locationFull TEXT,
              locationDisplay TEXT,
              weather TEXT,
              tags TEXT
            )
            """.trimIndent(),
        )
        database.execSQL(
            "CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY NOT NULL, entryId TEXT, type TEXT, path TEXT, createdAt INTEGER)",
        )
        database.execSQL(
            "INSERT INTO entries VALUES ('old-1', 'A thought #work', 1000, 1000, '2024-01-01', '09:00', 44.49, 11.34, 'Bologna, Italy', 'Bologna', 'Clear', 'work')",
        )
        database.execSQL(
            "INSERT INTO entries VALUES ('old-2', 'Another thought', 2000, 2000, '2024-01-02', '10:00', null, null, null, null, null, '')",
        )
        database.execSQL(
            "INSERT INTO media VALUES ('m-1', 'old-1', 'image', '/data/media/old-1.jpg', 1000)",
        )
        database.close()
    }

    @Test
    fun `the old database is found where the old app kept it`() {
        assertTrue(importer.hasLegacyData())
    }

    @Test
    fun `the entries are brought across with their dates`() = runTest {
        val result = importer.import()

        assertEquals(2, result.entriesImported)
        assertEquals(2, entryDao.stored.size)

        val entry = entryDao.stored.first { it.uid == "old-1" }
        assertEquals("A thought #work", entry.content)
        assertEquals(1000L, entry.createdAt)
    }

    @Test
    fun `the place and the weather come across with the entry`() = runTest {
        importer.import()

        val entry = entryDao.stored.first { it.uid == "old-1" }
        assertEquals("Bologna", entry.placeName)
        assertEquals(44.49, entry.placeLat!!, 0.001)
        assertEquals("Clear", entry.weatherSummary)
    }

    @Test
    fun `the tags come across`() = runTest {
        importer.import()

        assertEquals(listOf("work"), tagDao.tagsForEntry("old-1"))
    }

    @Test
    fun `the photos come across`() = runTest {
        val result = importer.import()

        assertEquals(1, result.photosImported)
    }

    @Test
    fun `importing twice does not duplicate the entries`() = runTest {
        importer.import()
        importer.import()

        assertEquals(2, entryDao.stored.size)
    }

    @Test
    fun `nothing to import says so rather than failing`() = runTest {
        File(File(context.filesDir, "SQLite"), "daylog.db").delete()

        val result = importer.import()

        assertTrue(result.skipped)
        assertEquals(0, result.entriesImported)
    }
}
