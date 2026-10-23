package app.daylog.feature.timeline

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLDivider
import app.daylog.core.designsystem.component.DLEmptyState
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.pressable
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.DayGroup
import app.daylog.core.model.Entry
import app.daylog.core.model.Media

/**
 * One thing on the timeline: a day's heading, or an entry.
 */
private sealed interface TimelineItem {
    data class Heading(val group: DayGroup) : TimelineItem
    data class Row(val entry: Entry) : TimelineItem
}

/**
 * The timeline.
 *
 * The days read as a notebook now: the date is a heading across the page and the entries of the
 * day sit under it, close together. The date is not margins any more — the writing is what has
 * the room, and the shape of the diary is still readable, from the headings rather than from a
 * line down the page.
 */
@Composable
fun TimelineScreen(
    groups: List<DayGroup>,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(0.dp),
    media: Map<String, List<Media>> = emptyMap(),
    onEntryClick: (String) -> Unit = {},
    listState: LazyListState = rememberLazyListState(),
) {
    val colors = DayLogTheme.colors
    val items = groups.toTimelineItems()

    if (items.isEmpty()) {
        Box(
            modifier = modifier
                .fillMaxSize()
                .background(colors.background),
            contentAlignment = Alignment.Center,
        ) {
            DLEmptyState(
                title = "Nothing written yet",
                body = "The line at the bottom is all it takes. Start typing.",
            )
        }
        return
    }

    LazyColumn(
        state = listState,
        modifier = modifier
            .fillMaxSize()
            .background(colors.background),
        contentPadding = contentPadding,
    ) {
        itemsIndexed(items, key = { _, item -> itemKey(item) }) { index, item ->
            when (item) {
                is TimelineItem.Heading -> DayHeading(
                    group = item.group,
                    // The first day needs no line above it: the page starts, it does not follow.
                    showRule = index != 0,
                )
                is TimelineItem.Row -> EntryRow(
                    entry = item.entry,
                    media = media[item.entry.uid].orEmpty(),
                    modifier = Modifier.pressable { onEntryClick(item.entry.uid) },
                )
            }
        }
    }
}

/**
 * The day's heading, across the page.
 *
 * A day starts with a subtle hairline and a little air: the gap to the day above it is bigger
 * than the gap under the heading itself, so the days read apart and the entries read together.
 * Shared with the search screen, so a result looks like the entry it is.
 */
@Composable
fun DayHeading(
    group: DayGroup,
    modifier: Modifier = Modifier,
    showRule: Boolean = true,
) {
    val colors = DayLogTheme.colors
    val spacing = DayLogTheme.spacing

    Column(modifier = modifier.fillMaxWidth()) {
        if (showRule) {
            DLDivider(modifier = Modifier.padding(horizontal = spacing.xl))
        }
        DLText(
            text = group.header,
            style = DayLogTheme.typography.label,
            color = colors.ink,
            maxLines = 1,
            modifier = Modifier.padding(
                start = spacing.xl,
                end = spacing.xl,
                top = if (showRule) spacing.sm else spacing.xxl,
                bottom = spacing.md,
            ),
        )
    }
}

/**
 * Flattens the days into the things the list shows.
 */
private fun List<DayGroup>.toTimelineItems(): List<TimelineItem> =
    flatMap { group ->
        listOf(TimelineItem.Heading(group)) + group.entries.map { TimelineItem.Row(it) }
    }

private fun itemKey(item: TimelineItem): String = when (item) {
    is TimelineItem.Heading -> "day-${item.group.key}"
    is TimelineItem.Row -> "entry-${item.entry.uid}"
}
