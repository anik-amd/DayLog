package app.daylog.core.designsystem.color

import androidx.compose.material3.ColorScheme
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

/**
 * The colours the app uses.
 *
 * The names are the app's own — ink, rule, accent — but every value comes from a Material 3
 * [ColorScheme]. That means the surfaces sit on a tonal ramp and the depth comes from the tone
 * rather than from a shadow, and that turning on the wallpaper's colours changes all of it at
 * once and correctly.
 */
@Immutable
data class DayLogColors(
    /** The ground of the screen. */
    val background: Color,
    /** The ground of a sheet or a card. */
    val surface: Color,
    /** One step above the surface. */
    val surfaceRaised: Color,
    /** The container the composer and the chips sit in. */
    val surfaceContainer: Color,
    /** A container a shade further along the ramp. */
    val surfaceContainerHigh: Color,
    /** The main text colour. */
    val ink: Color,
    /** Secondary text. */
    val inkMuted: Color,
    /** Faint text: captions and metadata. */
    val inkFaint: Color,
    /** A hairline. */
    val rule: Color,
    /** The one hue. It marks data, never chrome. */
    val accent: Color,
    /** The accent, softened for a container. */
    val accentSoft: Color,
    /** Text on the accent. */
    val onAccent: Color,
    /** A destructive action. */
    val danger: Color,
    /** Text on the destructive colour. */
    val onDanger: Color,
) {
    companion object {
        /**
         * Reads the app's colours out of a Material scheme.
         */
        fun from(scheme: ColorScheme): DayLogColors = DayLogColors(
            background = scheme.background,
            surface = scheme.surface,
            surfaceRaised = scheme.surfaceContainerHigh,
            surfaceContainer = scheme.surfaceContainer,
            surfaceContainerHigh = scheme.surfaceContainerHigh,
            ink = scheme.onSurface,
            inkMuted = scheme.onSurfaceVariant,
            inkFaint = scheme.outline,
            rule = scheme.outlineVariant,
            accent = scheme.primary,
            accentSoft = scheme.primaryContainer,
            onAccent = scheme.onPrimary,
            danger = scheme.error,
            onDanger = scheme.onError,
        )
    }
}
