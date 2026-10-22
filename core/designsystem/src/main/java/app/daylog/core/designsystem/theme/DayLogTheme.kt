package app.daylog.core.designsystem.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalContext
import app.daylog.core.designsystem.color.DayLogColors
import app.daylog.core.designsystem.color.NightScheme
import app.daylog.core.designsystem.color.PaperScheme
import app.daylog.core.designsystem.color.PureBlackScheme
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

    /**
     * The Material scheme behind the app's own colours.
     *
     * The Material components need it, and it is the same scheme the app's colours were read
     * from, so the two can never disagree.
     */
    val colorScheme: ColorScheme
        @Composable @ReadOnlyComposable get() = LocalMaterialScheme.current
}

internal val LocalMaterialScheme = staticCompositionLocalOf<ColorScheme> {
    error("DayLogTheme is not provided. Wrap your content in DayLogTheme.")
}

/**
 * Provides the design system to [content].
 *
 * @param themeMode which scheme to use.
 * @param accentSource where the colours come from.
 * @param pureBlack whether the dark scheme is on true black.
 */
@Composable
fun DayLogTheme(
    themeMode: DayLogThemeMode = DayLogThemeMode.System,
    accentSource: DayLogAccentSource = DayLogAccentSource.Teal,
    pureBlack: Boolean = false,
    content: @Composable () -> Unit,
) {
    val isDark = when (themeMode) {
        DayLogThemeMode.System -> isSystemInDarkTheme()
        DayLogThemeMode.Light -> false
        DayLogThemeMode.Dark -> true
    }

    val colorScheme = remember(themeMode, accentSource, pureBlack, isDark) {
        resolveColorScheme(isDark, accentSource, pureBlack)
    }

    val typography = remember {
        DayLogTypography.standard(family = DayLogFonts.Inter)
    }

    CompositionLocalProvider(
        LocalMaterialScheme provides colorScheme,
        LocalDayLogTheme provides DayLogThemeValues(
            colors = DayLogColors.from(colorScheme),
            typography = typography,
            spacing = DayLogSpacing(),
            isDark = isDark,
        ),
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = typography.toMaterialTypography(),
            content = content,
        )
    }
}

/**
 * Chooses the scheme.
 *
 * On Android 12 and later, the wallpaper's colours can be used. That is the modern native
 * behaviour and it is what most of Android looks like now, so it is offered rather than assumed:
 * a diary is a reading app and the app's own palette is part of its character.
 */
@Composable
private fun resolveColorScheme(
    isDark: Boolean,
    accentSource: DayLogAccentSource,
    pureBlack: Boolean,
): ColorScheme {
    if (accentSource == DayLogAccentSource.Wallpaper && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val context = LocalContext.current
        return if (isDark) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
    }

    return when {
        isDark && pureBlack -> PureBlackScheme
        isDark -> NightScheme
        else -> PaperScheme
    }
}
