package app.daylog.feature.search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.model.DayGroup
import app.daylog.core.model.DayGrouper
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import java.util.Locale

/**
 * What the search shows.
 */
data class SearchUiState(
    val query: String = "",
    val groups: List<DayGroup> = emptyList(),
)

/**
 * Finding an entry.
 *
 * The search waits a moment after the last keystroke before it runs, so the index is not asked
 * on every letter.
 */
@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
class SearchViewModel(
    repository: EntryRepository,
    private val locale: Locale = Locale.getDefault(),
) : ViewModel() {

    private val query = MutableStateFlow("")

    private val results: StateFlow<List<DayGroup>> =
        query
            .debounce(SEARCH_DELAY_MS)
            .distinctUntilChanged()
            .flatMapLatest { text ->
                if (text.isBlank()) {
                    kotlinx.coroutines.flow.flowOf(emptyList())
                } else {
                    repository.search(text)
                }
            }
            .let { entries ->
                kotlinx.coroutines.flow.map(entries) { list ->
                    DayGrouper.group(list, locale = locale)
                }
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = emptyList(),
            )

    val state: StateFlow<SearchUiState> =
        combine(query, results) { text, groups ->
            SearchUiState(query = text, groups = groups)
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = SearchUiState(),
        )

    /**
     * The writer typed something.
     */
    fun onQueryChanged(text: String) {
        query.value = text
    }

    companion object {
        /**
         * How long the search waits after the last keystroke.
         *
         * Long enough that the index is not asked on every letter, short enough that the results
         * feel like they are keeping up.
         */
        const val SEARCH_DELAY_MS = 200L
    }
}
