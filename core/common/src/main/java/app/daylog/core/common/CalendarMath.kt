package app.daylog.core.common

import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.Locale

/**
 * The days of a calendar month, laid out as a grid.
 *
 * A month is shown as a grid of weeks, with blank cells before the first day and after the last.
 * The grid is a fact about the calendar rather than about any particular screen, so it is here
 * and not in a view.
 *
 * The week starts on Monday, which is how a diary reads.
 */
object CalendarMath {

    /** The day of the week a month starts on, as an offset from Monday (0..6). */
    fun firstDayOffset(year: Int, month: Int): Int {
        val first = YearMonth.of(year, month).atDay(1)
        return first.dayOfWeek.value - 1 // Monday = 0
    }

    /** How many days are in the month. */
    fun daysInMonth(year: Int, month: Int): Int =
        YearMonth.of(year, month).lengthOfMonth()

    /**
     * The cells of the month, in order, including the blanks at the start and the end.
     *
     * A blank is `null`. A day is its number (1..31).
     */
    fun monthCells(year: Int, month: Int): List<Int?> {
        val offset = firstDayOffset(year, month)
        val days = daysInMonth(year, month)
        val cells = MutableList<Int?>(offset) { null }
        for (day in 1..days) cells += day
        while (cells.size % 7 != 0) cells += null
        return cells
    }

    /**
     * The month's name, for the header.
     */
    fun monthName(year: Int, month: Int, locale: Locale): String =
        YearMonth.of(year, month).format(DateTimeFormatter.ofPattern("MMMM yyyy", locale))

    /**
     * The day of the week labels, Monday first.
     */
    fun weekdayLabels(locale: Locale): List<String> {
        val monday = LocalDate.of(2024, 1, 1) // a Monday
        return (0..6).map { monday.plusDays(it.toLong()).format(DateTimeFormatter.ofPattern("EE", locale)) }
    }
}
