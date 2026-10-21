package app.daylog.feature.timeline

import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.testing.FakeEntryDao
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

    private val repository = EntryRepository(
        entryDao = entryDao,
        tagDao = tagDao,
        mediaDao = mediaDao,
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
    fun `the bar empties once the entry is written`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            val states = collectStates(viewModel)

            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            runCurrent()

            assertEquals("", states.last().draft)
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
            val states = collectStates(viewModel)

            viewModel.onDraftChanged("a thought")
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            runCurrent()
            val uid = entryDao.stored.first().uid

            viewModel.deleteEntry(uid)
            advance(TimelineViewModel.AUTOSAVE_DELAY_MS)
            runCurrent()

            assertEquals(0, states.last().groups.sumOf { it.entries.size })
            assertFalse(states.last().groups.any { group -> group.entries.any { it.uid == uid } })
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
     */
    private fun kotlinx.coroutines.test.TestScope.collectStates(
        viewModel: TimelineViewModel,
    ): List<TimelineUiState> {
        val states = mutableListOf<TimelineUiState>()
        launch { viewModel.state.collect { states += it } }
        runCurrent()
        return states
    }
}
