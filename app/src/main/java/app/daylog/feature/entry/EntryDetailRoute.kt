package app.daylog.feature.entry

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import app.daylog.core.data.repository.EntryRepository
import app.daylog.di.AppContainer

/**
 * One entry, opened, wired up.
 */
@Composable
fun EntryDetailRoute(
    container: AppContainer,
    uid: String,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onDeleted: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: EntryDetailViewModel = viewModel(
        key = uid,
        factory = entryDetailViewModelFactory(container.entryRepository, uid),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    val entry = state.entry
    if (entry == null) {
        // The entry is gone, or it never existed. There is nothing to show, so the screen closes
        // itself rather than sitting there empty.
        onBack()
        return
    }

    EntryDetailScreen(
        entry = entry,
        tags = state.tags,
        onBack = onBack,
        onEdit = onEdit,
        onDelete = {
            viewModel.delete()
            onDeleted()
        },
        modifier = modifier,
    )
}

/**
 * Builds the state holder for one entry.
 */
fun entryDetailViewModelFactory(
    repository: EntryRepository,
    uid: String,
): androidx.lifecycle.ViewModelProvider.Factory =
    androidx.lifecycle.viewmodel.viewModelFactory {
        androidx.lifecycle.viewmodel.initializer {
            EntryDetailViewModel(repository = repository, uid = uid)
        }
    }
