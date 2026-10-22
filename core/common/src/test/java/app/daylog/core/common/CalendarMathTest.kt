package app.daylog.core.common

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate
import java.util.Locale

class CalendarMathTest {

    @Test
    fun `a month starts on the right day of the week`() {
        // March 2026 starts on a Sunday.
        assertEquals(6, CalendarMath.firstDayOffset(2026, 3))
    }

    @Test
    fun `the grid has a blank for every day before the first`() {
        // March 2026 starts on a Sunday, so six blanks come before the 1st.
        assertEquals(6, CalendarMath.monthCells(2026, 3).indexOf(1))
    }

    @Test
    fun `the grid has every day of the month`() {
        assertEquals(31, CalendarMath.monthCells(2026, 3).filterNotNull().size)
    }

    @Test
    fun `the grid has a whole number of weeks`() {
        val cells = CalendarMath.monthCells(2026, 3)
        assertEquals(0, cells.size % 7)
    }

    @Test
    fun `February in a leap year has 29 days`() {
        assertEquals(29, CalendarMath.daysInMonth(2024, 2))
    }

    @Test
    fun `February in a normal year has 28 days`() {
        assertEquals(28, CalendarMath.daysInMonth(2026, 2))
    }

    @Test
    fun `the month is named in full`() {
        assertEquals("March 2026", CalendarMath.monthName(2026, 3, Locale.US))
    }

    @Test
    fun `the weekday labels start on Monday`() {
        val labels = CalendarMath.weekdayLabels(Locale.US)

        assertEquals(7, labels.size)
        assertEquals("Mon", labels.first())
    }

    @Test
    fun `the last day of the month is the last non-blank cell`() {
        val cells = CalendarMath.monthCells(2026, 3)

        assertEquals(31, cells.filterNotNull().last())
    }
}
