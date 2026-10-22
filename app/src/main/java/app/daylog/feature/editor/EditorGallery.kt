package app.daylog.feature.editor

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Media
import coil3.compose.AsyncImage

/**
 * The photos of the entry, as it is being written.
 *
 * Each thumbnail carries its removal, because a photo added before it was meant is cheaper to
 * take off than to live with. The arrangement is the same square row the entry reads as, so the
 * picture the editor paints is the picture the entry is.
 */
@Composable
internal fun EditorGallery(
    media: List<Media>,
    onRemove: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        media.forEach { item ->
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(DayLogShapes.chip)
                    .background(DayLogTheme.colors.surfaceContainerHigh),
            ) {
                AsyncImage(
                    model = item.thumbnailPath ?: item.path,
                    contentDescription = "Photo",
                    modifier = Modifier.size(56.dp),
                    contentScale = ContentScale.Crop,
                )
                DLIconButton(
                    imageVector = DayLogIcons.Trash,
                    contentDescription = "Remove photo",
                    onClick = { onRemove(item.uid) },
                    tint = Color.White,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .size(20.dp)
                        .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(4.dp)),
                )
            }
        }
    }
}
