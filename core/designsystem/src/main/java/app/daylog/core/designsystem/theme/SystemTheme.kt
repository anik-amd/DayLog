package app.daylog.core.designsystem.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import app.daylog.core.designsystem.color.NightColors
import app.daylog.core.designsystem.color.PaperColors

/**
 * Whether the system is currently in dark mode.
 */
@Composable
internal fun isSystemInDarkMode(): Boolean = isSystemInDarkTheme()

/**
 * The wallpaper's accent colour, on Android 12+.
 *
 * Only the accent ramp is derived from this. Paper, ink and rules never change, which keeps the
 * app's identity intact when the user turns on adaptive colour.
 *
 * The saturation is pulled down and the lightness pinned, because a wallpaper's accent is chosen
 * to look good as a large fill — not as the one small mark that carries meaning in this app.
 */
@Composable
internal fun adaptiveAccent(isDark: Boolean): Color {
    val fallback = if (isDark) NightColors.accent else PaperColors.accent
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return fallback

    val context = LocalContext.current
    val raw = runCatching {
        context.getColor(android.R.color.system_accent1_600)
    }.getOrNull() ?: return fallback

    val hsl = hslOf(Color(raw))
    val saturation = (hsl[1] * 0.55f).coerceIn(0.18f, 0.55f)
    val lightness = if (isDark) 0.62f else 0.28f
    return Color.hsl(hsl[0], saturation, lightness)
}

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
