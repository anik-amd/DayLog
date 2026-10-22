package app.daylog.feature.timeline

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLEmptyState
import app.daylog.core.designsystem.component.DLMeta
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.pressable
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.DayGroup
import app.daylog.core.model.Entry

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
 * The screen's idea is a ledger's margin: one rule runs down the page and the dates sit against
 * it, so the shape of the diary is visible before a word of it is read.
 */
@Composable
fun TimelineScreen(
    groups: List<DayGroup>,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(0.dp),
    onEntryClick: (String) -> Unit = {},
) {
    val colors = DayLogTheme.colors
    val items = groups.toTimelineItems()
    val gutter = gutterWidth()

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
        modifier = modifier
            .fillMaxSize()
            .background(colors.background),
        contentPadding = contentPadding,
    ) {
        items(items, key = { itemKey(it) }) { item ->
            // The rule is drawn a piece at a time, by each row, so it begins with the first day
            // and ends with the last entry. A rule that ran on past the writing into the empty
            // space below would be a line to nothing.
            val rule = Modifier.marginRule(gutter, colors.rule)

            when (item) {
                is TimelineItem.Heading -> DayHeading(item.group, rule)
                is TimelineItem.Row -> EntryRow(
                    entry = item.entry,
                    modifier = rule.pressable { onEntryClick(item.entry.uid) },
                )
            }
        }
    }
}

/**
 * Draws the margin rule down a row.
 */
private fun Modifier.marginRule(gutter: Dp, color: Color): Modifier = drawBehind {
    val x = gutter.toPx()
    drawLine(
        color = color,
        start = Offset(x, 0f),
        end = Offset(x, size.height),
        strokeWidth = 1f,
    )
}

/**
 * The day's name, in the margin.
 */
@Composable
private fun DayHeading(group: DayGroup, modifier: Modifier = Modifier) {
    val colors = DayLogTheme.colors

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 26.dp, end = 20.dp),
        verticalAlignment = Alignment.Top,
    ) {
        // The heading hugs the rule, the way a date is written in the margin of a ledger.
        Box(
            modifier = Modifier
                .width(gutterWidth())
                .padding(end = 12.dp),
            contentAlignment = Alignment.TopEnd,
        ) {
            DLText(
                text = group.header,
                style = DayLogTheme.typography.label,
                color = colors.ink,
                maxLines = 1,
            )
        }
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
