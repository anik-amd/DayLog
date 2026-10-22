package app.daylog.core.designsystem.theme

import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.font.FontVariation
import app.daylog.core.designsystem.R

/**
 * The app's typeface.
 *
 * One family: Inter, the grotesque that most of the modern web and a growing number of native
 * apps are set in. It is a variable font, so the whole weight range comes from one file and the
 * weights are real rather than synthesised.
 *
 * A diary is read in long stretches, so the type is tuned for reading rather than for density:
 * generous line height, open counters, and a size that does not fight the screen.
 */
object DayLogFonts {

    /**
     * Inter, with its weight axis.
     *
     * The axis is set explicitly on each weight because a variable font has to be told where to
     * stand; without this the file's default instance is used for every weight and the hierarchy
     * disappears.
     */
    val Inter: FontFamily = FontFamily(
        Font(
            resId = R.font.inter_variable,
            weight = FontWeight.Normal,
            variationSettings = FontVariation.Settings(FontVariation.weight(400f)),
        ),
        Font(
            resId = R.font.inter_variable,
            weight = FontWeight.Medium,
            variationSettings = FontVariation.Settings(FontVariation.weight(500f)),
        ),
        Font(
            resId = R.font.inter_variable,
            weight = FontWeight.SemiBold,
            variationSettings = FontVariation.Settings(FontVariation.weight(600f)),
        ),
        Font(
            resId = R.font.inter_variable,
            weight = FontWeight.Bold,
            variationSettings = FontVariation.Settings(FontVariation.weight(700f)),
        ),
    )
}
