package app.daylog.core.common

/**
 * The plain text of an entry, for the timeline's preview.
 *
 * The timeline is read at a glance, so it shows the words without their markdown clothing: the
 * markers, the heading hashes and the bullet dashes are taken off, and the blank lines between
 * them, so what is left reads like a sentence rather than like source.
 */
fun plainPreview(content: String, maxLines: Int = 4): String {
    val stripped = content.lines().map { line ->
        var s = line.trim()
        // Headings.
        s = s.replace(Regex("^#{1,6}\\s*"), "")
        // Bullets and numbered lists.
        s = s.replace(Regex("^[-*+]\\s+"), "")
        s = s.replace(Regex("^\\d+\\.\\s+"), "")
        // Inline markers.
        s = s.replace("**", "")
        s = s.replace("__", "")
        s = s.replace(Regex("`([^`]*)`"), "$1")
        s = s.replace(Regex("\\*(.+?)\\*"), "$1")
        s
    }.filter { it.isNotBlank() }

    return stripped.take(maxLines).joinToString("\n")
}
