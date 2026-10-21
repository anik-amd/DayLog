package app.daylog.core.designsystem.component

import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextOverflow
import app.daylog.core.designsystem.markdown.MarkdownParser
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
    /**
     * Whether the text is markdown and should be rendered as such.
     *
     * The entry text is markdown, so it is parsed here rather than by each screen that shows it.
     * Screens that show plain text leave it off.
     */
    annotated: Boolean = false,
) {
    val textStyle = style.copy(color = color)

    if (annotated) {
        val typography = DayLogTheme.typography
        val palette = DayLogTheme.colors
        val parsed = remember(text, typography, palette) {
            MarkdownParser.parse(text, typography, palette)
        }
        BasicText(
            text = parsed,
            modifier = modifier,
            style = textStyle,
            maxLines = maxLines,
            overflow = overflow,
        )
        return
    }

    BasicText(
        text = text,
        modifier = modifier,
        style = textStyle,
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
