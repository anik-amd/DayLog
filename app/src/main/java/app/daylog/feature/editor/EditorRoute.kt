package app.daylog.feature.editor

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.lifecycle.ViewModelProvider
import app.daylog.core.data.repository.EntryRepository
import app.daylog.di.AppContainer

/**
 * The full editor, wired up.
 *
 * Loads the entry when one is given, saves it when the writer is done, and goes back.
 */
@Composable
fun EditorRoute(
    container: AppContainer,
    uid: String?,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: EditorViewModel = viewModel(
        key = uid ?: "new",
        factory = editorViewModelFactory(container.entryRepository, uid),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    val text = state.text
    if (text == null) return

    val scope = rememberCoroutineScope()
    FullScreenEditor(
        initialText = text,
        onTextChanged = viewModel::onTextChanged,
        onBack = onBack,
        onSave = {
            scope.launch {
                viewModel.save()
                onBack()
            }
        },
        modifier = modifier,
    )
}

/**
 * Builds the state holder for the editor.
 */
fun editorViewModelFactory(
    repository: EntryRepository,
    uid: String?,
): ViewModelProvider.Factory = viewModelFactory {
    initializer { EditorViewModel(repository = repository, uid = uid) }
}
