package app.daylog.feature.entry

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.daylog.core.common.DayLabels
import app.daylog.core.common.toLocalDateTime
import app.daylog.core.designsystem.component.DLChip
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLMeta
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Entry
import app.daylog.core.model.Tag
import java.time.ZoneId
import java.util.Locale

/**
 * One entry, opened.
 *
 * The reading view of a single entry: the date it was written, the entry itself, and whatever was
 * attached to it. It is the same margin the timeline uses, so an entry looks the same wherever it
 * is read.
 */
@Composable
fun EntryDetailScreen(
    entry: Entry,
    tags: List<Tag>,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
    zone: ZoneId = ZoneId.systemDefault(),
    locale: Locale = Locale.getDefault(),
) {
    val colors = DayLogTheme.colors

    Surface(
        modifier = modifier.fillMaxSize(),
        color = colors.background,
    ) {
        Column {
            DLTopBar(
                title = "",
                leadingIcon = DayLogIcons.Back,
                onLeadingClick = onBack,
                trailingIcon = DayLogIcons.Trash,
                onTrailingClick = onDelete,
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 20.dp, end = 20.dp, top = 8.dp),
                verticalAlignment = Alignment.Top,
            ) {
                // The date in the margin, as on the timeline.
                Column(
                    modifier = Modifier.width(64.dp),
                    verticalArrangement = Arrangement.spacedBy(2.dp),
                ) {
                    DLMeta(
                        text = DayLabels.dayHeader(
                            date = entry.createdAt.toLocalDateTime(zone).toLocalDate(),
                            today = java.time.LocalDate.now(zone),
                            locale = locale,
                        ),
                        color = colors.ink,
                    )
                    DLMeta(
                        text = DayLabels.time(entry.createdAt.toLocalDateTime(zone), locale),
                    )
                }

                Spacer(Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    DLText(
                        text = entry.content,
                        style = DayLogTheme.typography.entryBody,
                        color = colors.ink,
                        annotated = true,
                    )

                    val place = entry.placeName
                    val weather = entry.weatherSummary
                    if (tags.isNotEmpty() || place != null || weather != null) {
                        Spacer(Modifier.height(16.dp))
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            tags.forEach { tag -> DLChip(text = tag.name) }
                            if (place != null) {
                                DLChip(text = place, leadingIcon = DayLogIcons.Pin)
                            }
                            if (weather != null) {
                                DLChip(text = weather, leadingIcon = DayLogIcons.Weather)
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.weight(1f))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
            ) {
                app.daylog.core.designsystem.component.DLButton(
                    text = "Edit",
                    onClick = onEdit,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}
