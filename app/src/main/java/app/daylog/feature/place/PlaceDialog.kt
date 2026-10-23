package app.daylog.feature.place

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier

/**
 * Naming the place an entry happened at.
 *
 * For now the writer names the place and the entry keeps the name; the resolution of a name to
 * coordinates comes with the map work. Leaving the field empty and confirming takes the place
 * off the entry.
 */
@Composable
fun PlaceDialog(
    /** The place the entry carries, when it carries one. */
    place: String?,
    onSet: (String?) -> Unit,
    onDismiss: () -> Unit,
) {
    var typed by remember { mutableStateOf(place ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Location") },
        text = {
            OutlinedTextField(
                value = typed,
                onValueChange = { typed = it },
                placeholder = { Text("Where was this?") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
        },
        confirmButton = {
            TextButton(
                onClick = {
                    val name = typed.trim()
                    onSet(name.ifEmpty { null })
                    onDismiss()
                },
            ) { Text("Done") }
        },
        dismissButton = {
            if (place != null) {
                TextButton(
                    onClick = {
                        onSet(null)
                        onDismiss()
                    },
                ) { Text("Remove") }
            } else {
                TextButton(onClick = onDismiss) { Text("Cancel") }
            }
        },
    )
}
