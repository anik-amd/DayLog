package app.daylog.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * A chip: a tag, a place, a weather reading, a filter.
 *
 * These are the Material chips. A chip that carries data is an assist chip; a chip that can be
 * turned on and off is a filter chip, and the selected one takes the accent. The accent is
 * allowed here because a chip *is* data.
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
    val shape = DayLogShapes.chip

    if (onClick != null) {
        FilterChip(
            selected = selected,
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            shape = shape,
            label = { DLLabel(text = text, color = if (selected) DayLogTheme.colors.ink else DayLogTheme.colors.inkMuted) },
            leadingIcon = leadingIcon?.let {
                {
                    DLIcon(
                        imageVector = it,
                        contentDescription = null,
                        tint = if (selected) DayLogTheme.colors.accent else DayLogTheme.colors.inkMuted,
                        modifier = Modifier.size(16.dp),
                    )
                }
            },
            // A selected chip is data, so it is the one place the accent is allowed to appear.
            colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = DayLogTheme.colors.accentSoft,
                selectedLabelColor = DayLogTheme.colors.ink,
                selectedLeadingIconColor = DayLogTheme.colors.accent,
                containerColor = Color.Transparent,
                labelColor = DayLogTheme.colors.inkMuted,
                iconColor = DayLogTheme.colors.inkMuted,
            ),
        )
        return
    }

    AssistChip(
        onClick = {},
        modifier = modifier,
        enabled = enabled,
        shape = shape,
        label = { DLLabel(text = text) },
        leadingIcon = leadingIcon?.let {
            {
                DLIcon(
                    imageVector = it,
                    contentDescription = null,
                    tint = DayLogTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(16.dp),
                )
            }
        },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = DayLogTheme.colorScheme.surfaceContainerHigh,
            labelColor = DayLogTheme.colorScheme.onSurfaceVariant,
            leadingIconContentColor = DayLogTheme.colorScheme.onSurfaceVariant,
        ),
        border = null,
    )
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

/**
 * A row of chips.
 */
@Composable
fun DLChipRow(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        content()
    }
}
