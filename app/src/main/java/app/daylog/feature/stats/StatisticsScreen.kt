package app.daylog.feature.stats

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.daylog.core.designsystem.component.DLChip
import app.daylog.core.designsystem.component.DLEmptyState
import app.daylog.core.designsystem.component.DLMeta
import app.daylog.core.designsystem.component.DLRule
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.DailyCount
import app.daylog.core.model.Statistics
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

/**
 * The numbers.
 *
 * A diary should not be a dashboard, so this screen shows plain counts and nothing that needs
 * explaining. The chart at the bottom is the only thing that draws anything, and it draws the
 * last thirty days.
 */
@Composable
fun StatisticsScreen(
    statistics: Statistics,
    isEmpty: Boolean,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    locale: Locale = Locale.getDefault(),
) {
    val colors = DayLogTheme.colors

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background),
    ) {
        DLTopBar(
            title = "Statistics",
            leadingIcon = DayLogIcons.Back,
            onLeadingClick = onBack,
        )

        if (isEmpty) {
            DLEmptyState(
                title = "Nothing written yet",
                body = "Once there is something here, this is where the numbers live.",
            )
            return@Column
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 32.dp),
        ) {
            BigNumber(
                value = statistics.totalEntries.toString(),
                label = if (statistics.totalEntries == 1) "entry written" else "entries written",
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp),
            )

            DLRule(modifier = Modifier.padding(horizontal = 20.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                SmallNumber(
                    value = statistics.totalWords.toString(),
                    label = "words",
                    modifier = Modifier.weight(1f),
                )
                SmallNumber(
                    value = statistics.daysWritten.toString(),
                    label = "days written on",
                    modifier = Modifier.weight(1f),
                )
                SmallNumber(
                    value = statistics.entriesThisMonth.toString(),
                    label = "this month",
                    modifier = Modifier.weight(1f),
                )
            }

            DLRule(modifier = Modifier.padding(horizontal = 20.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                SmallNumber(
                    value = streakLabel(statistics.currentStreak),
                    label = "in a row",
                    modifier = Modifier.weight(1f),
                )
                SmallNumber(
                    value = statistics.longestStreak.toString(),
                    label = "longest run",
                    modifier = Modifier.weight(1f),
                )
                SmallNumber(
                    value = statistics.busiestDay
                        ?.getDisplayName(TextStyle.FULL, locale)
                        ?: "—",
                    label = "most written on",
                    modifier = Modifier.weight(1f),
                )
            }

            if (statistics.topTags.isNotEmpty()) {
                DLRule(modifier = Modifier.padding(horizontal = 20.dp))

                Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
                    DLText(
                        text = "Most used tags",
                        style = DayLogTheme.typography.label,
                        color = colors.inkMuted,
                    )
                    Row(
                        modifier = Modifier.padding(top = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        statistics.topTags.take(4).forEach { tag ->
                            DLChip(text = "#${tag.name}")
                        }
                    }
                }
            }

            DLRule(modifier = Modifier.padding(horizontal = 20.dp))

            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
                DLText(
                    text = "The last thirty days",
                    style = DayLogTheme.typography.label,
                    color = colors.inkMuted,
                )
                DailyChart(
                    counts = statistics.dailyCounts,
                    modifier = Modifier.padding(top = 14.dp),
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    DLMeta(
                        text = statistics.dailyCounts.firstOrNull()?.date
                            ?.format(DateTimeFormatter.ofPattern("d MMM", locale))
                            .orEmpty(),
                    )
                    DLMeta(
                        text = statistics.dailyCounts.lastOrNull()?.date
                            ?.format(DateTimeFormatter.ofPattern("d MMM", locale))
                            .orEmpty(),
                    )
                }
            }
        }
    }
}

/**
 * The one big number.
 */
@Composable
private fun BigNumber(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        DLText(
            text = value,
            style = DayLogTheme.typography.chromeTitle.copy(fontSize = 44.sp),
            color = DayLogTheme.colors.accent,
        )
        DLMeta(text = label, modifier = Modifier.padding(top = 2.dp))
    }
}

/**
 * One of the smaller numbers.
 */
@Composable
private fun SmallNumber(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier) {
        DLText(
            text = value,
            style = DayLogTheme.typography.entryTitle,
            color = DayLogTheme.colors.ink,
        )
        DLMeta(text = label, modifier = Modifier.padding(top = 2.dp))
    }
}

/**
 * The last thirty days, as a row of bars.
 *
 * A day with nothing on it still shows a hairline, so the shape of the month is visible even
 * where there is nothing.
 */
@Composable
private fun DailyChart(
    counts: List<DailyCount>,
    modifier: Modifier = Modifier,
) {
    val colors = DayLogTheme.colors
    val busiest = counts.maxOfOrNull { it.count } ?: 0

    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(64.dp),
        verticalAlignment = Alignment.Bottom,
        horizontalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        counts.forEach { day ->
            val height = if (busiest == 0) {
                0f
            } else {
                (day.count.toFloat() / busiest).coerceIn(0f, 1f)
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(height.coerceAtLeast(0.02f))
                    .background(
                        color = if (day.count > 0) colors.accent else colors.rule,
                        shape = RoundedCornerShape(2.dp),
                    ),
            )
        }
    }
}

/**
 * A streak, said in words.
 */
private fun streakLabel(streak: Int): String = when (streak) {
    0 -> "—"
    1 -> "1 day"
    else -> "$streak days"
}
