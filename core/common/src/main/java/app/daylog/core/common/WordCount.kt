package app.daylog.core.common

/**
 * The number of words in a text.
 *
 * The words are whatever the whitespace separates, so `hello #work` counts as two. A blank text
 * counts as none.
 */
fun wordCount(text: String): Int =
    text.trim().split(Regex("\\s+")).count { it.isNotEmpty() }
