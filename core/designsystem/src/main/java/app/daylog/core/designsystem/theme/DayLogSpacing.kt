package app.daylog.core.designsystem.theme

import androidx.compose.runtime.Immutable

/**
 * Spacing scale.
 *
 * A 4dp base with a few half-steps. Named rather than numeric so the intent survives review.
 */
@Immutable
data class DayLogSpacing(
    val hairline: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(1f),
    val xxs: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(2f),
    val xs: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(4f),
    val sm: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(8f),
    val md: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(12f),
    val lg: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(16f),
    val xl: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(20f),
    val xxl: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(24f),
    val xxxl: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(32f),
    val huge: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(40f),
    val gutter: androidx.compose.ui.unit.Dp = androidx.compose.ui.unit.Dp(72f),
)
