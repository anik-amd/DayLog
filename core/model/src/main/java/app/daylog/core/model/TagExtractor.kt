package app.daylog.core.model

/**
 * Extracts `#hashtag` tags from entry text.
 *
 * A tag starts at a `#` that is at the start of the content or preceded by whitespace, and runs
 * until the next whitespace or a character that cannot appear in a tag. A `#` followed by nothing
 * usable is left as ordinary text, so a sentence like "costs #5" does not become a tag.
 */
object TagExtractor {

    private val allowedTagChars = Regex("[\\p{L}\\p{N}_-]+")

    fun extract(content: String): List<String> {
        val found = LinkedHashSet<String>()
        var index = 0
        while (index < content.length) {
            val hash = content.indexOf('#', index)
            if (hash < 0) break

            val isBoundary = hash == 0 || content[hash - 1].isWhitespace()
            if (!isBoundary) {
                index = hash + 1
                continue
            }

            val match = allowedTagChars.find(content, hash + 1)
            if (match != null && match.range.first == hash + 1) {
                found += match.value
                index = match.range.last + 1
            } else {
                index = hash + 1
            }
        }
        return found.toList()
    }
}
