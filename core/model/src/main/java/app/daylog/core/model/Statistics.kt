package app.daylog.core.model

import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId

/**
 * The numbers a reader might want to see about their own writing.
 *
 * The app says nothing about this unless it is asked, but when it is asked the answers are plain:
 * how much was written, how often, and when.
 */
data class Statistics(
    /** Every entry ever written. */
    val totalEntries: Int,
    /** Every word ever written. */
    val totalWords: Int,
    /** The entries written today. */
    val entriesToday: Int,
    /** The entries written this week, counting the week from Monday. */
    val entriesThisWeek: Int,
    /** The entries written this month. */
    val entriesThisMonth: Int,
    /** How many different days have an entry on them. */
    val daysWritten: Int,
    /**
     * How many days in a row have an entry, counting back from today.
     *
     * A streak survives a day that was missed, so writing yesterday and the day before still
     * counts until the day after yesterday is missed too.
     */
    val currentStreak: Int,
    /** The longest run of days in a row that ever happened. */
    val longestStreak: Int,
    /** The day of the week most entries are written on. */
    val busiestDay: DayOfWeek? = null,
    /** How many entries are written on that day. */
    val busiestDayCount: Int = 0,
    /** The tags in use, most used first. */
    val topTags: List<Tag> = emptyList(),
    /** The last [DAILY_WINDOW] days, oldest first, with the count on each. */
    val dailyCounts: List<DailyCount> = emptyList(),
) {
    companion object {
        /** How many days the little chart shows. */
        const val DAILY_WINDOW = 30
    }
}

/**
 * How many entries were written on one day.
 */
data class DailyCount(
    val date: LocalDate,
    val count: Int,
)

/**
 * Works out the numbers.
 *
 * This is a pure function on purpose: the numbers can be checked without a database, without an
 * Android device and without a clock, and the same answer comes out every time.
 *
 * @param entries every entry, including the deleted ones? No: the deleted ones are left out,
 * because a deleted entry is not something the reader wrote and kept.
 * @param today the day to count "today" as. Given rather than read from the clock, so the numbers
 * can be tested.
 */
fun calculateStatistics(
    entries: List<Entry>,
    tags: List<Tag> = emptyList(),
    today: LocalDate,
    zone: ZoneId = ZoneId.systemDefault(),
    days: Int = Statistics.DAILY_WINDOW,
): Statistics {
    val live = entries.filterNot { it.isDeleted }

    val countsByDate = live.groupingBy { entryDate(it, zone) }.eachCount()
    val wordCount = live.sumOf { countWords(it.content) }

    val busiest = live
        .groupingBy { entryDate(it, zone).dayOfWeek }
        .eachCount()
        .maxByOrNull { it.value }

    val sortedDates = countsByDate.keys.sorted()
    val startOfWeek = today.minusDays((today.dayOfWeek.value - 1).toLong())
    val thisMonth = YearMonth.from(today)

    return Statistics(
        totalEntries = live.size,
        totalWords = wordCount,
        entriesToday = countsByDate[today] ?: 0,
        entriesThisWeek = live.count { entryDate(it, zone) >= startOfWeek },
        entriesThisMonth = live.count { YearMonth.from(entryDate(it, zone)) == thisMonth },
        daysWritten = countsByDate.size,
        currentStreak = currentStreak(countsByDate, today),
        longestStreak = longestStreak(sortedDates),
        busiestDay = busiest?.key,
        busiestDayCount = busiest?.value ?: 0,
        topTags = tags.sortedWith(
            compareByDescending<Tag> { it.count }.thenBy { it.name.lowercase() },
        ).take(TOP_TAG_COUNT),
        dailyCounts = (days - 1 downTo 0).map { back ->
            val date = today.minusDays(back.toLong())
            DailyCount(date = date, count = countsByDate[date] ?: 0)
        },
    )
}

/**
 * The day an entry was written on, in the reader's own timezone.
 */
fun entryDate(entry: Entry, zone: ZoneId = ZoneId.systemDefault()): LocalDate =
    java.time.Instant.ofEpochMilli(entry.createdAt).atZone(zone).toLocalDate()

/**
 * How many words are in a piece of writing.
 *
 * A word is a run of characters between spaces. The count is not exact, and does not need to be:
 * it is there to give a sense of size.
 */
fun countWords(content: String): Int =
    content.split(WHITESPACE).count { it.isNotEmpty() }

/**
 * How many days in a row have an entry, counting back from today.
 */
private fun currentStreak(countsByDate: Map<LocalDate, Int>, today: LocalDate): Int {
    var date = today
    if ((countsByDate[date] ?: 0) == 0) {
        date = date.minusDays(1)
        if ((countsByDate[date] ?: 0) == 0) return 0
    }

    var streak = 0
    while ((countsByDate[date] ?: 0) > 0) {
        streak++
        date = date.minusDays(1)
    }
    return streak
}

/**
 * The longest run of days in a row that ever happened.
 */
private fun longestStreak(sortedDates: List<LocalDate>): Int {
    var longest = 0
    var run = 0
    var previous: LocalDate? = null

    sortedDates.forEach { date ->
        run = if (previous != null && previous.plusDays(1) == date) run + 1 else 1
        if (run > longest) longest = run
        previous = date
    }
    return longest
}

private val WHITESPACE = Regex("\\s+")

/** How many tags the statistics show. */
private const val TOP_TAG_COUNT = 8
