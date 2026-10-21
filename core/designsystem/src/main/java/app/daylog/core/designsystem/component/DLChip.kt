package app.daylog.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * A chip: a tag, a place, a weather reading, a filter.
 *
 * The chip is where the accent is allowed to appear, because a chip is data. A selected chip takes
 * the soft accent fill; an unselected one is a hairline on the ground. There is no accent on the
 * label of an unselected chip, so a screen full of chips stays quiet until one is chosen.
 */
@Composable
fun DLChip(
    text: String,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    enabled: Boolean = true,
    leadingIcon: ImageVector? = null,
    onClick: (() -> Unit)? = null,
) {
    val colors = DayLogTheme.colors
    val press = rememberPressState(onClick = { onClick?.invoke() }, enabled = enabled)

    val background = when {
        selected -> colors.accentSoft
        press.isPressed -> colors.ink.copy(alpha = 0.06f)
        else -> Color.Transparent
    }
    val foreground = when {
        !enabled -> colors.inkFaint
        selected -> colors.ink
        else -> colors.inkMuted
    }
    val border = if (selected) Color.Transparent else colors.rule

    Row(
        modifier = modifier
            .background(background, DayLogShapes.chip)
            .border(1.dp, border, DayLogShapes.chip)
            .then(
                if (onClick != null) {
                    Modifier.clickable(
                        enabled = enabled,
                        interactionSource = press.interactionSource,
                        indication = null,
                        onClick = { onClick() },
                    )
                } else {
                    Modifier
                },
            )
            .padding(horizontal = 10.dp, vertical = 5.dp),
        horizontalArrangement = Arrangement.spacedBy(5.dp, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (leadingIcon != null) {
            DLIcon(
                imageVector = leadingIcon,
                contentDescription = null,
                tint = if (selected) colors.accent else foreground,
                modifier = Modifier.size(13.dp),
            )
        }
        DLLabel(text = text, color = foreground)
    }
}

/**
 * A small filled dot.
 *
 * The one place a solid accent mark appears: it says something is pending, and nothing else.
 */
@Composable
fun DLPendingDot(
    modifier: Modifier = Modifier,
    color: Color = DayLogTheme.colors.accent,
) {
    Box(
        modifier = modifier
            .size(6.dp)
            .background(color, DayLogShapes.pill),
    )
}
