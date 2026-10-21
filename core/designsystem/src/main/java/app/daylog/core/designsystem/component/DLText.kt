package app.daylog.core.designsystem.component

import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextOverflow
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * The app's text.
 *
 * Every string in the app goes through one of these, so the type scale is enforced rather than
 * hoped for. The role decides the style; the size is never written by hand at the call site.
 */
@Composable
fun DLText(
    text: String,
    modifier: Modifier = Modifier,
    style: TextStyle = DayLogTheme.typography.entryBody,
    color: Color = DayLogTheme.colors.ink,
    maxLines: Int = Int.MAX_VALUE,
    overflow: TextOverflow = TextOverflow.Ellipsis,
) {
    BasicText(
        text = text,
        modifier = modifier,
        style = style.copy(color = color),
        maxLines = maxLines,
        overflow = overflow,
    )
}

/**
 * A secondary label: dates, counts, captions.
 *
 * Muted by default. It is the smallest text the app uses and it never carries meaning on its own.
 */
@Composable
fun DLMeta(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = DayLogTheme.colors.inkMuted,
    maxLines: Int = Int.MAX_VALUE,
) {
    DLText(
        text = text,
        modifier = modifier,
        style = DayLogTheme.typography.meta,
        color = color,
        maxLines = maxLines,
    )
}

/**
 * An interface label: a button, a chip, a field label.
 */
@Composable
fun DLLabel(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = DayLogTheme.colors.ink,
    maxLines: Int = Int.MAX_VALUE,
) {
    DLText(
        text = text,
        modifier = modifier,
        style = DayLogTheme.typography.label,
        color = color,
        maxLines = maxLines,
    )
}
