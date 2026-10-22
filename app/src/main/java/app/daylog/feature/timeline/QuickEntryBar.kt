package app.daylog.feature.timeline

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
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
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * The quick entry bar.
 *
 * It is a line you write on, not a chat input in a card: the only thing above it is a hairline.
 * The field grows upward as you type, up to six lines, and then it stops growing and scrolls.
 *
 * There is no save button and nothing is ever taken out of the field while you are writing. The
 * entry is written to the database shortly after you stop typing, and it is the same entry every
 * time, so a pause in the middle of a thought does not split it in two. A small dot shows while
 * it is being written.
 *
 * The bar rides above the keyboard rather than hiding behind it.
 */
@Composable
fun QuickEntryBar(
    value: String,
    onValueChange: (String) -> Unit,
    onExpand: () -> Unit,
    modifier: Modifier = Modifier,
    isSaving: Boolean = false,
) {
    val colors = DayLogTheme.colors

    Surface(
        modifier = modifier.fillMaxWidth(),
        color = colors.surfaceContainer,
        contentColor = colors.ink,
    ) {
        Column {
            DLDivider()

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .imePadding()
                    .padding(start = 20.dp, end = 8.dp, top = 10.dp, bottom = 10.dp),
                verticalAlignment = Alignment.Bottom,
            ) {
                BasicTextField(
                    value = value,
                    onValueChange = onValueChange,
                    modifier = Modifier.weight(1f),
                    textStyle = DayLogTheme.typography.entryBody.copy(color = colors.ink),
                    cursorBrush = SolidColor(colors.accent),
                    maxLines = 6,
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

                Spacer(Modifier.width(8.dp))

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                    modifier = Modifier.padding(bottom = 2.dp),
                ) {
                    DLIconButton(
                        imageVector = DayLogIcons.ChevronDown,
                        contentDescription = "Open the full editor",
                        onClick = onExpand,
                        tint = colors.inkMuted,
                    )
                    if (isSaving) {
                        DLPendingDot()
                    }
                }
            }
        }
    }
}
