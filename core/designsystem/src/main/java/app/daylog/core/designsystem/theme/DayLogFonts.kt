package app.daylog.core.designsystem.theme

import androidx.compose.ui.text.font.FontFamily

/**
 * The app's typeface.
 *
 * The system's own family — Roboto in the handheld's current build. Nothing is bundled, so there
 * is no font file to load and nothing to shape before the first frame, and the text is set in the
 * same glyphs the rest of the phone uses. An app that opens fast is typed in the type the device
 * already has.
 *
 * A diary is read in long stretches, so the sizes and line heights are still tuned for reading
 * even though the family is handed over: generous line height and a size that does not fight the
 * screen.
 */
object DayLogFonts {

    /** The system's family, named so a call site reads as a decision rather than an omission. */
    val system: FontFamily = FontFamily.Default
}
