package app.daylog.feature.calendar

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import app.daylog.core.data.repository.EntryRepository
import app.daylog.di.AppContainer
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.Locale

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

fun calendarViewModelFactory(repository: EntryRepository): ViewModelProvider.Factory =
    viewModelFactory {
        initializer {
            CalendarViewModel(repository = repository)
        }
    }
