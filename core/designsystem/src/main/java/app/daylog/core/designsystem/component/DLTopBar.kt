package app.daylog.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * The bar at the top of a screen.
 *
 * The Material top bar, because that is the bar Android expects: it carries the scroll behaviour,
 * the insets and the title treatment the platform defines. The title is the app's name, because a
 * screen whose product cannot be named reads as a template.
 */
@OptIn(ExperimentalMaterial3Api::class)
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
    TopAppBar(
        modifier = modifier,
        title = {
            Column(verticalArrangement = Arrangement.spacedBy(1.dp)) {
                Text(
                    text = title,
                    style = DayLogTheme.typography.chromeTitle,
                    maxLines = 1,
                )
                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        style = DayLogTheme.typography.meta,
                        color = DayLogTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                    )
                }
            }
        },
        navigationIcon = {
            if (leadingIcon != null && onLeadingClick != null) {
                IconButton(onClick = onLeadingClick) {
                    Icon(
                        imageVector = leadingIcon,
                        contentDescription = "Back",
                        tint = DayLogTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        },
        actions = {
            if (trailingContent != null) {
                trailingContent()
            } else if (trailingIcon != null && onTrailingClick != null) {
                IconButton(onClick = onTrailingClick) {
                    Icon(
                        imageVector = trailingIcon,
                        contentDescription = title,
                        tint = DayLogTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = DayLogTheme.colorScheme.surface,
            titleContentColor = DayLogTheme.colorScheme.onSurface,
        ),
    )
}

/**
 * A hairline.
 */
@Composable
fun DLDivider(
    modifier: Modifier = Modifier,
    color: androidx.compose.ui.graphics.Color = DayLogTheme.colors.rule,
) {
    HorizontalDivider(
        modifier = modifier,
        thickness = 1.dp,
        color = color,
    )
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
            Text(
                text = title,
                style = DayLogTheme.typography.chromeTitle,
                color = DayLogTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                text = body,
                style = DayLogTheme.typography.meta,
                color = DayLogTheme.colorScheme.outline,
            )
        }
    }
}
