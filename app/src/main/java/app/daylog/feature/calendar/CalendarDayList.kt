package app.daylog.feature.calendar

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.daylog.core.common.DayLabels
import app.daylog.core.common.plainPreview
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.pressable
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Entry
import java.time.LocalDate
import java.util.Locale

/**
 * The entries of the day the writer chose, under the grid.
 *
 * The grid says where the writing is; this says what it was. Each entry opens on its own terms
 * when it is tapped, because a day's writing is not a peek — it is the entry.
 */
@Composable
internal fun SelectedDayEntries(
    year: Int,
    month: Int,
    day: Int,
    entries: List<Entry>,
    onOpenEntry: (String) -> Unit,
    today: LocalDate,
    locale: Locale,
    modifier: Modifier = Modifier,
) {
    val colors = DayLogTheme.colors

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 16.dp, start = 20.dp, end = 20.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        DLText(
            text = DayLabels.dayHeader(
                date = LocalDate.of(year, month, day),
                today = today,
                locale = locale,
            ),
            style = DayLogTheme.typography.label,
            color = colors.ink,
        )
        entries.forEach { entry ->
            // The grid's entries read as a glance, like the timeline's do: the writing without
            // its markdown clothing, and nothing glowing.
            DLText(
                text = plainPreview(entry.content, maxLines = null),
                style = DayLogTheme.typography.entryBody,
                color = colors.ink,
                annotated = false,
                modifier = Modifier
                    .fillMaxWidth()
                    .pressable(onClick = { onOpenEntry(entry.uid) }),
            )
        }
    }
}
