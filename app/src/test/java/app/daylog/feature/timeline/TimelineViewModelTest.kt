package app.daylog.feature.timeline

import android.net.Uri
import androidx.test.ext.junit.runners.AndroidJUnit4
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.testing.FakeEntryDao
import app.daylog.core.testing.FakeEntryFtsDao
import app.daylog.core.testing.FakeMediaDao
import app.daylog.core.testing.FakeMediaStore
import app.daylog.core.testing.FakeTagDao
import app.daylog.core.testing.MainDispatcherRule
import app.daylog.core.testing.TestDispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.annotation.Config

/**
 * The timeline's state holder.
 *
 * The photo tests run on Robolectric, because a Uri comes from the device — the rest answer on
 * the plain JVM.
 */
@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34])
class TimelineViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val entryDao = FakeEntryDao()
    private val tagDao = FakeTagDao()
    private val mediaDao = FakeMediaDao()
    private val entryFtsDao = FakeEntryFtsDao()
    private val mediaStore = FakeMediaStore()

    private val repository = EntryRepository(
        entryDao = entryDao,
        tagDao = tagDao,
        mediaDao = mediaDao,
        entryFtsDao = entryFtsDao,
        now = { 1_700_000_000_000 },
    )

    private fun viewModel() = TimelineViewModel(
        repository = repository,
        mediaStore = mediaStore,
        dispatchers = TestDispatchers(mainDispatcherRule.dispatcher),
    )

    @Test
    fun `nothing is written while the writer is typing`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a thought")
            advanceUntilIdle()

            assertEquals(0, entryDao.stored.size)
        }

    @Test
    fun `the save button writes the thought and empties the bar`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.onDraftChanged("a thought")
            viewModel.save()
            advanceUntilIdle()

            assertEquals(1, entryDao.stored.size)
            assertEquals("a thought", entryDao.stored.first().content)
            assertEquals("", viewModel.state.value.draft)
        }

    @Test
    fun `the next save starts a new entry`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a thought")
            viewModel.save()
            viewModel.onDraftChanged("another thought")
            viewModel.save()
            advanceUntilIdle()

            assertEquals(2, entryDao.stored.size)
        }

    @Test
    fun `a blank save writes nothing`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("   ")
            viewModel.save()
            advanceUntilIdle()

            assertEquals(0, entryDao.stored.size)
        }

    @Test
    fun `the tags are read out of the entry when it is written`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.onDraftChanged("a thought #work")
            viewModel.save()
            advanceUntilIdle()

            assertEquals(listOf("work"), tagDao.tagsForEntry(entryDao.stored.first().uid))
        }

    @Test
    fun `a photo begins the entry when the bar is empty`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.addPhoto(Uri.parse("content://gallery/one"))
            advanceUntilIdle()

            assertEquals(1, entryDao.stored.size)
            val entry = entryDao.stored.first()
            assertEquals(1, mediaStore.observeMedia(entry.uid).first().size)
        }

    @Test
    fun `a photo keeps writing open and the save button closes it`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.onDraftChanged("a thought")
            viewModel.addPhoto(Uri.parse("content://gallery/one"))
            advanceUntilIdle()

            // Whatever is typed stays in the bar until the writer says save.
            assertEquals("a thought", viewModel.state.value.draft)
            assertEquals(1, entryDao.stored.size)

            viewModel.save()
            advanceUntilIdle()

            assertEquals("a thought", entryDao.stored.first().content)
            assertEquals("", viewModel.state.value.draft)
        }

    @Test
    fun `handing off takes the text and empties the bar`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.onDraftChanged("a thought")
            val handoff = viewModel.handOffDraft()

            assertEquals("a thought", handoff.text)
            assertNull(handoff.uid)
            assertEquals("", viewModel.state.value.draft)
        }

    @Test
    fun `handing off continues an entry that a photo began`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.addPhoto(Uri.parse("content://gallery/one"))
            advanceUntilIdle()
            val uid = entryDao.stored.first().uid

            val handoff = viewModel.handOffDraft()

            assertEquals(uid, handoff.uid)
        }

    @Test
    fun `deleting an entry leaves a tombstone rather than removing the row`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            viewModel.onDraftChanged("a thought")
            viewModel.save()
            advanceUntilIdle()
            val uid = entryDao.stored.first().uid

            viewModel.deleteEntry(uid)
            advanceUntilIdle()

            assertEquals(1, entryDao.stored.size)
            assertTrue(entryDao.stored.first().deletedAt != null)
        }

    @Test
    fun `a deleted entry does not show in the timeline`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.onDraftChanged("a thought")
            viewModel.save()
            advanceUntilIdle()
            val uid = entryDao.stored.first().uid

            viewModel.deleteEntry(uid)
            advanceUntilIdle()

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
            advanceUntilIdle()

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
            advanceUntilIdle()

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
            advanceUntilIdle()
            viewModel.toggleTag("work")
            advanceUntilIdle()

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
            advanceUntilIdle()
            viewModel.clearTags()
            advanceUntilIdle()

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(2, entries.size)
        }

    @Test
    fun `choosing a place narrows the timeline to the entries that were written there`() =
        runTest(mainDispatcherRule.dispatcher) {
            repository.save("at the sea", placeName = "the harbour")
            repository.save("at the desk", placeName = "home")
            repository.save("nowhere in particular")
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.togglePlace("the harbour")
            advanceUntilIdle()

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(1, entries.size)
            assertEquals("at the sea", entries.first().content)
        }

    @Test
    fun `two places chosen together show the entries at either of them`() =
        runTest(mainDispatcherRule.dispatcher) {
            repository.save("at the sea", placeName = "the harbour")
            repository.save("at the desk", placeName = "home")
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.togglePlace("the harbour")
            viewModel.togglePlace("home")
            advanceUntilIdle()

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(2, entries.size)
        }

    @Test
    fun `a place filter and a tag filter work together`() =
        runTest(mainDispatcherRule.dispatcher) {
            repository.save("a stormy walk #sea", placeName = "the harbour")
            repository.save("a calm walk #sea", placeName = "home")
            repository.save("a walk with no tag", placeName = "the harbour")
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.toggleTag("sea")
            viewModel.togglePlace("the harbour")
            advanceUntilIdle()

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(1, entries.size)
            assertEquals("a stormy walk #sea", entries.first().content)
        }

    @Test
    fun `clearing the places brings everything back`() =
        runTest(mainDispatcherRule.dispatcher) {
            repository.save("at the sea", placeName = "the harbour")
            repository.save("at the desk", placeName = "home")
            val viewModel = viewModel()
            watchState(viewModel)

            viewModel.togglePlace("the harbour")
            advanceUntilIdle()
            viewModel.clearPlaces()
            advanceUntilIdle()

            val entries = viewModel.state.value.groups.flatMap { it.entries }
            assertEquals(2, entries.size)
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
