package app.daylog.core.model

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneOffset

/**
 * The rule of "on this day": what counts as the same day in a past year, and the order the
 * memories read in.
 */
class OnThisDayTest {

    private val zone = ZoneOffset.UTC
    private val today = LocalDate.of(2026, 10, 23)

    private fun at(year: Int, month: Int, day: Int, hour: Int): Long =
        LocalDate.of(year, month, day).atTime(LocalTime.of(hour, 0)).atZone(zone).toInstant().toEpochMilli()

    private fun entry(uid: String, createdAt: Long) = Entry(
        uid = uid,
        content = "a thought",
        createdAt = createdAt,
        updatedAt = createdAt,
    )

    @Test
    fun `entries from this date in past years are grouped by year, newest year first`() {
        val entries = listOf(
            entry("old", at(2023, 10, 23, 9)),
            entry("older", at(2022, 10, 23, 9)),
            entry("newest", at(2025, 10, 23, 9)),
        )

        val years = onThisDay(entries, today, zone)

        assertEquals(listOf(2025, 2023, 2022), years.map { it.year })
    }

    @Test
    fun `entries inside a year stand newest first`() {
        val entries = listOf(
            entry("morning", at(2023, 10, 23, 8)),
            entry("evening", at(2023, 10, 23, 20)),
        )

        val years = onThisDay(entries, today, zone)

        assertEquals(listOf("evening", "morning"), years.single().entries.map { it.uid })
    }

    @Test
    fun `this year's entries are the timeline's, not a memory`() {
        val entries = listOf(entry("today", at(2026, 10, 23, 9)))

        assertEquals(emptyList<OnThisDayYear>(), onThisDay(entries, today, zone))
    }

    @Test
    fun `a different day is not this day`() {
        val entries = listOf(
            entry("day-before", at(2023, 10, 22, 9)),
            entry("other-month", at(2023, 11, 23, 9)),
        )

        assertEquals(emptyList<OnThisDayYear>(), onThisDay(entries, today, zone))
    }
}
