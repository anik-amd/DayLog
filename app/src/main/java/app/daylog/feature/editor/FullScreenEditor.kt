package app.daylog.feature.editor

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLIcon
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLMeta
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * The full editor.
 *
 * The whole screen is the writing surface: no title field, no separate body, no toolbar above a
 * box. The text starts near the top, set in the serif at a reading size, and the screen is the
 * paper.
 *
 * The formatting toolbar is at the bottom, on the same hairline as the quick entry bar, so the
 * thumb reaches it while the other hand writes.
 */
@Composable
fun FullScreenEditor(
    initialText: String,
    onTextChanged: (String) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    onSave: (() -> Unit)? = null,
) {
    val colors = DayLogTheme.colors
    var text by remember { mutableStateOf(initialText) }

    LaunchedEffect(initialText) {
        text = initialText
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .imePadding(),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 4.dp, end = 8.dp, top = 4.dp, bottom = 4.dp),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
        ) {
            DLIconButton(
                imageVector = DayLogIcons.Back,
                contentDescription = "Back",
                onClick = onBack,
            )
            DLMeta(
                text = "Editing",
                modifier = Modifier.weight(1f),
            )
        }

        BasicTextField(
            value = text,
            onValueChange = {
                text = it
                onTextChanged(it)
            },
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            textStyle = DayLogTheme.typography.entryBody.copy(color = colors.ink),
            cursorBrush = SolidColor(colors.accent),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Default),
            decorationBox = { innerTextField ->
                Box(modifier = Modifier.fillMaxSize()) {
                    if (text.isEmpty()) {
                        app.daylog.core.designsystem.component.DLText(
                            text = "Start writing",
                            style = DayLogTheme.typography.entryBody,
                            color = colors.inkFaint,
                        )
                    }
                    innerTextField()
                }
            },
        )

        EditorToolbar(
            onBold = { text = wrapSelection(text, "**", "**") },
            onItalic = { text = wrapSelection(text, "*", "*") },
            onUnderline = { text = wrapSelection(text, "__", "__") },
            onHeading = { text = prefixLine(text, "# ") },
        )
    }
}

/**
 * The formatting toolbar.
 *
 * Four actions and no more. Each one is the markdown shortcut rather than a rich-text command,
 * because the entry is stored as markdown and has to stay editable as markdown.
 */
@Composable
private fun EditorToolbar(
    onBold: () -> Unit,
    onItalic: () -> Unit,
    onUnderline: () -> Unit,
    onHeading: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = DayLogTheme.colors

    Column(modifier = modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .then(Modifier)
                .background(colors.rule)
                .padding(vertical = 1.dp),
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            ToolbarButton(DayLogIcons.Bold, "Bold", onBold)
            ToolbarButton(DayLogIcons.Italic, "Italic", onItalic)
            ToolbarButton(DayLogIcons.Underline, "Underline", onUnderline)
            ToolbarButton(DayLogIcons.Format, "Heading", onHeading)
        }
    }
}

@Composable
private fun ToolbarButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
) {
    DLIconButton(
        imageVector = icon,
        contentDescription = contentDescription,
        onClick = onClick,
        tint = DayLogTheme.colors.inkMuted,
    )
}

/**
 * Wraps the whole text in a markdown marker.
 */
internal fun wrapSelection(text: String, before: String, after: String): String =
    "$before$text$after"

/**
 * Prefixes the text with a markdown marker.
 */
internal fun prefixLine(text: String, prefix: String): String =
    if (text.startsWith(prefix)) text.removePrefix(prefix) else prefix + text
