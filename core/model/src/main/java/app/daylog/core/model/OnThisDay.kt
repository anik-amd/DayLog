package app.daylog.core.model

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/**
 * One past year's writing on this day.
 */
data class OnThisDayYear(
    val year: Int,
    val entries: List<Entry>,
)

/**
 * The entries written on this same date in past years, newest year first.
 *
 * Today's own entries are the timeline's business — this is the diary's long memory, so only the
 * years before this one are asked for, and each year's entries stand newest first, the way the
 * timeline reads.
 */
fun onThisDay(entries: List<Entry>, today: LocalDate, zone: ZoneId): List<OnThisDayYear> =
    entries
        .mapNotNull { entry ->
            val date = Instant.ofEpochMilli(entry.createdAt).atZone(zone).toLocalDate()
            val isThisDay = date.monthValue == today.monthValue && date.dayOfMonth == today.dayOfMonth
            if (isThisDay && date.year < today.year) date.year to entry else null
        }
        .groupBy({ (year, _) -> year }, { (_, entry) -> entry })
        .map { (year, list) -> OnThisDayYear(year, list.sortedByDescending { it.createdAt }) }
        .sortedByDescending { it.year }
