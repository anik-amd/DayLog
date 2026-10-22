package app.daylog.feature.timeline

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.daylog.core.common.AppDispatchers
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.model.DayGroup
import app.daylog.core.model.DayGrouper
import app.daylog.core.model.Tag
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Locale

/**
 * What the timeline shows.
 */
data class TimelineUiState(
    val groups: List<DayGroup> = emptyList(),
    val tags: List<Tag> = emptyList(),
    /** The text in the quick entry bar. */
    val draft: String = "",
    /** True while the draft is being written to the database. */
    val isSaving: Boolean = false,
)

/**
 * The timeline's state holder.
 *
 * The rule about autosave lives here rather than in the composable, because it is a rule: the
 * draft is written shortly after the writer stops typing. The composable only reports what was
 * typed and shows what came back.
 */
class TimelineViewModel(
    private val repository: EntryRepository,
    private val dispatchers: AppDispatchers,
    private val locale: Locale = Locale.getDefault(),
) : ViewModel() {

    private val draft = MutableStateFlow("")
    private val saving = MutableStateFlow(false)

    /**
     * The entry the draft belongs to.
     *
     * Every save updates this same entry, so a pause in the middle of a thought does not split it
     * into two entries. It is cleared when the writer empties the field, which is how they ask
     * for a fresh one.
     */
    private var draftUid: String? = null

    private var saveJob: Job? = null

    val state: StateFlow<TimelineUiState> =
        combine(
            repository.observeEntries(),
            repository.observeTags(),
            draft,
            saving,
        ) { entries, tags, draftText, isSaving ->
            TimelineUiState(
                groups = DayGrouper.group(entries, locale = locale),
                tags = tags,
                draft = draftText,
                isSaving = isSaving,
            )
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = TimelineUiState(),
        )

    /**
     * The writer typed something.
     *
     * The save is put off until they stop, and every keystroke pushes it back. The work is
     * cancelled and restarted rather than queued, so only the final text is ever written.
     *
     * The text is never taken out of the field. A writer who pauses to think should find their
     * sentence still there when they come back.
     */
    fun onDraftChanged(text: String) {
        draft.value = text

        saveJob?.cancel()

        if (text.isBlank()) {
            // An empty field is the writer asking for a fresh entry. The one they wrote stays in
            // the timeline; only the link to it is dropped.
            draftUid = null
            return
        }

        saveJob = viewModelScope.launch {
            delay(AUTOSAVE_DELAY_MS)
            write(text)
        }
    }

    /**
     * Writes the draft now, without waiting.
     */
    fun saveNow() {
        saveJob?.cancel()
        val text = draft.value
        if (text.isBlank()) return

        viewModelScope.launch { write(text) }
    }

    /**
     * Deletes an entry.
     */
    fun deleteEntry(uid: String) {
        viewModelScope.launch {
            repository.delete(uid)
        }
    }

    private suspend fun write(text: String) {
        saving.value = true
        try {
            draftUid = repository.save(text, uid = draftUid)
        } finally {
            saving.value = false
        }
    }

    companion object {
        /**
         * How long the writer has to stop typing before the entry is written.
         *
         * Long enough that a pause mid-sentence does not cause a write, short enough that the
         * entry is safely on disk before the app is likely to be closed.
         */
        const val AUTOSAVE_DELAY_MS = 700L
    }
}
