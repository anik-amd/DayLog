package app.daylog.feature.editor

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.data.repository.MediaStore
import app.daylog.core.model.Media
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * The state of the editor.
 */
data class EditorUiState(
    /** The text being edited. Null until the entry has loaded. */
    val text: String? = null,
    /** The entry being edited, or null while it is still a new one. */
    val uid: String? = null,
    /** The moment the entry happened at, which the writer may put back. */
    val createdAt: Long? = null,
    /** The photos of the entry. */
    val media: List<Media> = emptyList(),
)

/**
 * The editor's state holder.
 *
 * The editor owns the entry until the writer leaves it. Everything that leaves the screen goes
 * through [save] — the save button, the back arrow and the system's back gesture all come into
 * the same door, so no path out takes the writing with it. The entry written in this session is
 * put down by [discard]; an older one is put back how it was.
 */
class EditorViewModel(
    private val repository: EntryRepository,
    private val mediaStore: MediaStore,
    private val uid: String?,
    /** The text handed over by the quick entry bar, when there was one. */
    private val initialText: String = "",
    private val now: () -> Long = System::currentTimeMillis,
) : ViewModel() {

    private val text = MutableStateFlow<String?>(null)
    private val entryUid = MutableStateFlow<String?>(null)
    private val moment = MutableStateFlow<Long?>(null)
    private val photos = MutableStateFlow<List<Media>>(emptyList())

    /** The entry as it was last read from disk, for the discard to go back to. */
    private var savedText: String? = null

    /** True while this entry only exists because of this session. */
    private var createdHere = false

    init {
        viewModelScope.launch {
            val loaded = if (uid == null) null else repository.observeEntry(uid).firstOrNull()
            text.value = when {
                loaded == null -> initialText
                // The quick entry bar may have handed over writing that was never saved; it is
                // the newest version, so it stands.
                initialText.isNotEmpty() && initialText != loaded.content -> initialText
                else -> loaded.content
            }
            moment.value = loaded?.createdAt ?: now()
            photos.value = if (uid == null) {
                emptyList()
            } else {
                mediaStore.observeMedia(uid).first()
            }
            savedText = loaded?.content
            createdHere = loaded == null
            entryUid.value = uid
        }
    }

    val state: StateFlow<EditorUiState> = combine(
        text,
        entryUid,
        moment,
        photos,
    ) { text, uid, createdAt, media ->
        EditorUiState(text = text, uid = uid, createdAt = createdAt, media = media)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = EditorUiState(),
    )

    /**
     * The writer typed something.
     */
    fun onTextChanged(newText: String) {
        text.value = newText
    }

    /**
     * The writer moved the entry to another moment.
     */
    fun setTime(newMoment: Long) {
        moment.value = newMoment
    }

    /**
     * Writes the draft to the database and returns the uid of the entry.
     *
     * A blank draft is not written unless the entry already exists, so an opened-and-abandoned
     * editor leaves nothing behind.
     */
    suspend fun save(): String? {
        val content = text.value ?: return null
        if (content.isBlank() && entryUid.value == null) return null

        val saved = repository.save(content, uid = entryUid.value, createdAt = moment.value)
        if (entryUid.value == null) createdHere = true
        entryUid.value = saved
        return saved
    }

    /**
     * Adds a photo to the entry.
     *
     * The entry comes into being if it does not exist yet, because a photo needs something to
     * hang on — even when the text is still blank, a photo is a thing written down.
     */
    suspend fun addMedia(uri: Uri) {
        val targetUid = entryUid.value ?: beginEntry()
        mediaStore.addMedia(targetUid, uri)
        photos.value = mediaStore.observeMedia(targetUid).first()
    }

    /**
     * Removes a photo from the entry.
     */
    suspend fun removeMedia(mediaUid: String) {
        mediaStore.removeMedia(mediaUid)
        entryUid.value?.let { targetUid ->
            photos.value = mediaStore.observeMedia(targetUid).first()
        }
    }

    /**
     * The discard.
     *
     * An entry that came into being in this session is deleted; an older one is put back how it
     * was read from disk.
     */
    suspend fun discard() {
        val current = entryUid.value
        when {
            current != null && createdHere -> {
                repository.delete(current)
                mediaStore.removeMediaForEntry(current)
                entryUid.value = null
            }
            current != null -> text.value = savedText ?: ""
            else -> text.value = ""
        }
    }

    /**
     * Writes the entry as it stands, without asking, so a photo has an entry to go with.
     */
    private suspend fun beginEntry(): String {
        val saved = repository.save(text.value ?: "", createdAt = moment.value)
        createdHere = true
        entryUid.value = saved
        return saved
    }
}

