package app.daylog.core.designsystem.color

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

/**
 * The tonal palettes.
 *
 * These are Material 3 schemes: every surface, container and state colour is a tone of the same
 * hue rather than a colour picked by eye. That is what makes the app feel like the rest of
 * Android — the tonal ramp gives the surfaces their depth without a shadow anywhere.
 *
 * The seed is a deep teal, which is the one hue the app has ever had. Nothing else in the app is
 * coloured, so the hue is the accent and the accent is data.
 */

/**
 * Paper — the light scheme.
 *
 * Tones are taken from a teal seed at hue 176: tone 40 is the primary, tone 90 its container,
 * tone 98 the ground.
 */
val PaperScheme: ColorScheme = lightColorScheme(
    primary = Color(0xFF006A60),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFF9FF2E3),
    onPrimaryContainer = Color(0xFF00201C),
    secondary = Color(0xFF4A635E),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFCCE8E1),
    onSecondaryContainer = Color(0xFF06201C),
    tertiary = Color(0xFF456179),
    onTertiary = Color(0xFFFFFFFF),
    tertiaryContainer = Color(0xFFCCE5FF),
    onTertiaryContainer = Color(0xFF001E31),
    error = Color(0xFFBA1A1A),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    background = Color(0xFFF4FBF8),
    onBackground = Color(0xFF161D1C),
    surface = Color(0xFFF4FBF8),
    onSurface = Color(0xFF161D1C),
    surfaceVariant = Color(0xFFDAE5E1),
    onSurfaceVariant = Color(0xFF3F4947),
    outline = Color(0xFF6F7977),
    outlineVariant = Color(0xFFBEC9C6),
    scrim = Color(0xFF000000),
    inverseSurface = Color(0xFF2B3230),
    inverseOnSurface = Color(0xFFECF2EF),
    inversePrimary = Color(0xFF82D5C7),
    surfaceTint = Color(0xFF006A60),
    surfaceBright = Color(0xFFF4FBF8),
    surfaceDim = Color(0xFFD4DBD9),
    surfaceContainerLowest = Color(0xFFFFFFFF),
    surfaceContainerLow = Color(0xFFEFF5F3),
    surfaceContainer = Color(0xFFE9EFED),
    surfaceContainerHigh = Color(0xFFE3E9E7),
    surfaceContainerHighest = Color(0xFFDDE4E1),
)

/**
 * Night — the dark scheme.
 *
 * The same hues, read on a near-black ground. The tones are the ones the light scheme uses for
 * its containers, so the two read as the same paper under different light.
 */
val NightScheme: ColorScheme = darkColorScheme(
    primary = Color(0xFF82D5C7),
    onPrimary = Color(0xFF003731),
    primaryContainer = Color(0xFF005048),
    onPrimaryContainer = Color(0xFF9FF2E3),
    secondary = Color(0xFFB1CCC6),
    onSecondary = Color(0xFF1C3530),
    secondaryContainer = Color(0xFF334B47),
    onSecondaryContainer = Color(0xFFCCE8E1),
    tertiary = Color(0xFFADCAE9),
    onTertiary = Color(0xFF153349),
    tertiaryContainer = Color(0xFF2D4960),
    onTertiaryContainer = Color(0xFFCCE5FF),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),
    background = Color(0xFF0E1513),
    onBackground = Color(0xFFDDE4E1),
    surface = Color(0xFF0E1513),
    onSurface = Color(0xFFDDE4E1),
    surfaceVariant = Color(0xFF3F4947),
    onSurfaceVariant = Color(0xFFBEC9C6),
    outline = Color(0xFF899390),
    outlineVariant = Color(0xFF3F4947),
    scrim = Color(0xFF000000),
    inverseSurface = Color(0xFFDDE4E1),
    inverseOnSurface = Color(0xFF2B3230),
    inversePrimary = Color(0xFF006A60),
    surfaceTint = Color(0xFF82D5C7),
    surfaceBright = Color(0xFF343B39),
    surfaceDim = Color(0xFF0E1513),
    surfaceContainerLowest = Color(0xFF090F0E),
    surfaceContainerLow = Color(0xFF161D1C),
    surfaceContainer = Color(0xFF1A2120),
    surfaceContainerHigh = Color(0xFF252B2A),
    surfaceContainerHighest = Color(0xFF303635),
)

/**
 * Night, on true black.
 *
 * A reading app at night is often used in a dark room, and the pixels behind the text are pixels
 * the phone does not have to light. The tonal ramp is kept for the containers so the depth is
 * still there; only the ground goes black.
 */
val PureBlackScheme: ColorScheme = NightScheme.copy(
    background = Color(0xFF000000),
    surface = Color(0xFF000000),
    surfaceContainerLowest = Color(0xFF000000),
    surfaceContainerLow = Color(0xFF0B0F0E),
)
