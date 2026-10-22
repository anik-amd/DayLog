package app.daylog.core.designsystem.icon

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathBuilder
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.unit.dp

/**
 * The app's icons.
 *
 * Each one is drawn here rather than pulled from a Material icon set. The Material glyphs are
 * instantly recognisable as Material, which is exactly the impression this app is trying to
 * avoid, and they come with a dependency the rest of the project does not need.
 *
 * Every glyph is a 24dp box with a 1.5dp stroke, round caps and round joins, so a row of them
 * reads as one hand rather than a collection.
 */
object DayLogIcons {

    private const val Stroke = 1.5f

    /**
     * The control point offset that turns a cubic Bézier into a quarter circle.
     */
    private const val CircleK = 0.5523f

    private fun icon(
        name: String,
        pathBuilder: PathBuilder.() -> Unit,
    ): ImageVector = ImageVector.Builder(
        name = name,
        defaultWidth = 24.dp,
        defaultHeight = 24.dp,
        viewportWidth = 24f,
        viewportHeight = 24f,
    ).apply {
        path(
            fill = SolidColor(Color.Transparent),
            stroke = SolidColor(Color.Black),
            strokeLineWidth = Stroke,
            strokeLineCap = StrokeCap.Round,
            strokeLineJoin = StrokeJoin.Round,
            pathBuilder = pathBuilder,
        )
    }.build()

    /**
     * A circle, drawn with four Béziers.
     *
     * A circle is the one shape an icon cannot do without, and drawing it this way keeps it exact
     * rather than depending on an arc that has to be got right by eye.
     */
    private fun PathBuilder.circle(centerX: Float, centerY: Float, radius: Float) {
        val k = radius * CircleK
        moveTo(centerX, centerY - radius)
        curveTo(centerX + k, centerY - radius, centerX + radius, centerY - k, centerX + radius, centerY)
        curveTo(centerX + radius, centerY + k, centerX + k, centerY + radius, centerX, centerY + radius)
        curveTo(centerX - k, centerY + radius, centerX - radius, centerY + k, centerX - radius, centerY)
        curveTo(centerX - radius, centerY - k, centerX - k, centerY - radius, centerX, centerY - radius)
        close()
    }

    /** A chevron pointing left, for going back. */
    val Back: ImageVector = icon("Back") {
        moveTo(15f, 5f)
        lineTo(8f, 12f)
        lineTo(15f, 19f)
    }

    /** A magnifying glass, for search. */
    val Search: ImageVector = icon("Search") {
        circle(10.5f, 10.5f, 6.5f)
        moveTo(15.5f, 15.5f)
        lineTo(21f, 21f)
    }

    /** Two sliders, for settings. */
    val Settings: ImageVector = icon("Settings") {
        moveTo(4f, 8f)
        lineTo(20f, 8f)
        moveTo(4f, 16f)
        lineTo(20f, 16f)
        moveTo(9f, 5.5f)
        lineTo(9f, 10.5f)
        moveTo(15f, 13.5f)
        lineTo(15f, 18.5f)
    }

    /** A calendar page, for the month view. */
    val Calendar: ImageVector = icon("Calendar") {
        moveTo(4f, 6f)
        lineTo(20f, 6f)
        moveTo(4f, 6f)
        lineTo(4f, 20f)
        lineTo(20f, 20f)
        lineTo(20f, 6f)
        moveTo(8f, 3f)
        lineTo(8f, 8f)
        moveTo(16f, 3f)
        lineTo(16f, 8f)
    }

    /** A tag with a hole, for tags. */
    val Tag: ImageVector = icon("Tag") {
        moveTo(3f, 3.5f)
        lineTo(11f, 3.5f)
        lineTo(21f, 13.5f)
        lineTo(13.5f, 21f)
        lineTo(3.5f, 11f)
        close()
        circle(7.5f, 7.5f, 0.6f)
    }

    /**
     * A map pin, for a place.
     *
     * A ring over a point: the ring is the place, the two lines down to the tip are the mark that
     * puts it on a map. It reads at thirteen dots, which a filled teardrop does not.
     */
    val Pin: ImageVector = icon("Pin") {
        circle(12f, 9.5f, 4.5f)
        moveTo(8.5f, 13f)
        lineTo(12f, 21f)
        lineTo(15.5f, 13f)
    }

    /**
     * A cloud, for weather.
     *
     * One large circle and one small one, sat on a base line. The shape is unmistakable at any
     * size, which an arc-built one is not, and it is made of parts that are already exact.
     */
    val Weather: ImageVector = icon("Weather") {
        circle(13.5f, 12.5f, 4.5f)
        circle(8.5f, 14f, 3.2f)
        moveTo(6f, 18f)
        lineTo(17f, 18f)
    }

    /** A picture frame, for photos. */
    val Image: ImageVector = icon("Image") {
        moveTo(3f, 5f)
        lineTo(21f, 5f)
        lineTo(21f, 19f)
        lineTo(3f, 19f)
        close()
        moveTo(3f, 16f)
        lineTo(8.5f, 10.5f)
        lineTo(13f, 15f)
        lineTo(16f, 12f)
        lineTo(21f, 17f)
        circle(8f, 9f, 1f)
    }

    /** A plus, for adding. */
    val Plus: ImageVector = icon("Plus") {
        moveTo(12f, 5f)
        lineTo(12f, 19f)
        moveTo(5f, 12f)
        lineTo(19f, 12f)
    }

    /** A bin, for deleting. */
    val Trash: ImageVector = icon("Trash") {
        moveTo(4f, 7f)
        lineTo(20f, 7f)
        moveTo(9f, 7f)
        lineTo(9f, 4f)
        lineTo(15f, 4f)
        lineTo(15f, 7f)
        moveTo(6f, 7f)
        lineTo(7f, 20f)
        lineTo(17f, 20f)
        lineTo(18f, 7f)
        moveTo(10f, 11f)
        lineTo(10f, 16f)
        moveTo(14f, 11f)
        lineTo(14f, 16f)
    }

    /** A chevron pointing down, for expanding the composer. */
    val ChevronDown: ImageVector = icon("ChevronDown") {
        moveTo(6f, 9f)
        lineTo(12f, 15f)
        lineTo(18f, 9f)
    }

    /** A chevron pointing right, for a collapsed row. */
    val ChevronRight: ImageVector = icon("ChevronRight") {
        moveTo(9f, 6f)
        lineTo(15f, 12f)
        lineTo(9f, 18f)
    }

    /** A tick, for a confirmed action. */
    val Check: ImageVector = icon("Check") {
        moveTo(5f, 12.5f)
        lineTo(10f, 17.5f)
        lineTo(19f, 7f)
    }

    /** An eye, for the preview toggle. */
    val Eye: ImageVector = icon("Eye") {
        // The outline of the eye.
        moveTo(2f, 12f)
        curveTo(2f, 12f, 6f, 5f, 12f, 5f)
        curveTo(18f, 5f, 22f, 12f, 22f, 12f)
        curveTo(22f, 12f, 18f, 19f, 12f, 19f)
        curveTo(6f, 19f, 2f, 12f, 2f, 12f)
        close()
        // The pupil.
        circle(12f, 12f, 3f)
    }

    /** A brush, for the formatting toolbar. */
    val Format: ImageVector = icon("Format") {
        moveTo(4f, 20f)
        lineTo(9f, 19f)
        lineTo(19f, 9f)
        lineTo(15f, 5f)
        lineTo(5f, 15f)
        close()
        moveTo(13f, 7f)
        lineTo(17f, 11f)
    }

    /** Bold, for the formatting toolbar. */
    val Bold: ImageVector = icon("Bold") {
        moveTo(8f, 4f)
        lineTo(8f, 20f)
        moveTo(8f, 4f)
        lineTo(13f, 4f)
        curveTo(16f, 4f, 17.5f, 5.5f, 17.5f, 8f)
        curveTo(17.5f, 10.5f, 16f, 12f, 13f, 12f)
        lineTo(8f, 12f)
        moveTo(8f, 12f)
        lineTo(13.5f, 12f)
        curveTo(16.5f, 12f, 18f, 13.5f, 18f, 16f)
        curveTo(18f, 18.5f, 16.5f, 20f, 13.5f, 20f)
        lineTo(8f, 20f)
    }

    /** Italic, for the formatting toolbar. */
    val Italic: ImageVector = icon("Italic") {
        moveTo(15f, 4f)
        lineTo(9f, 4f)
        moveTo(15f, 20f)
        lineTo(9f, 20f)
        moveTo(14f, 4f)
        lineTo(10f, 20f)
    }

    /** Underline, for the formatting toolbar. */
    val Underline: ImageVector = icon("Underline") {
        moveTo(7f, 4f)
        lineTo(7f, 10f)
        curveTo(7f, 13.5f, 9f, 15f, 12f, 15f)
        curveTo(15f, 15f, 17f, 13.5f, 17f, 10f)
        lineTo(17f, 4f)
        moveTo(6f, 20f)
        lineTo(18f, 20f)
    }
}
