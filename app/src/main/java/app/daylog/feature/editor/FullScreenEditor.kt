package app.daylog.feature.editor

import android.text.format.DateFormat
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
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
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import app.daylog.core.common.wordCount
import app.daylog.core.designsystem.component.DLConfirmDialog
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
 * box. The entry's facts sit in one small line — the moment it happened at, which the writer can
 * tap and put right, and the word count, which answers the oldest question in a diary. Photos
 * hang under the writing, and the formatting toolbar sits at the bottom, on the same hairline as
 * the quick entry bar, so the thumb reaches it while the other hand writes.
 *
 * Leaving is saving: the back arrow, the system gesture and the save button all ask the route for
 * the same exit, and the route writes the entry first. The menu holds the exit that throws the
 * writing away, behind a question.
 */
@Composable
fun FullScreenEditor(
    state: EditorUiState,
    onTextChanged: (String) -> Unit,
    onChangeTime: (Long) -> Unit,
    onSave: () -> Unit,
    onDiscard: () -> Unit,
    onAddPhoto: () -> Unit,
    onRemovePhoto: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = DayLogTheme.colors
    var value by remember { mutableStateOf(TextFieldValue(state.text ?: "")) }
    var preview by remember { mutableStateOf(false) }
    var menuOpen by remember { mutableStateOf(false) }
    var confirmingDiscard by remember { mutableStateOf(false) }
    var pickingMoment by remember { mutableStateOf(false) }

    LaunchedEffect(state.text) {
        // The text comes back from the state holder when it changed somewhere else — when a
        // discard puts it back — and never when it is what this field last said.
        if (value.text != state.text) {
            value = TextFieldValue(state.text)
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
                onLeadingClick = onSave,
                trailingContent = {
                    DLIconButton(
                        imageVector = DayLogIcons.Eye,
                        contentDescription = if (preview) "Stop preview" else "Preview",
                        onClick = { preview = !preview },
                        tint = if (preview) colors.accent else colors.inkMuted,
                    )
                    DLIconButton(
                        imageVector = DayLogIcons.Check,
                        contentDescription = "Save",
                        onClick = onSave,
                        tint = colors.ink,
                    )
                    Box {
                        DLIconButton(
                            imageVector = DayLogIcons.MoreVert,
                            contentDescription = "More options",
                            onClick = { menuOpen = true },
                            tint = colors.inkMuted,
                        )
                        DropdownMenu(
                            expanded = menuOpen,
                            onDismissRequest = { menuOpen = false },
                        ) {
                            DropdownMenuItem(
                                text = {
                                    DLText(text = "Discard entry", style = DayLogTheme.typography.label)
                                },
                                leadingIcon = {
                                    DLIcon(imageVector = DayLogIcons.Trash, contentDescription = null)
                                },
                                onClick = {
                                    menuOpen = false
                                    confirmingDiscard = true
                                },
                            )
                        }
                    }
                },
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                val createdAt = state.createdAt
                if (createdAt != null) {
                    val is24Hour = DateFormat.is24HourFormat(LocalConfiguration.current)
                    DLText(
                        text = momentLabel(createdAt, is24Hour = is24Hour),
                        modifier = Modifier.clickable { pickingMoment = true },
                        style = DayLogTheme.typography.meta,
                        color = colors.inkMuted,
                    )
                }
                DLText(
                    text = "${wordCount(value.text)} words",
                    style = DayLogTheme.typography.meta,
                    color = colors.inkFaint,
                )
            }

            if (preview) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                ) {
                    DLText(
                        text = value.text,
                        style = DayLogTheme.typography.entryBody,
                        color = colors.ink,
                        annotated = true,
                    )
                }
            } else {
                BasicTextField(
                    value = value,
                    onValueChange = {
                        value = it
                        onTextChanged(it.text)
                    },
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    textStyle = DayLogTheme.typography.entryBody.copy(color = colors.ink),
                    cursorBrush = SolidColor(colors.accent),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Default),
                    decorationBox = { innerTextField ->
                        Box(modifier = Modifier.fillMaxWidth()) {
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
            }

            if (state.media.isNotEmpty()) {
                EditorGallery(
                    media = state.media,
                    onRemove = onRemovePhoto,
                )
            }

            EditorToolbar(
                onBold = { value = value.toggled("**") },
                onItalic = { value = value.toggled("*") },
                onUnderline = { value = value.toggled("__") },
                onHeading = { value = value.heading() },
                onAddPhoto = onAddPhoto,
            )
        }
    }

    if (pickingMoment) {
        MomentPicker(
            moment = state.createdAt ?: System.currentTimeMillis(),
            onChange = onChangeTime,
            onDone = { pickingMoment = false },
        )
    }

    if (confirmingDiscard) {
        DLConfirmDialog(
            title = "Discard the entry?",
            body = "The entry as it stands will be gone.",
            confirmLabel = "Discard",
            onConfirm = {
                confirmingDiscard = false
                onDiscard()
            },
            onDismiss = { confirmingDiscard = false },
        )
    }
}

/**
 * The formatting toolbar.
 *
 * Four actions and no more. Each one is the markdown shortcut rather than a rich-text command,
 * because the entry is stored as markdown and has to stay editable as markdown. The photo sits
 * at the end of the row, with the other edits of the entry.
 */
@Composable
private fun EditorToolbar(
    onBold: () -> Unit,
    onItalic: () -> Unit,
    onUnderline: () -> Unit,
    onHeading: () -> Unit,
    onAddPhoto: () -> Unit,
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
            Spacer(Modifier.weight(1f))
            ToolbarButton(DayLogIcons.Image, "Add a photo", onAddPhoto)
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
