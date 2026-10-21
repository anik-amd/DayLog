package app.daylog.feature.timeline

import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.testing.FakeEntryDao
import app.daylog.core.testing.FakeMediaDao
import app.daylog.core.testing.FakeTagDao
import app.daylog.core.testing.TestDispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class TimelineViewModelTest {

    private val entryDao = FakeEntryDao()
    private val tagDao = FakeTagDao()
    private val mediaDao = FakeMediaDao()

    private val repository = EntryRepository(
        entryDao = entryDao,
        tagDao = tagDao,
        mediaDao = mediaDao,
        now = { 1_700_000_000_000 },
    )

    private fun viewModel() = TimelineViewModel(
        repository = repository,
        dispatchers = TestDispatchers(),
    )

    @Test
    fun `the draft is not written before the writer stops typing`() = runTest {
        val viewModel = viewModel()

        viewModel.onDraftChanged("a thought")

        advanceTimeBy(TimelineViewModel.AUTOSAVE_DELAY_MS - 1)

        assertEquals(0, entryDao.stored.size)
    }

    @Test
    fun `the draft is written once the writer stops typing`() = runTest {
        val viewModel = viewModel()

        viewModel.onDraftChanged("a thought")
        advanceTimeBy(TimelineViewModel.AUTOSAVE_DELAY_MS)

        assertEquals(1, entryDao.stored.size)
        assertEquals("a thought", entryDao.stored.first().content)
    }

    @Test
    fun `only the last text is written when the writer keeps typing`() = runTest {
        val viewModel = viewModel()

        viewModel.onDraftChanged("a")
        advanceTimeBy(300)
        viewModel.onDraftChanged("a th")
        advanceTimeBy(300)
        viewModel.onDraftChanged("a thought")
        advanceTimeBy(TimelineViewModel.AUTOSAVE_DELAY_MS)

        assertEquals(1, entryDao.stored.size)
        assertEquals("a thought", entryDao.stored.first().content)
    }

    @Test
    fun `the bar empties once the entry is written`() = runTest {
        val viewModel = viewModel()

        viewModel.onDraftChanged("a thought")
        advanceTimeBy(TimelineViewModel.AUTOSAVE_DELAY_MS)

        assertEquals("", viewModel.state.value.draft)
    }

    @Test
    fun `an empty draft is not written`() = runTest {
        val viewModel = viewModel()

        viewModel.onDraftChanged("   ")
        advanceTimeBy(TimelineViewModel.AUTOSAVE_DELAY_MS)

        assertEquals(0, entryDao.stored.size)
    }

    @Test
    fun `the tags are read out of the entry when it is written`() = runTest {
        val viewModel = viewModel()

        viewModel.onDraftChanged("a thought #work")
        advanceTimeBy(TimelineViewModel.AUTOSAVE_DELAY_MS)

        assertEquals(listOf("work"), tagDao.tagsForEntry(entryDao.stored.first().uid))
    }

    @Test
    fun `deleting an entry leaves a tombstone rather than removing the row`() = runTest {
        val viewModel = viewModel()
        viewModel.onDraftChanged("a thought")
        advanceTimeBy(TimelineViewModel.AUTOSAVE_DELAY_MS)
        val uid = entryDao.stored.first().uid

        viewModel.deleteEntry(uid)

        assertEquals(1, entryDao.stored.size)
        assertTrue(entryDao.stored.first().deletedAt != null)
    }

    @Test
    fun `a deleted entry does not show in the timeline`() = runTest {
        val viewModel = viewModel()
        viewModel.onDraftChanged("a thought")
        advanceTimeBy(TimelineViewModel.AUTOSAVE_DELAY_MS)
        val uid = entryDao.stored.first().uid

        viewModel.deleteEntry(uid)

        assertEquals(0, viewModel.state.value.groups.sumOf { it.entries.size })
        assertFalse(viewModel.state.value.groups.any { group -> group.entries.any { it.uid == uid } })
    }
}
