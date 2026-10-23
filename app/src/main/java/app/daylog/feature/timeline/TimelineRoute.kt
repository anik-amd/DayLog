package app.daylog.feature.timeline

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import app.daylog.core.designsystem.component.DLEmptyState
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Tag
import app.daylog.di.AppContainer

/**
 * The timeline, wired up.
 *
 * The screen and the state holder are kept apart on purpose: this composable only says what is on
 * the screen and what happened, and every rule lives in [TimelineViewModel] or below it.
 */
@Composable
fun TimelineRoute(
    container: AppContainer,
    onOpenEditor: (String) -> Unit,
    onOpenEntryEditor: (String, String) -> Unit,
    onOpenSettings: () -> Unit,
    onOpenEntry: (String) -> Unit,
    onOpenSearch: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: TimelineViewModel = viewModel(
        factory = timelineViewModelFactory(
            repository = container.entryRepository,
            mediaStore = container.mediaRepository,
            dispatchers = container.dispatchers,
        ),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
    ) { picked ->
        picked?.let(viewModel::addPhoto)
    }

    var filterOpen by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DayLogTheme.colors.background),
    ) {
        DLTopBar(
            title = "DayLog",
            subtitle = entryCountLabel(state.groups.sumOf { it.entries.size }),
            trailingContent = {
                DLIconButton(
                    imageVector = DayLogIcons.Tag,
                    contentDescription = "Filter",
                    onClick = { filterOpen = true },
                    tint = if (state.selectedTags.isEmpty()) {
                        DayLogTheme.colors.inkMuted
                    } else {
                        DayLogTheme.colors.accent
                    },
                )
                DLIconButton(
                    imageVector = DayLogIcons.Search,
                    contentDescription = "Search",
                    onClick = onOpenSearch,
                    tint = DayLogTheme.colors.inkMuted,
                )
                DLIconButton(
                    imageVector = DayLogIcons.Settings,
                    contentDescription = "Settings",
                    onClick = onOpenSettings,
                    tint = DayLogTheme.colors.inkMuted,
                )
            },
        )

        Box(modifier = Modifier.weight(1f)) {
            TimelineScreen(
                groups = state.groups,
                contentPadding = PaddingValues(top = 4.dp, bottom = 24.dp),
                media = state.media,
                onEntryClick = onOpenEntry,
            )
        }

        QuickEntryBar(
            value = state.draft,
            onValueChange = viewModel::onDraftChanged,
            onSave = viewModel::save,
            onAddPhoto = {
                photoPicker.launch(
                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly),
                )
            },
            onExpand = {
                val handoff = viewModel.handOffDraft()
                if (handoff.uid != null) {
                    onOpenEntryEditor(handoff.uid, handoff.text)
                } else {
                    onOpenEditor(handoff.text)
                }
            },
            isSaving = state.isSaving,
        )
    }

    if (filterOpen) {
        AlertDialog(
            onDismissRequest = { filterOpen = false },
            title = { Text("Filter") },
            text = {
                if (state.tags.isEmpty()) {
                    DLEmptyState(
                        title = "No tags yet",
                        body = "Tags appear once you write #tagged entries.",
                    )
                } else {
                    LazyColumn {
                        items(state.tags) { tag: Tag ->
                            FilterChip(
                                selected = tag.name in state.selectedTags,
                                onClick = { viewModel.toggleTag(tag.name) },
                                label = { Text("#${tag.name} (${tag.count})") },
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { filterOpen = false }) { Text("Done") }
            },
            dismissButton = {
                TextButton(onClick = {
                    viewModel.clearTags()
                    filterOpen = false
                }) { Text("Clear") }
            },
        )
    }
}

/**
 * How many entries there are, said in words.
 */
private fun entryCountLabel(count: Int): String = when (count) {
    0 -> "Nothing yet"
    1 -> "1 entry"
    else -> "$count entries"
}
