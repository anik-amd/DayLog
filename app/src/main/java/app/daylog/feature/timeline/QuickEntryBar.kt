package app.daylog.feature.timeline

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLDivider
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLPendingDot
import app.daylog.core.designsystem.component.DLText
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * The quick entry bar.
 *
 * It is a line you write on, not a chat input in a card: the only thing above it is a hairline.
 * The field grows upward as the writing grows, up to ten lines, and then it stops growing and
 * scrolls.
 *
 * Nothing is saved by itself. The actions sit under the field, where the thumb rests: a photo, a
 * way up to the full editor, and the save button — the only thing that writes the thought down.
 * Saving is also what empties the field, so the bar is honest about when it is done.
 */
@Composable
fun QuickEntryBar(
    value: String,
    onValueChange: (String) -> Unit,
    onSave: () -> Unit,
    onExpand: () -> Unit,
    onAddPhoto: () -> Unit,
    modifier: Modifier = Modifier,
    isSaving: Boolean = false,
) {
    val colors = DayLogTheme.colors

    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = DayLogShapes.bubble,
        color = colors.surfaceContainer,
        contentColor = colors.ink,
        tonalElevation = 2.dp,
        border = BorderStroke(1.dp, colors.rule),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .imePadding(),
        ) {
            DLDivider()

            Column(
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
            ) {
                BasicTextField(
                    value = value,
                    onValueChange = onValueChange,
                    modifier = Modifier.fillMaxWidth(),
                    textStyle = DayLogTheme.typography.entryBody.copy(color = colors.ink),
                    cursorBrush = SolidColor(colors.accent),
                    maxLines = 10,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Default),
                    decorationBox = { innerTextField ->
                        // The placeholder sits exactly where the text will be, so the field never
                        // changes shape and the placeholder is the field rather than a label
                        // above it.
                        Box {
                            if (value.isEmpty()) {
                                DLText(
                                    text = "Write something",
                                    style = DayLogTheme.typography.entryBody,
                                    color = colors.inkFaint,
                                )
                            }
                            innerTextField()
                        }
                    },
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    DLIconButton(
                        imageVector = DayLogIcons.Image,
                        contentDescription = "Add a photo",
                        onClick = onAddPhoto,
                        tint = colors.inkMuted,
                    )
                    DLIconButton(
                        imageVector = DayLogIcons.UnfoldMore,
                        contentDescription = "Open the full editor",
                        onClick = onExpand,
                        tint = colors.inkMuted,
                    )

                    Spacer(Modifier.weight(1f))

                    if (isSaving) {
                        DLPendingDot()
                        Spacer(Modifier.width(8.dp))
                    }
                    DLIconButton(
                        imageVector = DayLogIcons.Check,
                        contentDescription = "Save",
                        onClick = onSave,
                        enabled = value.isNotBlank(),
                        tint = colors.ink,
                    )
                }
            }
        }
    }
}
