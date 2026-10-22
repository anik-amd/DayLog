package app.daylog.core.data.repository

import app.daylog.core.testing.FakeEntryDao
import app.daylog.core.testing.FakeEntryFtsDao
import app.daylog.core.testing.FakeMediaDao
import app.daylog.core.testing.FakeTagDao
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The rules of the repository: what is written, what is found, and what is kept in step.
 */
class EntryRepositoryTest {

    private val entryDao = FakeEntryDao()
    private val tagDao = FakeTagDao()
    private val mediaDao = FakeMediaDao()
    private val ftsDao = FakeEntryFtsDao()

    private val repository = EntryRepository(
        entryDao = entryDao,
        tagDao = tagDao,
        mediaDao = mediaDao,
        entryFtsDao = ftsDao,
        now = { 1_700_000_000_000 },
    )

    @Test
    fun `a saved entry comes back`() = runTest {
        repository.save("a thought")

        val entries = repository.observeEntries().first()

        assertEquals(1, entries.size)
        assertEquals("a thought", entries.first().content)
    }

    @Test
    fun `saving the same entry again updates it rather than adding another`() = runTest {
        val uid = repository.save("a thought")
        repository.save("a better thought", uid = uid)

        val entries = repository.observeEntries().first()

        assertEquals(1, entries.size)
        assertEquals("a better thought", entries.first().content)
    }

    @Test
    fun `the tags of an entry are read out of its text`() = runTest {
        val uid = repository.save("a thought #work #idea")

        assertEquals(listOf("work", "idea"), tagDao.tagsForEntry(uid))
    }

    @Test
    fun `a tag that is taken out of the text goes away with it`() = runTest {
        val uid = repository.save("a thought #work")
        repository.save("a thought", uid = uid)

        assertEquals(emptyList<String>(), tagDao.tagsForEntry(uid))
    }

    @Test
    fun `a deleted entry is not in the timeline but is still on the disk`() = runTest {
        val uid = repository.save("a thought")

        repository.delete(uid)

        assertEquals(0, repository.observeEntries().first().size)
        assertEquals(1, entryDao.stored.size)
    }

    @Test
    fun `an entry is written into the search index when it is saved`() = runTest {
        repository.save("a thought about the rain")

        assertEquals(1, ftsDao.indexed.size)
        assertEquals("a thought about the rain", ftsDao.indexed.first().content)
    }

    @Test
    fun `the index is rewritten when the entry changes`() = runTest {
        val uid = repository.save("a thought")
        repository.save("another thought", uid = uid)

        assertEquals(1, ftsDao.indexed.size)
        assertEquals("another thought", ftsDao.indexed.first().content)
    }

    @Test
    fun `a deleted entry is taken out of the search index`() = runTest {
        val uid = repository.save("a thought")

        repository.delete(uid)

        assertEquals(0, ftsDao.indexed.size)
    }

    @Test
    fun `the index carries the tags as well as the text`() = runTest {
        repository.save("a thought #work")

        assertEquals("work", ftsDao.indexed.first().tags)
    }

    @Test
    fun `an empty search finds nothing rather than everything`() = runTest {
        repository.save("a thought")

        assertEquals(emptyList<Any>(), repository.search("").first())
    }

    @Test
    fun `a search finds an entry by a word in it`() = runTest {
        repository.save("a thought about the rain")
        repository.save("something else entirely")

        val found = repository.search("rain").first()

        assertEquals(1, found.size)
        assertEquals("a thought about the rain", found.first().content)
    }

    @Test
    fun `a search finds an entry by a prefix of a word`() = runTest {
        repository.save("reading in the train")

        assertEquals(1, repository.search("read").first().size)
    }

    @Test
    fun `a search finds an entry by its tag`() = runTest {
        repository.save("a thought #weather")

        assertEquals(1, repository.search("weather").first().size)
    }

    @Test
    fun `a search for something that is not there finds nothing`() = runTest {
        repository.save("a thought about the rain")

        assertEquals(0, repository.search("bicycle").first().size)
    }

    @Test
    fun `a search with several words needs all of them`() = runTest {
        repository.save("a thought about the rain")
        repository.save("a thought about the sun")

        val found = repository.search("rain sun").first()

        assertEquals(0, found.size)
    }
}
