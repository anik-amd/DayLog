package app.daylog.core.designsystem.theme

import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight

/**
 * The two typefaces of the app, bundled so the app renders identically offline.
 *
 * Spectral carries the content — a serif that stays comfortable across a long entry.
 * Instrument Sans carries the interface — a grotesque with a real weight axis, so the chrome has
 * genuine hierarchy rather than synthetic bold.
 */
object DayLogFonts {

    val Spectral: FontFamily = FontFamily(
        Font(R.font.spectral, FontWeight.Normal),
        Font(R.font.spectral, FontWeight.Medium),
        Font(R.font.spectral, FontWeight.SemiBold),
    )

    val InstrumentSans: FontFamily = FontFamily(
        Font(R.font.instrument_sans, FontWeight.Normal),
        Font(R.font.instrument_sans, FontWeight.Medium),
        Font(R.font.instrument_sans, FontWeight.SemiBold),
    )
}
