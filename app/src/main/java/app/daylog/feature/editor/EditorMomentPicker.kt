package app.daylog.feature.editor

import android.text.format.DateFormat
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TimePicker
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.window.DialogProperties
import app.daylog.core.common.toLocalDateTime
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * What the writer is picking, when they tap the time on an entry.
 *
 * The day comes first, then the minute; each one can be kept as it is.
 */
private enum class MomentStep {
    Date,
    Time,
}

/**
 * The date and time the editor shows under its top bar, in the device's own shorthand.
 *
 * The line is small, but it is a fact of the entry rather than chrome: when it is wrong, the
 * writer taps it and puts it right.
 */
internal fun momentLabel(createdAt: Long, is24Hour: Boolean, locale: Locale = Locale.getDefault()): String =
    createdAt.toLocalDateTime().format(
        DateTimeFormatter.ofPattern(
            if (is24Hour) "EEE d MMM, HH:mm" else "EEE d MMM, h:mm a",
            locale,
        ),
    )

/**
 * The pickers.
 *
 * The day is picked on the platform's calendar, the minute on the platform's clock, and each
 * step reports the moment without disturbing the other half of it.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun MomentPicker(
    moment: Long,
    onChange: (Long) -> Unit,
    onDone: () -> Unit,
) {
    var step by remember { mutableStateOf(MomentStep.Date) }
    var current by remember { mutableStateOf(moment) }

    when (step) {
        MomentStep.Date -> {
            val zone = ZoneId.systemDefault()
            // The calendar's proposed moment is UTC, the entry's is local: the day it shows is
            // the entry's own day, written in UTC.
            val initial = current.localDate(zone).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()
            val pickerState = rememberDatePickerState(initialSelectedDateMillis = initial)

            DatePickerDialog(
                onDismissRequest = onDone,
                confirmButton = {
                    TextButton(onClick = {
                        val picked = pickerState.selectedDateMillis
                        if (picked != null) {
                            val pickedDay = Instant.ofEpochMilli(picked)
                                .atZone(ZoneOffset.UTC)
                                .toLocalDateTime()
                                .toLocalDate()
                            val time = current.localTime(zone)
                            current = LocalDateTime.of(pickedDay, time)
                                .atZone(zone)
                                .toInstant()
                                .toEpochMilli()
                            onChange(current)
                        }
                        step = MomentStep.Time
                    }) {
                        Text("Done", style = DayLogTheme.typography.label)
                    }
                },
                dismissButton = {
                    TextButton(onClick = onDone) {
                        Text("Cancel", style = DayLogTheme.typography.label)
                    }
                },
            ) {
                DatePicker(state = pickerState)
            }
        }

        MomentStep.Time -> {
            val zone = ZoneId.systemDefault()
            val time = current.localTime(zone)
            val timeState = rememberTimePickerState(
                initialHour = time.hour,
                initialMinute = time.minute,
                is24Hour = DateFormat.is24HourFormat(LocalContext.current),
            )

            AlertDialog(
                onDismissRequest = onDone,
                properties = DialogProperties(decorFitsSystemWindows = false),
                shape = DayLogShapes.sheet,
                confirmButton = {
                    TextButton(onClick = {
                        val day = current.localDate(zone)
                        current = LocalDateTime.of(day, LocalTime.of(timeState.hour, timeState.minute))
                            .atZone(zone)
                            .toInstant()
                            .toEpochMilli()
                        onChange(current)
                        onDone()
                    }) {
                        Text("Done", style = DayLogTheme.typography.label)
                    }
                },
                dismissButton = {
                    TextButton(onClick = onDone) {
                        Text("Cancel", style = DayLogTheme.typography.label)
                    }
                },
            ) {
                TimePicker(state = timeState)
            }
        }
    }
}

/**
 * The day a moment falls on, in the given zone.
 */
private fun Long.localDate(zone: ZoneId): LocalDate =
    Instant.ofEpochMilli(this).atZone(zone).toLocalDate()

/**
 * The time of day a moment falls at, in the given zone.
 */
private fun Long.localTime(zone: ZoneId): LocalTime =
    Instant.ofEpochMilli(this).atZone(zone).toLocalTime()
