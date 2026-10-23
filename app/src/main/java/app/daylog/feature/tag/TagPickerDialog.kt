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
 * Choosing the tags an entry carries.
 *
 * The tags already on the entry are the filled chips — tapping one takes it off. The tags in use
 * elsewhere and a new word are the ways to put one on. The picker only answers; what is done with
 * the name is the caller's writing, because a tag is written in the entry, not kept beside it.
 */
@Composable
fun TagPickerDialog(
    /** The tags in use across the diary, to choose from. */
    tags: List<Tag>,
    /** The tags the entry already carries. */
    current: Set<String> = emptySet(),
    onPick: (String) -> Unit,
    /** Answers when a tag that is on the entry is taken off. */
    onRemove: (String) -> Unit = {},
    onDismiss: () -> Unit,
) {
    var typed by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Tags") },
        text = {
            Column {
                if (current.isNotEmpty()) {
                    Text("On this entry")
                    Column(
                        modifier = Modifier.padding(bottom = 8.dp),
                    ) {
                        current.sorted().forEach { name ->
                            FilterChip(
                                selected = true,
                                onClick = { onRemove(name) },
                                label = { Text("#$name") },
                            )
                        }
                    }
                }

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

                val eligible = tags.filter { it.name !in current }
                if (eligible.isEmpty()) {
                    DLEmptyState(
                        title = "No tags yet",
                        body = "Tags you have used appear here.",
                    )
                } else {
                    LazyColumn {
                        items(eligible) { tag ->
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
            TextButton(onClick = onDismiss) { Text("Done") }
        },
    )
}
