package app.daylog.core.designsystem.component

import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.VisualTransformation
import app.daylog.core.designsystem.theme.DayLogShapes
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * A text field.
 *
 * The Material filled field, in the app's own shape. Filled rather than outlined because the app's
 * surfaces are flat and separated by tone, and a filled field sits on the surface rather than
 * drawing a box around it.
 *
 * The placeholder is the field: it is where the text will be, so the field never changes size
 * when it gains a value.
 */
@Composable
fun DLTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    singleLine: Boolean = true,
    keyboardType: KeyboardType = KeyboardType.Text,
    imeAction: ImeAction = ImeAction.Default,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    enabled: Boolean = true,
    label: String? = null,
) {
    TextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier.fillMaxWidth(),
        enabled = enabled,
        label = label?.let { { DLLabel(text = it) } },
        placeholder = placeholder.takeIf { it.isNotEmpty() }?.let { { DLText(text = it, color = DayLogTheme.colorScheme.onSurfaceVariant) } },
        singleLine = singleLine,
        shape = DayLogShapes.chip,
        textStyle = DayLogTheme.typography.entryBody,
        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
            keyboardType = keyboardType,
            imeAction = imeAction,
        ),
        visualTransformation = visualTransformation,
        colors = TextFieldDefaults.colors(
            focusedContainerColor = DayLogTheme.colorScheme.surfaceContainerHigh,
            unfocusedContainerColor = DayLogTheme.colorScheme.surfaceContainerHigh,
            disabledContainerColor = DayLogTheme.colorScheme.surfaceContainer,
            focusedIndicatorColor = androidx.compose.ui.graphics.Color.Transparent,
            unfocusedIndicatorColor = androidx.compose.ui.graphics.Color.Transparent,
            disabledIndicatorColor = androidx.compose.ui.graphics.Color.Transparent,
        ),
    )
}

/**
 * An outlined text field, for a form that sits on the plain ground.
 */
@Composable
fun DLOutlinedTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    singleLine: Boolean = true,
    keyboardType: KeyboardType = KeyboardType.Text,
    imeAction: ImeAction = ImeAction.Default,
    enabled: Boolean = true,
    label: String? = null,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier.fillMaxWidth(),
        enabled = enabled,
        label = label?.let { { DLLabel(text = it) } },
        placeholder = placeholder.takeIf { it.isNotEmpty() }?.let { { DLText(text = it, color = DayLogTheme.colorScheme.onSurfaceVariant) } },
        singleLine = singleLine,
        shape = DayLogShapes.chip,
        textStyle = DayLogTheme.typography.entryBody,
        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
            keyboardType = keyboardType,
            imeAction = imeAction,
        ),
        colors = androidx.compose.material3.OutlinedTextFieldDefaults.colors(
            focusedBorderColor = DayLogTheme.colorScheme.primary,
            unfocusedBorderColor = DayLogTheme.colorScheme.outlineVariant,
        ),
    )
}
