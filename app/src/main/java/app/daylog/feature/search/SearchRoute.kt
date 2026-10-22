package app.daylog.feature.search

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.lifecycle.ViewModelProvider
import app.daylog.core.data.repository.EntryRepository
import app.daylog.di.AppContainer

/**
 * Finding an entry, wired up.
 */
@Composable
fun SearchRoute(
    container: AppContainer,
    onEntryClick: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: SearchViewModel = viewModel(
        factory = searchViewModelFactory(container.entryRepository),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    SearchScreen(
        query = state.query,
        onQueryChanged = viewModel::onQueryChanged,
        groups = state.groups,
        onEntryClick = onEntryClick,
        onBack = onBack,
        modifier = modifier,
    )
}

/**
 * Builds the state holder for the search.
 */
fun searchViewModelFactory(repository: EntryRepository): ViewModelProvider.Factory =
    viewModelFactory {
        initializer { SearchViewModel(repository = repository) }
    }
