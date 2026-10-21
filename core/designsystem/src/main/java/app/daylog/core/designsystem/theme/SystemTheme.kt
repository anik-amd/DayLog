package app.daylog.core.designsystem.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

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
 */
@Composable
internal fun adaptiveAccent(isDark: Boolean): Color {
    val fallback = if (isDark) NightColors.accent else PaperColors.accent
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return fallback

    val context = LocalContext.current
    val raw = runCatching {
        context.getColor(android.R.color.system_accent1_600)
    }.getOrNull() ?: return fallback

    val hsl = FloatArray(3)
    android.graphics.Color.colorToHSL(raw, hsl)
    // Pull the saturation down so a loud wallpaper colour still reads as an ink accent.
    val saturation = (hsl[1] * 0.55f).coerceIn(0.18f, 0.55f)
    val lightness = if (isDark) 0.62f else 0.28f
    return Color.hsl(hsl[0], saturation, lightness)
}
