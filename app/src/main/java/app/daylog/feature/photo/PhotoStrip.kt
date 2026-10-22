package app.daylog.feature.photo

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.component.DLIcon
import kotlinx.coroutines.launch
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.Media

/**
 * The photos of an entry.
 *
 * The picker is the system one, so no permission prompt is shown. The photos are copied into the
 * app's own storage, so the entry keeps them even if the original is deleted from the gallery.
 *
 * The thumbnails are small and square, because a list has to stay a list.
 */
@Composable
fun PhotoStrip(
    entryUid: String,
    mediaRepository: app.daylog.core.data.repository.MediaRepository,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val media = remember { mutableStateOf<List<app.daylog.core.model.Media>>(emptyList()) }

    LaunchedEffect(entryUid) {
        mediaRepository.observeMedia(entryUid).collect { media.value = it }
    }

    val picker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickMultipleVisualMedia(maxItems = 10),
    ) { uris ->
        scope.launch {
            uris.forEach { uri ->
                runCatching { mediaRepository.addMedia(entryUid, uri) }
            }
        }
    }

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        DLIconButton(
            imageVector = DayLogIcons.Image,
            contentDescription = "Add a photo",
            onClick = {
                picker.launch(
                    androidx.activity.result.PickVisualMediaRequest(
                        ActivityResultContracts.PickVisualMedia.ImageOnly,
                    ),
                )
            },
            tint = DayLogTheme.colors.inkMuted,
        )

        media.value.forEach { item ->
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(8.dp))
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
                    onClick = { scope.launch { mediaRepository.removeMedia(item.uid) } },
                    tint = androidx.compose.ui.graphics.Color.White,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .size(20.dp)
                        .background(androidx.compose.ui.graphics.Color.Black.copy(alpha = 0.5f), RoundedCornerShape(4.dp)),
                )
            }
        }
    }
}
