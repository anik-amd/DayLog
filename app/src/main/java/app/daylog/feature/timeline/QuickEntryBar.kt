package app.daylog.feature.timeline

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLIcon
import app.daylog.core.designsystem.component.DLIconButton
import app.daylog.core.designsystem.component.DLPendingDot
import app.daylog.core.designsystem.icon.DayLogIcons
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * The quick entry bar.
 *
 * It is a line you write on, not a chat input in a card: there is no box around it, only a
 * hairline across the screen above it. The field grows downward-free, upward, as you type, up to
 * six lines, and then it stops growing and scrolls.
 *
 * There is no save button. The bar saves itself shortly after you stop typing, and a small dot
 * appears in the corner while it does.
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

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(colors.surface),
    ) {
        // The hairline the writing sits on.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(colors.rule),
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 20.dp, end = 8.dp, top = 12.dp, bottom = 12.dp),
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
                    Column {
                        if (value.isEmpty()) {
                            app.daylog.core.designsystem.component.DLText(
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
                modifier = Modifier.heightIn(min = 40.dp),
            ) {
                DLIconButton(
                    imageVector = DayLogIcons.ChevronDown,
                    contentDescription = "Open the full editor",
                    onClick = onExpand,
                )
                if (isSaving) {
                    DLPendingDot()
                }
            }
        }
    }
}
