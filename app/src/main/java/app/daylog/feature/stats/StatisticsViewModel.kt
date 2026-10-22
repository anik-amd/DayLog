package app.daylog.feature.stats

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.model.Statistics
import app.daylog.core.model.calculateStatistics
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import java.time.LocalDate
import java.time.ZoneId

/**
 * What the statistics screen shows.
 */
data class StatisticsUiState(
    val statistics: Statistics = Statistics(
        totalEntries = 0,
        totalWords = 0,
        entriesToday = 0,
        entriesThisWeek = 0,
        entriesThisMonth = 0,
        daysWritten = 0,
        currentStreak = 0,
        longestStreak = 0,
    ),
    /** True when nothing has been written yet. */
    val isEmpty: Boolean = true,
)

/**
 * The statistics' state holder.
 *
 * The numbers are worked out in the model rather than here, so they can be checked without a
 * device. This only watches the entries and hands them over.
 */
class StatisticsViewModel(
    repository: EntryRepository,
    private val zone: ZoneId = ZoneId.systemDefault(),
    private val today: () -> LocalDate = { LocalDate.now(zone) },
) : ViewModel() {

    val state: StateFlow<StatisticsUiState> =
        combine(
            repository.observeEntries(),
            repository.observeTags(),
        ) { entries, tags ->
            val statistics = calculateStatistics(
                entries = entries,
                tags = tags,
                today = today(),
                zone = zone,
            )
            StatisticsUiState(statistics = statistics, isEmpty = entries.isEmpty())
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = StatisticsUiState(),
        )
}
