package app.daylog.feature.timeline

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.daylog.core.common.AppDispatchers
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.data.repository.MediaStore
import app.daylog.core.model.DayGroup
import app.daylog.core.model.DayGrouper
import app.daylog.core.model.Entry
import app.daylog.core.model.Media
import app.daylog.core.model.Tag
import app.daylog.core.model.onThisDay
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.ZoneId
import java.util.Locale

/**
 * What the timeline shows.
 */
data class TimelineUiState(
    val groups: List<DayGroup> = emptyList(),
    val tags: List<Tag> = emptyList(),
    /** The photos of every entry, so a row can show a thumbnail. */
    val media: Map<String, List<Media>> = emptyMap(),
    /** The tags the writer has chosen to filter by. */
    val selectedTags: Set<String> = emptySet(),
    /** The text in the quick entry bar. */
    val draft: String = "",
    /** True while the draft is being written to the database. */
    val isSaving: Boolean = false,
    /** The place the quick bar's thought carries, when one was picked. */
    val draftPlace: String? = null,
    /** How many entries were written on this day in past years. */
    val onThisDayCount: Int = 0,
)

/**
 * A thought leaving the quick bar for the full editor.
 */
data class DraftHandoff(
    val text: String,
    /** The entry that already exists for this thought, when one has been started. */
    val uid: String?,
    /** The place the thought was given, when one was picked. */
    val place: String? = null,
)

/**
 * The timeline's state holder.
 *
 * The quick bar saves when the writer says so: the save button writes the thought down, and
 * nothing is written while they are still typing. The composables only report what was typed and
 * show what came back.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class TimelineViewModel(
    private val repository: EntryRepository,
    private val mediaStore: MediaStore,
    dispatchers: AppDispatchers,
    private val locale: Locale = Locale.getDefault(),
) : ViewModel() {

    private val draft = MutableStateFlow("")
    private val saving = MutableStateFlow(false)

    /**
     * The place the thought in the quick bar happened at.
     *
     * Null is "not picked", the empty string is "picked and then taken off again" — the difference
     * decides whether the save leaves whatever place the entry already has.
     */
    private val draftPlace = MutableStateFlow<String?>(null)

    /**
     * The entry a photo has already started.
     *
     * A photo needs an entry to hang on, so attaching one begins the thought without writing it
     * down as finished. The save button is still the only thing that closes it.
     */
    private var draftUid: String? = null

    /**
     * The tags the writer has chosen to filter by.
     */
    private val selectedTags = MutableStateFlow<Set<String>>(emptySet())

    /**
     * The entries the timeline shows.
     *
     * With no tags chosen that is everything; with tags chosen it is the entries that carry all
     * of them.
     */
    private val shownEntries: Flow<List<Entry>> =
        selectedTags.flatMapLatest { tags ->
            repository.observeEntriesWithAllTags(tags.toList())
        }

    /**
     * Every entry, for the "on this day" count — that one is not filtered by the chosen tags.
     */
    private val allEntries: Flow<List<Entry>> = repository.observeEntries()

    /**
     * The content of the timeline: the entries, the tags and the photos.
     */
    private val content = combine(
        shownEntries,
        repository.observeTags(),
        repository.observeMediaByEntry(),
    ) { entries, tags, media -> Triple(entries, tags, media) }

    /**
     * How many entries were written on this day in past years, for the badge on the top bar.
     */
    private val onThisDayCountFlow: Flow<Int> = allEntries.map { entries ->
        onThisDay(entries, LocalDate.now(), ZoneId.systemDefault()).sumOf { it.entries.size }
    }

    /**
     * The bar's small state, bundled so the big combine fits.
     */
    private data class DraftBits(
        val text: String,
        val isSaving: Boolean,
        val place: String?,
    )

    private val draftBits = combine(draft, saving, draftPlace) { text, isSaving, place ->
        DraftBits(text, isSaving, place)
    }

    val state: StateFlow<TimelineUiState> =
        combine(
            content,
            selectedTags,
            draftBits,
            onThisDayCountFlow,
        ) { (entries, tags, media), chosen, bits, count ->
            TimelineUiState(
                groups = DayGrouper.group(entries, locale = locale),
                tags = tags,
                media = media,
                selectedTags = chosen,
                draft = bits.text,
                isSaving = bits.isSaving,
                // "Picked and removed" reads as no place, as far as the screen is concerned.
                draftPlace = bits.place?.takeIf { it.isNotBlank() },
                onThisDayCount = count,
            )
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = TimelineUiState(),
        )

    /**
     * Turns a tag filter on or off.
     *
     * Choosing a second tag narrows the timeline to the entries that carry both, so the tags
     * work together rather than one at a time.
     */
    fun toggleTag(name: String) {
        selectedTags.value = selectedTags.value.let { chosen ->
            if (name in chosen) chosen - name else chosen + name
        }
    }

    /**
     * Takes off every tag filter.
     */
    fun clearTags() {
        selectedTags.value = emptySet()
    }

    /**
     * The writer typed something.
     *
     * Nothing is saved here. An empty field makes room for the next thought; a thought that a
     * photo has already begun keeps its entry while the field is being emptied around it.
     */
    fun onDraftChanged(text: String) {
        draft.value = text

        if (text.isBlank()) {
            draftUid = null
            draftPlace.value = null
        }
    }

    /**
     * The place the thought happened at, or null when it is taken off.
     */
    fun setDraftPlace(name: String?) {
        draftPlace.value = name ?: ""
    }

    /**
     * The writer pressed save.
     *
     * The thought is written to the database and the bar is cleared for the next one: the save is
     * the end of the thought, so it is the only thing that empties the field.
     */
    fun save() {
        val text = draft.value
        val place = draftPlace.value

        viewModelScope.launch {
            saving.value = true
            try {
                if (text.isNotBlank() || draftUid != null) {
                    draftUid = repository.save(
                        content = text,
                        uid = draftUid,
                        placeName = place?.takeIf { it.isNotBlank() },
                        placeCleared = place == "",
                    )
                    draft.value = ""
                    draftUid = null
                    draftPlace.value = null
                }
            } finally {
                saving.value = false
            }
        }
    }

    /**
     * Attaches a photo to the thought.
     *
     * An entry comes into being if the photo is the first thing in this thought, and whatever
     * text there is stays in the field: the save button remains the only thing that closes it.
     */
    fun addPhoto(uri: Uri) {
        viewModelScope.launch {
            saving.value = true
            try {
                val uid = repository.save(draft.value, uid = draftUid)
                draftUid = uid
                mediaStore.addMedia(uid, uri)
            } finally {
                saving.value = false
            }
        }
    }

    /**
     * Hands the writing over to the full editor.
     *
     * The bar gives up the text — the entry is another screen's to finish — and the entry's uid
     * goes with it when one has already begun, so the editor continues the same thought.
     */
    fun handOffDraft(): DraftHandoff {
        val handedText = draft.value
        val handedUid = draftUid
        val handedPlace = draftPlace.value?.takeIf { it.isNotBlank() }
        draft.value = ""
        draftUid = null
        draftPlace.value = null
        return DraftHandoff(text = handedText, uid = handedUid, place = handedPlace)
    }

    /**
     * Deletes an entry.
     */
    fun deleteEntry(uid: String) {
        viewModelScope.launch {
            repository.delete(uid)
        }
    }
}
