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

    /**
     * Takes one tag out of the content.
     *
     * The tag is only removed where it stands on its own — a hash on a boundary, ending on one —
     * so removing `#work` from `name#work` does nothing. The space next to the tag goes with it,
     * so what is left reads without a hole.
     */
    fun remove(content: String, name: String): String {
        val token = "#$name"
        if (token.length > content.length) return content

        var search = 0
        while (search <= content.length - token.length) {
            val at = content.indexOf(token, search)
            if (at < 0) return content

            val end = at + token.length
            val onStartBoundary = at == 0 || content[at - 1].isWhitespace()
            val onEndBoundary = end == content.length || content[end].isWhitespace()
            if (onStartBoundary && onEndBoundary) {
                // The space the tag leaves behind goes with it, before or after as the tag sits.
                val from = if (at == 0 && end < content.length && content[end].isWhitespace()) {
                    end + 1
                } else {
                    end
                }
                val skip = if (at > 0) 1 else 0
                return content.substring(0, at - skip) + content.substring(from)
            }
            search = at + 1
        }
        return content
    }
}
