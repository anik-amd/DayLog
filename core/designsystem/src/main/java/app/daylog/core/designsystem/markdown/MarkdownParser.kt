package app.daylog.core.designsystem.markdown

import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import app.daylog.core.designsystem.color.DayLogColors
import app.daylog.core.designsystem.theme.DayLogTypography

/**
 * The app's markdown.
 *
 * The dialect is deliberately small: bold, italic, underline, two levels of heading, bullets,
 * numbered lists and inline code. Anything else is left as it was written.
 *
 * The parser is written by hand. A markdown library would bring a large dependency and a large
 * idea of what markdown is, and the entries here are short notes, not documents.
 *
 * A marker only counts when it is closed. `a * b` is a sentence with an asterisk in it, not
 * italics that failed to parse, and `2 * 3` is arithmetic. A backslash escapes a marker.
 */
object MarkdownParser {

    /**
     * Turns markdown into styled text.
     *
     * @param text the markdown.
     * @param typography the type scale the result is set in.
     * @param colors the palette the result is coloured with.
     */
    fun parse(
        text: String,
        typography: DayLogTypography,
        colors: DayLogColors,
    ): AnnotatedString = buildAnnotatedString {
        text.lines().forEachIndexed { index, line ->
            if (index > 0) append('\n')
            appendLine(line, typography, colors)
        }
    }

    /**
     * One line of markdown.
     */
    private fun AnnotatedString.Builder.appendLine(
        line: String,
        typography: DayLogTypography,
        colors: DayLogColors,
    ) {
        when {
            line.startsWith("# ") -> {
                pushStyle(typography.entryTitle)
                appendInline(line.removePrefix("# "), typography, colors)
                pop()
            }

            line.startsWith("## ") -> {
                pushStyle(typography.entrySubheading)
                appendInline(line.removePrefix("## "), typography, colors)
                pop()
            }

            line.startsWith("- ") || line.startsWith("* ") -> {
                append("• ")
                appendInline(line.drop(2), typography, colors)
            }

            NUMBERED.matches(line) -> {
                val number = line.takeWhile { it.isDigit() }
                append("$number. ")
                appendInline(line.drop(number.length + 2), typography, colors)
            }

            else -> appendInline(line, typography, colors)
        }
    }

    /**
     * The markers that are understood, longest first so `**` is not read as two `*`.
     */
    private val MARKERS = listOf("**", "__", "*", "`")

    private val NUMBERED = Regex("^\\d+\\. ")

    /**
     * The inline markers of one line.
     */
    private fun AnnotatedString.Builder.appendInline(
        text: String,
        typography: DayLogTypography,
        colors: DayLogColors,
    ) {
        var index = 0
        val plain = StringBuilder()

        fun flush() {
            if (plain.isNotEmpty()) {
                append(plain)
                plain.clear()
            }
        }

        while (index < text.length) {
            val character = text[index]

            // A backslash escapes the next character, so a marker can be written literally.
            if (character == '\\' && index + 1 < text.length && isMarker(text[index + 1])) {
                plain.append(text[index + 1])
                index += 2
                continue
            }

            val marker = MARKERS.firstOrNull { text.startsWith(it, index) }
            if (marker != null) {
                val close = text.indexOf(marker, index + marker.length)
                // A marker that is never closed is just a character.
                if (close > index + marker.length) {
                    val content = text.substring(index + marker.length, close)
                    flush()
                    pushStyle(styleFor(marker, typography, colors))
                    append(content)
                    pop()
                    index = close + marker.length
                    continue
                }
            }

            plain.append(character)
            index++
        }

        flush()
    }

    /**
     * The style a marker carries.
     */
    private fun styleFor(
        marker: String,
        typography: DayLogTypography,
        colors: DayLogColors,
    ): SpanStyle = when (marker) {
        "**" -> SpanStyle(fontWeight = FontWeight.Bold)
        "*" -> SpanStyle(fontStyle = FontStyle.Italic)
        "__" -> SpanStyle(textDecoration = TextDecoration.Underline)
        "`" -> SpanStyle(
            fontFamily = FontFamily.Monospace,
            background = colors.surfaceRaised,
        )
        else -> SpanStyle()
    }

    /**
     * Whether a character can be escaped.
     */
    private fun isMarker(character: Char): Boolean =
        character == '*' || character == '_' || character == '`' || character == '#'
}
