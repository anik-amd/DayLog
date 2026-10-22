package app.daylog.feature.onthisday

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.lifecycle.viewmodel.compose.viewModel
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.model.OnThisDayYear
import app.daylog.core.model.onThisDay
import app.daylog.di.AppContainer
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import java.time.LocalDate
import java.time.ZoneId

/**
 * This day in past years, wired up.
 *
 * The screen and the state holder are kept apart on purpose: this composable only says what is on
 * the screen and what happened, and the rule itself — what counts as "this day" — lives in
 * [onThisDay], where it is tested.
 */
@Composable
fun OnThisDayRoute(
    container: AppContainer,
    onBack: () -> Unit,
    onOpenEntry: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: OnThisDayViewModel = viewModel(
        factory = onThisDayViewModelFactory(container.entryRepository),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    OnThisDayScreen(
        years = state.years,
        onBack = onBack,
        onOpenEntry = onOpenEntry,
        modifier = modifier,
    )
}

/**
 * The state of the "on this day" screen.
 */
data class OnThisDayUiState(
    val years: List<OnThisDayYear> = emptyList(),
)

/**
 * The "on this day" state holder.
 */
class OnThisDayViewModel(
    repository: EntryRepository,
    private val zone: ZoneId = ZoneId.systemDefault(),
) : ViewModel() {

    val state: StateFlow<OnThisDayUiState> =
        repository.observeEntries()
            .map { entries ->
                OnThisDayUiState(
                    years = onThisDay(entries, LocalDate.now(zone), zone),
                )
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = OnThisDayUiState(),
            )
}

/**
 * Builds the "on this day" state holder.
 */
fun onThisDayViewModelFactory(
    repository: EntryRepository,
): ViewModelProvider.Factory = viewModelFactory {
    initializer {
        OnThisDayViewModel(repository = repository)
    }
}
