package app.daylog.core.common

import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale

/**
 * The dates the timeline shows.
 *
 * Everything here is pure: the zone and the locale are passed in, so the rules can be tested on
 * the JVM without a device and so the app can be checked against a specific calendar.
 *
 * The rules themselves are the point. A diary is read over months, and the header above each day
 * should say whatever is most useful about that day — the weekday for this week, the date for
 * older entries — without the reader having to work out which is which.
 */
object DayLabels {

    /**
     * The heading above a day's entries.
     *
     * Today and yesterday are named. The last week is named by its weekday. Anything older shows
     * the date, with the year only when it is not the current one.
     */
    fun dayHeader(date: LocalDate, today: LocalDate, locale: Locale): String {
        // Measured from the date to today, so a day in the past is a positive number of days ago.
        val daysAgo = java.time.temporal.ChronoUnit.DAYS.between(date, today)

        return when {
            daysAgo == 0L -> "Today"
            daysAgo == 1L -> "Yesterday"
            daysAgo in 2..6 -> date.format(
                DateTimeFormatter.ofPattern("EEEE", locale),
            )
            date.year == today.year -> date.format(
                DateTimeFormatter.ofPattern("d MMMM", locale),
            )
            else -> date.format(
                DateTimeFormatter.ofPattern("d MMMM yyyy", locale),
            )
        }
    }

    /**
     * The time of an entry, in the device's short time format.
     */
    fun time(moment: LocalDateTime, locale: Locale): String =
        moment.format(DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT).withLocale(locale))

    /**
     * A stable key for a calendar day.
     *
     * Entries are grouped by day, and the group must not change when the device's time zone
     * changes. The key is the day itself, not a timestamp, so it stays the same wherever the
     * reader is when they open the app.
     */
    fun dayKey(date: LocalDate): Long = date.toEpochDay()
}

/**
 * The calendar day a moment falls on.
 */
fun Long.toLocalDate(zone: ZoneId = ZoneId.systemDefault()): LocalDate =
    Instant.ofEpochMilli(this).atZone(zone).toLocalDate()

/**
 * The wall-clock moment a timestamp refers to.
 */
fun Long.toLocalDateTime(zone: ZoneId = ZoneId.systemDefault()): LocalDateTime =
    Instant.ofEpochMilli(this).atZone(zone).toLocalDateTime()
