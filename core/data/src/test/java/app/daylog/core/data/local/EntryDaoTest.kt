package app.daylog.core.data.local

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config

/**
 * The real database.
 *
 * The other tests answer from memory, which is fast but only proves the repository's own rules.
 * These run against the real Room database and the real SQLite full-text index, so a query that
 * only works in a fake cannot pass.
 */
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34])
class EntryDaoTest {

    private lateinit var database: DayLogDatabase
    private lateinit var entries: EntryDao
    private lateinit var fts: EntryFtsDao
    private lateinit var tags: TagDao

    @Before
    fun setUp() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            DayLogDatabase::class.java,
        ).allowMainThreadQueries().build()

        entries = database.entryDao()
        fts = database.entryFtsDao()
        tags = database.tagDao()
    }

    @After
    fun tearDown() {
        database.close()
    }

    private suspend fun insert(
        content: String,
        uid: String = "entry-1",
        createdAt: Long = 1_700_000_000_000,
    ): EntryEntity {
        val entity = EntryEntity(
            uid = uid,
            content = content,
            createdAt = createdAt,
            updatedAt = createdAt,
        )
        entries.upsert(entity)
        val saved = entries.findByUid(uid)!!
        fts.upsert(
            EntryFtsEntity(
                rowid = saved.id,
                uid = saved.uid,
                content = saved.content,
                tags = "",
            ),
        )
        return saved
    }

    @Test
    fun `an entry comes back`() = runTest {
        insert("a thought")

        val found = entries.observeEntries().first()

        assertEquals(1, found.size)
        assertEquals("a thought", found.first().content)
    }

    @Test
    fun `a deleted entry is not in the list but is still on the disk`() = runTest {
        insert("a thought")

        entries.softDelete("entry-1", deletedAt = 1, updatedAt = 1)

        assertEquals(0, entries.observeEntries().first().size)
        assertEquals(1, entries.findByUid("entry-1")?.let { 1 } ?: 0)
    }

    @Test
    fun `the full-text index finds an entry by a word in it`() = runTest {
        insert("a thought about the rain")

        val found = fts.search("rain*")

        assertEquals(listOf("entry-1"), found)
    }

    @Test
    fun `the full-text index matches the start of a word`() = runTest {
        insert("reading in the train")

        assertEquals(listOf("entry-1"), fts.search("read*"))
    }

    @Test
    fun `the full-text index does not match the middle of a word`() = runTest {
        insert("reading in the train")

        assertEquals(emptyList<String>(), fts.search("adi*"))
    }

    @Test
    fun `the full-text index needs every word of the search`() = runTest {
        insert("a thought about the rain")
        insert("a thought about the sun", uid = "entry-2")

        val found = fts.search("rain* AND sun*")

        assertEquals(emptyList<String>(), found)
    }

    @Test
    fun `the full-text index finds a word in the tags`() = runTest {
        val saved = insert("a thought")
        fts.upsert(
            EntryFtsEntity(
                rowid = saved.id,
                uid = saved.uid,
                content = saved.content,
                tags = "weather",
            ),
        )

        assertEquals(listOf("entry-1"), fts.search("weather*"))
    }

    @Test
    fun `the index is written with the entry it belongs to`() = runTest {
        val saved = insert("a thought")

        assertEquals(1, fts.count())
        assertEquals(saved.id, fts.search("thought*").size.toLong())
    }

    @Test
    fun `the entries are found by their uids, newest first`() = runTest {
        insert("older", uid = "old", createdAt = 1)
        insert("newer", uid = "new", createdAt = 2)

        val found = entries.findByUids(listOf("old", "new"))

        assertEquals(listOf("new", "old"), found.map { it.uid })
    }

    @Test
    fun `a deleted entry is not found by its uids`() = runTest {
        insert("a thought")
        entries.softDelete("entry-1", deletedAt = 1, updatedAt = 1)

        assertEquals(0, entries.findByUids(listOf("entry-1")).size)
    }

    @Test
    fun `the tag counts are read from the entries that carry them`() = runTest {
        insert("a thought")
        tags.insertTag(TagEntity(name = "work"))
        tags.insertLinks(listOf(EntryTagEntity(entryUid = "entry-1", tagName = "work")))

        tags.recountAll()

        val found = tags.observeTagsInUse().first()
        assertEquals(1, found.size)
        assertEquals(1, found.first().count)
    }

    @Test
    fun `the database has the tables the app needs`() = runTest {
        insert("a thought")

        val tables = mutableSetOf<String>()
        database.query("SELECT name FROM sqlite_master WHERE type = 'table'", emptyArray())
            .use { cursor ->
                while (cursor.moveToNext()) tables += cursor.getString(0)
            }

        assertTrue(tables.contains("entries"))
        assertTrue(tables.contains("tags"))
        assertTrue(tables.contains("entry_tags"))
        assertTrue(tables.contains("media"))
        assertTrue(tables.contains("entries_fts"))
    }
}
