package app.daylog.core.model

/**
 * The formatting the toolbar applies.
 *
 * These are pure functions over the text and the selection, so the rule can be tested without a
 * text field and without a screen. The editor turns the result back into a selection.
 */
object MarkdownToggle {

    /**
     * The result of a toggle: the new text and where the selection is afterwards.
     */
    data class Result(
        val text: String,
        val selectionStart: Int,
        val selectionEnd: Int,
    )

    /**
     * Wraps the selection in a marker, or takes the marker off again.
     *
     * A marker that is already around the selection is removed, so pressing the button twice
     * leaves the text as it was. With nothing selected, the marker is put at the caret rather
     * than around nothing.
     */
    fun toggle(
        text: String,
        selectionStart: Int,
        selectionEnd: Int,
        marker: String,
    ): Result {
        val start = selectionStart.coerceIn(0, text.length)
        val end = selectionEnd.coerceIn(start, text.length)

        val alreadyMarked = text.substring(start - marker.length.coerceAtMost(start), start) == marker &&
            text.substring(end, end + marker.length.coerceAtMost(text.length - end)) == marker

        if (alreadyMarked) {
            val withoutStart = start - marker.length
            val withoutEnd = end + marker.length
            return Result(
                text = text.removeRange(withoutStart, withoutEnd),
                selectionStart = withoutStart,
                selectionEnd = withoutEnd - marker.length * 2,
            )
        }

        val marked = text.substring(0, start) + marker + text.substring(start, end) + marker +
            text.substring(end)

        return Result(
            text = marked,
            selectionStart = start + marker.length,
            selectionEnd = end + marker.length,
        )
    }

    /**
     * Puts a line prefix on the selected lines, or takes it off.
     *
     * A heading is a property of the line rather than of the words in it, so the whole line the
     * caret is on is affected.
     */
    fun toggleLinePrefix(
        text: String,
        selectionStart: Int,
        selectionEnd: Int,
        prefix: String,
    ): Result {
        val start = selectionStart.coerceIn(0, text.length)
        val end = selectionEnd.coerceIn(start, text.length)

        val lineStart = text.lastIndexOf('\n', (start - 1).coerceAtLeast(0)).let {
            if (start == 0) 0 else it + 1
        }
        val lineEnd = text.indexOf('\n', end).let { if (it < 0) text.length else it }

        val line = text.substring(lineStart, lineEnd)
        val alreadyPrefixed = line.startsWith(prefix)

        val newLine = if (alreadyPrefixed) line.removePrefix(prefix) else prefix + line
        val newText = text.substring(0, lineStart) + newLine + text.substring(lineEnd)

        val shift = newLine.length - line.length
        return Result(
            text = newText,
            selectionStart = (start + shift).coerceIn(0, newText.length),
            selectionEnd = (end + shift).coerceIn(0, newText.length),
        )
    }
}
