package app.daylog.core.designsystem.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import app.daylog.core.designsystem.color.DayLogColors
import app.daylog.core.designsystem.color.NightColors
import app.daylog.core.designsystem.color.PaperColors
import app.daylog.core.model.DayLogAccentSource
import app.daylog.core.model.DayLogThemeMode

/**
 * The values a theme provides.
 *
 * This is the payload the composition local carries. It is separate from [DayLogTheme] itself
 * so that the ambient accessors and the composable can share one name without colliding.
 */
@Immutable
data class DayLogThemeValues(
    val colors: DayLogColors,
    val typography: DayLogTypography,
    val spacing: DayLogSpacing,
    val isDark: Boolean,
)

internal val LocalDayLogTheme = staticCompositionLocalOf<DayLogThemeValues> {
    error("DayLogTheme is not provided. Wrap your content in DayLogTheme.")
}

/**
 * The complete visual environment for a screen.
 *
 * Read it like `MaterialTheme`:
 *
 * ```
 * Text("Today", color = DayLogTheme.colors.ink)
 * ```
 */
object DayLogTheme {

    val colors: DayLogColors
        @Composable @ReadOnlyComposable get() = LocalDayLogTheme.current.colors

    val typography: DayLogTypography
        @Composable @ReadOnlyComposable get() = LocalDayLogTheme.current.typography

    val spacing: DayLogSpacing
        @Composable @ReadOnlyComposable get() = LocalDayLogTheme.current.spacing

    val isDark: Boolean
        @Composable @ReadOnlyComposable get() = LocalDayLogTheme.current.isDark
}

/**
 * Provides the Ink & Margin design system to [content].
 *
 * @param themeMode which scheme to use.
 * @param accentSource where the accent colour comes from.
 */
@Composable
fun DayLogTheme(
    themeMode: DayLogThemeMode = DayLogThemeMode.System,
    accentSource: DayLogAccentSource = DayLogAccentSource.Teal,
    content: @Composable () -> Unit,
) {
    val isDark = when (themeMode) {
        DayLogThemeMode.System -> isSystemInDarkMode()
        DayLogThemeMode.Light -> false
        DayLogThemeMode.Dark -> true
    }

    val baseColors = if (isDark) NightColors else PaperColors
    val accent = when (accentSource) {
        DayLogAccentSource.Adaptive -> adaptiveAccent(isDark)
        DayLogAccentSource.Teal -> baseColors.accent
    }

    val colors = if (accent == baseColors.accent) {
        baseColors
    } else {
        baseColors.copy(
            accent = accent,
            accentSoft = accent.copy(alpha = if (isDark) 0.22f else 0.14f),
            onAccent = if (isDark) Color(0xFF06201D) else Color.White,
        )
    }

    val typography = remember {
        DayLogTypography.standard(
            bodyFamily = DayLogFonts.Spectral,
            chromeFamily = DayLogFonts.InstrumentSans,
        )
    }

    CompositionLocalProvider(
        LocalDayLogTheme provides DayLogThemeValues(
            colors = colors,
            typography = typography,
            spacing = DayLogSpacing(),
            isDark = isDark,
        ),
        content = content,
    )
}
