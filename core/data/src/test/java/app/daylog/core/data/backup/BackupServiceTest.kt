package app.daylog.core.data.backup

import app.daylog.core.data.local.EntryEntity
import app.daylog.core.data.local.EntryFtsEntity
import app.daylog.core.data.local.EntryTagEntity
import app.daylog.core.data.local.TagEntity
import app.daylog.core.model.TagExtractor
import app.daylog.core.testing.FakeEntryDao
import app.daylog.core.testing.FakeEntryFtsDao
import app.daylog.core.testing.FakeMediaDao
import app.daylog.core.testing.FakeTagDao
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/**
 * Writing the entries out and bringing them back in.
 */
class BackupServiceTest {

    private lateinit var entryDao: FakeEntryDao
    private lateinit var tagDao: FakeTagDao
    private lateinit var mediaDao: FakeMediaDao
    private lateinit var ftsDao: FakeEntryFtsDao
    private lateinit var service: BackupService

    @Before
    fun setUp() {
        entryDao = FakeEntryDao()
        tagDao = FakeTagDao()
        mediaDao = FakeMediaDao()
        ftsDao = FakeEntryFtsDao()
        service = BackupService(entryDao, tagDao, mediaDao, ftsDao, now = { 5_000L })
    }

    @Test
    fun `the entries are written out with their tags`() = runTest {
        writeEntry("a thought #work", uid = "one", createdAt = 1_000L)

        val exported = service.export()

        assertEquals(1, exported.file.entries.size)
        assertEquals("one", exported.file.entries.first().uid)
        assertEquals(listOf("work"), exported.file.entries.first().tags)
    }

    @Test
    fun `the entries are brought back in`() = runTest {
        writeEntry("a thought #work", uid = "one", createdAt = 1_000L)
        val exported = service.export().file

        val fresh = BackupService(FakeEntryDao(), FakeTagDao(), FakeMediaDao(), FakeEntryFtsDao())
        val result = fresh.restore(exported)

        assertEquals(1, result.entriesAdded)
    }

    @Test
    fun `bringing the same file in twice does not duplicate the entries`() = runTest {
        writeEntry("a thought #work", uid = "one", createdAt = 1_000L)
        val exported = service.export().file

        service.restore(exported)
        service.restore(exported)

        assertEquals(1, entryDao.stored.size)
    }

    @Test
    fun `the newer entry is the one that is kept`() = runTest {
        writeEntry("the old version", uid = "one", createdAt = 1_000L, updatedAt = 1_000L)
        val exported = service.export().file

        // The entry is written again after the file was made.
        writeEntry("the new version", uid = "one", createdAt = 1_000L, updatedAt = 9_000L)

        val result = service.restore(exported)

        assertEquals(0, result.entriesUpdated)
        assertEquals("the new version", entryDao.findByUid("one")!!.content)
    }

    @Test
    fun `the newer file wins over the entry that is here`() = runTest {
        writeEntry("the old version", uid = "one", createdAt = 1_000L, updatedAt = 1_000L)
        val exported = service.export().file

        writeEntry("the new version", uid = "one", createdAt = 1_000L, updatedAt = 9_000L)
        val newer = exported.copy(
            entries = exported.entries.map { it.copy(content = "from the file", updatedAt = 20_000L) },
        )

        service.restore(newer)

        assertEquals("from the file", entryDao.findByUid("one")!!.content)
    }

    @Test
    fun `an entry that was deleted stays deleted`() = runTest {
        writeEntry("a thought", uid = "one", createdAt = 1_000L)
        val exported = service.export().file

        val deleted = exported.copy(
            entries = exported.entries.map { it.copy(deletedAt = 3_000L, updatedAt = 3_000L) },
        )

        service.restore(deleted)

        assertNotNull(entryDao.findByUid("one")!!.deletedAt)
    }

    @Test
    fun `the tags of a restored entry come back`() = runTest {
        writeEntry("a thought #work", uid = "one", createdAt = 1_000L)
        val exported = service.export().file

        val freshTagDao = FakeTagDao()
        val fresh = BackupService(FakeEntryDao(), freshTagDao, FakeMediaDao(), FakeEntryFtsDao())
        fresh.restore(exported)

        assertEquals(listOf("work"), freshTagDao.tagsForEntry("one"))
    }

    @Test
    fun `a restored entry can be found by searching for it`() = runTest {
        writeEntry("a thought about walking", uid = "one", createdAt = 1_000L)
        val exported = service.export().file

        val freshFts = FakeEntryFtsDao()
        val fresh = BackupService(FakeEntryDao(), FakeTagDao(), FakeMediaDao(), freshFts)
        fresh.restore(exported)

        assertTrue(freshFts.search("walk*").contains("one"))
    }

    @Test
    fun `a file with nothing in it changes nothing`() = runTest {
        writeEntry("a thought", uid = "one", createdAt = 1_000L)

        val result = service.restore(BackupFile(exportedAt = 1_000L, entries = emptyList()))

        assertEquals(0, result.entriesAdded)
        assertEquals(1, entryDao.stored.size)
    }

    @Test
    fun `a photo whose file has gone is left out of the export`() = runTest {
        writeEntry("a thought", uid = "one", createdAt = 1_000L)

        val exported = service.export()

        assertEquals(0, exported.photos.size)
    }

    /**
     * Writes an entry the way the app would, with its tags and its place in the search index.
     */
    private suspend fun writeEntry(
        content: String,
        uid: String,
        createdAt: Long,
        updatedAt: Long = createdAt,
    ) {
        entryDao.upsert(
            EntryEntity(
                id = 0,
                uid = uid,
                content = content,
                createdAt = createdAt,
                updatedAt = updatedAt,
            ),
        )

        val saved = entryDao.findByUid(uid)!!
        val tags = TagExtractor.extract(content)

        tags.forEach { tagDao.insertTag(TagEntity(name = it)) }
        tagDao.insertLinks(tags.map { EntryTagEntity(entryUid = uid, tagName = it) })

        ftsDao.upsert(
            EntryFtsEntity(
                rowid = saved.id,
                uid = uid,
                content = content,
                tags = tags.joinToString(" "),
            ),
        )
    }
}
