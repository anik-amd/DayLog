package app.daylog.feature.calendar

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.daylog.core.common.CalendarMath
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.model.DayGroup
import app.daylog.core.model.DayGrouper
import app.daylog.di.AppContainer
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import java.time.LocalDate
import java.util.Locale

/**
 * One month on a single screen, wired up.
 */
@Composable
fun CalendarRoute(
    container: AppContainer,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: CalendarViewModel = viewModel(
        factory = calendarViewModelFactory(container.entryRepository),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    CalendarScreen(
        year = state.year,
        month = state.month,
        entryDays = state.entryDays,
        selectedDay = state.selectedDay,
        onDaySelected = viewModel::selectDay,
        onPreviousMonth = viewModel::previousMonth,
        onNextMonth = viewModel::nextMonth,
        onBack = onBack,
        selectedEntries = state.selectedEntries,
        modifier = modifier,
    )
}

class CalendarViewModel(
    private val repository: EntryRepository,
) : ViewModel() {

    private var year by mutableIntStateOf(LocalDate.now().year)
    private var month by mutableIntStateOf(LocalDate.now().monthValue)
    private var selectedDay by mutableStateOf<Int?>(null)

    val state: StateFlow<CalendarUiState> =
        repository.observeEntries()
            .let { entries ->
                kotlinx.coroutines.flow.map(entries) { list ->
                    val entryDays = list
                        .map { java.time.Instant.ofEpochMilli(it.createdAt).atZone(java.time.ZoneId.systemDefault()).toLocalDate() }
                        .filter { it.year == year && it.monthValue == month }
                        .map { it.dayOfMonth }
                        .toSet()

                    val selectedEntries = if (selectedDay == null) {
                        emptyList()
                    } else {
                        val date = LocalDate.of(year, month, selectedDay!!)
                        list.filter {
                            java.time.Instant.ofEpochMilli(it.createdAt).atZone(java.time.ZoneId.systemDefault()).toLocalDate() == date
                        }
                    }

                    CalendarUiState(
                        year = year,
                        month = month,
                        entryDays = entryDays,
                        selectedDay = selectedDay,
                        selectedEntries = selectedEntries,
                    )
                }
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = CalendarUiState(),
            )

    fun selectDay(day: Int) { selectedDay = day }
    fun previousMonth() {
        val ym = java.time.YearMonth.of(year, month).minusMonths(1)
        year = ym.year; month = ym.monthValue; selectedDay = null
    }
    fun nextMonth() {
        val ym = java.time.YearMonth.of(year, month).plusMonths(1)
        year = ym.year; month = ym.monthValue; selectedDay = null
    }
}

data class CalendarUiState(
    val year: Int = LocalDate.now().year,
    val month: Int = LocalDate.now().monthValue,
    val entryDays: Set<Int> = emptySet(),
    val selectedDay: Int? = null,
    val selectedEntries: List<Entry> = emptyList(),
)

fun calendarViewModelFactory(repository: EntryRepository): androidx.lifecycle.ViewModelProvider.Factory =
    androidx.lifecycle.viewmodel.viewModelFactory {
        androidx.lifecycle.viewmodel.initializer {
            CalendarViewModel(repository = repository)
        }
    }
