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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.daylog.core.common.DayLabels
import app.daylog.core.common.toLocalDateTime
import app.daylog.core.designsystem.component.DLChip
import app.daylog.core.designsystem.component.DLConfirmDialog
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
 * The reading view of a single entry: a small line with the date and time, the entry itself, and
 * whatever was attached to it. The chrome stays out of the way; the writing is the screen.
 */
@Composable
fun EntryDetailScreen(
    entry: Entry,
    tags: List<Tag>,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier,
    mediaRepository: app.daylog.core.data.repository.MediaRepository? = null,
    zone: ZoneId = ZoneId.systemDefault(),
    locale: Locale = Locale.getDefault(),
) {
    val colors = DayLogTheme.colors
    var confirmingDelete by remember { mutableStateOf(false) }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = colors.background,
    ) {
        Column {
            DLTopBar(
                title = "",
                leadingIcon = DayLogIcons.Back,
                onLeadingClick = onBack,
                trailingContent = {
                    DLIconButton(
                        imageVector = DayLogIcons.Edit,
                        contentDescription = "Edit",
                        onClick = onEdit,
                        tint = colors.inkMuted,
                    )
                    DLIconButton(
                        imageVector = DayLogIcons.Trash,
                        contentDescription = "Delete",
                        onClick = { confirmingDelete = true },
                        tint = colors.inkMuted,
                    )
                },
            )

            // The date and time sit above the entry, small and quiet, so the writing is the screen.
            Row(
                modifier = Modifier.padding(start = 20.dp, end = 20.dp, top = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                DLMeta(
                    text = DayLabels.dayHeader(
                        date = entry.createdAt.toLocalDateTime(zone).toLocalDate(),
                        today = java.time.LocalDate.now(zone),
                        locale = locale,
                    ),
                    color = colors.inkMuted,
                )
                Spacer(Modifier.width(8.dp))
                DLMeta(
                    text = DayLabels.time(entry.createdAt.toLocalDateTime(zone), locale),
                    color = colors.inkMuted,
                )
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 20.dp, end = 20.dp, top = 6.dp),
            ) {
                DLText(
                    text = entry.content,
                    style = DayLogTheme.typography.entryBody,
                    color = colors.ink,
                    annotated = true,
                )

                val place = entry.placeName
                val weather = entry.weatherSummary
                if (mediaRepository != null) {
                    Spacer(Modifier.height(14.dp))
                    app.daylog.feature.photo.PhotoStrip(
                        entryUid = entry.uid,
                        mediaRepository = mediaRepository,
                    )
                }
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

            Spacer(Modifier.weight(1f))

            if (confirmingDelete) {
                DLConfirmDialog(
                    title = "Delete this entry?",
                    body = "It will be removed from your diary. This cannot be undone.",
                    confirmLabel = "Delete",
                    onConfirm = {
                        confirmingDelete = false
                        onDelete()
                    },
                    onDismiss = { confirmingDelete = false },
                )
            }
        }
    }
}
