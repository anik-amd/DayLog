package app.daylog.core.designsystem.icon

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
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

    private fun icon(
        name: String,
        pathBuilder: androidx.compose.ui.graphics.vector.PathBuilder.() -> Unit,
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

    /** A chevron pointing left, for going back. */
    val Back: ImageVector = icon("Back") {
        moveTo(15f, 5f)
        lineTo(8f, 12f)
        lineTo(15f, 19f)
    }

    /** A magnifying glass, for search. */
    val Search: ImageVector = icon("Search") {
        moveTo(11f, 4f)
        arcToRelative(7f, 7f, 0f, true, true, 0f, 14f)
        arcToRelative(7f, 7f, 0f, true, true, 0f, -14f)
        moveTo(16f, 16f)
        lineTo(21f, 21f)
    }

    /** Two sliders, for settings. */
    val Settings: ImageVector = icon("Settings") {
        moveTo(4f, 8f)
        lineTo(20f, 8f)
        moveTo(4f, 16f)
        lineTo(20f, 16f)
        moveTo(9f, 6f)
        lineTo(9f, 10f)
        moveTo(15f, 14f)
        lineTo(15f, 18f)
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
        moveTo(3f, 3f)
        lineTo(11f, 3f)
        lineTo(21f, 13f)
        lineTo(13f, 21f)
        lineTo(3f, 11f)
        close()
        moveTo(7.5f, 7.5f)
        lineTo(7.6f, 7.5f)
    }

    /** A map pin, for a place. */
    val Pin: ImageVector = icon("Pin") {
        moveTo(12f, 21f)
        curveTo(12f, 21f, 19f, 15f, 19f, 10f)
        arcTo(7f, 7f, 0f, true, false, -14f, 0f)
        curveTo(5f, 15f, 12f, 21f, 12f, 21f)
        moveTo(12f, 7f)
        lineTo(12.1f, 7f)
    }

    /** A sun behind a cloud, for weather. */
    val Weather: ImageVector = icon("Weather") {
        moveTo(8f, 5f)
        lineTo(8f, 7f)
        moveTo(3.5f, 8f)
        lineTo(5f, 8f)
        moveTo(4.8f, 4.8f)
        lineTo(5.8f, 5.8f)
        moveTo(11.2f, 4.8f)
        lineTo(10.2f, 5.8f)
        moveTo(16f, 19f)
        arcToRelative(4f, 4f, 0f, true, true, 0f, -8f)
        arcTo(5.5f, 5.5f, 0f, true, false, -11f, 2f)
        arcToRelative(3f, 3f, 0f, true, false, 0f, 6f)
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
        moveTo(15.5f, 9f)
        lineTo(15.6f, 9f)
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
        arcTo(4f, 4f, 0f, true, true, 13f, 8f)
        arcTo(4f, 4f, 0f, true, true, 13f, 12f)
        lineTo(8f, 12f)
        moveTo(8f, 12f)
        lineTo(14f, 12f)
        arcTo(4f, 4f, 0f, true, true, 14f, 20f)
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
        arcTo(5f, 5f, 0f, true, true, 17f, 10f)
        lineTo(17f, 4f)
        moveTo(6f, 20f)
        lineTo(18f, 20f)
    }
}
