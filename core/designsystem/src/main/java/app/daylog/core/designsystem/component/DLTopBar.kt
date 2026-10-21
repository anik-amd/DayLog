package app.daylog.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * The bar at the top of a screen.
 *
 * A quiet bar: the title in the chrome face, an action on the right, and a hairline under it.
 * There is no large title and no elevation — the title belongs to the screen it heads, so it is
 * the same size on every screen.
 */
@Composable
fun DLTopBar(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    leadingIcon: ImageVector? = null,
    onLeadingClick: (() -> Unit)? = null,
    trailingIcon: ImageVector? = null,
    onTrailingClick: (() -> Unit)? = null,
    trailingContent: (@Composable () -> Unit)? = null,
) {
    val colors = DayLogTheme.colors

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(colors.background),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 4.dp, end = 8.dp, top = 4.dp, bottom = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            if (leadingIcon != null && onLeadingClick != null) {
                DLIconButton(
                    imageVector = leadingIcon,
                    contentDescription = "Back",
                    onClick = onLeadingClick,
                )
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(start = if (leadingIcon != null) 4.dp else 12.dp),
                verticalArrangement = Arrangement.spacedBy(1.dp),
            ) {
                DLText(
                    text = title,
                    style = DayLogTheme.typography.chromeTitle,
                    color = colors.ink,
                    maxLines = 1,
                )
                if (subtitle != null) {
                    DLMeta(text = subtitle, maxLines = 1)
                }
            }

            if (trailingContent != null) {
                trailingContent()
            } else if (trailingIcon != null && onTrailingClick != null) {
                DLIconButton(
                    imageVector = trailingIcon,
                    contentDescription = title,
                    onClick = onTrailingClick,
                )
            }
        }

        DLRule()
    }
}

/**
 * An empty state.
 *
 * The words of the trade, not a generic noun: "Nothing written yet" says what happened, where
 * "No items" says nothing at all.
 */
@Composable
fun DLEmptyState(
    title: String,
    body: String,
    modifier: Modifier = Modifier,
) {
    val colors = DayLogTheme.colors

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 32.dp, vertical = 48.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            DLText(
                text = title,
                style = DayLogTheme.typography.chromeTitle,
                color = colors.inkMuted,
            )
            DLMeta(
                text = body,
                color = colors.inkFaint,
            )
        }
    }
}
