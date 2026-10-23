package app.daylog

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.android.tools.screenshot.PreviewTest
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.DayGroup
import app.daylog.core.model.DayLogThemeMode
import app.daylog.core.model.Entry
import app.daylog.core.model.OnThisDayYear
import app.daylog.feature.timeline.QuickEntryBar
import app.daylog.feature.timeline.TimelineScreen
import app.daylog.feature.calendar.CalendarScreen
import app.daylog.feature.entry.EntryDetailScreen
import app.daylog.feature.onthisday.OnThisDayScreen
import app.daylog.feature.search.SearchScreen
import app.daylog.feature.stats.StatisticsScreen
import app.daylog.core.model.Tag
import app.daylog.core.model.calculateStatistics
import app.daylog.navigation.DayLogBottomBar
import app.daylog.navigation.Routes
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

/**
 * The app, rendered.
 *
 * These previews are the only way the design is ever looked at in CI, so they are written
 * against real content rather than lorem ipsum: a long entry, a short one, a tagged one, a place
 * and the weather. A design that only works with tidy text is a design that only works in a demo.
 */

private val zone: ZoneId = ZoneId.systemDefault()

private fun at(day: LocalDate, hour: Int, minute: Int): Long =
    LocalDateTime.of(day, java.time.LocalTime.of(hour, minute))
        .atZone(zone)
        .toInstant()
        .toEpochMilli()

private val today: LocalDate = LocalDate.now(zone)

private val sampleEntries = listOf(
    Entry(
        uid = "1",
        content = "# The train was late\n" +
            "So I read the whole of the essay on the way in and arrived with something to think " +
            "about. **That** was the best part of the morning. #reading",
        createdAt = at(today, 9, 14),
        updatedAt = at(today, 9, 14),
    ),
    Entry(
        uid = "2",
        content = "Rain all afternoon. Finished the second chapter of the book.\n" +
            "- read the essay\n" +
            "- wrote two lines",
        createdAt = at(today, 18, 2),
        updatedAt = at(today, 18, 2),
        placeName = "Bologna",
        weatherSummary = "Light rain",
    ),
    Entry(
        uid = "3",
        content = "Called Mum. She is well. #family",
        createdAt = at(today.minusDays(1), 21, 30),
        updatedAt = at(today.minusDays(1), 21, 30),
    ),
    Entry(
        uid = "4",
        content = "A short one.",
        createdAt = at(today.minusDays(4), 7, 45),
        updatedAt = at(today.minusDays(4), 7, 45),
    ),
)

private val sampleGroups = listOf(
    DayGroup(
        key = today.toEpochDay(),
        date = today,
        header = "Today",
        entries = sampleEntries.take(2),
    ),
    DayGroup(
        key = today.minusDays(1).toEpochDay(),
        date = today.minusDays(1),
        header = "Yesterday",
        entries = sampleEntries.drop(2).take(1),
    ),
    DayGroup(
        key = today.minusDays(4).toEpochDay(),
        date = today.minusDays(4),
        header = "Thursday",
        entries = sampleEntries.drop(3),
    ),
)

/**
 * The whole screen: the bar at the top, the timeline, and the line at the bottom.
 */
@Composable
private fun DayLogPreview(dark: Boolean = false) {
    DayLogTheme(themeMode = if (dark) DayLogThemeMode.Dark else DayLogThemeMode.Light) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DayLogTheme.colors.background)
                .statusBarsPadding(),
            contentAlignment = Alignment.BottomCenter,
        ) {
            Column(Modifier.fillMaxSize()) {
                DLTopBar(
                    title = "DayLog",
                    subtitle = "4 entries",
                    trailingContent = {
                        DLIconButton(
                            imageVector = app.daylog.core.designsystem.icon.DayLogIcons.History,
                            contentDescription = "On this day",
                            onClick = {},
                            tint = DayLogTheme.colors.inkMuted,
                        )
                        DLIconButton(
                            imageVector = app.daylog.core.designsystem.icon.DayLogIcons.Tag,
                            contentDescription = "Filter",
                            onClick = {},
                            tint = DayLogTheme.colors.inkMuted,
                        )
                        DLIconButton(
                            imageVector = app.daylog.core.designsystem.icon.DayLogIcons.Search,
                            contentDescription = "Search",
                            onClick = {},
                            tint = DayLogTheme.colors.inkMuted,
                        )
                        DLIconButton(
                            imageVector = app.daylog.core.designsystem.icon.DayLogIcons.Settings,
                            contentDescription = "Settings",
                            onClick = {},
                            tint = DayLogTheme.colors.inkMuted,
                        )
                    },
                )

                Box(modifier = Modifier.weight(1f)) {
                    TimelineScreen(
                        groups = sampleGroups,
                        contentPadding = PaddingValues(top = 4.dp, bottom = 24.dp),
                    )
                }

                DayLogBottomBar(
                    current = Routes.Timeline,
                    onTab = {},
                )
            }

            Box(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 112.dp),
            ) {
                QuickEntryBar(
                    value = "",
                    onValueChange = {},
                    onSave = {},
                    onExpand = {},
                    onAddPhoto = {},
                )
            }
        }
    }
}

@PreviewTest
@Preview(name = "Timeline", widthDp = 400, heightDp = 780, showBackground = true)
@Composable
fun TimelinePreview() {
    DayLogPreview()
}

@PreviewTest
@Preview(
    name = "Timeline - Night",
    widthDp = 400,
    heightDp = 780,
    showBackground = true,
    uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES,
)
@Composable
fun TimelineNightPreview() {
    DayLogPreview(dark = true)
}

@PreviewTest
@Preview(
    name = "Timeline - Large text",
    widthDp = 400,
    heightDp = 780,
    showBackground = true,
    fontScale = 1.5f,
)
@Composable
fun TimelineLargeTextPreview() {
    DayLogPreview()
}

@PreviewTest
@Preview(
    name = "Timeline - Tablet",
    widthDp = 840,
    heightDp = 900,
    showBackground = true,
)
@Composable
fun TimelineTabletPreview() {
    DayLogPreview()
}

@PreviewTest
@Preview(name = "One entry", widthDp = 400, heightDp = 780, showBackground = true)
@Composable
fun EntryDetailPreview() {
    DayLogTheme {
        EntryDetailScreen(
            entry = sampleEntries[0],
            tags = listOf(app.daylog.core.model.Tag("reading")),
            onBack = {},
            onEdit = {},
            onDelete = {},
        )
    }
}

@PreviewTest
@Preview(name = "Search", widthDp = 400, heightDp = 780, showBackground = true)
@Composable
fun SearchPreview() {
    DayLogTheme {
        SearchScreen(
            query = "rain",
            onQueryChanged = {},
            groups = listOf(
                DayGroup(
                    key = today.toEpochDay(),
                    date = today,
                    header = "Today",
                    entries = sampleEntries.take(1),
                ),
            ),
            onEntryClick = {},
            onBack = {},
        )
    }
}

@PreviewTest
@Preview(name = "Calendar", widthDp = 400, heightDp = 780, showBackground = true)
@Composable
fun CalendarPreview() {
    DayLogTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DayLogTheme.colors.background),
        ) {
            CalendarScreen(
                year = 2026,
                month = 3,
                entryDays = setOf(1, 4, 9, 15, 22, 28),
                selectedDay = 9,
                onDaySelected = {},
                onPreviousMonth = {},
                onNextMonth = {},
                selectedEntries = listOf(sampleEntries[0]),
                onOpenEntry = {},
                modifier = Modifier.weight(1f),
            )

            DayLogBottomBar(
                current = Routes.Calendar,
                onTab = {},
            )
        }
    }
}

@PreviewTest
@Preview(name = "On this day", widthDp = 400, heightDp = 780, showBackground = true)
@Composable
fun OnThisDayPreview() {
    DayLogTheme {
        OnThisDayScreen(
            years = listOf(
                OnThisDayYear(
                    year = today.minusYears(1).year,
                    entries = listOf(
                        Entry(
                            uid = "m1",
                            content = "The train was late, but the book was good. #reading",
                            createdAt = at(today.minusYears(1), 9, 14),
                            updatedAt = at(today.minusYears(1), 9, 14),
                        ),
                    ),
                ),
                OnThisDayYear(
                    year = today.minusYears(3).year,
                    entries = listOf(
                        Entry(
                            uid = "m2",
                            content = "Rain all afternoon. Finished the second chapter.",
                            createdAt = at(today.minusYears(3), 18, 2),
                            updatedAt = at(today.minusYears(3), 18, 2),
                        ),
                        Entry(
                            uid = "m3",
                            content = "Called Mum. She is well. #family",
                            createdAt = at(today.minusYears(3), 21, 30),
                            updatedAt = at(today.minusYears(3), 21, 30),
                        ),
                    ),
                ),
            ),
            onBack = {},
            onOpenEntry = {},
        )
    }
}

@PreviewTest
@Preview(name = "Statistics", widthDp = 400, heightDp = 780, showBackground = true)
@Composable
fun StatisticsPreview() {
    DayLogTheme {
        StatisticsScreen(
            statistics = calculateStatistics(
                entries = sampleEntries,
                tags = listOf(
                    Tag("reading", 4),
                    Tag("family", 2),
                    Tag("work", 7),
                ),
                today = today,
                zone = zone,
            ),
            isEmpty = false,
            onBack = {},
        )
    }
}