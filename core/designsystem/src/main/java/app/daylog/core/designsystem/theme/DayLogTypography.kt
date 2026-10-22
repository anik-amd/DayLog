package app.daylog.core.designsystem.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * The type scale.
 *
 * One family, Inter. The reading is carried by size and line height rather than by a second
 * typeface: a diary is a wall of prose, and a single well-set sans is quieter than two faces
 * fighting each other.
 *
 * Roles are named by what they are for, so a screen cannot quietly use `entryBody` for a button
 * label. Sentence case everywhere — no tracked capitals.
 */
@Immutable
data class DayLogTypography(
    val family: FontFamily,
    /** Long-form entry prose. */
    val entryBody: TextStyle,
    /** A single entry's title, and a first-level heading. */
    val entryTitle: TextStyle,
    /** A second-level heading inside an entry. */
    val entrySubheading: TextStyle,
    /** Screen-level heading. */
    val chromeTitle: TextStyle,
    /** Interface label: buttons, chips, field labels. */
    val label: TextStyle,
    /** Secondary metadata: dates, counts, captions. */
    val meta: TextStyle,
) {
    companion object {
        fun standard(family: FontFamily): DayLogTypography = DayLogTypography(
            family = family,
            entryBody = TextStyle(
                fontFamily = family,
                fontWeight = FontWeight.Normal,
                fontSize = 16.sp,
                lineHeight = 26.sp,
                letterSpacing = 0.sp,
            ),
            entryTitle = TextStyle(
                fontFamily = family,
                fontWeight = FontWeight.SemiBold,
                fontSize = 20.sp,
                lineHeight = 27.sp,
                letterSpacing = (-0.4).sp,
            ),
            entrySubheading = TextStyle(
                fontFamily = family,
                fontWeight = FontWeight.SemiBold,
                fontSize = 16.sp,
                lineHeight = 23.sp,
                letterSpacing = (-0.2).sp,
            ),
            chromeTitle = TextStyle(
                fontFamily = family,
                fontWeight = FontWeight.SemiBold,
                fontSize = 20.sp,
                lineHeight = 26.sp,
                letterSpacing = (-0.4).sp,
            ),
            label = TextStyle(
                fontFamily = family,
                fontWeight = FontWeight.Medium,
                fontSize = 13.sp,
                lineHeight = 18.sp,
                letterSpacing = 0.1.sp,
            ),
            meta = TextStyle(
                fontFamily = family,
                fontWeight = FontWeight.Normal,
                fontSize = 12.sp,
                lineHeight = 16.sp,
                letterSpacing = 0.1.sp,
            ),
        )
    }
}

/**
 * The Material type scale, so the Material components and the app's own text agree.
 *
 * The Material roles are filled from ours rather than the other way round: the app's roles are
 * named by what they are for, and the Material ones are given whatever matches.
 */
fun DayLogTypography.toMaterialTypography(): androidx.compose.material3.Typography =
    androidx.compose.material3.Typography(
        titleLarge = chromeTitle,
        titleMedium = entryTitle,
        titleSmall = entrySubheading,
        bodyLarge = entryBody,
        bodyMedium = entryBody,
        bodySmall = meta,
        labelLarge = label,
        labelMedium = label,
        labelSmall = meta,
    )
