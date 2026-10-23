package app.daylog.feature.editor

import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.data.repository.MediaStore
import app.daylog.di.AppContainer
import kotlinx.coroutines.launch

/**
 * The full editor, wired up.
 *
 * Loads the entry when one is given, seeds it with the quick bar's handover when there is one,
 * and answers every route out of the screen with a save first — so no way of leaving takes the
 * writing with it. The photos are picked with the system picker and copied into the app's own
 * storage.
 */
@Composable
fun EditorRoute(
    container: AppContainer,
    uid: String?,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    initialText: String = "",
    initialPlace: String? = null,
) {
    val viewModel: EditorViewModel = viewModel(
        key = uid ?: "new",
        factory = editorViewModelFactory(
            repository = container.entryRepository,
            mediaStore = container.mediaRepository,
            uid = uid,
            initialText = initialText,
            initialPlace = initialPlace,
        ),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    val text = state.text
    if (text == null) return

    val scope = rememberCoroutineScope()

    /**
     * Leaving the editor saves what was written: the back arrow, the system gesture and the save
     * button all come through here.
     */
    val close: () -> Unit = {
        scope.launch {
            viewModel.save()
            onBack()
        }
    }

    // The system's back gesture is caught the same way, so a swipe out is also a save.
    BackHandler(onBack = close)

    val discard: () -> Unit = {
        scope.launch {
            viewModel.discard()
            onBack()
        }
    }

    val picker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
    ) { picked ->
        picked?.let { uri -> scope.launch { viewModel.addMedia(uri) } }
    }

    FullScreenEditor(
        state = state,
        onTextChanged = viewModel::onTextChanged,
        onChangeTime = viewModel::setTime,
        onSetPlace = viewModel::setPlace,
        onAddPhoto = {
            picker.launch(
                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly),
            )
        },
        onRemovePhoto = { mediaUid ->
            scope.launch { viewModel.removeMedia(mediaUid) }
        },
        onSave = close,
        onDiscard = discard,
        modifier = modifier,
    )
}

/**
 * Builds the state holder for the editor.
 */
fun editorViewModelFactory(
    repository: EntryRepository,
    mediaStore: MediaStore,
    uid: String?,
    initialText: String,
    initialPlace: String? = null,
): ViewModelProvider.Factory = viewModelFactory {
    initializer {
        EditorViewModel(
            repository = repository,
            mediaStore = mediaStore,
            uid = uid,
            initialText = initialText,
            initialPlace = initialPlace,
        )
    }
}
