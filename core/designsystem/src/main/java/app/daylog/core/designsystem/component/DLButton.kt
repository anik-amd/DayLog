package app.daylog.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * How prominent a button is.
 */
enum class DLButtonStyle {
    /**
     * Filled with ink, in the paper colour's inverse.
     *
     * The primary action is near-black rather than the accent: the accent marks data in this app,
     * and a coloured button would spend it on chrome. One of these per screen.
     */
    Filled,

    /** An outlined button: a hairline and the ink label. */
    Outlined,

    /** A text button with no container. */
    Text,
}

/**
 * A button.
 *
 * Flat by design. There is no shadow, no gradient and no scale-on-press: the fill changes and
 * that is all.
 */
@Composable
fun DLButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    style: DLButtonStyle = DLButtonStyle.Filled,
    enabled: Boolean = true,
    leadingIcon: ImageVector? = null,
    contentColor: Color? = null,
) {
    val colors = DayLogTheme.colors
    val press = rememberPressState(onClick = onClick, enabled = enabled)

    val background = when {
        !enabled -> Color.Transparent
        style == DLButtonStyle.Filled ->
            if (press.isPressed) colors.ink.copy(alpha = 0.82f) else colors.ink
        press.isPressed -> colors.ink.copy(alpha = 0.06f)
        else -> Color.Transparent
    }
    val foreground = when {
        !enabled -> colors.inkFaint
        style == DLButtonStyle.Filled -> colors.background
        else -> colors.ink
    }

    Row(
        modifier = modifier
            .defaultMinSize(minHeight = 40.dp)
            .background(background, DayLogShapes.chip)
            .then(
                if (style == DLButtonStyle.Outlined) {
                    Modifier.border(BorderStroke(1.dp, colors.rule), DayLogShapes.chip)
                } else {
                    Modifier
                },
            )
            .clickable(
                enabled = enabled,
                interactionSource = press.interactionSource,
                indication = null,
                onClick = onClick,
            )
            .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (leadingIcon != null) {
            DLIcon(
                imageVector = leadingIcon,
                contentDescription = null,
                tint = contentColor ?: foreground,
                modifier = Modifier.size(16.dp),
            )
        }
        DLLabel(text = text, color = contentColor ?: foreground)
    }
}

/**
 * A button with no label, for the back arrow and the like.
 */
@Composable
fun DLIconButton(
    imageVector: ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    val tint: Color = DayLogTheme.colors.ink,
    enabled: Boolean = true,
) {
    val press = rememberPressState(onClick = onClick, enabled = enabled)

    Box(
        modifier = modifier
            .size(40.dp)
            .background(
                if (press.isPressed) DayLogTheme.colors.ink.copy(alpha = 0.06f) else Color.Transparent,
                DayLogShapes.pill,
            )
            .clickable(
                enabled = enabled,
                interactionSource = press.interactionSource,
                indication = null,
                onClick = onClick,
            ),
        contentAlignment = Alignment.Center,
    ) {
        DLIcon(
            imageVector = imageVector,
            contentDescription = contentDescription,
            tint = if (enabled) tint else DayLogTheme.colors.inkFaint,
            modifier = Modifier.size(20.dp),
        )
    }
}

/**
 * A horizontal rule.
 *
 * The only separator the app uses. Cards are not lifted off the page with a shadow; they are
 * separated by a line or by one step in tone.
 */
@Composable
fun DLRule(
    modifier: Modifier = Modifier,
    color: Color = DayLogTheme.colors.rule,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(1.dp)
            .background(color),
    )
}

/**
 * A vertical rule, for the margin in the timeline.
 */
@Composable
fun DLVerticalRule(
    modifier: Modifier = Modifier,
    color: Color = DayLogTheme.colors.rule,
) {
    Box(
        modifier = modifier
            .fillMaxHeight()
            .width(1.dp)
            .background(color),
    )
}

/**
 * Padding values that follow the app's spacing scale.
 */
object DLPadding {
    val none = PaddingValues(0.dp)
    val tight = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
    val chip = PaddingValues(horizontal = 10.dp, vertical = 5.dp)
    val field = PaddingValues(horizontal = 12.dp, vertical = 10.dp)
}
