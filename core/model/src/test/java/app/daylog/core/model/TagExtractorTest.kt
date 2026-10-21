package app.daylog.core.model

import org.junit.Assert.assertEquals
import org.junit.Test

class TagExtractorTest {

    @Test
    fun `extracts a single tag`() {
        assertEquals(listOf("work"), TagExtractor.extract("#work"))
    }

    @Test
    fun `extracts several tags in order without duplicates`() {
        assertEquals(
            listOf("work", "walk"),
            TagExtractor.extract("#work today, then #walk and more #work"),
        )
    }

    @Test
    fun `ignores a hash that is not at a word boundary`() {
        assertEquals(emptyList<String>(), TagExtractor.extract("costs #5"))
    }

    @Test
    fun `ignores a hash with no name after it`() {
        assertEquals(emptyList<String>(), TagExtractor.extract("trailing # and more"))
    }

    @Test
    fun `keeps digits and underscores inside a tag`() {
        assertEquals(listOf("day_42"), TagExtractor.extract("#day_42"))
    }

    @Test
    fun `stops a tag at punctuation`() {
        assertEquals(listOf("work"), TagExtractor.extract("#work, then rest"))
    }

    @Test
    fun `handles a tag at the very start and at the very end`() {
        assertEquals(listOf("one", "two"), TagExtractor.extract("#one middle #two"))
    }

    @Test
    fun `returns nothing for content without tags`() {
        assertEquals(emptyList<String>(), TagExtractor.extract("just a plain entry"))
    }
}
