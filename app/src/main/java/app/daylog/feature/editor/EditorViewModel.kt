package app.daylog.feature.editor

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.daylog.core.data.repository.EntryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * The state of the editor.
 */
data class EditorUiState(
    /** The text being edited. Null until the entry has loaded. */
    val text: String? = null,
    val isSaving: Boolean = false,
)

/**
 * The editor's state holder.
 *
 * Loads the entry when one is given, and saves it back when the writer is done.
 */
class EditorViewModel(
    private val repository: EntryRepository,
    private val uid: String?,
) : ViewModel() {

    private val text = MutableStateFlow<String?>(null)

    init {
        viewModelScope.launch {
            text.value = if (uid == null) {
                ""
            } else {
                repository.observeEntry(uid).first()?.content ?: ""
            }
        }
    }

    val state: StateFlow<EditorUiState> = text.map { value ->
        EditorUiState(text = value)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = EditorUiState(),
    )

    /**
     * Updates the draft.
     */
    fun onTextChanged(newText: String) {
        text.value = newText
    }

    /**
     * Writes the draft to the database and returns the uid of the entry.
     */
    suspend fun save(): String? {
        val content = text.value ?: return null
        return repository.save(content, uid = uid)
    }
}
