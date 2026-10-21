package app.daylog.core.model

/**
 * Extracts `#hashtag` tags from entry text.
 *
 * A tag starts at a `#` that is at the start of the content or preceded by whitespace, and runs
 * until the next whitespace or a character that cannot appear in a tag.
 *
 * A tag must *begin* with a letter or an underscore. Digits are allowed after that, so `#day_42`
 * is a tag but `#5` is not — a number after a hash is far more likely to be a price, a footnote or
 * a heading than something the writer meant to file.
 *
 * A `#` that cannot start a tag is left as ordinary text, so "costs #5" stays as it is written.
 */
object TagExtractor {

    /**
     * The first character of a tag: a letter or an underscore.
     */
    private val tagStart = Regex("[\\p{L}_]")

    /**
     * The rest of a tag: letters, digits, underscores and hyphens.
     */
    private val tagRest = Regex("[\\p{L}\\p{N}_-]*")

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

            val start = tagStart.find(content, hash + 1)
            if (start != null && start.range.first == hash + 1) {
                val rest = tagRest.find(content, start.range.last + 1)
                val end = rest?.range?.last ?: start.range.last
                found += content.substring(hash + 1, end + 1)
                index = end + 1
            } else {
                index = hash + 1
            }
        }
        return found.toList()
    }
}
