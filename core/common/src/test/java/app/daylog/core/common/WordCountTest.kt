package app.daylog.core.common

import org.junit.Assert.assertEquals
import org.junit.Test

class WordCountTest {

    @Test
    fun `words are whatever the whitespace separates`() {
        assertEquals(2, wordCount("hello there"))
        assertEquals(3, wordCount("a thought #work"))
        assertEquals(3, wordCount("  spaced   out   text  "))
    }

    @Test
    fun `a blank text counts as none`() {
        assertEquals(0, wordCount(""))
        assertEquals(0, wordCount("   \n  "))
    }
}
