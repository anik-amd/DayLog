package app.daylog.feature.editor

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLIcon
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.component.DLTopBar
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme
import app.daylog.core.model.MarkdownToggle

/**
 * The full editor.
 *
 * The whole screen is the writing surface: no title field, no separate body, no toolbar above a
 * box. The text starts near the top and the screen is the paper.
 *
 * The formatting toolbar is at the bottom, on the same hairline as the quick entry bar, so the
 * thumb reaches it while the other hand writes. Each button works on the selection: it marks the
 * selected words, or takes the mark off again.
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
    var value by remember { mutableStateOf(TextFieldValue(initialText)) }

    LaunchedEffect(initialText) {
        if (value.text != initialText) {
            value = TextFieldValue(initialText)
        }
    }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = colors.background,
    ) {
        Column(modifier = Modifier.imePadding()) {
            DLTopBar(
                title = "Entry",
                leadingIcon = DayLogIcons.Back,
                onLeadingClick = onBack,
                trailingContent = {
                    if (onSave != null) {
                        DLIconButton(
                            imageVector = DayLogIcons.Check,
                            contentDescription = "Save",
                            onClick = onSave,
                            tint = colors.accent,
                        )
                    }
                },
            )

            BasicTextField(
                value = value,
                onValueChange = {
                    value = it
                    onTextChanged(it.text)
                },
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                textStyle = DayLogTheme.typography.entryBody.copy(color = colors.ink),
                cursorBrush = SolidColor(colors.accent),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Default),
                decorationBox = { innerTextField ->
                    Box(modifier = Modifier.fillMaxSize()) {
                        if (value.text.isEmpty()) {
                            DLText(
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
                onBold = { value = value.toggled("**") },
                onItalic = { value = value.toggled("*") },
                onUnderline = { value = value.toggled("__") },
                onHeading = { value = value.heading() },
            )
        }
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
                .background(colors.rule)
                .padding(vertical = 1.dp),
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
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
    icon: ImageVector,
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
 * Applies a marker to the selection.
 */
private fun TextFieldValue.toggled(marker: String): TextFieldValue {
    val result = MarkdownToggle.toggle(
        text = text,
        selectionStart = selection.min,
        selectionEnd = selection.max,
        marker = marker,
    )
    return TextFieldValue(
        text = result.text,
        selection = TextRange(result.selectionStart, result.selectionEnd),
    )
}

/**
 * Makes the line a heading, or takes the heading off.
 */
private fun TextFieldValue.heading(): TextFieldValue {
    val result = MarkdownToggle.toggleLinePrefix(
        text = text,
        selectionStart = selection.min,
        selectionEnd = selection.max,
        prefix = "# ",
    )
    return TextFieldValue(
        text = result.text,
        selection = TextRange(result.selectionStart, result.selectionEnd),
    )
}
