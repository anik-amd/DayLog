package app.daylog.core.common

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Locale

class DayLabelsTest {

    private val today = LocalDate.of(2026, 3, 30)
    private val locale = Locale.US

    @Test
    fun `the day being read about is called today`() {
        assertEquals("Today", DayLabels.dayHeader(today, today, locale))
    }

    @Test
    fun `the day before is called yesterday`() {
        assertEquals("Yesterday", DayLabels.dayHeader(today.minusDays(1), today, locale))
    }

    @Test
    fun `the rest of the week is called by its weekday`() {
        assertEquals("Thursday", DayLabels.dayHeader(today.minusDays(3), today, locale))
    }

    @Test
    fun `an older day is called by its date`() {
        assertEquals("12 March", DayLabels.dayHeader(today.minusDays(18), today, locale))
    }

    @Test
    fun `a day in another year carries the year too`() {
        assertEquals("12 March 2025", DayLabels.dayHeader(LocalDate.of(2025, 3, 12), today, locale))
    }

    @Test
    fun `the first of the month reads as a date, not a weekday`() {
        val first = LocalDate.of(2026, 3, 1)
        assertEquals("1 March", DayLabels.dayHeader(first, today, locale))
    }

    @Test
    fun `the time of an entry is shown in the locale's short form`() {
        val moment = LocalDateTime.of(2026, 3, 30, 14, 32)
        // The space before AM and PM is a narrow no-break space in the current CLDR data, so the
        // comparison normalises it rather than hard-coding one particular space character.
        assertEquals("2:32 PM", DayLabels.time(moment, locale).replace(' ', ' '))
    }

    @Test
    fun `a day key does not change with the time zone`() {
        // The key is the day itself, so the same calendar day always groups together.
        assertEquals(today.toEpochDay(), DayLabels.dayKey(today))
    }
}
