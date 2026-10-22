package app.daylog.core.model

import org.junit.Assert.assertEquals
import org.junit.Test

class MarkdownToggleTest {

    @Test
    fun `the selection is wrapped in the marker`() {
        val result = MarkdownToggle.toggle("a bold word", 2, 6, "**")

        assertEquals("a **bold** word", result.text)
    }

    @Test
    fun `the selection is left selected after the marker goes on`() {
        val result = MarkdownToggle.toggle("a bold word", 2, 6, "**")

        assertEquals(4, result.selectionStart)
        assertEquals(8, result.selectionEnd)
    }

    @Test
    fun `pressing the button twice takes the marker off again`() {
        val on = MarkdownToggle.toggle("a bold word", 2, 6, "**")
        val off = MarkdownToggle.toggle(on.text, on.selectionStart, on.selectionEnd, "**")

        assertEquals("a bold word", off.text)
    }

    @Test
    fun `nothing selected leaves the cursor between a pair of markers`() {
        val result = MarkdownToggle.toggle("ab", 1, 1, "*")

        // A pair of markers with the cursor between them, so the words can be typed in.
        assertEquals("a**b", result.text)
        assertEquals(2, result.selectionStart)
        assertEquals(2, result.selectionEnd)
    }

    @Test
    fun `the italic marker is not confused with the bold one`() {
        val result = MarkdownToggle.toggle("a bold word", 2, 6, "*")

        assertEquals("a *bold* word", result.text)
    }

    @Test
    fun `a heading goes on the whole line`() {
        val result = MarkdownToggle.toggleLinePrefix("first\nsecond", 6, 6, "# ")

        assertEquals("first\n# second", result.text)
    }

    @Test
    fun `a heading comes off again`() {
        val on = MarkdownToggle.toggleLinePrefix("first\nsecond", 6, 6, "# ")
        val off = MarkdownToggle.toggleLinePrefix(on.text, on.selectionStart, on.selectionEnd, "# ")

        assertEquals("first\nsecond", off.text)
    }

    @Test
    fun `a heading on the first line works too`() {
        val result = MarkdownToggle.toggleLinePrefix("first", 2, 2, "# ")

        assertEquals("# first", result.text)
    }

    @Test
    fun `a selection past the end of the text is brought back in`() {
        val result = MarkdownToggle.toggle("ab", 0, 99, "*")

        assertEquals("*ab*", result.text)
    }
}
