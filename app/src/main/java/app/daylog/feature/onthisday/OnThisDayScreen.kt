package app.daylog.feature.onthisday

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.daylog.core.common.plainPreview
import app.daylog.core.common.toLocalDateTime
import app.daylog.core.designsystem.component.DLEmptyState
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.component.pressable
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Entry
import app.daylog.core.model.OnThisDayYear
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * This day in past years.
 *
 * The calendar's grid says where the writing is; this screen says what the writing was. Each year
 * stands under its number, its entries newest first, and an entry opens on its own terms when it
 * is tapped.
 */
@Composable
fun OnThisDayScreen(
    years: List<OnThisDayYear>,
    onBack: () -> Unit,
    onOpenEntry: (String) -> Unit,
    modifier: Modifier = Modifier,
    zone: ZoneId = ZoneId.systemDefault(),
    locale: Locale = Locale.getDefault(),
) {
    val colors = DayLogTheme.colors

    Surface(
        modifier = modifier.fillMaxSize(),
        color = colors.background,
    ) {
        Column {
            DLTopBar(
                title = "On this day",
                leadingIcon = DayLogIcons.Back,
                onLeadingClick = onBack,
            )

            if (years.isEmpty()) {
                DLEmptyState(
                    title = "Nothing on this day yet",
                    body = "Entries written on this date in past years appear here.",
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(top = 8.dp, bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp),
                    modifier = Modifier.fillMaxSize(),
                ) {
                    years.forEach { year ->
                        item(key = "year-${year.year}") {
                            YearHeader(year = year.year)
                        }
                        items(year.entries, key = { it.uid }) { entry ->
                            MemoryRow(
                                entry = entry,
                                zone = zone,
                                locale = locale,
                                onClick = { onOpenEntry(entry.uid) },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun YearHeader(year: Int) {
    DLText(
        text = year.toString(),
        style = DayLogTheme.typography.chromeTitle,
        color = DayLogTheme.colors.ink,
        modifier = Modifier.padding(horizontal = 20.dp),
    )
}

/**
 * One remembered entry: the time it was written, and what it said.
 */
@Composable
private fun MemoryRow(
    entry: Entry,
    zone: ZoneId,
    locale: Locale,
    onClick: () -> Unit,
) {
    val colors = DayLogTheme.colors
    val time = entry.createdAt.toLocalDateTime()
        .format(DateTimeFormatter.ofPattern("HH:mm", locale))

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .pressable(onClick = onClick)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        DLText(
            text = time,
            style = DayLogTheme.typography.meta,
            color = colors.inkFaint,
        )
        DLText(
            // This day is read as a glance, like the timeline's rows: the writing without its
            // markdown clothing, and nothing glowing.
            text = plainPreview(entry.content, maxLines = null),
            style = DayLogTheme.typography.entryBody,
            color = colors.ink,
            annotated = false,
        )
    }
}
