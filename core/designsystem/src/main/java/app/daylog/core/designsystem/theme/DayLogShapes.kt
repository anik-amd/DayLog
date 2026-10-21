package app.daylog.core.designsystem.theme

import androidx.compose.ui.unit.dp

/**
 * Corner radii.
 *
 * Four values, used with intent. Nothing is a circle by default; the pill shape is reserved for the
 * small date markers in the timeline margin.
 */
object DayLogShapes {
    /** Chips, small controls. */
    val chip = 6.dp

    /** Cards and grouped content. */
    val card = 10.dp

    /** Sheets and large surfaces. */
    val sheet = 16.dp

    /** Date pills in the timeline margin. */
    val pill = 999.dp
}
