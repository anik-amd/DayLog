package app.daylog.feature.entry

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.model.Entry
import app.daylog.core.model.Tag
import app.daylog.core.model.TagExtractor
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * What the entry view shows.
 */
data class EntryDetailUiState(
    val entry: Entry? = null,
    val tags: List<Tag> = emptyList(),
    val isDeleted: Boolean = false,
)

/**
 * One entry, opened.
 */
class EntryDetailViewModel(
    private val repository: EntryRepository,
    private val uid: String,
) : ViewModel() {

    val state: StateFlow<EntryDetailUiState> =
        repository.observeEntry(uid)
            .map { entry ->
                EntryDetailUiState(
                    entry = entry,
                    tags = entry?.let { findTags(it) } ?: emptyList(),
                )
            }
            .stateIn(
                scope = viewModelScope,
                started = SharingStarted.WhileSubscribed(5_000),
                initialValue = EntryDetailUiState(),
            )

    /**
     * Deletes the entry.
     *
     * It is tombstoned rather than removed, so a future sync can replicate the deletion.
     */
    fun delete() {
        viewModelScope.launch {
            repository.delete(uid)
        }
    }

    /**
     * The tags of an entry, read out of its text.
     */
    private suspend fun findTags(entry: Entry): List<Tag> =
        TagExtractor.extract(entry.content).map { Tag(it) }
}
