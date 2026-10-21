package app.daylog.core.model

import app.daylog.core.common.DayLabels
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.Locale

/**
 * One day of entries.
 *
 * The timeline is a list of these, not a flat list of entries. The date lives in the margin
 * beside the entries rather than above them, so the group has to carry the date as data.
 */
data class DayGroup(
    /** The day, as a key that does not change with the time zone. */
    val key: Long,
    /** The calendar day, for the header and for filtering. */
    val date: LocalDate,
    /** The heading shown in the margin: "Today", "Thursday", "12 March". */
    val header: String,
    /** The entries of that day, newest first. */
    val entries: List<Entry>,
)

/**
 * Groups entries by the day they were written.
 *
 * This is a rule, not a view concern, so it lives in the model and is tested on the JVM.
 *
 * Entries are grouped by the *local* day they fall on, and the days come back newest first. An
 * entry that was written yesterday but edited today still belongs to yesterday: the day an entry
 * belongs to is the day it was written.
 */
object DayGrouper {

    fun group(
        entries: List<Entry>,
        zone: ZoneId = ZoneId.systemDefault(),
        locale: Locale = Locale.getDefault(),
        today: LocalDate = LocalDate.now(zone),
    ): List<DayGroup> =
        entries
            .groupBy { entry ->
                val date = Instant.ofEpochMilli(entry.createdAt).atZone(zone).toLocalDate()
                date to DayLabels.dayKey(date)
            }
            .map { (dateAndKey, dayEntries) ->
                DayGroup(
                    key = dateAndKey.second,
                    date = dateAndKey.first,
                    header = DayLabels.dayHeader(dateAndKey.first, today, locale),
                    entries = dayEntries.sortedByDescending { it.createdAt },
                )
            }
            .sortedByDescending { it.key }
}
