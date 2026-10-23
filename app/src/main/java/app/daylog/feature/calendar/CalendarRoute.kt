package app.daylog.feature.calendar

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.lifecycle.viewmodel.compose.viewModel
import app.daylog.core.common.CalendarMath
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.model.Entry
import app.daylog.di.AppContainer
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import java.time.Instant
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId
import java.util.Locale

/**
 * The calendar, wired up.
 *
 * The calendar is a tab, not a detour: nothing above it to go back to, the month's own chevrons
 * beside its name, and the clock face in the corner leading to this day in past years.
 */
@Composable
fun CalendarRoute(
    container: AppContainer,
    onOpenEntry: (String) -> Unit,
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
        selectedEntries = state.selectedEntries,
        onOpenEntry = onOpenEntry,
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
            .map { list ->
                val entryDays = list
                    .map { Instant.ofEpochMilli(it.createdAt).atZone(ZoneId.systemDefault()).toLocalDate() }
                    .filter { it.year == year && it.monthValue == month }
                    .map { it.dayOfMonth }
                    .toSet()

                val selectedEntries = if (selectedDay == null) {
                    emptyList()
                } else {
                    val date = LocalDate.of(year, month, selectedDay!!)
                    list.filter {
                        Instant.ofEpochMilli(it.createdAt).atZone(ZoneId.systemDefault()).toLocalDate() == date
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
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = CalendarUiState(),
            )

    fun selectDay(day: Int) { selectedDay = day }
    fun previousMonth() {
        val ym = YearMonth.of(year, month).minusMonths(1)
        year = ym.year; month = ym.monthValue; selectedDay = null
    }
    fun nextMonth() {
        val ym = YearMonth.of(year, month).plusMonths(1)
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

fun calendarViewModelFactory(repository: EntryRepository): ViewModelProvider.Factory =
    viewModelFactory {
        initializer {
            CalendarViewModel(repository = repository)
        }
    }
