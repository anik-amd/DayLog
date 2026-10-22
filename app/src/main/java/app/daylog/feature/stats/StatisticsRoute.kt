package app.daylog.feature.stats

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import app.daylog.core.data.repository.EntryRepository
import app.daylog.di.AppContainer

/**
 * The statistics, wired up.
 */
@Composable
fun StatisticsRoute(
    container: AppContainer,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: StatisticsViewModel = viewModel(
        factory = statisticsViewModelFactory(repository = container.entryRepository),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    StatisticsScreen(
        statistics = state.statistics,
        isEmpty = state.isEmpty,
        onBack = onBack,
        modifier = modifier,
    )
}

/**
 * Builds the statistics' state holder.
 */
fun statisticsViewModelFactory(
    repository: EntryRepository,
): ViewModelProvider.Factory = viewModelFactory {
    initializer {
        StatisticsViewModel(repository = repository)
    }
}
