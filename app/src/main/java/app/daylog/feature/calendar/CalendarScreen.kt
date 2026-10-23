package app.daylog.feature.calendar

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import app.daylog.core.common.CalendarMath
import app.daylog.core.designsystem.component.DLEmptyState
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.component.pressable
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Entry
import java.time.LocalDate
import java.time.ZoneId
import java.util.Locale

/**
 * A month on a single screen.
 *
 * The month grid is the screen's idea: a diary's calendar is not a date picker, it is a map of
 * the writing. Each day with an entry carries a dot, and tapping a day shows what was written
 * there. The month's own chevrons sit beside its name, and the clock face in the corner leads to
 * this day in past years.
 */
@Composable
fun CalendarScreen(
    year: Int,
    month: Int,
    entryDays: Set<Int>,
    selectedDay: Int?,
    onDaySelected: (Int) -> Unit,
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit,
    onOpenOnThisDay: () -> Unit,
    selectedEntries: List<Entry>,
    onOpenEntry: (String) -> Unit,
    modifier: Modifier = Modifier,
    zone: ZoneId = ZoneId.systemDefault(),
    locale: Locale = Locale.getDefault(),
    today: LocalDate = LocalDate.now(zone),
) {
    val colors = DayLogTheme.colors
    val cells = CalendarMath.monthCells(year, month)
    val weekdays = CalendarMath.weekdayLabels(locale)

    Surface(
        modifier = modifier,
        color = colors.background,
    ) {
        Column {
            DLTopBar(
                title = CalendarMath.monthName(year, month, locale),
                trailingContent = {
                    DLIconButton(
                        imageVector = DayLogIcons.ChevronLeft,
                        contentDescription = "Previous month",
                        onClick = onPreviousMonth,
                        tint = colors.inkMuted,
                    )
                    DLIconButton(
                        imageVector = DayLogIcons.ChevronRight,
                        contentDescription = "Next month",
                        onClick = onNextMonth,
                        tint = colors.inkMuted,
                    )
                },
            )

            // The weekday header.
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceAround,
            ) {
                weekdays.forEach { label ->
                    DLText(
                        text = label,
                        style = DayLogTheme.typography.meta,
                        color = colors.inkFaint,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                    )
                }
            }

            // The grid.
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp),
            ) {
                cells.chunked(7).forEach { week ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround,
                    ) {
                        week.forEach { day ->
                            DayCell(
                                day = day,
                                selected = day != null && day == selectedDay,
                                hasEntry = day != null && day in entryDays,
                                isToday = day != null &&
                                    year == today.year && month == today.monthValue && day == today.dayOfMonth,
                                onClick = { if (day != null) onDaySelected(day) },
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }
                }
            }

            // A link to this day in past years, shown only when no day is filtered.
            if (selectedDay == null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    DLText(
                        text = "On this day",
                        style = DayLogTheme.typography.label,
                        color = colors.inkMuted,
                        modifier = Modifier.pressable(onClick = onOpenOnThisDay),
                    )
                }
            }

            // The entries of the selected day.
            if (selectedDay != null && selectedEntries.isNotEmpty()) {
                SelectedDayEntries(
                    year = year,
                    month = month,
                    day = selectedDay,
                    entries = selectedEntries,
                    onOpenEntry = onOpenEntry,
                    today = today,
                    locale = locale,
                )
            } else if (selectedDay != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(48.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    DLEmptyState(
                        title = "Nothing that day",
                        body = "No entry was written then.",
                    )
                }
            }
        }
    }
}

@Composable
private fun DayCell(
    day: Int?,
    selected: Boolean,
    hasEntry: Boolean,
    isToday: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = DayLogTheme.colors

    Box(
        modifier = modifier
            .padding(vertical = 4.dp)
            .size(40.dp)
            .then(
                if (day != null) {
                    Modifier.pressable(onClick = onClick)
                } else {
                    Modifier
                },
            ),
        contentAlignment = Alignment.Center,
    ) {
        if (day != null) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .then(
                        if (selected) {
                            Modifier.background(colors.accent, androidx.compose.foundation.shape.RoundedCornerShape(16.dp))
                        } else {
                            Modifier
                        },
                    ),
                contentAlignment = Alignment.Center,
            ) {
                DLText(
                    text = day.toString(),
                    style = DayLogTheme.typography.label,
                    color = if (selected) colors.onAccent else if (isToday) colors.accent else colors.ink,
                )
            }

            if (hasEntry) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 2.dp)
                        .size(4.dp)
                        .background(
                            if (selected) colors.onAccent else colors.accent,
                            DayLogShapes.pill,
                        ),
                )
            }
        }
    }
}
