package app.daylog.feature.timeline

import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import app.daylog.core.common.AppDispatchers
import app.daylog.core.data.repository.EntryRepository
import app.daylog.core.data.repository.MediaStore

/**
 * Builds the timeline's state holder.
 *
 * A hand-written factory, like the rest of the app's wiring: the graph is small enough that a
 * generated one would cost more than it saves.
 */
fun timelineViewModelFactory(
    repository: EntryRepository,
    mediaStore: MediaStore,
    dispatchers: AppDispatchers,
): ViewModelProvider.Factory = viewModelFactory {
    initializer {
        TimelineViewModel(
            repository = repository,
            mediaStore = mediaStore,
            dispatchers = dispatchers,
        )
    }
}
