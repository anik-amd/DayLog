package app.daylog.core.designsystem.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.unit.sp

/**
 * The Ink & Margin type scale.
 *
 * Two families with distinct jobs:
 *  - [bodyFamily] — Spectral, a serif. Entry prose is read, often at length, so the entry text is set
 *    in a face designed for reading.
 *  - [chromeFamily] — Instrument Sans, a grotesque. Everything that is interface rather than
 *    content: labels, dates, buttons, chips.
 *
 * Roles are named by what they are for, not by size, so a screen cannot quietly drift into using
 * `body` for a button label.
 */
@Immutable
data class DayLogTypography(
    val bodyFamily: FontFamily,
    val chromeFamily: FontFamily,
    /** Long-form entry prose. */
    val entryBody: TextStyle,
    /** A single entry's title, when it has one. */
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
        /**
         * Reads a little tighter than the Compose default so serif text does not feel airy.
         */
        private val serifLineHeight = LineHeightStyle(
            alignment = LineHeightStyle.Alignment.Proportional,
            trim = LineHeightStyle.Trim.None,
        )

        fun standard(
            bodyFamily: FontFamily,
            chromeFamily: FontFamily,
        ): DayLogTypography = DayLogTypography(
            bodyFamily = bodyFamily,
            chromeFamily = chromeFamily,
            entryBody = TextStyle(
                fontFamily = bodyFamily,
                fontWeight = FontWeight.Normal,
                fontSize = 17.sp,
                lineHeight = 26.sp,
                letterSpacing = 0.sp,
                lineHeightStyle = serifLineHeight,
            ),
            entryTitle = TextStyle(
                fontFamily = bodyFamily,
                fontWeight = FontWeight.SemiBold,
                fontSize = 20.sp,
                lineHeight = 27.sp,
                letterSpacing = (-0.2).sp,
            ),
            entrySubheading = TextStyle(
                fontFamily = bodyFamily,
                fontWeight = FontWeight.SemiBold,
                fontSize = 15.sp,
                lineHeight = 21.sp,
                letterSpacing = 0.sp,
            ),
            chromeTitle = TextStyle(
                fontFamily = chromeFamily,
                fontWeight = FontWeight.SemiBold,
                fontSize = 20.sp,
                lineHeight = 26.sp,
                letterSpacing = (-0.2).sp,
            ),
            label = TextStyle(
                fontFamily = chromeFamily,
                fontWeight = FontWeight.Medium,
                fontSize = 13.sp,
                lineHeight = 18.sp,
                letterSpacing = 0.1.sp,
            ),
            meta = TextStyle(
                fontFamily = chromeFamily,
                fontWeight = FontWeight.Normal,
                fontSize = 11.5.sp,
                lineHeight = 16.sp,
                letterSpacing = 0.1.sp,
            ),
        )
    }
}
