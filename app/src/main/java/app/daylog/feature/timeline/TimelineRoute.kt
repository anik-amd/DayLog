package app.daylog.feature.timeline

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.di.AppContainer
import kotlinx.coroutines.launch
import androidx.compose.runtime.rememberCoroutineScope

/**
 * The timeline, wired up.
 *
 * The screen and the state holder are kept apart on purpose: this composable only says what is on
 * the screen and what happened, and every rule lives in [TimelineViewModel] or below it.
 */
@Composable
fun TimelineRoute(
    container: AppContainer,
    onOpenEditor: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenEntry: (String) -> Unit,
    onOpenSearch: () -> Unit,
    onOpenCalendar: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val viewModel: TimelineViewModel = viewModel(
        factory = timelineViewModelFactory(
            repository = container.entryRepository,
            dispatchers = container.dispatchers,
        ),
    )
    val state by viewModel.state.collectAsStateWithLifecycle()

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
                    imageVector = DayLogIcons.Calendar,
                    contentDescription = "Calendar",
                    onClick = onOpenCalendar,
                    tint = DayLogTheme.colors.inkMuted,
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

        TagFilterStrip(
            tags = state.tags,
            selected = state.selectedTags,
            onToggle = viewModel::toggleTag,
            onClear = viewModel::clearTags,
        )

        Box(modifier = Modifier.weight(1f)) {
            TimelineScreen(
                groups = state.groups,
                contentPadding = PaddingValues(top = 4.dp, bottom = 24.dp),
                onEntryClick = onOpenEntry,
            )
        }

        QuickEntryBar(
            value = state.draft,
            onValueChange = viewModel::onDraftChanged,
            onExpand = onOpenEditor,
            isSaving = state.isSaving,
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
