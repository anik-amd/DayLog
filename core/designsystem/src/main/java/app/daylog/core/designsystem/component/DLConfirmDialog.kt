package app.daylog.core.designsystem.component

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * A confirmation, for the things that cannot be undone.
 *
 * The body says what will happen and the button names it. "Are you sure?" with an OK button
 * tells the reader nothing and asks them to guess.
 */
@Composable
fun DLConfirmDialog(
    title: String,
    body: String,
    confirmLabel: String,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = modifier,
        title = {
            Text(
                text = title,
                style = DayLogTheme.typography.chromeTitle,
            )
        },
        text = {
            Text(
                text = body,
                style = DayLogTheme.typography.entryBody,
                color = DayLogTheme.colors.inkMuted,
                textAlign = TextAlign.Start,
            )
        },
        confirmButton = {
            TextButton(onClick = onConfirm) {
                Text(
                    text = confirmLabel,
                    style = DayLogTheme.typography.label,
                    color = DayLogTheme.colors.danger,
                )
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = "Keep it",
                    style = DayLogTheme.typography.label,
                    color = DayLogTheme.colors.ink,
                )
            }
        },
        shape = DayLogShapes.sheet,
    )
}
