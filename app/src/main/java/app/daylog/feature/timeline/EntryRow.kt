package app.daylog.feature.timeline

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.ui.Alignment
import androidx.compose.ui.unit.dp
import app.daylog.core.common.DayLabels
import app.daylog.core.common.toLocalDateTime
import app.daylog.core.designsystem.component.DLChip
import app.daylog.core.designsystem.component.DLMeta
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Entry
import app.daylog.core.model.Tag
import java.time.ZoneId
import java.util.Locale

/**
 * The width of the margin the dates sit in.
 *
 * It is wide enough for "Yesterday" and "12 March" to sit against the rule without crowding it,
 * and narrow enough to leave the entry text the room it needs to be read in.
 */
val GutterWidth = 72.dp

/**
 * One entry in the timeline.
 *
 * The time sits above the text in the muted face, and the text is set in the serif at a reading
 * size. Tags, a place and the weather are chips underneath, because they are data about the
 * entry rather than part of it.
 */
@Composable
fun EntryRow(
    entry: Entry,
    tags: List<Tag>,
    modifier: Modifier = Modifier,
    zone: ZoneId = ZoneId.systemDefault(),
    locale: Locale = Locale.getDefault(),
    onClick: (() -> Unit)? = null,
) {
    val colors = DayLogTheme.colors

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(end = 20.dp, bottom = 20.dp),
    ) {
        DLMeta(
            text = DayLabels.time(entry.createdAt.toLocalDateTime(zone), locale),
            color = colors.inkFaint,
        )

        Spacer(Modifier.height(3.dp))

        DLText(
            text = entry.content,
            style = DayLogTheme.typography.entryBody,
            color = colors.ink,
        )

        val chips = buildList {
            tags.forEach { add(it) }
        }
        if (chips.isNotEmpty() || entry.placeName != null || entry.weatherSummary != null) {
            Spacer(Modifier.height(8.dp))
            Row(
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(),
            ) {
                chips.forEach { tag ->
                    DLChip(text = tag.name, selected = true)
                }
                if (entry.placeName != null) {
                    DLChip(
                        text = entry.placeName,
                        leadingIcon = DayLogIcons.Pin,
                    )
                }
                if (entry.weatherSummary != null) {
                    DLChip(
                        text = entry.weatherSummary,
                        leadingIcon = DayLogIcons.Weather,
                    )
                }
            }
        }
    }
}
