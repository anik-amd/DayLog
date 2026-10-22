package app.daylog.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
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
    /** Filled. The one primary action on a screen. */
    Filled,

    /** An outlined button: a hairline and the label. */
    Outlined,

    /** A text button with no container. */
    Text,
}

/**
 * A button.
 *
 * These are the Material buttons, because the Material button *is* the Android button: it carries
 * the press animation, the shape and the tonal behaviour the platform expects. The app's own
 * shape scale decides how round they are.
 */
@Composable
fun DLButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    style: DLButtonStyle = DLButtonStyle.Filled,
    enabled: Boolean = true,
    leadingIcon: ImageVector? = null,
) {
    val shape = DayLogShapes.chip

    when (style) {
        DLButtonStyle.Filled -> Button(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            shape = shape,
            contentPadding = ButtonDefaults.ContentPadding,
            // The filled button is the ink, not the accent. The accent marks data in this app,
            // and a coloured button would spend it on chrome.
            colors = ButtonDefaults.buttonColors(
                containerColor = DayLogTheme.colors.ink,
                contentColor = DayLogTheme.colors.background,
                disabledContainerColor = DayLogTheme.colors.surfaceContainerHigh,
                disabledContentColor = DayLogTheme.colors.inkFaint,
            ),
        ) {
            ButtonContent(text, leadingIcon)
        }

        DLButtonStyle.Outlined -> OutlinedButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            shape = shape,
            border = BorderStroke(1.dp, DayLogTheme.colorScheme.outline),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = DayLogTheme.colors.ink,
            ),
        ) {
            ButtonContent(text, leadingIcon)
        }

        DLButtonStyle.Text -> TextButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            shape = shape,
            colors = ButtonDefaults.textButtonColors(
                contentColor = DayLogTheme.colors.ink,
            ),
        ) {
            ButtonContent(text, leadingIcon)
        }
    }
}

@Composable
private fun ButtonContent(text: String, leadingIcon: ImageVector?) {
    if (leadingIcon != null) {
        DLIcon(
            imageVector = leadingIcon,
            contentDescription = null,
            modifier = Modifier.size(18.dp),
        )
        Spacer(Modifier.width(8.dp))
    }
    DLLabel(text = text)
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
    tint: Color = DayLogTheme.colorScheme.onSurfaceVariant,
    enabled: Boolean = true,
) {
    IconButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
    ) {
        DLIcon(
            imageVector = imageVector,
            contentDescription = contentDescription,
            tint = if (enabled) tint else DayLogTheme.colorScheme.outline,
            modifier = Modifier.size(20.dp),
        )
    }
}

/**
 * A horizontal rule.
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

/**
 * A tappable row that shows no ripple.
 *
 * Used where the surface itself is the affordance — a list row that opens something — so the
 * whole row can be pressed without a ripple being drawn over the text.
 */
@Composable
fun Modifier.pressable(
    enabled: Boolean = true,
    onClick: () -> Unit,
): Modifier = clickable(
    enabled = enabled,
    interactionSource = remember { MutableInteractionSource() },
    indication = null,
    onClick = onClick,
)

/**
 * Arranged with the app's own spacing.
 */
internal val ButtonRowSpacing = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally)
