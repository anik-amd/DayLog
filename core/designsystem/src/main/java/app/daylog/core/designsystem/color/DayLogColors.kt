package app.daylog.core.designsystem.color

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

/**
 * The Ink & Margin colour scheme.
 *
 * Two schemes, one hue. Paper (light) and Night (dark) are near-monochrome: a cool off-white or
 * near-black ground, one ink colour for text, and a single deep teal accent.
 *
 * The accent is reserved. It marks *data* — today's date in the margin, the selected chip, a pending
 * change. It never paints chrome: never a primary button, never navigation, never a card.
 */
@Immutable
data class DayLogColors(
    val background: Color,
    val surface: Color,
    val surfaceRaised: Color,
    val ink: Color,
    val inkMuted: Color,
    val inkFaint: Color,
    val rule: Color,
    val accent: Color,
    val accentSoft: Color,
    val onAccent: Color,
    val danger: Color,
    val onDanger: Color,
)
