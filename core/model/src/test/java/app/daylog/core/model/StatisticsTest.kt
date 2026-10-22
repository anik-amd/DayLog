package app.daylog.core.model

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.LocalDate
import java.time.ZoneId

/**
 * The numbers.
 */
class StatisticsTest {

    private val zone = ZoneId.of("UTC")

    @Test
    fun `the entries and the words are counted`() {
        val statistics = calculateStatistics(
            entries = listOf(
                entry("a", "one two three", day = 1),
                entry("b", "four five", day = 2),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(2, statistics.totalEntries)
        assertEquals(5, statistics.totalWords)
    }

    @Test
    fun `a deleted entry is not counted`() {
        val statistics = calculateStatistics(
            entries = listOf(
                entry("a", "kept", day = 1),
                entry("b", "gone", day = 2, deleted = true),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(1, statistics.totalEntries)
    }

    @Test
    fun `today this week and this month are counted separately`() {
        // 2026-10-22 is a Thursday, so the week starts on the 19th.
        val statistics = calculateStatistics(
            entries = listOf(
                entry("a", "today", month = 10, day = 22),
                entry("b", "this week", month = 10, day = 20),
                entry("c", "last week", month = 10, day = 15),
                entry("d", "last month", month = 9, day = 1),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(1, statistics.entriesToday)
        assertEquals(2, statistics.entriesThisWeek)
        assertEquals(3, statistics.entriesThisMonth)
    }

    @Test
    fun `the streak counts back from today`() {
        val statistics = calculateStatistics(
            entries = listOf(
                entry("a", "today", day = 22),
                entry("b", "yesterday", day = 21),
                entry("c", "the day before", day = 20),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(3, statistics.currentStreak)
    }

    @Test
    fun `a streak survives a day that was missed`() {
        val statistics = calculateStatistics(
            entries = listOf(
                entry("a", "yesterday", day = 21),
                entry("b", "the day before", day = 20),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(2, statistics.currentStreak)
    }

    @Test
    fun `the streak ends when two days are missed`() {
        val statistics = calculateStatistics(
            entries = listOf(
                entry("a", "the day before yesterday", day = 20),
                entry("b", "three days ago", day = 19),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(0, statistics.currentStreak)
    }

    @Test
    fun `the longest streak is the longest run that ever happened`() {
        val statistics = calculateStatistics(
            entries = listOf(
                entry("a", "today", day = 22),
                entry("b", "a run", day = 10),
                entry("c", "a run", day = 11),
                entry("d", "a run", day = 12),
                entry("e", "a run", day = 13),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(4, statistics.longestStreak)
    }

    @Test
    fun `the busiest day is the one with the most entries`() {
        // 2026-10-19 is a Monday.
        val statistics = calculateStatistics(
            entries = listOf(
                entry("a", "monday", day = 19),
                entry("b", "monday", day = 12),
                entry("c", "tuesday", day = 20),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(java.time.DayOfWeek.MONDAY, statistics.busiestDay)
        assertEquals(2, statistics.busiestDayCount)
    }

    @Test
    fun `there is no busiest day when nothing has been written`() {
        val statistics = calculateStatistics(
            entries = emptyList(),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertNull(statistics.busiestDay)
        assertEquals(0, statistics.totalEntries)
    }

    @Test
    fun `the chart shows the last thirty days oldest first`() {
        val statistics = calculateStatistics(
            entries = listOf(entry("a", "today", day = 22)),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(30, statistics.dailyCounts.size)
        assertEquals(LocalDate.of(2026, 9, 23), statistics.dailyCounts.first().date)
        assertEquals(LocalDate.of(2026, 10, 22), statistics.dailyCounts.last().date)
        assertEquals(1, statistics.dailyCounts.last().count)
        assertEquals(0, statistics.dailyCounts.first().count)
    }

    @Test
    fun `the tags are in order of how often they are used`() {
        val statistics = calculateStatistics(
            entries = emptyList(),
            tags = listOf(
                Tag("work", count = 2),
                Tag("reading", count = 9),
                Tag("walking", count = 5),
            ),
            today = LocalDate.of(2026, 10, 22),
            zone = zone,
        )

        assertEquals(listOf("reading", "walking", "work"), statistics.topTags.map { it.name })
    }

    @Test
    fun `words are counted however the text is spaced`() {
        assertEquals(3, countWords("one two three"))
        assertEquals(3, countWords("  one   two\nthree  "))
        assertEquals(0, countWords("   "))
    }

    private fun entry(
        uid: String,
        content: String,
        month: Int = 10,
        day: Int,
        deleted: Boolean = false,
    ): Entry {
        val date = LocalDate.of(2026, month, day)
        return Entry(
            uid = uid,
            content = content,
            createdAt = date.atStartOfDay(zone).toInstant().toEpochMilli(),
            updatedAt = date.atStartOfDay(zone).toInstant().toEpochMilli(),
            deletedAt = if (deleted) 1_000L else null,
        )
    }
}
