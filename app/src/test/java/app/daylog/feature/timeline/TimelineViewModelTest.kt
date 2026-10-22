package app.daylog.feature.timeline

import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.testing.FakeEntryDao
import app.daylog.core.testing.FakeEntryFtsDao
import app.daylog.core.testing.FakeMediaDao
import app.daylog.core.testing.FakeTagDao
import app.daylog.core.testing.MainDispatcherRule
import app.daylog.core.testing.TestDispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class TimelineViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val entryDao = FakeEntryDao()
    private val tagDao = FakeTagDao()
    private val mediaDao = FakeMediaDao()
    private val entryFtsDao = FakeEntryFtsDao()

    private val repository = EntryRepository(
        entryDao = entryDao,
        tagDao = tagDao,
        mediaDao = mediaDao,
        entryFtsDao = entryFtsDao,
        now = { 1_700_000_000_000 },
    )

    private fun viewModel() = TimelineViewModel(
        repository = repository,
        dispatchers = TestDispatchers(mainDispatcherRule.dispatcher),
    )

    @Test
    fun `the draft is not written before the writer stops typing`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS - 1)

            assertEquals(0, entryDao.stored.size)
        }

    @Test
    fun `the draft is written once the writer stops typing`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            assertEquals(1, entryDao.stored.size)
            assertEquals("a thought", entryDao.stored.first().content)
        }

    @Test
    fun `only the last text is written when the writer keeps typing`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a")
            advance(300)
            viewModel.onDraftChanged("a th")
            advance(300)
            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            assertEquals(1, entryDao.stored.size)
            assertEquals("a thought", entryDao.stored.first().content)
        }

    @Test
    fun `the text stays in the bar when the entry is written`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            // The writing is never taken out from under the writer.
            assertEquals("a thought", viewModel.state.value.draft)
        }

    @Test
    fun `a pause in the writing updates the same entry rather than starting another`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            viewModel.onDraftChanged("a thought that grew")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            assertEquals(1, entryDao.stored.size)
            assertEquals("a thought that grew", entryDao.stored.first().content)
        }

    @Test
    fun `emptying the bar leaves the entry in the timeline and makes room for a new one`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            viewModel.onDraftChanged("")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            viewModel.onDraftChanged("another thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            assertEquals(2, entryDao.stored.size)
        }

    @Test
    fun `an empty draft is not written`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("   ")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            assertEquals(0, entryDao.stored.size)
        }

    @Test
    fun `the tags are read out of the entry when it is written`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a thought #work")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            assertEquals(listOf("work"), tagDao.tagsForEntry(entryDao.stored.first().uid))
        }

    @Test
    fun `deleting an entry leaves a tombstone rather than removing the row`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            val uid = entryDao.stored.first().uid

            viewModel.deleteEntry(uid)
            runCurrent()

            assertEquals(1, entryDao.stored.size)
            assertTrue(entryDao.stored.first().deletedAt != null)
        }

    @Test
    fun `a deleted entry does not show in the timeline`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            val uid = entryDao.stored.first().uid

            viewModel.deleteEntry(uid)
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            val groups = viewModel.state.value.groups
            assertEquals(0, groups.sumOf { it.entries.size })
            assertFalse(groups.any { group -> group.entries.any { it.uid == uid } })
        }

    @Test
    fun `choosing a tag narrows the timeline to the entries that carry it`() =
        runTest(mainDispatcherRule.dispatcher) {
            repository.save("a thought #work")
            repository.save("another thought #idea")
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.toggleTag("work")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(1, entries.size)
            assertEquals("a thought #work", entries.first().content)
        }

    @Test
    fun `two tags chosen show only the entries that carry both`() =
        runTest(mainDispatcherRule.dispatcher) {
            repository.save("a thought #work #idea")
            repository.save("another thought #work")
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.toggleTag("work")
            viewModel.toggleTag("idea")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(1, entries.size)
            assertEquals("a thought #work #idea", entries.first().content)
        }

    @Test
    fun `turning a tag off again brings the other entries back`() =
        runTest(mainDispatcherRule.dispatcher) {
            repository.save("a thought #work")
            repository.save("another thought #idea")
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.toggleTag("work")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            viewModel.toggleTag("work")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(2, entries.size)
        }

    @Test
    fun `clearing the filters brings everything back`() =
        runTest(mainDispatcherRule.dispatcher) {
            repository.save("a thought #work")
            repository.save("another thought #idea")
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.toggleTag("work")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            viewModel.clearTags()
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(2, entries.size)
        }

    /**
     * Moves the virtual clock and runs whatever is due.
     *
     * `advanceTimeBy` alone does not run the work that was scheduled for exactly the moment it
     * reached, so the clock is followed by `runCurrent`.
     */
    private fun kotlinx.coroutines.test.TestScope.advance(millis: Long) {
        advanceTimeBy(millis)
        runCurrent()
    }

    /**
     * Watches the state, so the flow is running while the test moves time.
     *
     * The watcher is launched in the background scope, which cancels it when the test ends. A
     * watcher left running would fail the test for having unfinished work, which says nothing
     * about the behaviour being tested.
     */
    private fun kotlinx.coroutines.test.TestScope.watchState(viewModel: TimelineViewModel) {
        backgroundScope.launch { viewModel.state.collect { } }
        runCurrent()
    }
}
