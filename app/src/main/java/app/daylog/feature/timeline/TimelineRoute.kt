package app.daylog.feature.timeline

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
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
    onOpenOnThisDay: () -> Unit,
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

    val listState = rememberLazyListState()
    var barExpanded by remember { mutableStateOf(true) }
    val previousScroll = remember { mutableIntStateOf(0) }
    LaunchedEffect(listState) {
        snapshotFlow { listState.firstVisibleItemIndex * 1000 + listState.firstVisibleItemScrollOffset }
            .collect { current ->
                if (listState.firstVisibleItemIndex == 0 && listState.firstVisibleItemScrollOffset == 0) {
                    barExpanded = true
                } else if (current > previousScroll.intValue + 30) {
                    barExpanded = false
                } else if (current < previousScroll.intValue - 30) {
                    barExpanded = true
                }
                previousScroll.intValue = current
            }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(DayLogTheme.colors.background),
    ) {
        Column(Modifier.fillMaxSize()) {
            DLTopBar(
                title = "DayLog",
                subtitle = entryCountLabel(state.groups.sumOf { it.entries.size }),
                trailingContent = {
                    BadgedBox(
                        badge = {
                            if (state.onThisDayCount > 0) {
                                Badge { Text(state.onThisDayCount.toString()) }
                            }
                        },
                    ) {
                        DLIconButton(
                            imageVector = DayLogIcons.History,
                            contentDescription = "On this day",
                            onClick = onOpenOnThisDay,
                            tint = DayLogTheme.colors.inkMuted,
                        )
                    }
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
                    listState = listState,
                )
            }
        }

        // The quick bar floats over the writing. It folds into a plus when the writer scrolls
        // down, so the writing takes the whole page; scrolling back up unfolds it.
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(horizontal = 16.dp, vertical = 16.dp),
        ) {
            AnimatedVisibility(
                visible = barExpanded,
                enter = fadeIn(animationSpec = tween(160)) + slideInVertically(animationSpec = tween(160)) { it },
                exit = fadeOut(animationSpec = tween(120)) + slideOutVertically(animationSpec = tween(120)) { it },
            ) {
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
        }

        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(16.dp),
        ) {
            AnimatedVisibility(
                visible = !barExpanded,
                enter = fadeIn(animationSpec = tween(160)) + scaleIn(animationSpec = tween(160)),
                exit = fadeOut(animationSpec = tween(120)) + scaleOut(animationSpec = tween(120)),
            ) {
                FloatingActionButton(
                    onClick = { barExpanded = true },
                    containerColor = DayLogTheme.colors.surfaceContainerHigh,
                    contentColor = DayLogTheme.colors.ink,
                ) {
                    Icon(
                        imageVector = DayLogIcons.Plus,
                        contentDescription = "Open quick entry",
                    )
                }
            }
        }
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
