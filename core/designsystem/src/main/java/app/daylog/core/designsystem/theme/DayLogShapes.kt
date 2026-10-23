package app.daylog.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp

/**
 * Corner radii.
 *
 * Four values, used with intent. Nothing is a circle by default; the pill shape is reserved for the
 * small date markers in the timeline margin.
 */
object DayLogShapes {
    /** Chips, small controls. */
    val chipRadius = 8.dp

    /** Cards and grouped content. */
    val cardRadius = 12.dp

    /** Sheets and large surfaces. */
    val sheetRadius = 16.dp

    /** The quick entry bar, floating like a bubble. */
    val bubbleRadius = 24.dp

    /** Date pills in the timeline margin. */
    val pillRadius = 999.dp

    /** Chips, small controls. */
    val chip: Shape = RoundedCornerShape(chipRadius)

    /** Cards and grouped content. */
    val card: Shape = RoundedCornerShape(cardRadius)

    /** Sheets and large surfaces. */
    val sheet: Shape = RoundedCornerShape(sheetRadius)

    /** The quick entry bar, floating like a bubble. */
    val bubble: Shape = RoundedCornerShape(bubbleRadius)

    /** Date pills in the timeline margin. */
    val pill: Shape = RoundedCornerShape(pillRadius)
}
