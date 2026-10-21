package app.daylog.core.designsystem.component

import androidx.compose.foundation.Image
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * An icon.
 *
 * Drawn with `Image` and a tint rather than with Material's `Icon`, because the app has no
 * Material dependency. The tint replaces every colour in the vector, so one icon serves every
 * state it is used in.
 *
 * [contentDescription] is null for decorative icons, which is the right answer whenever the icon
 * sits next to a label that already says what it means.
 */
@Composable
fun DLIcon(
    imageVector: ImageVector,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    tint: Color = DayLogTheme.colors.ink,
) {
    Image(
        painter = rememberVectorPainter(imageVector),
        contentDescription = contentDescription,
        modifier = modifier,
        colorFilter = ColorFilter.tint(tint),
    )
}
