package app.daylog.feature.editor

import android.net.Uri
import androidx.test.ext.junit.runners.AndroidJUnit4
import app.daylog.core.data.place.PickedPlace
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
import org.junit.runner.RunWith
import org.robolectric.annotation.Config

private const val NOW = 1_700_000_000_000L

/**
 * The editor's state holder.
 *
 * The photo tests need a Uri, which comes from the device's picker, so the class runs on
 * Robolectric; the rest answer on the plain JVM.
 */
@OptIn(ExperimentalCoroutinesApi::class)
@RunWith(AndroidJUnit4::class)
@Config(sdk = [34])
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

    private fun viewModel(
        uid: String? = null,
        initialText: String = "",
        initialPlace: PickedPlace? = null,
    ) = EditorViewModel(
        repository = repository,
        mediaStore = mediaStore,
        uid = uid,
        initialText = initialText,
        initialPlace = initialPlace,
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
            val uid = repository.save("a thought", createdAt = 1_234_000L)
            mediaStore.addMedia(uid, Uri.parse("content://gallery/one"))

            val viewModel = viewModel(uid = uid)
            val state = viewModel.state.first { it.media.isNotEmpty() }

            assertEquals("a thought", state.text)
            assertEquals(1_234_000L, state.createdAt)
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
    fun `a place the editor names is kept by the save`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel(initialText = "a thought")

            viewModel.setPlace(PickedPlace(name = "the harbour", latitude = 11.0, longitude = 76.9))
            viewModel.save()
            advanceUntilIdle()

            assertEquals("the harbour", entryDao.stored.first().placeName)
            assertEquals(11.0, entryDao.stored.first().placeLat)
            assertEquals(76.9, entryDao.stored.first().placeLon)
        }

    @Test
    fun `a place the editor takes off is cleared by the save`() =
        runTest(mainDispatcherRule.dispatcher) {
            val uid = repository.save("a thought", placeName = "the harbour")

            val viewModel = viewModel(uid = uid)
            advanceUntilIdle()
            viewModel.setPlace(null)
            viewModel.save()
            advanceUntilIdle()

            assertNull(entryDao.stored.first().placeName)
        }

    @Test
    fun `a place the editor never touches is left as it was`() =
        runTest(mainDispatcherRule.dispatcher) {
            val uid = repository.save("a thought", placeName = "the harbour")

            val viewModel = viewModel(uid = uid)
            advanceUntilIdle()
            viewModel.onTextChanged("a thought, edited")
            viewModel.save()
            advanceUntilIdle()

            assertEquals("the harbour", entryDao.stored.first().placeName)
        }

    @Test
    fun `a place handed over by the quick bar goes with the new entry`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel(initialText = "a thought", initialPlace = PickedPlace(name = "the harbour"))
            val state = viewModel.state.first { it.text != null }

            assertEquals("the harbour", state.place?.name)
        }

    @Test
    fun `setting the moment is kept by the next save`() =
        runTest(mainDispatcherRule.dispatcher) {
            val viewModel = viewModel(initialText = "a thought")

            viewModel.setTime(1_500_000)
            viewModel.save()
            advanceUntilIdle()

            assertEquals(1_500_000L, entryDao.stored.first().createdAt)
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

            // An entry is tombstoned rather than removed; the photo goes with it.
            assertEquals(1, entryDao.stored.size)
            assertTrue(entryDao.stored.single().deletedAt != null)
            assertEquals(0, mediaStore.stored.value.size)
        }

    @Test
    fun `discarding an older entry puts it back as it was read`() =
        runTest(mainDispatcherRule.dispatcher) {
            val uid = repository.save("the original")

            val viewModel = viewModel(uid = uid, initialText = "the original, rewritten")
            // The load has to finish before the writer can act on what it loaded.
            viewModel.state.first { it.text != null }
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
