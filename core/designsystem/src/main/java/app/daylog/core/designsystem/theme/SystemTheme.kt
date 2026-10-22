package app.daylog.core.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/**
 * Whether the system is currently in dark mode.
 */
@Composable
internal fun isSystemInDarkMode(): Boolean = isSystemInDarkTheme()

/**
 * Converts a colour to HSL, as hue, saturation and lightness in the range 0..1.
 *
 * Written out rather than taken from `android.graphics.Color.colorToHSL` so the design system
 * stays free of platform calls and the conversion can be unit tested on the JVM.
 */
internal fun hslOf(color: Color): FloatArray {
    val r = color.red
    val g = color.green
    val b = color.blue

    val max = maxOf(r, g, b)
    val min = minOf(r, g, b)
    val lightness = (max + min) / 2f

    // Achromatic: hue and saturation are undefined, so they are reported as zero.
    if (max == min) return floatArrayOf(0f, 0f, lightness)

    val delta = max - min
    val saturation = if (lightness > 0.5f) {
        delta / (2f - max - min)
    } else {
        delta / (max + min)
    }

    val hue = when (max) {
        r -> ((g - b) / delta + if (g < b) 6f else 0f) / 6f
        g -> ((b - r) / delta + 2f) / 6f
        else -> ((r - g) / delta + 4f) / 6f
    }

    return floatArrayOf(hue, saturation, lightness)
}
