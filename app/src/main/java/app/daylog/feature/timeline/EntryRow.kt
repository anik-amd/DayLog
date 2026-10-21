package app.daylog.feature.timeline

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import app.daylog.core.common.DayLabels
import app.daylog.core.common.toLocalDateTime
import app.daylog.core.designsystem.component.DLChip
import app.daylog.core.designsystem.component.DLMeta
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Entry
import java.time.ZoneId
import java.util.Locale

/**
 * The width of the margin the dates sit in.
 *
 * It is wide enough for "Yesterday" and "12 March" to sit against the rule without wrapping, and
 * narrow enough to leave the entry text the room it needs to be read in.
 *
 * The margin grows with the text. A reader who has turned the font up has already said they want
 * fewer words on a line, so the margin takes its share rather than the day name being cut off.
 */
@Composable
fun gutterWidth(): Dp = (GUTTER_WIDTH_DP * LocalDensity.current.fontScale)
    .coerceAtMost(GUTTER_MAX_DP)
    .dp

private const val GUTTER_WIDTH_DP = 80f
private const val GUTTER_MAX_DP = 112f

/**
 * The space between the margin rule and the entry text.
 */
val GutterGap = 16.dp

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
    modifier: Modifier = Modifier,
    zone: ZoneId = ZoneId.systemDefault(),
    locale: Locale = Locale.getDefault(),
) {
    val colors = DayLogTheme.colors

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(start = gutterWidth() + GutterGap, end = 20.dp, bottom = 22.dp),
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
            annotated = true,
        )

        // A place and the weather are not in the text, so they are shown as chips. A tag is:
        // it is already written in the entry as "#reading", and a chip that repeats it is noise.
        val placeName = entry.placeName
        val weatherSummary = entry.weatherSummary

        if (placeName != null || weatherSummary != null) {
            Spacer(Modifier.height(10.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (placeName != null) {
                    DLChip(
                        text = placeName,
                        leadingIcon = DayLogIcons.Pin,
                    )
                }
                if (weatherSummary != null) {
                    DLChip(
                        text = weatherSummary,
                        leadingIcon = DayLogIcons.Weather,
                    )
                }
            }
        }
    }
}
