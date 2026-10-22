package app.daylog.core.designsystem.markdown

import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextDecoration
import app.daylog.core.designsystem.color.DayLogColors
import app.daylog.core.designsystem.color.PaperScheme
import app.daylog.core.designsystem.theme.DayLogFonts
import app.daylog.core.designsystem.theme.DayLogTypography
import app.daylog.core.model.MarkdownToggle
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The toolbar and the parser agree.
 *
 * A button that produces markdown the parser cannot read is a button that does nothing, and the
 * reader cannot tell until they see the rendered entry. This test parses the result of every
 * button and checks that the mark is where the button said it would be.
 */
class MarkdownRoundTripTest {

    private val typography = DayLogTypography.standard(DayLogFonts.Inter)
    private val colors = DayLogColors.from(PaperScheme)
    private val parser = MarkdownParser

    private fun parse(text: String) = parser.parse(text, typography, colors)

    @Test
    fun `bold survives the round trip`() {
        val result = MarkdownToggle.toggle("a bold word", 2, 6, "**")

        assertEquals("a **bold** word", result.text)

        val parsed = parse(result.text)
        assertEquals("a bold word", parsed.text)
        assertTrue(parsed.spanStyles.any { it.item.fontWeight == FontWeight.SemiBold })
    }

    @Test
    fun `italic survives the round trip`() {
        val result = MarkdownToggle.toggle("an italic word", 3, 9, "*")

        assertEquals("an *italic* word", result.text)

        val parsed = parse(result.text)
        assertEquals("an italic word", parsed.text)
        assertTrue(parsed.spanStyles.any { it.item.fontStyle == FontStyle.Italic })
    }

    @Test
    fun `underline survives the round trip`() {
        val result = MarkdownToggle.toggle("an underlined word", 3, 13, "__")

        assertEquals("an __underlined__ word", result.text)

        val parsed = parse(result.text)
        assertEquals("an underlined word", parsed.text)
        assertTrue(parsed.spanStyles.any { it.item.textDecoration == TextDecoration.Underline })
    }

    @Test
    fun `a heading survives the round trip`() {
        val result = MarkdownToggle.toggleLinePrefix("first\nsecond", 6, 6, "# ")

        assertEquals("first\n# second", result.text)

        val parsed = parse(result.text)
        assertEquals("first\nsecond", parsed.text)
    }

    @Test
    fun `taking a mark off again leaves plain text`() {
        val on = MarkdownToggle.toggle("a bold word", 2, 6, "**")
        val off = MarkdownToggle.toggle(on.text, on.selectionStart, on.selectionEnd, "**")

        assertEquals("a bold word", off.text)
        assertTrue(parse(off.text).spanStyles.none { it.item.fontWeight == FontWeight.SemiBold })
    }

    @Test
    fun `a backslash escapes a marker`() {
        val result = parse("a \\* b")

        assertEquals("a * b", result.text)
    }
}
