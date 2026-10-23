package app.daylog.feature.tag

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import app.daylog.core.designsystem.component.DLEmptyState
import app.daylog.core.model.Tag

/**
 * Picking a tag to put on the entry.
 *
 * The tags in use are chips, and a new one can be typed. Choosing — by chip or by word — answers
 * with the tag's name; the picker does not know where the tag goes, that is the caller's writing.
 */
@Composable
fun TagPickerDialog(
    tags: List<Tag>,
    onPick: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    var typed by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add a tag") },
        text = {
            Column {
                OutlinedTextField(
                    value = typed,
                    onValueChange = { typed = it.filterNot { c -> c.isWhitespace() || c == '#' } },
                    placeholder = { Text("New tag") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                    keyboardActions = KeyboardActions(onDone = {
                        val name = typed.trim()
                        if (name.isNotEmpty()) {
                            onPick(name)
                            onDismiss()
                        }
                    }),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                )

                if (tags.isEmpty()) {
                    DLEmptyState(
                        title = "No tags yet",
                        body = "Tags you have used appear here.",
                    )
                } else {
                    LazyColumn {
                        items(tags) { tag ->
                            FilterChip(
                                selected = false,
                                onClick = {
                                    onPick(tag.name)
                                    onDismiss()
                                },
                                label = { Text("#${tag.name} (${tag.count})") },
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                enabled = typed.isNotBlank(),
                onClick = {
                    onPick(typed.trim())
                    onDismiss()
                },
            ) { Text("Add") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}
