package app.daylog.core.designsystem.markdown

import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import app.daylog.core.designsystem.color.DayLogColors
import app.daylog.core.designsystem.color.NightScheme
import app.daylog.core.designsystem.color.PaperScheme
import app.daylog.core.designsystem.theme.DayLogTypography
import app.daylog.core.designsystem.theme.DayLogFonts
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MarkdownParserTest {

    private val typography = DayLogTypography.standard(DayLogFonts.system)
    private val colors = DayLogColors.from(PaperScheme)

    private fun parse(text: String) = MarkdownParser.parse(text, typography, colors)

    @Test
    fun `plain text is left alone`() {
        assertEquals("a plain note", parse("a plain note").text)
    }

    @Test
    fun `bold text is marked in bold`() {
        val result = parse("a **bold** word")

        assertEquals("a bold word", result.text)
        // Spectral is cut at three weights, so bold is the heaviest of them.
        assertTrue(result.spanStyles.any { it.item.fontWeight == FontWeight.SemiBold })
    }

    @Test
    fun `italic text is marked in italic`() {
        val result = parse("an *italic* word")

        assertEquals("an italic word", result.text)
        assertTrue(result.spanStyles.any { it.item.fontStyle == FontStyle.Italic })
    }

    @Test
    fun `underlined text is marked with an underline`() {
        val result = parse("an __underlined__ word")

        assertEquals("an underlined word", result.text)
        assertTrue(result.spanStyles.any { it.item.textDecoration == TextDecoration.Underline })
    }

    @Test
    fun `inline code keeps its characters`() {
        val result = parse("call `doThing()` now")

        assertEquals("call doThing() now", result.text)
    }

    @Test
    fun `a marker that is never closed is just a character`() {
        assertEquals("2 * 3 = 6", parse("2 * 3 = 6").text)
    }

    @Test
    fun `an asterisk inside a word does not start italics`() {
        val result = parse("a*b*c")

        assertEquals("a*b*c", result.text)
        assertTrue(result.spanStyles.none { it.item.fontStyle == FontStyle.Italic })
    }

    @Test
    fun `a backslash escapes a marker`() {
        assertEquals("a * b", parse("a \\* b").text)
    }

    @Test
    fun `a heading loses its hash`() {
        val result = parse("# A heading")

        assertEquals("A heading", result.text)
    }

    @Test
    fun `a second level heading loses its hashes`() {
        assertEquals("A heading", parse("## A heading").text)
    }

    @Test
    fun `a heading is set in the heading style`() {
        val result = parse("# A heading")

        assertTrue(result.spanStyles.any { it.start == 0 && it.end == 9 })
    }

    @Test
    fun `a bullet becomes a dot`() {
        assertEquals("• first", parse("- first").text)
    }

    @Test
    fun `a numbered list keeps its number`() {
        assertEquals("1. first", parse("1. first").text)
        assertEquals("2. second", parse("2. second").text)
    }

    @Test
    fun `a number that is not a list is left alone`() {
        assertEquals("3 out of 4", parse("3 out of 4").text)
    }

    @Test
    fun `several lines are kept apart`() {
        assertEquals("one\ntwo", parse("one\ntwo").text)
    }

    @Test
    fun `the bold marker is read before the italic one`() {
        val result = parse("**strong**")

        assertEquals("strong", result.text)
        assertTrue(result.spanStyles.any { it.item.fontWeight == FontWeight.SemiBold })
        assertTrue(result.spanStyles.none { it.item.fontStyle == FontStyle.Italic })
    }

    @Test
    fun `the night palette is used when it is asked for`() {
        val night = DayLogColors.from(NightScheme)
        val result = MarkdownParser.parse("a `word`", typography, night)

        assertTrue(result.spanStyles.any { it.item.background == night.surfaceRaised })
    }
}



