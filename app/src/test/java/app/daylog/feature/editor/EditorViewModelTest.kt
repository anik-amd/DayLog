package app.daylog.feature.editor

import android.net.Uri
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
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

private const val NOW = 1_700_000_000_000L

@OptIn(ExperimentalCoroutinesApi::class)
class EditorViewModelTest {

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
        now = { NOW },
    )

    private fun viewModel(uid: String? = null, initialText: String = "") = EditorViewModel(
        repository = repository,
        mediaStore = mediaStore,
        uid = uid,
        initialText = initialText,
        now = { NOW },
    )

    @Test
    fun `a new editor holds the handed-over text and the current moment`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel(initialText = "handed over")
            val state = viewModel.state.first { it.text != null }

            assertEquals("handed over", state.text)
            assertNull(state.uid)
            assertEquals(NOW, state.createdAt)
        }

    @Test
    fun `an editor given an entry loads its text, moment and photos`() =
        runTest(mainDispatcherRule.dispatcher) {
            val uid = repository.save("a thought", createdAt = 1_234_000)
            mediaStore.addMedia(uid, Uri.parse("content://gallery/one"))

            val viewModel = viewModel(uid = uid)
            val state = viewModel.state.first { it.media.isNotEmpty() }

            assertEquals("a thought", state.text)
            assertEquals(1_234_000, state.createdAt)
            assertEquals(1, state.media.size)
        }

    @Test
    fun `the quick bar's handover stands when it is newer than the entry`() =
        runTest(mainDispatcherRule.dispatcher) {
            val uid = repository.save("a thought")

            val viewModel = viewModel(uid = uid, initialText = "a thought, edited")
            val state = viewModel.state.first { it.text != null }

            assertEquals("a thought, edited", state.text)
        }

    @Test
    fun `saving a new entry keeps it on further saves`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel(initialText = "first")
            viewModel.save()
            viewModel.onTextChanged("first, second")
            viewModel.save()
            advanceUntilIdle()

            assertEquals(1, entryDao.stored.size)
            assertEquals("first, second", entryDao.stored.first().content)
        }

    @Test
    fun `a blank new draft is not written`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.save()
            advanceUntilIdle()

            assertEquals(0, entryDao.stored.size)
        }

    @Test
    fun `setting the moment is kept by the next save`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel(initialText = "a thought")

            viewModel.setTime(1_500_000)
            viewModel.save()
            advanceUntilIdle()

            assertEquals(1_500_000, entryDao.stored.first().createdAt)
        }

    @Test
    fun `a photo begins the entry when there is none`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.addMedia(Uri.parse("content://gallery/one"))
            advanceUntilIdle()

            assertEquals(1, entryDao.stored.size)
            val state = viewModel.state.first { it.uid != null }
            assertEquals(entryDao.stored.first().uid, state.uid)
            assertEquals(1, state.media.size)
        }

    @Test
    fun `discarding a photo-only draft takes the photo and the entry with it`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel()

            viewModel.addMedia(Uri.parse("content://gallery/one"))
            advanceUntilIdle()

            viewModel.discard()
            advanceUntilIdle()

            assertEquals(0, entryDao.stored.size)
            assertEquals(0, mediaStore.stored.value.size)
        }

    @Test
    fun `discarding an older entry puts it back as it was read`() =
        runTest(mainDispatcherRule.dispatcher) {
            val uid = repository.save("the original")

            val viewModel = viewModel(uid = uid, initialText = "the original, rewritten")
            viewModel.onTextChanged("the original, rewritten")
            viewModel.save()
            advanceUntilIdle()

            viewModel.discard()
            advanceUntilIdle()

            assertEquals(uid, entryDao.stored.single().uid)
            assertEquals("the original", entryDao.stored.single().content)
            assertTrue(entryDao.stored.single().deletedAt == null)
        }
}
