package app.daylog.core.model

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.Locale

class DayGrouperTest {

    private val zone: ZoneId = ZoneId.of("UTC")
    private val today = LocalDate.of(2026, 3, 30)

    private fun at(date: LocalDate, hour: Int): Long =
        ZonedDateTime.of(date, java.time.LocalTime.of(hour, 0), zone).toInstant().toEpochMilli()

    private fun entry(uid: String, date: LocalDate, hour: Int, updatedAt: Long = 0L) = Entry(
        uid = uid,
        content = "entry $uid",
        createdAt = at(date, hour),
        updatedAt = updatedAt,
    )

    @Test
    fun `entries written on the same day are one group`() {
        val groups = DayGrouper.group(
            entries = listOf(
                entry("a", today, 9),
                entry("b", today, 18),
            ),
            zone = zone,
            locale = Locale.US,
            today = today,
        )

        assertEquals(1, groups.size)
        assertEquals(2, groups.first().entries.size)
    }

    @Test
    fun `the days come back newest first`() {
        val groups = DayGrouper.group(
            entries = listOf(
                entry("old", today.minusDays(2), 9),
                entry("new", today, 9),
            ),
            zone = zone,
            locale = Locale.US,
            today = today,
        )

        assertEquals(listOf("new", "old"), groups.flatMap { it.entries }.map { it.uid })
    }

    @Test
    fun `the entries of a day come back newest first`() {
        val groups = DayGrouper.group(
            entries = listOf(
                entry("morning", today, 9),
                entry("night", today, 23),
            ),
            zone = zone,
            locale = Locale.US,
            today = today,
        )

        assertEquals(listOf("night", "morning"), groups.first().entries.map { it.uid })
    }

    @Test
    fun `an entry belongs to the day it was written, not the day it was edited`() {
        val groups = DayGrouper.group(
            entries = listOf(
                entry(
                    uid = "edited",
                    date = today.minusDays(1),
                    hour = 9,
                    updatedAt = at(today, 20),
                ),
            ),
            zone = zone,
            locale = Locale.US,
            today = today,
        )

        assertEquals("Yesterday", groups.first().header)
    }

    @Test
    fun `the group carries the heading for its day`() {
        val groups = DayGrouper.group(
            entries = listOf(entry("a", today, 9)),
            zone = zone,
            locale = Locale.US,
            today = today,
        )

        assertEquals("Today", groups.first().header)
        assertEquals(today, groups.first().date)
    }

    @Test
    fun `no entries make no groups`() {
        val groups = DayGrouper.group(
            entries = emptyList(),
            zone = zone,
            locale = Locale.US,
            today = today,
        )

        assertEquals(0, groups.size)
    }
}
