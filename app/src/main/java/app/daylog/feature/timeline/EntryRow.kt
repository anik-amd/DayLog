package app.daylog.feature.timeline

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import app.daylog.core.common.DayLabels
import app.daylog.core.common.plainPreview
import app.daylog.core.common.toLocalDateTime
import app.daylog.core.designsystem.component.DLChip
import app.daylog.core.designsystem.component.DLMeta
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.pressable
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Entry
import app.daylog.core.model.Media
import coil3.compose.AsyncImage
import java.time.ZoneId
import java.util.Locale

/**
 * One entry in the timeline.
 *
 * The time sits above the text in the muted face, and the text is set in the platform face at a
 * reading size. The entries under one day's heading share its air; the spacing scale puts the
 * room between them, not an eyeballed dp. Tags are already written in the entry; a place and the
 * weather are data about it, so they are chips underneath.
 */
@Composable
fun EntryRow(
    entry: Entry,
    modifier: Modifier = Modifier,
    media: List<Media> = emptyList(),
    zone: ZoneId = ZoneId.systemDefault(),
    locale: Locale = Locale.getDefault(),
    onClick: (() -> Unit)? = null,
) {
    val colors = DayLogTheme.colors
    val spacing = DayLogTheme.spacing

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(start = spacing.xl, end = spacing.xl, bottom = spacing.lg)
            .then(
                if (onClick != null) {
                    Modifier.pressable(onClick = onClick)
                } else {
                    Modifier
                },
            ),
    ) {
        DLMeta(
            text = DayLabels.time(entry.createdAt.toLocalDateTime(zone), locale),
            color = colors.inkFaint,
        )

        Spacer(Modifier.height(spacing.xxs))

        DLText(
            text = plainPreview(entry.content),
            style = DayLogTheme.typography.entryBody,
            color = colors.ink,
            annotated = false,
        )

        // The photos, if the entry has any. A thumbnail strip, not a gallery: the entry is read
        // in a list and the full size belongs on the entry's own screen.
        if (media.isNotEmpty()) {
            Spacer(Modifier.height(spacing.md))
            Row(horizontalArrangement = Arrangement.spacedBy(spacing.sm)) {
                media.take(4).forEach { item ->
                    AsyncImage(
                        model = item.thumbnailPath ?: item.path,
                        contentDescription = "Photo",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(colors.surfaceContainerHigh),
                    )
                }
            }
        }

        // A place and the weather are not in the text, so they are shown as chips. A tag is:
        // it is already written in the entry as "#reading", and a chip that repeats it is noise.
        val placeName = entry.placeName
        val weatherSummary = entry.weatherSummary

        if (placeName != null || weatherSummary != null) {
            Spacer(Modifier.height(spacing.md))
            Row(
                horizontalArrangement = Arrangement.spacedBy(spacing.sm),
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
