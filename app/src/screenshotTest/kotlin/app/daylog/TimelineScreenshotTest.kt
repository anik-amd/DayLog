package app.daylog

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import com.android.tools.screenshot.PreviewTest
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.DayGroup
import app.daylog.core.model.Entry
import app.daylog.core.model.Tag
import app.daylog.feature.timeline.TimelineScreen
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

/**
 * The timeline, rendered.
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
        content = "The train was late, so I read the whole of the essay on the way in and " +
            "arrived with something to think about. #reading",
        createdAt = at(today, 9, 14),
        updatedAt = at(today, 9, 14),
    ),
    Entry(
        uid = "2",
        content = "Rain all afternoon. Finished the second chapter of the book.",
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

private val sampleTags = listOf(
    Tag(name = "reading", count = 1),
    Tag(name = "family", count = 1),
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

@PreviewTest
@Preview(name = "Timeline", widthDp = 400, heightDp = 780, showBackground = true)
@Composable
fun TimelinePreview() {
    DayLogTheme {
        TimelineScreen(groups = sampleGroups, tags = sampleTags)
    }
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
    DayLogTheme(themeMode = app.daylog.core.model.DayLogThemeMode.Dark) {
        TimelineScreen(groups = sampleGroups, tags = sampleTags)
    }
}

@PreviewTest
@Preview(name = "Timeline - Large text", widthDp = 400, heightDp = 780, showBackground = true, fontScale = 1.5f)
@Composable
fun TimelineLargeTextPreview() {
    DayLogTheme {
        TimelineScreen(groups = sampleGroups, tags = sampleTags)
    }
}
